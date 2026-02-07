import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Authenticated successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: '#09090b' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(239,68,68,0.05) 0%, transparent 50%)' }} />

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50 relative z-10 animate-fade-up" data-testid="login-card">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-14 h-14 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">HoneyPrompt</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">AI Security Middleware</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@honeyprompt.io"
                className="bg-muted/50 border-input focus:border-primary font-mono text-sm h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-muted/50 border-input focus:border-primary font-mono text-sm h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-semibold"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{' '}
            <Link to="/register" className="text-primary hover:underline" data-testid="register-link">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
