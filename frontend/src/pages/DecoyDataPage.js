import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import api from '../lib/api';
import { Database, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['instruction_override', 'data_exfiltration', 'prompt_leakage', 'social_engineering', 'jailbreak'];

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

export default function DecoyDataPage() {
  const [decoys, setDecoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ category: 'instruction_override', title: '', content: '', is_active: true });

  const fetchDecoys = useCallback(async () => {
    try {
      const res = await api.get('/decoys');
      setDecoys(res.data.decoys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDecoys(); }, [fetchDecoys]);

  const openCreate = () => {
    setFormData({ category: 'instruction_override', title: '', content: '', is_active: true });
    setDialog('create');
  };

  const openEdit = (d) => {
    setFormData({ category: d.category, title: d.title, content: d.content, is_active: d.is_active });
    setDialog(d);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }
    try {
      if (dialog === 'create') {
        await api.post('/decoys', formData);
        toast.success('Decoy data created');
      } else {
        await api.put(`/decoys/${dialog.id}`, formData);
        toast.success('Decoy data updated');
      }
      setDialog(null);
      fetchDecoys();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/decoys/${id}`);
      toast.success('Decoy data deleted');
      fetchDecoys();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (d) => {
    try {
      await api.put(`/decoys/${d.id}`, { is_active: !d.is_active });
      fetchDecoys();
    } catch (err) {
      toast.error('Toggle failed');
    }
  };

  return (
    <div className="space-y-4" data-testid="decoy-data-page">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-warning" />
          Decoy Data
          <Badge variant="secondary" className="text-xs ml-1">{decoys.length}</Badge>
        </h2>
        <Button onClick={openCreate} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(6,182,212,0.2)]" data-testid="create-decoy-button">
          <Plus className="w-4 h-4 mr-1.5" /> New Decoy
        </Button>
      </div>

      <div className="bg-muted/20 border border-border/30 rounded-md p-3 text-xs text-muted-foreground font-mono" data-testid="decoy-info">
        Decoy data is served to attackers when prompt injection is detected. Make it look realistic to keep attackers engaged while logging their behavior. Each category can have one active decoy.
      </div>

      <div className="grid gap-3" data-testid="decoys-list">
        {loading ? (
          <Card className="bg-card border-border/50"><CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">Loading...</CardContent></Card>
        ) : decoys.length === 0 ? (
          <Card className="bg-card border-border/50"><CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">No decoy data. Create some to bait attackers with realistic fake responses.</CardContent></Card>
        ) : decoys.map((d) => (
          <Card key={d.id} className={`bg-card border-border/50 hover:border-primary/30 transition-colors ${!d.is_active ? 'opacity-50' : ''}`} data-testid={`decoy-card-${d.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm">{d.title}</h3>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono" style={{ borderColor: `${categoryColor(d.category)}40`, color: categoryColor(d.category) }}>
                      {d.category?.replace('_', ' ')}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 ${d.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground line-clamp-2">{d.content}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Switch checked={d.is_active} onCheckedChange={() => handleToggle(d)} data-testid={`toggle-decoy-${d.id}`} />
                  <Button size="sm" variant="ghost" onClick={() => setPreview(d)} className="h-7 w-7 p-0 hover:text-primary" data-testid={`preview-decoy-${d.id}`}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(d)} className="h-7 w-7 p-0 hover:text-primary" data-testid={`edit-decoy-${d.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)} className="h-7 w-7 p-0 hover:text-destructive" data-testid={`delete-decoy-${d.id}`}>
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
        <DialogContent className="bg-card border-border max-w-lg" data-testid="decoy-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-warning" />
              {dialog === 'create' ? 'Create Decoy Data' : 'Edit Decoy Data'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input data-testid="decoy-title-input" value={formData.title} onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Fake API Credentials" className="bg-muted/50 border-input text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-muted/50 border-input text-sm" data-testid="decoy-category-select">
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
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Fake Response Content</Label>
              <textarea
                data-testid="decoy-content-input"
                value={formData.content}
                onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                placeholder="Write realistic-looking fake data that will be served to attackers..."
                className="w-full h-40 bg-muted/50 border border-input rounded-md p-2.5 font-mono text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
              />
              <p className="text-[10px] text-muted-foreground">Make it look real. The more convincing, the longer attackers stay engaged.</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData(f => ({ ...f, is_active: v }))} data-testid="decoy-active-switch" />
              <Label className="text-sm">Active</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialog(null)} className="h-9" data-testid="cancel-decoy-button">Cancel</Button>
              <Button onClick={handleSave} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="save-decoy-button">
                {dialog === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="bg-card border-border max-w-lg" data-testid="decoy-preview-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Decoy Preview: {preview?.title}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono" style={{ borderColor: `${categoryColor(preview.category)}40`, color: categoryColor(preview.category) }}>
                  {preview.category?.replace('_', ' ')}
                </Badge>
                <span className="text-[10px] text-muted-foreground">This is what the attacker will see:</span>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-md p-4">
                <p className="font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed">{preview.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
