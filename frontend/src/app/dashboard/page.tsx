'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChatWidget } from '@/components/chat-widget';
import { accountsApi, transactionsApi, reportsApi, budgetsApi, goalsApi } from '@/lib/api';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import ReactECharts from 'echarts-for-react';
import { Wallet, ArrowLeftRight, TrendingUp, Target } from 'lucide-react';

const DAYS_IN_REPORT = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const reportStartDate = new Date(Date.now() - DAYS_IN_REPORT * MS_PER_DAY);
      const reportEndDate = new Date();

      const [accountsRes, transactionsRes, cashFlowRes, budgetsRes, goalsRes] = await Promise.all([
        accountsApi.getAll(),
        transactionsApi.getAll({ limit: 5 }),
        reportsApi.getCashFlow(reportStartDate.toISOString(), reportEndDate.toISOString()),
        budgetsApi.getAll(),
        goalsApi.getAll(),
      ]);

      setAccounts(accountsRes.data || []);
      setTransactions(transactionsRes.data || []);
      setCashFlow(cashFlowRes.data);
      setBudgets(budgetsRes.data || []);
      setGoals(goalsRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const activeBudgets = budgets.filter((b) => b.isActive !== false).length;
  const activeGoals = goals.filter((g) => !g.achievedAt).length;

  const chartOption = {
    title: { text: 'Fluxo de Caixa (Últimos 30 dias)' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['Receitas', 'Despesas'] },
    xAxis: { type: 'category', data: ['Mês atual'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Receitas',
        type: 'bar',
        data: [cashFlow?.income || 0],
        itemStyle: { color: '#4CAF50' },
      },
      {
        name: 'Despesas',
        type: 'bar',
        data: [Math.abs(cashFlow?.expenses || 0)],
        itemStyle: { color: '#F44336' },
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length} conta{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cashFlow?.income || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Math.abs(cashFlow?.expenses || 0))}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos & Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBudgets + activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              {activeBudgets} orçamento{activeBudgets !== 1 ? 's' : ''}, {activeGoals} meta{activeGoals !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contas Recentes</CardTitle>
            <Link href="/dashboard/contas" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada</p>
            ) : (
              <div className="space-y-2">
                {accounts.slice(0, 5).map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-2 rounded hover:bg-accent">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{account.type}</p>
                    </div>
                    <p className="font-bold">{formatCurrency(Number(account.balance))}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Link href="/dashboard/transacoes" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma transação encontrada</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-2 rounded hover:bg-accent">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <p className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Fluxo de Caixa</CardTitle>
          <CardDescription>Receitas vs Despesas dos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts option={chartOption} style={{ height: '400px' }} />
        </CardContent>
      </Card>

      <ChatWidget />
    </div>
  );
}
