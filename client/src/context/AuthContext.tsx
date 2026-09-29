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
  login: (emailOrToken: string, passwordOrUser?: any) => Promise<User>;
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
  const [loading, setLoading] = useState(true);

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
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (emailOrToken: string, passwordOrUser?: any): Promise<User> => {
    // If called as login(token, user)
    if (typeof passwordOrUser === 'object' && passwordOrUser !== null) {
      const newToken = emailOrToken;
      const newUser = passwordOrUser as User;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }

    // Otherwise called as login(email, password)
    const email = emailOrToken;
    const password = passwordOrUser as string;
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
