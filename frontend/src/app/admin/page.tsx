'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adminApi, whatsappApi } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Settings, MessageSquare, Activity, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSettings: 0,
    whatsappSessions: 0,
    connectedSessions: 0,
    whatsappContacts: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, settingsRes, sessionsRes, contactsRes, logsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSettings(),
        whatsappApi.getSessions(),
        adminApi.getWhatsAppContacts(),
        adminApi.getAuditLogs({ limit: 10 }).catch(() => ({ data: [] })),
      ]);

      const sessions = sessionsRes.data || [];
      const connected = sessions.filter((s: any) => s.status === 'CONNECTED' || s.status === 'AUTHENTICATED').length;
      const users = usersRes.data || [];

      setStats({
        totalUsers: users.length,
        totalSettings: settingsRes.data?.length || 0,
        whatsappSessions: sessions.length,
        connectedSessions: connected,
        whatsappContacts: contactsRes.data?.length || 0,
      });

      setRecentLogs(logsRes.data?.slice(0, 5) || []);
      setRecentUsers(users.slice(-5).reverse());
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  if (loading) {
    return <p>Carregando estatísticas...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Painel Administrativo</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessões WhatsApp
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.whatsappSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.connectedSessions} conectadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contatos WhatsApp
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.whatsappContacts}</div>
            <p className="text-xs text-muted-foreground">
              Telefones vinculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Configurações
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSettings}</div>
            <p className="text-xs text-muted-foreground">
              Parâmetros do sistema
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Usuários Recentes</CardTitle>
              <CardDescription>Últimos usuários cadastrados</CardDescription>
            </div>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas ações no sistema</CardDescription>
            </div>
            <Link href="/admin/logs">
              <Button variant="outline" size="sm">Ver Logs</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma atividade registrada</p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user?.name || 'Sistema'} • {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido</CardTitle>
          <CardDescription>Links para funcionalidades administrativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Usuários
              </Button>
            </Link>
            <Link href="/admin/whatsapp">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Sessões WhatsApp
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
