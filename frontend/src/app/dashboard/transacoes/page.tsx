'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { transactionsApi, accountsApi, categoriesApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  date: string;
  accountId: string;
  account?: { name: string };
  categoryId?: string;
  category?: { name: string };
  createdAt: string;
}

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        transactionsApi.getAll({ limit: 100 }),
        accountsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setTransactions(transactionsRes.data || []);
      setAccounts(accountsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingTransaction(null);
    setForm({
      type: 'EXPENSE',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      accountId: accounts[0]?.id || '',
      categoryId: '',
    });
    setShowDialog(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0],
      accountId: transaction.accountId,
      categoryId: transaction.categoryId || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.description.trim() || !form.amount || !form.accountId) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    setSaving(true);
    try {
      const data = {
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description,
        date: new Date(form.date).toISOString(),
        accountId: form.accountId,
        categoryId: form.categoryId || undefined,
      };

      if (editingTransaction) {
        await transactionsApi.update(editingTransaction.id, data);
      } else {
        await transactionsApi.create(data);
      }
      
      setShowDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      alert(error.response?.data?.message || 'Erro ao salvar transação');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    try {
      await transactionsApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erro ao excluir transação');
    }
  };

  if (loading) {
    return <p>Carregando transações...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Transações</h2>
        <Button onClick={handleNew}>Nova Transação</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Registre suas receitas e despesas</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma transação cadastrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.category?.name || '-'}</TableCell>
                    <TableCell>{transaction.account?.name || '-'}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(transaction)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(transaction.id)}>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Receita</SelectItem>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Salário, Aluguel, Compras..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor</label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Conta</label>
              <Select value={form.accountId} onValueChange={(value) => setForm({ ...form, accountId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Categoria (Opcional)</label>
              <Select value={form.categoryId} onValueChange={(value) => setForm({ ...form, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
