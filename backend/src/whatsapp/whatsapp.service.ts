import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppStatus } from '@prisma/client';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import * as QRCode from 'qrcode';
import { CommandParserService } from './command-parser.service';
import { WhatsAppGateway } from './whatsapp.gateway';

interface WhatsAppClientData {
  client: Client;
  qrCode: string | null;
  status: WhatsAppStatus;
  pairingCode: string | null;
}

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private clients: Map<string, WhatsAppClientData> = new Map();

  constructor(
    private prisma: PrismaService,
    private commandParser: CommandParserService,
    @Inject(forwardRef(() => WhatsAppGateway))
    private gateway: WhatsAppGateway,
  ) {}

  async onModuleInit() {
    const sessions = await this.prisma.whatsAppSession.findMany({
      where: { status: { in: ['CONNECTED', 'AUTHENTICATED'] } },
    });

    for (const session of sessions) {
      try {
        await this.initializeSession(session.name);
      } catch (error) {
        console.error(`Failed to restore session ${session.name}:`, error);
      }
    }
  }

  async onModuleDestroy() {
    for (const [name, data] of this.clients) {
      try {
        await data.client.destroy();
      } catch (error) {
        console.error(`Failed to destroy client ${name}:`, error);
      }
    }
  }

  async initializeSession(sessionName: string): Promise<{ success: boolean; message: string }> {
    if (this.clients.has(sessionName)) {
      return { success: false, message: 'Session already exists' };
    }

    let session = await this.prisma.whatsAppSession.findUnique({
      where: { name: sessionName },
    });

    if (!session) {
      session = await this.prisma.whatsAppSession.create({
        data: {
          name: sessionName,
          status: 'CONNECTING',
        },
      });
    } else {
      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: { status: 'CONNECTING' },
      });
    }

    this.emitStatusUpdate(sessionName, 'CONNECTING');

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: sessionName }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    const clientData: WhatsAppClientData = {
      client,
      qrCode: null,
      status: 'CONNECTING',
      pairingCode: null,
    };

    this.clients.set(sessionName, clientData);

    client.on('qr', async (qr) => {
      console.log(`QR received for session ${sessionName}`);
      qrcode.generate(qr, { small: true });

      clientData.qrCode = qr;
      clientData.status = 'QR_READY';

      // Convert QR code to data URL for frontend
      let qrDataUrl: string;
      try {
        qrDataUrl = await this.convertQrToDataUrl(qr);
      } catch (error) {
        console.error('Failed to convert QR code to data URL image, frontend may not display QR properly:', error);
        // Emit error status instead of attempting to continue with invalid data
        await this.prisma.whatsAppSession.update({
          where: { name: sessionName },
          data: { status: 'DISCONNECTED' },
        });
        this.emitStatusUpdate(sessionName, 'DISCONNECTED');
        return; // Don't emit QR code if conversion failed
      }

      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: { status: 'QR_READY', qrCode: qr },
      });

      this.emitStatusUpdate(sessionName, 'QR_READY', qrDataUrl);
      this.gateway.emitQrCode(sessionName, qrDataUrl);
    });

    client.on('ready', async () => {
      console.log(`Client ${sessionName} is ready!`);
      clientData.status = 'CONNECTED';
      clientData.qrCode = null;

      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: {
          status: 'CONNECTED',
          qrCode: null,
          lastActive: new Date(),
        },
      });

      this.emitStatusUpdate(sessionName, 'CONNECTED');
      this.gateway.emitSessionConnected(sessionName);
    });

    client.on('authenticated', async () => {
      console.log(`Client ${sessionName} authenticated!`);
      clientData.status = 'AUTHENTICATED';

      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: { status: 'AUTHENTICATED' },
      });

      this.emitStatusUpdate(sessionName, 'AUTHENTICATED');
    });

    client.on('auth_failure', async (msg) => {
      console.error(`Authentication failure for ${sessionName}:`, msg);
      clientData.status = 'DISCONNECTED';

      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: { status: 'DISCONNECTED' },
      });

      this.emitStatusUpdate(sessionName, 'DISCONNECTED');
      this.gateway.emitSessionDisconnected(sessionName, 'auth_failure');
    });

    client.on('disconnected', async (reason) => {
      console.log(`Client ${sessionName} disconnected:`, reason);
      clientData.status = 'DISCONNECTED';

      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: { status: 'DISCONNECTED' },
      });

      this.emitStatusUpdate(sessionName, 'DISCONNECTED');
      this.gateway.emitSessionDisconnected(sessionName, reason);

      this.clients.delete(sessionName);
    });

    client.on('message', async (message) => {
      await this.handleIncomingMessage(sessionName, message);
    });

    try {
      await client.initialize();
      return { success: true, message: 'Session initialization started' };
    } catch (error) {
      this.clients.delete(sessionName);
      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: { status: 'DISCONNECTED' },
      });
      this.emitStatusUpdate(sessionName, 'DISCONNECTED');
      throw error;
    }
  }

  private emitStatusUpdate(
    sessionName: string,
    status: WhatsAppStatus,
    qrCode?: string | null,
    pairingCode?: string | null,
  ) {
    this.gateway.emitStatusUpdate({
      sessionName,
      status,
      qrCode,
      pairingCode,
      timestamp: new Date(),
    });
  }

  private async convertQrToDataUrl(qrString: string): Promise<string> {
    try {
      return await QRCode.toDataURL(qrString);
    } catch (error) {
      console.error('Error generating QR code image:', error);
      throw new Error('Failed to generate QR code image');
    }
  }

  async getSessionStatus(sessionName: string): Promise<{
    status: WhatsAppStatus;
    qrCode: string | null;
    pairingCode: string | null;
  }> {
    const clientData = this.clients.get(sessionName);

    if (clientData) {
      return {
        status: clientData.status,
        qrCode: clientData.qrCode,
        pairingCode: clientData.pairingCode,
      };
    }

    const session = await this.prisma.whatsAppSession.findUnique({
      where: { name: sessionName },
    });

    return {
      status: session?.status || 'DISCONNECTED',
      qrCode: session?.qrCode || null,
      pairingCode: session?.pairingCode || null,
    };
  }

  async getQrCode(sessionName: string): Promise<string | null> {
    const clientData = this.clients.get(sessionName);
    if (!clientData?.qrCode) {
      return null;
    }

    // Convert QR code string to data URL
    return this.convertQrToDataUrl(clientData.qrCode);
  }

  async requestPairingCode(sessionName: string, phoneNumber: string): Promise<string | null> {
    const clientData = this.clients.get(sessionName);

    if (!clientData) {
      throw new Error('Session not initialized');
    }

    try {
      const code = await clientData.client.requestPairingCode(phoneNumber);
      clientData.pairingCode = code;

      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: { pairingCode: code },
      });

      this.emitStatusUpdate(sessionName, clientData.status, clientData.qrCode, code);

      return code;
    } catch (error) {
      console.error(`Failed to request pairing code for ${sessionName}:`, error);
      throw error;
    }
  }

  async disconnectSession(sessionName: string): Promise<{ success: boolean; message: string }> {
    const clientData = this.clients.get(sessionName);

    if (!clientData) {
      return { success: false, message: 'Session not found' };
    }

    try {
      await clientData.client.logout();
      await clientData.client.destroy();
      this.clients.delete(sessionName);

      await this.prisma.whatsAppSession.update({
        where: { name: sessionName },
        data: {
          status: 'DISCONNECTED',
          qrCode: null,
          pairingCode: null,
        },
      });

      this.emitStatusUpdate(sessionName, 'DISCONNECTED');
      this.gateway.emitSessionDisconnected(sessionName, 'manual_disconnect');

      return { success: true, message: 'Session disconnected successfully' };
    } catch (error) {
      console.error(`Failed to disconnect ${sessionName}:`, error);
      throw error;
    }
  }

  async sendMessage(sessionName: string, phoneNumber: string, message: string): Promise<boolean> {
    const clientData = this.clients.get(sessionName);

    if (!clientData || clientData.status !== 'CONNECTED') {
      throw new Error('Session not connected');
    }

    try {
      const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
      await clientData.client.sendMessage(chatId, message);
      return true;
    } catch (error) {
      console.error(`Failed to send message:`, error);
      throw error;
    }
  }

  private async handleIncomingMessage(sessionName: string, message: any): Promise<void> {
    console.log(`Message received on ${sessionName}:`, message.body);

    const phoneNumber = message.from.replace('@c.us', '');

    const contact = await this.prisma.whatsAppContact.findUnique({
      where: { phoneNumber },
      include: { user: true },
    });

    if (!contact || !contact.isVerified) {
      await message.reply(
        'Seu número não está cadastrado ou verificado. Entre em contato com o administrador.',
      );
      return;
    }

    try {
      const command = this.commandParser.parseCommand(message.body);
      const result = await this.commandParser.executeCommand(contact.userId, command);
      await message.reply(result.message);
    } catch (error) {
      console.error('Error processing command:', error);
      await message.reply(
        'Desculpe, ocorreu um erro ao processar seu comando. Por favor, tente novamente.',
      );
    }
  }

  async getAllSessions(): Promise<any[]> {
    return this.prisma.whatsAppSession.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSession(sessionName: string): Promise<void> {
    await this.disconnectSession(sessionName);
    await this.prisma.whatsAppSession.delete({
      where: { name: sessionName },
    });
  }
}
