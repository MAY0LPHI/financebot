'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { whatsappApi } from '@/lib/api';
import { getWhatsAppSocket, disconnectWhatsAppSocket, WhatsAppStatusUpdate, QrCodeEvent, SessionEvent } from '@/lib/socket';

export default function WhatsAppPairingConsolePage() {
  const [sessionName] = useState('pairing-console');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [requestingPairing, setRequestingPairing] = useState(false);
  const [status, setStatus] = useState<string>('DISCONNECTED');
  const [socketConnected, setSocketConnected] = useState(false);

  const handleStatusUpdate = useCallback((update: WhatsAppStatusUpdate) => {
    if (update.sessionName === sessionName) {
      console.log('Status update received:', update);
      setStatus(update.status);
      
      if (update.qrCode) {
        setQrCode(update.qrCode);
      }
      
      if (update.pairingCode) {
        setPairingCode(update.pairingCode);
      }

      if (update.status === 'CONNECTED') {
        setLoading(false);
        setQrCode(null);
      }
    }
  }, [sessionName]);

  const handleQrCode = useCallback((event: QrCodeEvent) => {
    if (event.sessionName === sessionName) {
      console.log('QR code received:', event.sessionName);
      setQrCode(event.qrCode);
      setLoading(false);
    }
  }, [sessionName]);

  const handleSessionConnected = useCallback((event: SessionEvent) => {
    if (event.sessionName === sessionName) {
      console.log('Session connected:', event.sessionName);
      setStatus('CONNECTED');
      setQrCode(null);
      setPairingCode(null);
      setLoading(false);
      setError(null);
    }
  }, [sessionName]);

  const handleSessionDisconnected = useCallback((event: SessionEvent) => {
    if (event.sessionName === sessionName) {
      console.log('Session disconnected:', event.sessionName, event.reason);
      setStatus('DISCONNECTED');
      setQrCode(null);
      setPairingCode(null);
      setLoading(false);
    }
  }, [sessionName]);

  useEffect(() => {
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

    // Check current status
    checkSessionStatus();

    return () => {
      socket.off('status-update', handleStatusUpdate);
      socket.off('qr-code', handleQrCode);
      socket.off('session-connected', handleSessionConnected);
      socket.off('session-disconnected', handleSessionDisconnected);
      disconnectWhatsAppSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleStatusUpdate, handleQrCode, handleSessionConnected, handleSessionDisconnected]);

  const checkSessionStatus = async () => {
    try {
      const res = await whatsappApi.getStatus(sessionName);
      setStatus(res.data.status);
      if (res.data.qrCode) {
        setQrCode(res.data.qrCode);
      }
      if (res.data.pairingCode) {
        setPairingCode(res.data.pairingCode);
      }
    } catch (error) {
      // Session doesn't exist yet, which is fine
      console.log('Session not found, will create on generate');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setQrCode(null);
    setPairingCode(null);

    try {
      // Initialize the session - QR code will be received via WebSocket
      await whatsappApi.initSession(sessionName);
      // Keep loading state - it will be cleared when QR arrives via socket or error occurs
    } catch (err: any) {
      console.error('Error generating pairing data:', err);
      setError(err.response?.data?.message || 'Failed to generate pairing data');
      setLoading(false);
    }
  };

  const handleRequestPairingCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setRequestingPairing(true);
    setError(null);

    try {
      const res = await whatsappApi.requestPairingCode(sessionName, phoneNumber);
      setPairingCode(res.data.pairingCode);
      setRequestingPairing(false);
    } catch (err: any) {
      console.error('Error requesting pairing code:', err);
      setError(err.response?.data?.message || 'Failed to request pairing code');
      setRequestingPairing(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'CONNECTED':
      case 'AUTHENTICATED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CONNECTING':
      case 'QR_READY':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'CONNECTED':
        return 'Connected';
      case 'AUTHENTICATED':
        return 'Authenticated';
      case 'CONNECTING':
        return 'Connecting...';
      case 'QR_READY':
        return 'QR Ready';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">WhatsApp Pairing Console</h2>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-muted-foreground">
            {socketConnected ? 'Real-time active' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Pairing Code</CardTitle>
          <CardDescription>
            Initialize a new WhatsApp session and get a QR code or pairing code to connect your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusLabel()}
              </span>
            </div>
          </div>

          {status !== 'CONNECTED' && status !== 'AUTHENTICATED' && (
            <Button 
              onClick={handleGenerate} 
              disabled={loading || status === 'CONNECTING' || status === 'QR_READY'}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate QR Code & Pairing Code'}
            </Button>
          )}

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading && !qrCode && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Initializing WhatsApp session...</p>
            </div>
          )}

          {qrCode && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4 space-y-4 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold">Scan QR Code</h3>
                <p className="text-sm text-muted-foreground text-center px-4">
                  Open WhatsApp on your phone → Linked Devices → Link a Device → Scan this QR code
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 border-4 border-primary rounded-lg" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t"></div>
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="flex-1 border-t"></div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Request Pairing Code</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your phone number to receive a pairing code instead
                </p>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="5511999999999 (with country code)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={requestingPairing}
                  />
                  <Button 
                    onClick={handleRequestPairingCode} 
                    disabled={requestingPairing || !phoneNumber.trim()}
                  >
                    {requestingPairing ? 'Requesting...' : 'Request Code'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {pairingCode && (
            <div className="flex flex-col items-center py-6 space-y-4 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold">Your Pairing Code</h3>
              <p className="text-sm text-muted-foreground text-center px-4">
                Open WhatsApp on your phone → Linked Devices → Link a Device → Link with Phone Number → Enter this code
              </p>
              <div className="bg-primary/10 px-8 py-4 rounded-lg">
                <p className="text-4xl font-mono font-bold tracking-widest text-primary">{pairingCode}</p>
              </div>
            </div>
          )}

          {(status === 'CONNECTED' || status === 'AUTHENTICATED') && (
            <div className="flex flex-col items-center py-8 space-y-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Successfully Connected!</h3>
              <p className="text-sm text-green-700 dark:text-green-300 text-center px-4">
                Your WhatsApp session is now active and ready to use.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Using QR Code:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click &quot;Generate QR Code &amp; Pairing Code&quot; button above</li>
              <li>Open WhatsApp on your phone</li>
              <li>Go to Settings → Linked Devices</li>
              <li>Tap &quot;Link a Device&quot;</li>
              <li>Scan the QR code displayed above</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Using Pairing Code:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click &quot;Generate QR Code &amp; Pairing Code&quot; button above</li>
              <li>Enter your phone number (with country code) in the field</li>
              <li>Click &quot;Request Code&quot; to generate a pairing code</li>
              <li>Open WhatsApp on your phone</li>
              <li>Go to Settings → Linked Devices → Link a Device → Link with Phone Number</li>
              <li>Enter the pairing code displayed above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
