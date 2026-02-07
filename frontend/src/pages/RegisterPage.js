import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ShieldAlert, Eye, EyeOff, User, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await register(email, password, name, role);
      toast.success('Account created successfully');
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: '#09090b' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(239,68,68,0.05) 0%, transparent 50%)' }} />

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50 relative z-10 animate-fade-up" data-testid="register-card">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-14 h-14 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">Join HoneyPrompt</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Account Type</Label>
            <Tabs value={role} onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="user" className="flex items-center gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary" data-testid="tab-user-register">
                  <User className="w-3.5 h-3.5" /> User
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive" data-testid="tab-admin-register">
                  <Lock className="w-3.5 h-3.5" /> Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input id="name" data-testid="register-name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-muted/50 border-input focus:border-primary text-sm h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input id="email" data-testid="register-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="bg-muted/50 border-input focus:border-primary font-mono text-sm h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
              <div className="relative">
                <Input id="password" data-testid="register-password-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="bg-muted/50 border-input focus:border-primary font-mono text-sm h-11 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" data-testid="toggle-password-reg">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              data-testid="register-submit-button"
              disabled={loading}
              className={`w-full h-11 font-semibold ${
                role === 'admin'
                  ? 'bg-destructive/80 text-destructive-foreground hover:bg-destructive/70 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              }`}
            >
              {loading ? 'Creating account...' : role === 'admin' ? 'Create Admin Account' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline" data-testid="login-link">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
