import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WhatsAppStatus } from '@prisma/client';

export interface WhatsAppStatusUpdate {
  sessionName: string;
  status: WhatsAppStatus;
  qrCode?: string | null;
  pairingCode?: string | null;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/whatsapp',
})
export class WhatsAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected to WhatsApp gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from WhatsApp gateway: ${client.id}`);
  }

  emitStatusUpdate(update: WhatsAppStatusUpdate) {
    this.server.emit('status-update', update);
  }

  emitQrCode(sessionName: string, qrCode: string) {
    this.server.emit('qr-code', { sessionName, qrCode, timestamp: new Date() });
  }

  emitSessionConnected(sessionName: string) {
    this.server.emit('session-connected', { sessionName, timestamp: new Date() });
  }

  emitSessionDisconnected(sessionName: string, reason?: string) {
    this.server.emit('session-disconnected', { sessionName, reason, timestamp: new Date() });
  }
}
