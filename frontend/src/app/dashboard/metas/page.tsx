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
import { formatCurrency } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: string;
  currentAmount: string;
  deadline?: string;
  status: string;
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
    deadline: '',
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
    setEditingGoal(null);
    setForm({
      name: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
    });
    setShowDialog(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name,
      description: goal.description || '',
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
    });
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
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      };

      if (editingGoal) {
        await goalsApi.update(editingGoal.id, data);
      } else {
        await goalsApi.create(data);
      }
      
      setShowDialog(false);
      loadGoals();
    } catch (error: any) {
      console.error('Error saving goal:', error);
      alert(error.response?.data?.message || 'Erro ao salvar meta');
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const calculateProgress = (current: string, target: string) => {
    const currentNum = Number(current);
    const targetNum = Number(target);
    if (targetNum === 0) return 0;
    return Math.min((currentNum / targetNum) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      IN_PROGRESS: { label: 'Em Progresso', class: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Concluída', class: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelada', class: 'bg-gray-100 text-gray-800' },
    };
    const info = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${info.class}`}>{info.label}</span>;
  };

  if (loading) {
    return <p>Carregando metas...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Metas Financeiras</h2>
        <Button onClick={handleNew}>Nova Meta</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Metas</CardTitle>
          <CardDescription>Defina e acompanhe seus objetivos financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma meta cadastrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Atual</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => {
                  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                  return (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{goal.name}</p>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(goal.targetAmount))}</TableCell>
                      <TableCell>{formatCurrency(Number(goal.currentAmount))}</TableCell>
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
                      <TableCell>{goal.deadline ? formatDate(goal.deadline) : '-'}</TableCell>
                      <TableCell>{getStatusBadge(goal.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(goal)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(goal.id)}>
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
            <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nome da Meta</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Viagem, Carro, Casa..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (Opcional)</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes sobre a meta..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor da Meta</label>
              <Input
                type="number"
                step="0.01"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor Atual</label>
              <Input
                type="number"
                step="0.01"
                value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prazo (Opcional)</label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
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
