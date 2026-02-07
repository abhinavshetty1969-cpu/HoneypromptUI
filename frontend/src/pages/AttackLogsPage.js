import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { attacksAPI } from '../lib/api';
import { Search, ChevronLeft, ChevronRight, ShieldAlert, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['all', 'instruction_override', 'data_exfiltration', 'prompt_leakage', 'social_engineering', 'jailbreak'];

const riskColor = (score) => {
  if (score >= 75) return '#ef4444';
  if (score >= 50) return '#f59e0b';
  if (score >= 25) return '#06b6d4';
  return '#10b981';
};

export default function AttackLogsPage() {
  const [attacks, setAttacks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedAttack, setSelectedAttack] = useState(null);
  const limit = 15;

  const fetchAttacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit, skip: page * limit };
      if (category !== 'all') params.category = category;
      const res = await attacksAPI.list(params);
      setAttacks(res.data.attacks);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, category]);

  useEffect(() => { fetchAttacks(); }, [fetchAttacks]);

  const filtered = search
    ? attacks.filter(a => a.message?.toLowerCase().includes(search.toLowerCase()) || a.user_email?.toLowerCase().includes(search.toLowerCase()))
    : attacks;

  const totalPages = Math.ceil(total / limit);

  const handleExport = async (format) => {
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('honeyprompt_token');
      const queryStr = new URLSearchParams({ format, ...params }).toString();
      const res = await fetch(`${backendUrl}/api/attacks/export?${queryStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `honeyprompt_attacks.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-4" data-testid="attack-logs-page">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          Attack Logs
          <Badge variant="destructive" className="text-xs ml-1">{total}</Badge>
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="attack-search-input"
              placeholder="Search attacks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-input font-mono text-sm h-9"
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0); }}>
            <SelectTrigger className="w-48 bg-muted/50 border-input h-9 text-sm" data-testid="category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="h-9 border-border/50 text-xs" data-testid="export-csv-button">
            <Download className="w-3.5 h-3.5 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="h-9 border-border/50 text-xs" data-testid="export-json-button">
            <Download className="w-3.5 h-3.5 mr-1" /> JSON
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border/50 overflow-hidden" data-testid="attacks-table-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border/50">
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Timestamp</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">User</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Prompt</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Categories</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Risk</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground font-mono text-sm">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground font-mono text-sm">No attacks found</td></tr>
                ) : filtered.map((attack) => (
                  <tr key={attack.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors" data-testid={`attack-row-${attack.id}`}>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(attack.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{attack.user_email}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate font-mono">{attack.message}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {attack.categories?.map(c => (
                          <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary font-mono">
                            {c.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: riskColor(attack.risk_score) }} />
                        <span className="text-sm font-mono font-semibold" style={{ color: riskColor(attack.risk_score) }}>
                          {attack.risk_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedAttack(attack)}
                        className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                        data-testid={`view-attack-${attack.id}`}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-mono">
                Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-7 w-7 p-0" data-testid="prev-page">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="h-7 w-7 p-0" data-testid="next-page">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attack Detail Dialog */}
      <Dialog open={!!selectedAttack} onOpenChange={() => setSelectedAttack(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="attack-detail-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Attack Detail
            </DialogTitle>
          </DialogHeader>
          {selectedAttack && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Risk Score</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: riskColor(selectedAttack.risk_score) }}>
                    {selectedAttack.risk_score}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Timestamp</p>
                  <p className="text-sm font-mono">{new Date(selectedAttack.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">User</p>
                  <p className="text-sm font-mono">{selectedAttack.user_email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Session</p>
                  <p className="text-xs font-mono text-muted-foreground truncate">{selectedAttack.session_id}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Categories</p>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedAttack.categories?.map(c => (
                    <Badge key={c} className="bg-destructive/10 text-destructive border border-destructive/20 text-xs">
                      {c.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Malicious Prompt</p>
                <div className="bg-muted/50 border border-border/50 rounded-md p-3">
                  <p className="font-mono text-sm text-destructive whitespace-pre-wrap">{selectedAttack.message}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Honeypot Response</p>
                <div className="bg-muted/50 border border-border/50 rounded-md p-3">
                  <p className="font-mono text-sm text-primary whitespace-pre-wrap">{selectedAttack.response}</p>
                </div>
              </div>

              {selectedAttack.detections?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Detection Details</p>
                  <div className="space-y-2">
                    {selectedAttack.detections.map((d, i) => (
                      <div key={i} className="bg-muted/30 border border-border/30 rounded-md p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{d.category}</Badge>
                          <span className="text-xs font-mono text-muted-foreground">Weight: {d.risk_weight}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{d.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
