import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, ShieldX, Clock, Users, Play, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isValidating, isAuthenticated, error, validateToken, login } = useAuth();
  const [hasAttempted, setHasAttempted] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const success = await login({ username: email, password });
      if (!success) {
        setLoginError('Invalid email or password');
      }
    } catch (err: unknown) {
      setLoginError((err as { message?: string })?.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const renderContent = () => {
    if (isValidating && !isLoggingIn) {
      return (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Validating Access</h2>
            <p className="mt-2 text-muted-foreground">Please wait while we verify your credentials...</p>
          </div>
        </div>
      );
    }

    // Show error for token-based validation failures
    if (error && !loginError && searchParams.get('token')) {
      const errorConfig: Record<string, { icon: typeof Clock; title: string; description: string }> = {
        expired: {
          icon: Clock,
          title: 'Link Expired',
          description: 'This access link has expired. Please login with your credentials or request a new link.',
        },
        invalid: {
          icon: ShieldX,
          title: 'Invalid Link',
          description: 'This access link is not valid. Please login with your credentials.',
        },
        revoked: {
          icon: AlertCircle,
          title: 'Access Revoked',
          description: 'Your access has been revoked. Please contact your HR representative.',
        },
      };

      const config = errorConfig[error as string] || errorConfig.invalid;
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
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Back to Login
          </Button>
        </div>
      );
    }

    // Login form
    return (
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-5 animate-slide-up">
        <div className="text-center mb-2">
          <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access your candidate portal
          </p>
        </div>

        {(loginError || (error && typeof error === 'string')) && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{loginError || error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={isLoggingIn}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              disabled={isLoggingIn}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isLoggingIn}>
          {isLoggingIn ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleDemoLogin}
          className="w-full gap-2"
          disabled={isLoggingIn}
        >
          <Play className="h-4 w-4" />
          Enter Demo Mode
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Demo mode uses sample data for exploration
        </p>
      </form>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <span className="text-2xl font-bold text-foreground">Client Portal</span>
          <p className="text-xs text-muted-foreground">Candidate Review System</p>
        </div>
      </div>

      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-elevated">
        {renderContent()}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Powered by HR System
      </p>
    </div>
  );
}
