import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

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
      // Still show success to avoid user enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <Users className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold text-foreground">
          Client Portal
        </span>
      </div>

      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-elevated">
        {isSubmitted ? (
          <div className="flex flex-col items-center gap-6 animate-slide-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Check your email
              </h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                If an account exists with that email, we've sent a password
                reset link.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
              <Mail className="w-5 h-5 flex-shrink-0" />
              <p>
                The link will expire in 30 minutes. Check your spam folder if
                you don't see it.
              </p>
            </div>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-slide-up">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Forgot password?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we'll send you a link to reset your
                password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={error ? "border-destructive" : ""}
                  disabled={isLoading}
                  autoFocus
                  required
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </form>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Secure access powered by encrypted password reset
      </p>
    </div>
  );
}
