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
import { goalsApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Target, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  achievedAt?: string;
  createdAt: string;
}

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await goalsApi.getAll();
      setGoals(res.data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    
    setForm({
      name: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: threeMonthsLater.toISOString().split('T')[0],
    });
    setEditingGoal(null);
    setShowDialog(true);
  };

  const handleEdit = (goal: Goal) => {
    setForm({
      name: goal.name,
      description: goal.description || '',
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate.split('T')[0],
    });
    setEditingGoal(goal);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.targetAmount) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount) || 0,
        targetDate: new Date(form.targetDate).toISOString(),
      };

      if (editingGoal) {
        await goalsApi.update(editingGoal.id, data);
      } else {
        await goalsApi.create(data);
      }

      setShowDialog(false);
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Erro ao salvar meta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      await goalsApi.delete(id);
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Erro ao excluir meta');
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getDaysRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const activeGoals = goals.filter((g) => !g.achievedAt);
  const achievedGoals = goals.filter((g) => g.achievedAt);
  const totalTargeted = activeGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const totalSaved = activeGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Carregando metas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
          <p className="text-muted-foreground">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Metas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeGoals.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {achievedGoals.length} alcançada{achievedGoals.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valor Alvo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalTargeted)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Economizado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSaved)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTargeted > 0 ? `${((totalSaved / totalTargeted) * 100).toFixed(1)}% do total` : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Falta Economizar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(Math.max(0, totalTargeted - totalSaved))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Metas Ativas</CardTitle>
          <CardDescription>
            {activeGoals.length > 0 ? `${activeGoals.length} meta${activeGoals.length > 1 ? 's' : ''} em andamento` : 'Nenhuma meta ativa'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Você ainda não tem metas ativas</p>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Criar sua primeira meta
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor Alvo</TableHead>
                  <TableHead className="text-right">Economizado</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Data Alvo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeGoals.map((goal) => {
                  const percentage = getProgressPercentage(goal);
                  const daysRemaining = getDaysRemaining(goal.targetDate);
                  return (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{goal.description || '-'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(Number(goal.targetAmount))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {formatCurrency(Number(goal.currentAmount))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-24" />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(goal.targetDate)}
                          <p className={`text-xs ${daysRemaining < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {daysRemaining < 0
                              ? `Atrasado ${Math.abs(daysRemaining)} dias`
                              : daysRemaining === 0
                              ? 'Hoje!'
                              : `${daysRemaining} dias restantes`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(goal)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(goal.id)}>
                            <Trash2 className="h-3 w-3" />
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

      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Metas Alcançadas
            </CardTitle>
            <CardDescription>{achievedGoals.length} meta{achievedGoals.length > 1 ? 's' : ''} completada{achievedGoals.length > 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {achievedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Alcançada em {formatDate(goal.achievedAt!)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(Number(goal.targetAmount))}</p>
                    <Check className="h-5 w-5 text-green-600 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog for Create/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nome da Meta</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Viagem, Emergência, Carro Novo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descreva sua meta..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor Alvo</label>
              <Input
                type="number"
                step="0.01"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor Atual Economizado</label>
              <Input
                type="number"
                step="0.01"
                value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Alvo</label>
              <Input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
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
