import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import api from '../lib/api';
import { Key, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [scans, setScans] = useState([]);
  const [showScans, setShowScans] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await api.get('/apikeys');
      setKeys(res.data.api_keys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }
    try {
      const res = await api.post('/apikeys', formData);
      setNewKeyResult(res.data);
      setCreateDialog(false);
      setFormData({ name: '', description: '' });
      fetchKeys();
      toast.success('API key created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Create failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/apikeys/${id}`);
      toast.success('API key revoked');
      fetchKeys();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.post(`/apikeys/${id}/toggle`);
      fetchKeys();
    } catch (err) {
      toast.error('Toggle failed');
    }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const fetchScans = async () => {
    try {
      const res = await api.get('/external/scans?limit=20');
      setScans(res.data.scans);
      setShowScans(true);
    } catch (err) {
      toast.error('Failed to load scans');
    }
  };

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  return (
    <div className="space-y-4" data-testid="api-keys-page">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          API Keys
          <Badge variant="secondary" className="text-xs ml-1">{keys.length}</Badge>
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchScans} className="h-9 text-sm border-border/50" data-testid="view-scans-button">
            <Eye className="w-4 h-4 mr-1.5" /> Scans
          </Button>
          <Button onClick={() => setCreateDialog(true)} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(6,182,212,0.2)]" data-testid="create-apikey-button">
            <Plus className="w-4 h-4 mr-1.5" /> New API Key
          </Button>
        </div>
      </div>

      {/* API Usage Docs */}
      <Card className="bg-card border-border/50" data-testid="api-docs-card">
        <CardContent className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Integration Guide</p>
          <div className="bg-muted/30 border border-border/30 rounded-md p-3 font-mono text-xs text-muted-foreground">
            <p className="text-primary mb-1"># Scan a prompt for injection attacks:</p>
            <p>curl -X POST {backendUrl}/api/external/scan \</p>
            <p className="pl-4">-H "X-API-Key: hp_your_key_here" \</p>
            <p className="pl-4">-H "Content-Type: application/json" \</p>
            <p className="pl-4">-d '{`{"message": "user prompt here", "user_identifier": "user123"}`}'</p>
            <p className="mt-2 text-primary"># Response includes: is_attack, risk_score, categories, recommended_action</p>
          </div>
        </CardContent>
      </Card>

      {/* Keys List */}
      <div className="grid gap-3" data-testid="apikeys-list">
        {loading ? (
          <Card className="bg-card border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">Loading...</CardContent>
          </Card>
        ) : keys.length === 0 ? (
          <Card className="bg-card border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">
              No API keys yet. Create one to integrate HoneyPrompt with external apps.
            </CardContent>
          </Card>
        ) : keys.map((k) => (
          <Card key={k.id} className={`bg-card border-border/50 hover:border-primary/30 transition-colors ${!k.is_active ? 'opacity-50' : ''}`} data-testid={`apikey-card-${k.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{k.name}</h3>
                    <Badge className={`text-[10px] px-1.5 py-0 ${k.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {k.is_active ? 'Active' : 'Revoked'}
                    </Badge>
                  </div>
                  {k.description && <p className="text-xs text-muted-foreground mb-1">{k.description}</p>}
                  <p className="text-xs font-mono text-muted-foreground">{k.key_preview}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-mono">
                    <span>Used: {k.usage_count || 0}x</span>
                    <span>Created: {new Date(k.created_at).toLocaleDateString()}</span>
                    {k.last_used_at && <span>Last used: {new Date(k.last_used_at).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Switch checked={k.is_active} onCheckedChange={() => handleToggle(k.id)} data-testid={`toggle-apikey-${k.id}`} />
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(k.id)} className="h-7 w-7 p-0 hover:text-destructive" data-testid={`delete-apikey-${k.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="bg-card border-border max-w-md" data-testid="create-apikey-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Create API Key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input data-testid="apikey-name-input" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Production App" className="bg-muted/50 border-input text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description (optional)</Label>
              <Input data-testid="apikey-desc-input" value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="What is this key for?" className="bg-muted/50 border-input text-sm" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreateDialog(false)} className="h-9" data-testid="cancel-apikey-button">Cancel</Button>
              <Button onClick={handleCreate} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="save-apikey-button">Create Key</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Key Result */}
      <Dialog open={!!newKeyResult} onOpenChange={() => setNewKeyResult(null)}>
        <DialogContent className="bg-card border-border max-w-lg" data-testid="new-key-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Key className="w-5 h-5" />
              API Key Created
            </DialogTitle>
          </DialogHeader>
          {newKeyResult && (
            <div className="space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3">
                <p className="text-xs text-destructive font-semibold mb-1">Save this key now. It cannot be shown again.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your API Key</Label>
                <div className="flex gap-2">
                  <Input value={newKeyResult.api_key} readOnly className="bg-muted/50 border-input font-mono text-sm flex-1" data-testid="new-key-value" />
                  <Button variant="outline" onClick={() => copyKey(newKeyResult.api_key)} className="h-10" data-testid="copy-key-button">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => setNewKeyResult(null)} className="w-full h-9 bg-primary text-primary-foreground" data-testid="done-key-button">
                I've Saved It
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* External Scans Dialog */}
      <Dialog open={showScans} onOpenChange={setShowScans}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="scans-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              External API Scans
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            {scans.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground font-mono text-sm">No external scans yet</p>
            ) : (
              <div className="space-y-2">
                {scans.map((s) => (
                  <div key={s.id} className="bg-muted/20 border border-border/30 rounded-md p-3" data-testid={`scan-item-${s.id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary font-mono">{s.api_key_name}</Badge>
                        {s.is_attack && <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px]">ATTACK</Badge>}
                        <Badge variant="outline" className="text-[10px] px-1 py-0 border-muted-foreground/30 text-muted-foreground font-mono">
                          Risk: {s.risk_score}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{new Date(s.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs font-mono text-foreground/80 truncate">{s.message}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">User: {s.user_identifier}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
