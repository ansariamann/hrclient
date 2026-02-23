import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_URL } from '@/lib/config';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});

    useEffect(() => {
        if (!token) {
            setError('Missing reset token. Please use the link from your email.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const errors: { password?: string; confirmPassword?: string } = {};
        if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.detail || 'Reset failed. The link may have expired.');
            }

            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message || 'Something went wrong. Please try again.');
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
                <span className="text-2xl font-bold text-foreground">Candidate Portal</span>
            </div>

            <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-elevated">
                {isSuccess ? (
                    <div className="flex flex-col items-center gap-6 animate-slide-up">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-foreground">Password reset!</h2>
                            <p className="mt-2 max-w-sm text-muted-foreground">
                                Your password has been changed successfully. You can now sign in with your new password.
                            </p>
                        </div>
                        <Link to="/login" className="w-full">
                            <Button className="w-full">Go to login</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 animate-slide-up">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-foreground">Set new password</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Choose a strong password for your account.
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="password">New password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`pr-10 ${fieldErrors.password ? 'border-destructive' : ''}`}
                                        disabled={isLoading || !token}
                                        autoComplete="new-password"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword">Confirm password</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={fieldErrors.confirmPassword ? 'border-destructive' : ''}
                                    disabled={isLoading || !token}
                                    autoComplete="new-password"
                                />
                                {fieldErrors.confirmPassword && (
                                    <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading || !token}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset password'
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
