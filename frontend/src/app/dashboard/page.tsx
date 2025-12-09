'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { accountsApi, transactionsApi, reportsApi } from '@/lib/api';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import ReactECharts from 'echarts-for-react';

const DAYS_IN_REPORT = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const reportStartDate = new Date(Date.now() - DAYS_IN_REPORT * MS_PER_DAY);
      const reportEndDate = new Date();

      const [accountsRes, transactionsRes, cashFlowRes] = await Promise.all([
        accountsApi.getAll(),
        transactionsApi.getAll({ limit: 5 }),
        reportsApi.getCashFlow(reportStartDate.toISOString(), reportEndDate.toISOString()),
      ]);

      setAccounts(accountsRes.data);
      setTransactions(transactionsRes.data);
      setCashFlow(cashFlowRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  const chartOption = {
    title: { text: 'Fluxo de Caixa' },
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
        data: [cashFlow?.expenses || 0],
        itemStyle: { color: '#F44336' },
      },
    ],
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Saldo Total</CardTitle>
              <CardDescription>Todas as contas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receitas</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(cashFlow?.income || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(cashFlow?.expenses || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Contas</CardTitle>
              <Link href="/dashboard/contas">
                <Button variant="outline" size="sm">Ver Todas</Button>
              </Link>
            </CardHeader>
            <CardContent>
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
                {accounts.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Transações Recentes</CardTitle>
              <Link href="/dashboard/transacoes">
                <Button variant="outline" size="sm">Ver Todas</Button>
              </Link>
            </CardHeader>
            <CardContent>
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
                {transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma transação cadastrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={chartOption} style={{ height: '400px' }} />
        </CardContent>
      </Card>
    </div>
  );
}
