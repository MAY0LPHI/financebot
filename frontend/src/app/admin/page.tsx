'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi, whatsappApi } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSettings: 0,
    whatsappSessions: 0,
    connectedSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, settingsRes, sessionsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSettings(),
        whatsappApi.getSessions(),
      ]);

      const sessions = sessionsRes.data || [];
      const connected = sessions.filter((s: any) => s.status === 'CONNECTED' || s.status === 'AUTHENTICATED').length;

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalSettings: settingsRes.data?.length || 0,
        whatsappSessions: sessions.length,
        connectedSessions: connected,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Carregando estatísticas...</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Painel Administrativo</h2>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalSettings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessões WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.whatsappSessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessões Conectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.connectedSessions}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
