import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, CheckCircle2, Users, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isSubmitted) {
      return (
        <div className="flex flex-col items-center gap-6 animate-slide-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              If an account exists with that email, we've sent a password reset link.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
            <Mail className="w-5 h-5 flex-shrink-0" />
            <p>The link will expire in 30 minutes. Check your spam folder if you don't see it.</p>
          </div>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full gap-2 h-12 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Email address
            </Label>
            <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.02]' : ''}`}>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="you@company.com"
                className={`pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:border-primary/30 focus-visible:bg-background transition-all ${error ? "border-destructive" : ""}`}
                disabled={isLoading}
                autoFocus
                required
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-sm font-semibold group relative overflow-hidden bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send reset link
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
        </form>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-foreground">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-accent/10 blur-2xl" />

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
                Reset your
                <br />
                password
                <br />
                <span className="text-primary">securely.</span>
              </span>
            </h1>
            <p className="mt-4 text-sm text-background/60 leading-relaxed max-w-sm animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              We'll send you a secure link to reset your password and get back to your dashboard.
            </p>
          </div>

          <p className="text-xs text-background/40 animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
            Secure access powered by encrypted password reset
          </p>
        </div>
      </div>

      {/* Right form panel */}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-4">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Forgot password?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}
