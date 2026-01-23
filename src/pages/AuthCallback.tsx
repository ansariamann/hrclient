import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type CallbackState = 'processing' | 'success' | 'error';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { validateToken, isAuthenticated } = useAuth();
  const [state, setState] = useState<CallbackState>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const handleCallback = async () => {
      // Extract token from URL params (common OAuth patterns)
      const token = searchParams.get('token') || 
                    searchParams.get('access_token') ||
                    searchParams.get('code');
      
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setState('error');
        setErrorMessage(errorDescription || error || 'Authentication failed');
        return;
      }

      if (!token) {
        setState('error');
        setErrorMessage('No authentication token received');
        return;
      }

      try {
        const isValid = await validateToken(token);
        
        if (isValid) {
          setState('success');
          // Short delay to show success state before redirect
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        } else {
          setState('error');
          setErrorMessage('Invalid or expired token');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setState('error');
        setErrorMessage('Failed to validate authentication');
      }
    };

    handleCallback();
  }, [searchParams, validateToken, navigate, isAuthenticated]);

  const handleRetry = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          {state === 'processing' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardTitle>Completing Sign In</CardTitle>
              <CardDescription>
                Please wait while we verify your authentication...
              </CardDescription>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-600 dark:text-green-400">
                Sign In Successful
              </CardTitle>
              <CardDescription>
                Redirecting you to the dashboard...
              </CardDescription>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                Authentication Failed
              </CardTitle>
              <CardDescription>
                {errorMessage}
              </CardDescription>
            </>
          )}
        </CardHeader>

        {state === 'error' && (
          <CardContent className="flex flex-col gap-3">
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/', { replace: true })}
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
