import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { TokenValidationResult, LoginCredentials, User } from '@/types/ats';
import { apiClient } from '@/lib/api';

interface AuthState {
  isValidating: boolean;
  isAuthenticated: boolean;
  clientName: string | null;
  clientId: string | null;
  role: string | null;
  user: User | null;
  error: TokenValidationResult['error'] | string | null;
  expiresAt: Date | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  validateToken: (token: string) => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_STORAGE_KEY = 'ats_auth_token';

const initialState: AuthState = {
  isAuthenticated: false,
  isValidating: true,
  token: null,
  clientId: null,
  clientName: null,
  role: null,
  user: null,
  error: null,
  expiresAt: null,
};

import { API_URL, DEMO_MODE } from '@/lib/config';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const validateToken = useCallback(async (token: string) => {
    setState(prev => ({ ...prev, isValidating: true }));

    try {
      if (DEMO_MODE) {
        setState({
          isAuthenticated: true,
          isValidating: false,
          token: 'demo-token',
          clientId: 'demo-client-id',
          clientName: 'Demo Client',
          role: 'client_admin',
          user: {
            id: 'demo-user',
            email: 'demo@client.com',
            role: 'client_admin',
            client_id: 'demo-client-id',
            client_name: 'Demo Client',
            created_at: new Date().toISOString()
          },
          error: null,
          expiresAt: null,
        });
        return true;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user: User = await response.json();
        localStorage.setItem(TOKEN_STORAGE_KEY, token); // Ensure token is stored if validation succeeds
        apiClient.setToken(token); // Sync token with API client
        setState({
          isAuthenticated: true,
          isValidating: false,
          token,
          clientId: user.client_id,
          clientName: user.client_name || 'Client',
          role: user.role,
          user: user,
          error: null,
          expiresAt: null,
        });
        return true;
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setState({ ...initialState, isValidating: false });
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setState({ ...initialState, isValidating: false });
      return false;
    }
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (existingToken) {
      validateToken(existingToken);
    } else {
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, [validateToken]);


  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      if (DEMO_MODE) {
        localStorage.setItem(TOKEN_STORAGE_KEY, 'demo-token');
        await validateToken('demo-token');
        return true;
      }

      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      await validateToken(data.access_token);
      return true;
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string; detail?: string })?.message ||
        (err as { message?: string; detail?: string })?.detail ||
        'Login failed';
      setState({
        ...initialState,
        isValidating: false,
        error: errorMessage,
      });
      return false;
    }
  }, [validateToken]);
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    apiClient.clearToken();
    setState({
      isValidating: false,
      isAuthenticated: false,
      token: null,
      clientId: null,
      clientName: null,
      role: null,
      user: null,
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
