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
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isValidating: false,
    isAuthenticated: false,
    clientName: null,
    error: null,
    expiresAt: null,
  });

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const result = await apiClient.validateToken(token);

      if (result.valid) {
        apiClient.setToken(token);
        setState({
          isValidating: false,
          isAuthenticated: true,
          clientName: result.clientName || null,
          error: null,
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : null,
        });
        return true;
      } else {
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

  const logout = useCallback(() => {
    apiClient.clearToken();
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
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          error: 'expired',
        }));
      }
    };

    const interval = setInterval(checkExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.expiresAt]);

  return (
    <AuthContext.Provider value={{ ...state, validateToken, logout }}>
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
