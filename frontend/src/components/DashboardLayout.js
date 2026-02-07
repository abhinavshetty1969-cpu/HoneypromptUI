import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { alertsAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  ShieldAlert, Activity, Terminal, Users, Radar, Bell,
  LogOut, ChevronLeft, ChevronRight, Menu, X, Fingerprint, Webhook, Key
} from 'lucide-react';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/attacks', label: 'Attack Logs', icon: ShieldAlert },
  { path: '/profiles', label: 'Threat Profiles', icon: Fingerprint },
  { path: '/chat', label: 'Chat Test', icon: Terminal },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/honeypots', label: 'Honeypots', icon: Radar },
  { path: '/webhooks', label: 'Webhooks', icon: Webhook },
  { path: '/apikeys', label: 'API Keys', icon: Key },
];

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await alertsAPI.list({ unread_only: true, limit: 10 });
      const newCount = res.data.unread_count;
      if (newCount > unreadCount && unreadCount > 0) {
        toast.error('New attack detected!', {
          description: 'Check alerts for details',
          duration: 5000,
        });
      }
      setAlerts(res.data.alerts);
      setUnreadCount(newCount);
    } catch (err) {
      // silent
    }
  }, [unreadCount]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleMarkAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setAlerts([]);
      setUnreadCount(0);
      toast.success('All alerts marked as read');
    } catch (err) {
      toast.error('Failed to mark alerts');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#09090b' }} data-testid="dashboard-layout">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 h-full flex flex-col bg-card/80 backdrop-blur-sm border-r border-border/50 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-16' : 'w-56'}`}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className={`flex items-center h-14 border-b border-border/50 px-3 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && <span className="font-bold text-sm tracking-tight">HoneyPrompt</span>}
          <button
            className="ml-auto lg:hidden text-muted-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-0.5 px-2">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  data-testid={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Collapse toggle */}
        <div className="hidden lg:flex border-t border-border/50 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            data-testid="sidebar-collapse-toggle"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4" data-testid="top-bar">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
              data-testid="mobile-menu-button"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold tracking-tight hidden sm:block">
              {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Alerts Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0" data-testid="alerts-bell-button">
                  <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[9px] font-bold flex items-center justify-center text-white alert-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border" data-testid="alerts-dropdown">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Alerts</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline" data-testid="mark-all-read-button">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {alerts.length > 0 ? alerts.slice(0, 5).map((alert) => (
                    <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-1 px-3 py-2 cursor-pointer" data-testid={`dropdown-alert-${alert.id}`}>
                      <p className="text-xs font-mono truncate w-full">{alert.message_preview}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-destructive/30 text-destructive">
                          Risk: {alert.risk_score}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )) : (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground font-mono">No unread alerts</div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 relative z-50" data-testid="user-menu-button">
                  <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <span className="text-sm hidden sm:block">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-48" data-testid="user-dropdown">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer" data-testid="logout-button">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
