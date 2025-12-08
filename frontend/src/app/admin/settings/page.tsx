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
import { adminApi } from '@/lib/api';

interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [form, setForm] = useState({ key: '', value: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await adminApi.getSettings();
      setSettings(res.data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setForm({ key: '', value: '', description: '' });
    setShowNew(true);
  };

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting);
    setForm({ key: setting.key, value: setting.value, description: setting.description || '' });
  };

  const handleSaveNew = async () => {
    if (!form.key.trim() || !form.value.trim()) return;
    
    setSaving(true);
    try {
      await adminApi.createSetting({ key: form.key, value: form.value, description: form.description });
      setShowNew(false);
      loadSettings();
    } catch (error) {
      console.error('Error creating setting:', error);
      alert('Erro ao criar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSetting || !form.value.trim()) return;
    
    setSaving(true);
    try {
      await adminApi.upsertSetting(editingSetting.key, { value: form.value, description: form.description });
      setEditingSetting(null);
      loadSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Erro ao atualizar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;
    
    try {
      await adminApi.deleteSetting(key);
      loadSettings();
    } catch (error) {
      console.error('Error deleting setting:', error);
      alert('Erro ao excluir configuração');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  if (loading) {
    return <p>Carregando configurações...</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Configurações do Sistema</h2>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Parâmetros gerais do sistema</CardDescription>
          </div>
          <Button onClick={handleNew}>Nova Configuração</Button>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma configuração encontrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chave</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-mono font-medium">{setting.key}</TableCell>
                    <TableCell className="max-w-xs truncate">{setting.value}</TableCell>
                    <TableCell className="text-muted-foreground">{setting.description || '-'}</TableCell>
                    <TableCell>{formatDate(setting.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(setting)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(setting.key)}>
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

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Configuração</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Chave</label>
              <Input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="NOME_CONFIGURACAO"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor</label>
              <Textarea
                value={form.value}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, value: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNew} disabled={saving}>
              {saving ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Configuração</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Chave</label>
              <Input value={form.key} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Valor</label>
              <Textarea
                value={form.value}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, value: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSetting(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
