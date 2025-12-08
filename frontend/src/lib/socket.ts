import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface WhatsAppStatusUpdate {
  sessionName: string;
  status: string;
  qrCode?: string | null;
  pairingCode?: string | null;
  timestamp: Date;
}

export interface QrCodeEvent {
  sessionName: string;
  qrCode: string;
  timestamp: Date;
}

export interface SessionEvent {
  sessionName: string;
  reason?: string;
  timestamp: Date;
}

export function getWhatsAppSocket(): Socket {
  if (!socket) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    socket = io(`${backendUrl}/whatsapp`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('Connected to WhatsApp WebSocket');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WhatsApp WebSocket:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('WhatsApp WebSocket connection error:', error);
    });
  }

  return socket;
}

export function disconnectWhatsAppSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
