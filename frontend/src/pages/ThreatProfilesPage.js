import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Fingerprint, ShieldAlert, AlertTriangle, UserX, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { usersAPI } from '../lib/api';
import api from '../lib/api';

const threatColor = (level) => {
  const map = { critical: '#ef4444', high: '#f59e0b', medium: '#06b6d4', low: '#10b981' };
  return map[level] || '#94a3b8';
};

export default function ThreatProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await api.get('/profiles');
      setProfiles(res.data.profiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const handleBlock = async (userId, email) => {
    try {
      await usersAPI.block({ user_id: userId, reason: 'Blocked from threat profile - high risk' });
      toast.success(`User ${email} blocked`);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Block failed');
    }
  };

  return (
    <div className="space-y-4" data-testid="threat-profiles-page">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-primary" />
          Threat Profiles
          <Badge variant="secondary" className="text-xs ml-1">{profiles.length}</Badge>
        </h2>
      </div>

      {loading ? (
        <Card className="bg-card border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">Loading profiles...</CardContent>
        </Card>
      ) : profiles.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground font-mono text-sm">
            No threat profiles yet. Profiles are created when attacks are detected.
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border/50 overflow-hidden" data-testid="profiles-table-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/50">
                    <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">User</th>
                    <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Threat Level</th>
                    <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Total Attacks</th>
                    <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Avg Risk</th>
                    <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Categories</th>
                    <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Sessions</th>
                    <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Last Attack</th>
                    <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.user_id} className="border-b border-border/30 hover:bg-muted/20 transition-colors" data-testid={`profile-row-${p.user_id}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{p.user_name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{p.user_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className="text-[10px] px-1.5 py-0.5 uppercase font-mono font-bold"
                          style={{
                            background: `${threatColor(p.threat_level)}15`,
                            color: threatColor(p.threat_level),
                            border: `1px solid ${threatColor(p.threat_level)}30`
                          }}
                        >
                          {p.threat_level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-semibold">{p.total_attacks}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-bold" style={{ color: threatColor(p.threat_level) }}>
                          {p.avg_risk}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {p.all_categories?.map(c => (
                            <Badge key={c} variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary font-mono">
                              {c.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.sessions?.length || 0}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {p.last_attack_at ? new Date(p.last_attack_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setDetail(p)} className="h-7 px-2 text-xs hover:text-primary" data-testid={`view-profile-${p.user_id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleBlock(p.user_id, p.user_email)} className="h-7 px-2 text-xs hover:text-destructive" data-testid={`block-from-profile-${p.user_id}`}>
                            <UserX className="w-3.5 h-3.5 mr-1" /> Block
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="profile-detail-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-primary" />
              Threat Profile: {detail?.user_name}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/30 border border-border/30 rounded-md p-3 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Threat Level</p>
                  <p className="text-lg font-bold uppercase font-mono" style={{ color: threatColor(detail.threat_level) }}>
                    {detail.threat_level}
                  </p>
                </div>
                <div className="bg-muted/30 border border-border/30 rounded-md p-3 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Attacks</p>
                  <p className="text-lg font-bold font-mono text-destructive">{detail.total_attacks}</p>
                </div>
                <div className="bg-muted/30 border border-border/30 rounded-md p-3 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Avg Risk</p>
                  <p className="text-lg font-bold font-mono" style={{ color: threatColor(detail.threat_level) }}>{detail.avg_risk}</p>
                </div>
                <div className="bg-muted/30 border border-border/30 rounded-md p-3 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Sessions</p>
                  <p className="text-lg font-bold font-mono text-primary">{detail.sessions?.length || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent Attacks</p>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {detail.recent_attacks?.map((a, i) => (
                      <div key={i} className="bg-muted/20 border border-border/30 rounded-md p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex gap-1">
                            {a.categories?.map(c => (
                              <Badge key={c} variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary font-mono">{c}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1 py-0 border-destructive/30 text-destructive font-mono">Risk: {a.risk_score}</Badge>
                            <span className="text-[10px] font-mono text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-xs font-mono text-foreground/80">{a.message_preview}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
