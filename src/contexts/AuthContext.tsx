import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = 'admin_session_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      // Clean up legacy mock_user key if present
      localStorage.removeItem('mock_user');

      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'E-mail ou senha incorretos.');
        return;
      }

      if (data.token && data.user) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setUser(data.user);
      }
    } catch {
      setError('Não foi possível conectar ao servidor de autenticação.');
    }
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('mock_user');
    setUser(null);
  };

  const isAdmin = !!user?.email;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, error, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
