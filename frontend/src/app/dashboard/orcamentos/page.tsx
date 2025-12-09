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
import { budgetsApi, categoriesApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Budget {
  id: string;
  categoryId?: string;
  category?: { name: string };
  amount: string;
  spent: string;
  period: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function OrcamentosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [form, setForm] = useState({
    categoryId: '',
    amount: '',
    period: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetsRes, categoriesRes] = await Promise.all([
        budgetsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setBudgets(budgetsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingBudget(null);
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setForm({
      categoryId: '',
      amount: '',
      period: 'MONTHLY',
      startDate: today.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    });
    setShowDialog(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setForm({
      categoryId: budget.categoryId || '',
      amount: budget.amount,
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: new Date(budget.endDate).toISOString().split('T')[0],
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.startDate || !form.endDate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    setSaving(true);
    try {
      const data = {
        categoryId: form.categoryId || undefined,
        amount: parseFloat(form.amount),
        period: form.period,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };

      if (editingBudget) {
        await budgetsApi.update(editingBudget.id, data);
      } else {
        await budgetsApi.create(data);
      }
      
      setShowDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving budget:', error);
      alert(error.response?.data?.message || 'Erro ao salvar orçamento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
    
    try {
      await budgetsApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Erro ao excluir orçamento');
    }
  };

  const calculateProgress = (spent: string, amount: string) => {
    const spentNum = Number(spent);
    const amountNum = Number(amount);
    if (amountNum === 0) return 0;
    return Math.min((spentNum / amountNum) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return <p>Carregando orçamentos...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Orçamentos</h2>
        <Button onClick={handleNew}>Novo Orçamento</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Orçamentos</CardTitle>
          <CardDescription>Controle seus gastos por categoria e período</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-muted-foreground">Nenhum orçamento cadastrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Orçado</TableHead>
                  <TableHead>Gasto</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => {
                  const progress = calculateProgress(budget.spent || '0', budget.amount);
                  return (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">
                        {budget.category?.name || 'Geral'}
                      </TableCell>
                      <TableCell>
                        {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(budget.amount))}</TableCell>
                      <TableCell>{formatCurrency(Number(budget.spent || 0))}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressColor(progress)}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(budget)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(budget.id)}>
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Categoria (Opcional)</label>
              <Select value={form.categoryId} onValueChange={(value) => setForm({ ...form, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Valor do Orçamento</label>
              <Input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Período</label>
              <Select value={form.period} onValueChange={(value) => setForm({ ...form, period: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                  <SelectItem value="MONTHLY">Mensal</SelectItem>
                  <SelectItem value="YEARLY">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
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
