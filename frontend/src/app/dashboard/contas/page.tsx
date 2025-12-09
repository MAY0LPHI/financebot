'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { accountsApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  createdAt: string;
}

export default function ContasPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form, setForm] = useState({ name: '', type: 'CHECKING', balance: '0' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await accountsApi.getAll();
      setAccounts(res.data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingAccount(null);
    setForm({ name: '', type: 'CHECKING', balance: '0' });
    setShowDialog(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setForm({ 
      name: account.name, 
      type: account.type, 
      balance: account.balance 
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('O nome da conta é obrigatório');
      return;
    }
    
    setSaving(true);
    try {
      const data = {
        name: form.name,
        type: form.type,
        balance: parseFloat(form.balance) || 0,
      };

      if (editingAccount) {
        await accountsApi.update(editingAccount.id, data);
      } else {
        await accountsApi.create(data);
      }
      
      setShowDialog(false);
      loadAccounts();
    } catch (error: any) {
      console.error('Error saving account:', error);
      alert(error.response?.data?.message || 'Erro ao salvar conta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    
    try {
      await accountsApi.delete(id);
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Erro ao excluir conta');
    }
  };

  const accountTypes = [
    { value: 'CHECKING', label: 'Conta Corrente' },
    { value: 'SAVINGS', label: 'Poupança' },
    { value: 'INVESTMENT', label: 'Investimento' },
    { value: 'CASH', label: 'Dinheiro' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  ];

  if (loading) {
    return <p>Carregando contas...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Contas</h2>
        <Button onClick={handleNew}>Nova Conta</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Contas</CardTitle>
          <CardDescription>Gerencie suas contas bancárias e ativos</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma conta cadastrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      {accountTypes.find(t => t.value === account.type)?.label || account.type}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(Number(account.balance))}
                    </TableCell>
                    <TableCell>{formatDate(account.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(account)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(account.id)}>
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
            <DialogTitle>{editingAccount ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nome da Conta</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Banco do Brasil CC"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Saldo Inicial</label>
              <Input
                type="number"
                step="0.01"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
                placeholder="0.00"
              />
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
