import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { TokenValidationResult, LoginCredentials, LoginResponse } from '@/types/ats';
import { apiClient } from '@/lib/api';

interface AuthState {
  isValidating: boolean;
  isAuthenticated: boolean;
  clientName: string | null;
  error: TokenValidationResult['error'] | string | null;
  expiresAt: Date | null;
}

interface AuthContextValue extends AuthState {
  validateToken: (token: string) => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_STORAGE_KEY = 'ats_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isValidating: true, // Start as validating to check for existing token
    isAuthenticated: false,
    clientName: null,
    error: null,
    expiresAt: null,
  });

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = apiClient.getToken();
    if (existingToken) {
      // Validate the existing token
      validateToken(existingToken).finally(() => {
        setState(prev => ({ ...prev, isValidating: false }));
      });
    } else {
      setState(prev => ({ ...prev, isValidating: false }));
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

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const response: LoginResponse = await apiClient.login(credentials);

      // Token is already set in apiClient.login()
      setState({
        isValidating: false,
        isAuthenticated: true,
        clientName: null, // Will be fetched separately if needed
        error: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Assume 24h expiry
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string; detail?: string })?.message ||
        (err as { message?: string; detail?: string })?.detail ||
        'Login failed';
      setState({
        isValidating: false,
        isAuthenticated: false,
        clientName: null,
        error: errorMessage,
        expiresAt: null,
      });
      return false;
    }
  }, []);

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
    <AuthContext.Provider value={{ ...state, validateToken, login, logout }}>
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
