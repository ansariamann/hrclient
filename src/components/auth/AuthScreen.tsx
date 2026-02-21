import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, ShieldX, Clock, Users, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isValidating, isAuthenticated, error, validateToken, login } = useAuth();
  const [hasAttempted, setHasAttempted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token && !hasAttempted) {
      setHasAttempted(true);
      validateToken(token);
    } else if (!token && !hasAttempted) {
      setHasAttempted(true);
    }
  }, [searchParams, validateToken, hasAttempted]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleDemoLogin = () => {
    validateToken('demo-token');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ username: email, password });
  };

  const renderContent = () => {
    if (isValidating) {
      return (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Validating Access</h2>
            <p className="mt-2 text-muted-foreground">Please wait while we verify your link...</p>
          </div>
        </div>
      );
    }

    if (error) {
      const errorConfig = {
        expired: {
          icon: Clock,
          title: 'Link Expired',
          description: 'This access link has expired. Please request a new link from your HR contact.',
        },
        invalid: {
          icon: ShieldX,
          title: 'Invalid Link',
          description: 'This access link is not valid. Please check you have the correct link or request a new one.',
        },
        revoked: {
          icon: AlertCircle,
          title: 'Access Revoked',
          description: 'Your access has been revoked. Please contact your HR representative for assistance.',
        },
      };

      const config = errorConfig[error] || errorConfig.invalid;
      const Icon = config.icon;

      return (
        <div className="flex flex-col items-center gap-6 animate-slide-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Icon className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{config.title}</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">{config.description}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button onClick={handleDemoLogin} className="gap-2">
              <Play className="h-4 w-4" />
              Try Demo
            </Button>
          </div>
        </div>
      );
    }

    // No token provided: allow username/password login
    return (
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Client Login</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in using the credentials created by HR.
          </p>
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client.admin@company.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isValidating}>
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="w-full border-t pt-6 mt-2">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Have an access link instead?
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Open the provided link directly in this browser.
          </p>
        </div>

        <div className="w-full border-t pt-6 mt-2">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Want to explore the portal?
          </p>
          <Button onClick={handleDemoLogin} className="w-full gap-2">
            <Play className="h-4 w-4" />
            Enter Demo Mode
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <Users className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold text-foreground">Candidate Portal</span>
      </div>

      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-elevated">
        {renderContent()}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Secure access powered by encrypted magic links
      </p>
    </div>
  );
}
