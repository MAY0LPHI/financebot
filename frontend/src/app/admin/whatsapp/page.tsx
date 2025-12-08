'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { whatsappApi, adminApi } from '@/lib/api';
import { getWhatsAppSocket, disconnectWhatsAppSocket, WhatsAppStatusUpdate, QrCodeEvent, SessionEvent } from '@/lib/socket';

interface Session {
  id: string;
  name: string;
  status: string;
  qrCode?: string;
  pairingCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: string;
  phoneNumber: string;
  userId?: string;
  user?: { name: string; email: string };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DISCONNECTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  CONNECTING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  QR_READY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  CONNECTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  AUTHENTICATED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const statusLabels: Record<string, string> = {
  DISCONNECTED: 'Desconectado',
  CONNECTING: 'Conectando...',
  QR_READY: 'Aguardando QR',
  CONNECTED: 'Conectado',
  AUTHENTICATED: 'Autenticado',
};

export default function WhatsAppPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [qrDialog, setQrDialog] = useState<{ open: boolean; qrCode: string; sessionName: string }>({
    open: false,
    qrCode: '',
    sessionName: '',
  });
  const [pairingDialog, setPairingDialog] = useState<{ open: boolean; sessionName: string; code: string }>({
    open: false,
    sessionName: '',
    code: '',
  });
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleStatusUpdate = useCallback((update: WhatsAppStatusUpdate) => {
    console.log('Status update received:', update);
    setSessions((prev) =>
      prev.map((session) =>
        session.name === update.sessionName
          ? { 
              ...session, 
              status: update.status, 
              qrCode: update.qrCode || undefined, 
              pairingCode: update.pairingCode || undefined,
              updatedAt: new Date().toISOString() 
            }
          : session
      )
    );

    if (update.qrCode && qrDialog.open && qrDialog.sessionName === update.sessionName) {
      setQrDialog((prev) => ({ ...prev, qrCode: update.qrCode! }));
    }

    if (update.pairingCode && pairingDialog.open && pairingDialog.sessionName === update.sessionName) {
      setPairingDialog((prev) => ({ ...prev, code: update.pairingCode! }));
    }
  }, [qrDialog.open, qrDialog.sessionName, pairingDialog.open, pairingDialog.sessionName]);

  const handleQrCode = useCallback((event: QrCodeEvent) => {
    console.log('QR code received:', event.sessionName);
    if (qrDialog.open && qrDialog.sessionName === event.sessionName) {
      setQrDialog((prev) => ({ ...prev, qrCode: event.qrCode }));
    }
  }, [qrDialog.open, qrDialog.sessionName]);

  const handleSessionConnected = useCallback((event: SessionEvent) => {
    console.log('Session connected:', event.sessionName);
    setSessions((prev) =>
      prev.map((session) =>
        session.name === event.sessionName
          ? { ...session, status: 'CONNECTED', qrCode: undefined, updatedAt: new Date().toISOString() }
          : session
      )
    );
    if (qrDialog.open && qrDialog.sessionName === event.sessionName) {
      setQrDialog({ open: false, qrCode: '', sessionName: '' });
    }
  }, [qrDialog.open, qrDialog.sessionName]);

  const handleSessionDisconnected = useCallback((event: SessionEvent) => {
    console.log('Session disconnected:', event.sessionName, event.reason);
    setSessions((prev) =>
      prev.map((session) =>
        session.name === event.sessionName
          ? { ...session, status: 'DISCONNECTED', qrCode: undefined, updatedAt: new Date().toISOString() }
          : session
      )
    );
  }, []);

  useEffect(() => {
    loadData();

    const socket = getWhatsAppSocket();

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('status-update', handleStatusUpdate);
    socket.on('qr-code', handleQrCode);
    socket.on('session-connected', handleSessionConnected);
    socket.on('session-disconnected', handleSessionDisconnected);

    return () => {
      socket.off('status-update', handleStatusUpdate);
      socket.off('qr-code', handleQrCode);
      socket.off('session-connected', handleSessionConnected);
      socket.off('session-disconnected', handleSessionDisconnected);
      disconnectWhatsAppSocket();
    };
  }, [handleStatusUpdate, handleQrCode, handleSessionConnected, handleSessionDisconnected]);

