import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import api from '../lib/api';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  hostel: string;
  batch: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadInitialUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadInitialUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  // Validate token on initial app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      api
        .get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    const clearSession = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('campusswap:unauthorized', clearSession);
    return () => window.removeEventListener('campusswap:unauthorized', clearSession);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: loggedInUser } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    const res = await api.post('/auth/register', payload);
    const { token: newToken, user: registeredUser } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    setToken(newToken);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
