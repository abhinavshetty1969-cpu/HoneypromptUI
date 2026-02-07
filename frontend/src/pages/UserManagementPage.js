import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { usersAPI } from '../lib/api';
import { UserX, Unlock, Users, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [blockDialog, setBlockDialog] = useState(null);
  const [blockReason, setBlockReason] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await usersAPI.list();
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBlock = async () => {
    if (!blockDialog) return;
    try {
      await usersAPI.block({ user_id: blockDialog.id, reason: blockReason });
      toast.success(`User ${blockDialog.email} blocked`);
      setBlockDialog(null);
      setBlockReason('');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Block failed');
    }
  };

  const handleUnblock = async (userId, email) => {
    try {
      await usersAPI.unblock(userId);
      toast.success(`User ${email} unblocked`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Unblock failed');
    }
  };

  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="space-y-4" data-testid="user-management-page">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          User Management
          <Badge variant="secondary" className="text-xs ml-1">{users.length}</Badge>
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-testid="user-search-input"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-input font-mono text-sm h-9"
          />
        </div>
      </div>

      <Card className="bg-card border-border/50 overflow-hidden" data-testid="users-table-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border/50">
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Name</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Email</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Role</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Status</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Joined</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground font-mono text-sm">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground font-mono text-sm">No users found</td></tr>
                ) : filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors" data-testid={`user-row-${user.id}`}>
                    <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm font-mono">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary font-mono uppercase">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_blocked ? (
                        <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px]">Blocked</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_blocked ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnblock(user.id, user.email)}
                          className="h-7 px-2 text-xs hover:bg-emerald-500/10 hover:text-emerald-400"
                          data-testid={`unblock-user-${user.id}`}
                        >
                          <Unlock className="w-3.5 h-3.5 mr-1" /> Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setBlockDialog(user)}
                          className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                          data-testid={`block-user-${user.id}`}
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" /> Block
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Block Dialog */}
      <Dialog open={!!blockDialog} onOpenChange={() => { setBlockDialog(null); setBlockReason(''); }}>
        <DialogContent className="bg-card border-border max-w-md" data-testid="block-user-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-destructive" />
              Block User
            </DialogTitle>
          </DialogHeader>
          {blockDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Block <span className="text-foreground font-mono">{blockDialog.email}</span>?
              </p>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Reason (optional)</Label>
                <Input
                  data-testid="block-reason-input"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Reason for blocking..."
                  className="bg-muted/50 border-input text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setBlockDialog(null)} className="h-9" data-testid="cancel-block-button">
                  Cancel
                </Button>
                <Button onClick={handleBlock} className="h-9 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20" data-testid="confirm-block-button">
                  Block User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
