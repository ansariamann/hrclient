import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, ShieldX, Clock, Users, Lock, Mail, ArrowRight } from 'lucide-react';
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
  const [isFocused, setIsFocused] = useState<string | null>(null);

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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ username: email, password });
  };

  const renderContent = () => {
    if (isValidating) {
      return (
        <div className="flex flex-col items-center gap-4 animate-fade-in py-12">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
          </div>
          <div className="text-center mt-4">
            <h2 className="text-lg font-semibold text-foreground">Validating Access</h2>
            <p className="mt-1 text-sm text-muted-foreground">Verifying your session...</p>
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
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
        },
        invalid: {
          icon: ShieldX,
          title: 'Invalid Link',
          description: 'This access link is not valid. Please check you have the correct link or request a new one.',
          color: 'text-destructive',
          bg: 'bg-destructive/10',
        },
        revoked: {
          icon: AlertCircle,
          title: 'Access Revoked',
          description: 'Your access has been revoked. Please contact your HR representative for assistance.',
          color: 'text-destructive',
          bg: 'bg-destructive/10',
        },
      };

      const config = errorConfig[error as keyof typeof errorConfig] || errorConfig.invalid;
      const Icon = config.icon;

      return (
        <div className="flex flex-col items-center gap-6 animate-slide-up py-8">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${config.bg}`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">{config.title}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{config.description}</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl">
            Try Again
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5 animate-slide-up">
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Email
            </Label>
            <div className={`relative transition-all duration-200 ${isFocused === 'email' ? 'scale-[1.02]' : ''}`}>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused('email')}
                onBlur={() => setIsFocused(null)}
                placeholder="you@company.com"
                required
                className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:border-primary/30 focus-visible:bg-background transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Password
            </Label>
            <div className={`relative transition-all duration-200 ${isFocused === 'password' ? 'scale-[1.02]' : ''}`}>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused('password')}
                onBlur={() => setIsFocused(null)}
                placeholder="••••••••"
                required
                className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:border-primary/30 focus-visible:bg-background transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isValidating}
            className="w-full h-12 rounded-xl text-sm font-semibold group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Have an access link? Open it directly in your browser.
        </p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-foreground">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-accent/10 blur-2xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-background w-full">
          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/10 backdrop-blur-sm">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Client Portal</span>
          </div>

          <div className="max-w-md">
            <h1 className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <span className="text-4xl font-bold tracking-tight leading-tight">
                Manage your
                <br />
                hiring pipeline
                <br />
                <span className="text-primary">effortlessly.</span>
              </span>
            </h1>
            <p className="mt-4 text-sm text-background/60 leading-relaxed max-w-sm animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              Track candidates, schedule interviews, and collaborate with your team — all in one place.
            </p>
          </div>

          <p className="text-xs text-background/40 animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
            Secure access for provisioned client accounts
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-foreground">Client Portal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}
