import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { honeypotsAPI } from '../lib/api';
import { Radar, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['instruction_override', 'data_exfiltration', 'prompt_leakage', 'social_engineering', 'jailbreak'];

export default function HoneypotSettingsPage() {
  const [honeypots, setHoneypots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null); // 'create' | honeypot object for edit
  const [formData, setFormData] = useState({ name: '', content: '', category: 'instruction_override', is_active: true });

  const fetchHoneypots = useCallback(async () => {
    try {
      const res = await honeypotsAPI.list();
      setHoneypots(res.data.honeypots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHoneypots(); }, [fetchHoneypots]);

  const openCreate = () => {
    setFormData({ name: '', content: '', category: 'instruction_override', is_active: true });
    setDialog('create');
  };

  const openEdit = (hp) => {
    setFormData({ name: hp.name, content: hp.content, category: hp.category, is_active: hp.is_active });
    setDialog(hp);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      toast.error('Name and content are required');
      return;
    }
    try {
      if (dialog === 'create') {
        await honeypotsAPI.create(formData);
        toast.success('Honeypot created');
      } else {
        await honeypotsAPI.update(dialog.id, formData);
        toast.success('Honeypot updated');
      }
      setDialog(null);
      fetchHoneypots();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await honeypotsAPI.delete(id);
      toast.success('Honeypot deleted');
      fetchHoneypots();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (hp) => {
    try {
      await honeypotsAPI.update(hp.id, { is_active: !hp.is_active });
      fetchHoneypots();
    } catch (err) {
      toast.error('Toggle failed');
    }
  };

  const categoryColor = (cat) => {
    const map = {
      instruction_override: '#ef4444',
      data_exfiltration: '#f59e0b',
      prompt_leakage: '#06b6d4',
      social_engineering: '#8b5cf6',
      jailbreak: '#d946ef'
    };
    return map[cat] || '#94a3b8';
  };

  return (
    <div className="space-y-4" data-testid="honeypot-settings-page">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Radar className="w-5 h-5" style={{ color: '#d946ef' }} />
          Honeypot Configuration
          <Badge variant="secondary" className="text-xs ml-1">{honeypots.length}</Badge>
        </h2>
        <Button
          onClick={openCreate}
          className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          data-testid="create-honeypot-button"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Honeypot
        </Button>
      </div>

      <div className="grid gap-3" data-testid="honeypots-list">
        {loading ? (
          <Card className="bg-card border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">Loading...</CardContent>
          </Card>
        ) : honeypots.length === 0 ? (
          <Card className="bg-card border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">No honeypots configured</CardContent>
          </Card>
        ) : honeypots.map((hp) => (
          <Card key={hp.id} className={`bg-card border-border/50 hover:border-primary/30 transition-colors ${!hp.is_active ? 'opacity-50' : ''}`} data-testid={`honeypot-card-${hp.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm">{hp.name}</h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 font-mono"
                      style={{ borderColor: `${categoryColor(hp.category)}40`, color: categoryColor(hp.category) }}
                    >
                      {hp.category?.replace('_', ' ')}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 ${hp.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {hp.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground line-clamp-2">{hp.content}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Switch
                    checked={hp.is_active}
                    onCheckedChange={() => handleToggle(hp)}
                    data-testid={`toggle-honeypot-${hp.id}`}
                  />
                  <Button size="sm" variant="ghost" onClick={() => openEdit(hp)} className="h-7 w-7 p-0 hover:text-primary" data-testid={`edit-honeypot-${hp.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(hp.id)} className="h-7 w-7 p-0 hover:text-destructive" data-testid={`delete-honeypot-${hp.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="bg-card border-border max-w-lg" data-testid="honeypot-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radar className="w-5 h-5" style={{ color: '#d946ef' }} />
              {dialog === 'create' ? 'Create Honeypot' : 'Edit Honeypot'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input
                data-testid="honeypot-name-input"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Honeypot name"
                className="bg-muted/50 border-input text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-muted/50 border-input text-sm" data-testid="honeypot-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Content</Label>
              <textarea
                data-testid="honeypot-content-input"
                value={formData.content}
                onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                placeholder="Honeypot instructions..."
                className="w-full h-28 bg-muted/50 border border-input rounded-md p-2.5 font-mono text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData(f => ({ ...f, is_active: v }))}
                data-testid="honeypot-active-switch"
              />
              <Label className="text-sm">Active</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialog(null)} className="h-9" data-testid="cancel-honeypot-button">
                Cancel
              </Button>
              <Button onClick={handleSave} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="save-honeypot-button">
                {dialog === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
