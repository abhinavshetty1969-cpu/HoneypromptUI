import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../lib/api';
import { Webhook, Plus, Pencil, Trash2, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['instruction_override', 'data_exfiltration', 'prompt_leakage', 'social_engineering', 'jailbreak'];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '', min_risk_score: 70, categories: [], is_active: true });

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await api.get('/webhooks');
      setWebhooks(res.data.webhooks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const openCreate = () => {
    setFormData({ name: '', url: '', min_risk_score: 70, categories: [], is_active: true });
    setDialog('create');
  };

  const openEdit = (wh) => {
    setFormData({ name: wh.name, url: wh.url, min_risk_score: wh.min_risk_score, categories: wh.categories || [], is_active: wh.is_active });
    setDialog(wh);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      toast.error('Name and URL are required');
      return;
    }
    try {
      if (dialog === 'create') {
        await api.post('/webhooks', formData);
        toast.success('Webhook created');
      } else {
        await api.put(`/webhooks/${dialog.id}`, formData);
        toast.success('Webhook updated');
      }
      setDialog(null);
      fetchWebhooks();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/webhooks/${id}`);
      toast.success('Webhook deleted');
      fetchWebhooks();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleTest = async (id) => {
    try {
      const res = await api.post(`/webhooks/${id}/test`);
      if (res.data.success) {
        toast.success(`Test sent! Status: ${res.data.status_code}`);
      } else {
        toast.error(`Test failed: ${res.data.error}`);
      }
    } catch (err) {
      toast.error('Test failed');
    }
  };

  const handleToggle = async (wh) => {
    try {
      const update = { is_active: !wh.is_active };
      await api.put(`/webhooks/${wh.id}`, update);
      fetchWebhooks();
    } catch (err) {
      toast.error('Toggle failed');
    }
  };

  const toggleCategory = (cat) => {
    setFormData(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat]
    }));
  };

  return (
    <div className="space-y-4" data-testid="webhooks-page">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Webhook className="w-5 h-5 text-primary" />
          Webhook Alerts
          <Badge variant="secondary" className="text-xs ml-1">{webhooks.length}</Badge>
        </h2>
        <Button onClick={openCreate} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(6,182,212,0.2)]" data-testid="create-webhook-button">
          <Plus className="w-4 h-4 mr-1.5" /> New Webhook
        </Button>
      </div>

      <div className="grid gap-3" data-testid="webhooks-list">
        {loading ? (
          <Card className="bg-card border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">Loading...</CardContent>
          </Card>
        ) : webhooks.length === 0 ? (
          <Card className="bg-card border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">
              No webhooks configured. Create one to receive attack alerts via HTTP POST.
            </CardContent>
          </Card>
        ) : webhooks.map((wh) => (
          <Card key={wh.id} className={`bg-card border-border/50 hover:border-primary/30 transition-colors ${!wh.is_active ? 'opacity-50' : ''}`} data-testid={`webhook-card-${wh.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{wh.name}</h3>
                    <Badge className={`text-[10px] px-1.5 py-0 ${wh.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {wh.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive font-mono">
                      Min Risk: {wh.min_risk_score}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground truncate">{wh.url}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-mono">
                    <span>Triggered: {wh.trigger_count || 0}x</span>
                    {wh.last_triggered_at && <span>Last: {new Date(wh.last_triggered_at).toLocaleString()}</span>}
                    {wh.last_error && (
                      <span className="text-destructive flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Error
                      </span>
                    )}
                  </div>
                  {wh.categories?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {wh.categories.map(c => (
                        <Badge key={c} variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary font-mono">{c.replace('_',' ')}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Switch checked={wh.is_active} onCheckedChange={() => handleToggle(wh)} data-testid={`toggle-webhook-${wh.id}`} />
                  <Button size="sm" variant="ghost" onClick={() => handleTest(wh.id)} className="h-7 w-7 p-0 hover:text-primary" data-testid={`test-webhook-${wh.id}`}>
                    <Zap className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(wh)} className="h-7 w-7 p-0 hover:text-primary" data-testid={`edit-webhook-${wh.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(wh.id)} className="h-7 w-7 p-0 hover:text-destructive" data-testid={`delete-webhook-${wh.id}`}>
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
        <DialogContent className="bg-card border-border max-w-lg" data-testid="webhook-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-primary" />
              {dialog === 'create' ? 'Create Webhook' : 'Edit Webhook'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input data-testid="webhook-name-input" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Slack Alert" className="bg-muted/50 border-input text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Webhook URL</Label>
              <Input data-testid="webhook-url-input" value={formData.url} onChange={(e) => setFormData(f => ({ ...f, url: e.target.value }))} placeholder="https://hooks.slack.com/..." className="bg-muted/50 border-input font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min Risk Score to Trigger</Label>
              <Input data-testid="webhook-risk-input" type="number" min={0} max={100} value={formData.min_risk_score} onChange={(e) => setFormData(f => ({ ...f, min_risk_score: parseInt(e.target.value) || 0 }))} className="bg-muted/50 border-input font-mono text-sm w-32" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Filter Categories (empty = all)</Label>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map(c => (
                  <Button
                    key={c}
                    type="button"
                    size="sm"
                    variant={formData.categories.includes(c) ? "default" : "outline"}
                    onClick={() => toggleCategory(c)}
                    className={`text-xs h-7 ${formData.categories.includes(c) ? 'bg-primary text-primary-foreground' : 'border-border/50 text-muted-foreground'}`}
                    data-testid={`webhook-cat-${c}`}
                  >
                    {c.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData(f => ({ ...f, is_active: v }))} data-testid="webhook-active-switch" />
              <Label className="text-sm">Active</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialog(null)} className="h-9" data-testid="cancel-webhook-button">Cancel</Button>
              <Button onClick={handleSave} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="save-webhook-button">
                {dialog === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
