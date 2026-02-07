import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { dashboardAPI, alertsAPI } from '../lib/api';
import { ShieldAlert, Activity, UserX, Radar, Bell, AlertTriangle, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';

const CHART_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon: Icon, color, subtitle, testId }) => (
  <Card className="bg-card border-border/50 relative overflow-hidden group hover:border-primary/30 transition-colors duration-300" data-testid={testId}>
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold tracking-tight" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1 font-mono">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#020617] border border-[#1e293b] rounded-md px-3 py-2 text-sm">
        <p className="text-muted-foreground font-mono text-xs">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        dashboardAPI.stats(),
        alertsAPI.list({ unread_only: true, limit: 5 })
      ]);
      setStats(statsRes.data);
      setAlerts(alertsRes.data.alerts);

      // Show toast for new unread alerts
      if (alertsRes.data.unread_count > 0) {
        toast.warning(`${alertsRes.data.unread_count} unread attack alert(s)`, {
          description: 'Check the alerts panel for details',
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]" data-testid="dashboard-loading">
        <div className="text-center">
          <Radar className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const categoryData = stats?.category_breakdown || [];
  const trendData = stats?.daily_trend || [];
  const riskData = stats?.risk_distribution || [];

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Attacks" value={stats?.total_attacks || 0} icon={ShieldAlert} color="#ef4444" subtitle="All time" testId="stat-total-attacks" />
        <StatCard title="High Risk" value={stats?.high_risk_attacks || 0} icon={AlertTriangle} color="#f59e0b" subtitle="Score 70+" testId="stat-high-risk" />
        <StatCard title="Active Honeypots" value={stats?.active_honeypots || 0} icon={Radar} color="#d946ef" subtitle="Traps deployed" testId="stat-honeypots" />
        <StatCard title="Blocked Users" value={stats?.blocked_users || 0} icon={UserX} color="#06b6d4" subtitle={`of ${stats?.total_users || 0} total`} testId="stat-blocked" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attack Trend */}
        <Card className="bg-card border-border/50" data-testid="chart-attack-trend">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Attack Trend (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="attacks" name="Attacks" stroke="#06b6d4" fill="rgba(6,182,212,0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm font-mono">
                No attack data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-card border-border/50" data-testid="chart-category-breakdown">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Attack Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={40} strokeWidth={2} stroke="#09090b">
                      {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {categoryData.map((item, i) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-muted-foreground font-mono text-xs">{item.category.replace('_', ' ')}</span>
                      </div>
                      <span className="font-semibold font-mono text-xs">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm font-mono">
                No category data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Distribution */}
        <Card className="bg-card border-border/50" data-testid="chart-risk-distribution">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                    {riskData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm font-mono">
                No risk data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="bg-card border-border/50" data-testid="recent-alerts-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-destructive alert-pulse" />
              Recent Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-auto">
                  {alerts.length} NEW
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-md bg-muted/30 border border-border/30 hover:border-destructive/30 transition-colors" data-testid={`alert-item-${alert.id}`}>
                  <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 flex-shrink-0 alert-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-foreground truncate">{alert.message_preview}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-destructive/30 text-destructive">
                        Risk: {alert.risk_score}
                      </Badge>
                      {alert.categories?.map(c => (
                        <Badge key={c} variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary">
                          {c.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">{alert.user_email} - {new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm font-mono">
                  No unread alerts
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
