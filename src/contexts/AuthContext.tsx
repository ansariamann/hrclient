import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { TokenValidationResult, LoginCredentials, User } from '@/types/ats';
import { apiClient } from '@/lib/api';
import { API_URL } from '@/lib/config';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/lib/authToken';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const validateToken = useCallback(async (token: string) => {
    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const response = await fetch(`${API_URL}/auth/client/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user: User = await response.json();
        setAuthToken(token);
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
        const errorData = await response.json().catch(() => null);
        console.error('Token validation failed:', errorData);
        clearAuthToken();
        apiClient.clearToken();
        setState({ 
          ...initialState, 
          isValidating: false, 
          error: 'invalid' 
        });
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      clearAuthToken();
      apiClient.clearToken();
      setState({ ...initialState, isValidating: false });
      return false;
    }
  }, []);

  useEffect(() => {
    const existingToken = getAuthToken();
    if (existingToken) {
      validateToken(existingToken);
    } else {
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, [validateToken]);


  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const data = await apiClient.login(credentials);
      setAuthToken(data.access_token);
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
    clearAuthToken();
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
