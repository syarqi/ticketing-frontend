import { createContext, useContext, useState, ReactNode } from 'react';
import { api, apiErrorMessage } from '../api/client';
import { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('nst_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  async function login(username: string, password: string) {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('nst_token', data.token);
      localStorage.setItem('nst_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      throw new Error(apiErrorMessage(err, 'Login gagal'));
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('nst_token');
    localStorage.removeItem('nst_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
