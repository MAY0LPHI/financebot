'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adminApi, whatsappApi } from '@/lib/api';
import { Users, Settings, MessageSquare, Activity, CheckCircle, XCircle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    totalSettings: 0,
    whatsappSessions: 0,
    connectedSessions: 0,
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, settingsRes, sessionsRes, logsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSettings(),
        whatsappApi.getSessions(),
        adminApi.getAuditLogs({ limit: 10 }),
      ]);

      const users = usersRes.data || [];
      const sessions = sessionsRes.data || [];
      const connected = sessions.filter((s: any) => s.status === 'CONNECTED' || s.status === 'AUTHENTICATED').length;

      setStats({
        totalUsers: users.length,
        adminUsers: users.filter((u: any) => u.role === 'ADMIN').length,
        totalSettings: settingsRes.data?.length || 0,
        whatsappSessions: sessions.length,
        connectedSessions: connected,
        totalLogs: logsRes.data?.length || 0,
      });

      setRecentActivity(logsRes.data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const userChartOption = {
    title: { text: 'Distribuição de Usuários', left: 'center', top: 10 },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 40 },
    series: [
      {
        name: 'Usuários',
        type: 'pie',
        radius: '50%',
        data: [
          { value: stats.adminUsers, name: 'Administradores' },
          { value: stats.totalUsers - stats.adminUsers, name: 'Usuários Regulares' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const sessionChartOption = {
    title: { text: 'Status das Sessões WhatsApp', left: 'center', top: 10 },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 40 },
    series: [
      {
        name: 'Sessões',
        type: 'pie',
        radius: '50%',
        data: [
          { value: stats.connectedSessions, name: 'Conectadas', itemStyle: { color: '#22c55e' } },
          { value: stats.whatsappSessions - stats.connectedSessions, name: 'Desconectadas', itemStyle: { color: '#ef4444' } },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  if (loading) {
    return <p>Carregando estatísticas...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Painel Administrativo</h2>
        <p className="text-muted-foreground">Visão geral do sistema e métricas principais</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.adminUsers} administrador{stats.adminUsers !== 1 ? 'es' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurações</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSettings}</div>
            <p className="text-xs text-muted-foreground">Parâmetros do sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões WhatsApp</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.whatsappSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.connectedSessions} ativa{stats.connectedSessions !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs de Auditoria</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">Ações recentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Sessões WhatsApp</CardTitle>
            <CardDescription>Conexões ativas e inativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.connectedSessions}</p>
                <p className="text-xs text-muted-foreground">Conectadas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.whatsappSessions - stats.connectedSessions}</p>
                <p className="text-xs text-muted-foreground">Desconectadas</p>
              </div>
            </div>
            {stats.whatsappSessions > 0 && (
              <ReactECharts option={sessionChartOption} style={{ height: '250px' }} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Usuários</CardTitle>
            <CardDescription>Por tipo de permissão</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalUsers > 0 ? (
              <ReactECharts option={userChartOption} style={{ height: '300px' }} />
            ) : (
              <p className="text-center text-muted-foreground py-12">Nenhum usuário cadastrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações registradas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma atividade recente</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent">
                  <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{log.action}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{log.entity}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {log.user ? log.user.name : 'Sistema'}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