  const loadData = async () => {
    try {
      const [sessionsRes, contactsRes] = await Promise.all([
        whatsappApi.getSessions(),
        adminApi.getWhatsAppContacts(),
      ]);
      setSessions(sessionsRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    
    setCreating(true);
    try {
      await whatsappApi.initSession(newSessionName);
      setNewSessionName('');
      setShowNewSession(false);
      loadData();
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Erro ao criar sessão');
    } finally {
      setCreating(false);
    }
  };

  const handleShowQr = async (sessionName: string) => {
    try {
      const res = await whatsappApi.getQrCode(sessionName);
      setQrDialog({ open: true, qrCode: res.data.qrCode, sessionName });
    } catch (error: any) {
      alert(error.response?.data?.message || 'QR code não disponível');
    }
  };

  const handleRequestPairing = async (sessionName: string) => {
    if (!phoneNumber.trim()) {
      alert('Digite o número de telefone');
      return;
    }
    
    try {
      const res = await whatsappApi.requestPairingCode(sessionName, phoneNumber);
      setPairingDialog({ open: true, sessionName, code: res.data.pairingCode });
      setPhoneNumber('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao solicitar código');
    }
  };

  const handleDisconnect = async (sessionName: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta sessão?')) return;
    
    try {
      await whatsappApi.disconnect(sessionName);
      loadData();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleDelete = async (sessionName: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sessão?')) return;
    
    try {
      await whatsappApi.deleteSession(sessionName);
      loadData();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gerenciamento WhatsApp</h2>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-muted-foreground">
            {socketConnected ? 'Tempo real ativo' : 'Reconectando...'}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sessões WhatsApp</CardTitle>
            <CardDescription>Gerencie as conexões do bot com o WhatsApp</CardDescription>
          </div>
          <Button onClick={() => setShowNewSession(true)}>Nova Sessão</Button>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma sessão encontrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[session.status] || 'bg-gray-100'}`}>
                        {statusLabels[session.status] || session.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(session.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {session.status === 'QR_READY' && (
                          <Button size="sm" variant="outline" onClick={() => handleShowQr(session.name)}>
                            Ver QR
                          </Button>
                        )}
                        {(session.status === 'CONNECTED' || session.status === 'AUTHENTICATED') && (
                          <Button size="sm" variant="outline" onClick={() => handleDisconnect(session.name)}>
                            Desconectar
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(session.name)}>
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contatos WhatsApp</CardTitle>
          <CardDescription>Telefones vinculados a usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-muted-foreground">Nenhum contato encontrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vinculado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.phoneNumber}</TableCell>
                    <TableCell>{contact.user?.name || '-'}</TableCell>
                    <TableCell>{contact.user?.email || '-'}</TableCell>
                    <TableCell>{formatDate(contact.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewSession} onOpenChange={setShowNewSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Sessão WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Nome da Sessão</label>
            <Input
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="ex: principal"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSession(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSession} disabled={creating}>
              {creating ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={qrDialog.open} onOpenChange={(open: boolean) => setQrDialog({ ...qrDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {qrDialog.sessionName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Escaneie o QR code no WhatsApp do seu celular
            </p>
            {qrDialog.qrCode && (
              <img src={qrDialog.qrCode} alt="QR Code" className="w-64 h-64" />
            )}
            <div className="mt-4 w-full space-y-2">
              <p className="text-sm font-medium">Ou solicite um código de pareamento:</p>
              <div className="flex gap-2">
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="5511999999999"
                />
                <Button onClick={() => handleRequestPairing(qrDialog.sessionName)}>
                  Solicitar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pairingDialog.open} onOpenChange={(open: boolean) => setPairingDialog({ ...pairingDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código de Pareamento</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Digite este código no WhatsApp do seu celular:
            </p>
            <p className="text-4xl font-mono font-bold tracking-widest">{pairingDialog.code}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
