import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { TokenValidationResult } from '@/types/ats';
import { apiClient } from '@/lib/api';

interface AuthState {
  isValidating: boolean;
  isAuthenticated: boolean;
  clientName: string | null;
  error: TokenValidationResult['error'] | null;
  expiresAt: Date | null;
}

interface AuthContextValue extends AuthState {
  validateToken: (token: string) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  handleOAuthCallback: (token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_STORAGE_KEY = 'ats_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isValidating: false,
    isAuthenticated: false,
    clientName: null,
    error: null,
    expiresAt: null,
  });

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      validateToken(storedToken);
    }
  }, []);

  // Handle OAuth callback from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('access_token');
    
    if (token) {
      handleOAuthCallback(token).then((success) => {
        if (success) {
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      });
    }
  }, []);

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const result = await apiClient.validateToken(token);

      if (result.valid) {
        apiClient.setToken(token);
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
        setState({
          isValidating: false,
          isAuthenticated: true,
          clientName: result.clientName || null,
          error: null,
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : null,
        });
        return true;
      } else {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setState({
          isValidating: false,
          isAuthenticated: false,
          clientName: null,
          error: result.error || 'invalid',
          expiresAt: null,
        });
        return false;
      }
    } catch {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      setState({
        isValidating: false,
        isAuthenticated: false,
        clientName: null,
        error: 'invalid',
        expiresAt: null,
      });
      return false;
    }
  }, []);

  const loginWithOAuth = useCallback(async (provider: 'google' | 'github'): Promise<void> => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    
    // Redirect to backend OAuth endpoint
    window.location.href = `${apiUrl}/auth/${provider}?redirect_uri=${redirectUri}`;
  }, []);

  const handleOAuthCallback = useCallback(async (token: string): Promise<boolean> => {
    return validateToken(token);
  }, [validateToken]);

  const logout = useCallback(() => {
    apiClient.clearToken();
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setState({
      isValidating: false,
      isAuthenticated: false,
      clientName: null,
      error: null,
      expiresAt: null,
    });
  }, []);

  // Check for session expiration
  useEffect(() => {
    if (!state.expiresAt) return;

    const checkExpiration = () => {
      if (state.expiresAt && new Date() > state.expiresAt) {
        logout();
        setState(prev => ({
          ...prev,
          error: 'expired',
        }));
      }
    };

    const interval = setInterval(checkExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.expiresAt, logout]);

  return (
    <AuthContext.Provider value={{ ...state, validateToken, loginWithOAuth, handleOAuthCallback, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
