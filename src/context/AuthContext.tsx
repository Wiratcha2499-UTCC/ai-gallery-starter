import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CredentialResponse } from '@react-oauth/google';
import { upsertUser, fetchPaidStatus } from '../lib/pb';

interface User {
  sub: string;
  name: string;
  email: string;
  picture: string;
  pb_id: string;
  paid: boolean;
}

interface AuthContextValue {
  user: User | null;
  pbError: string | null;
  login: (response: CredentialResponse) => Promise<void>;
  logout: () => void;
  refreshPaid: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwt(token: string): Omit<User, 'pb_id' | 'paid'> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return { sub: payload.sub, name: payload.name, email: payload.email, picture: payload.picture };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [pbError, setPbError] = useState<string | null>(null);

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
  }, [user]);

  async function login(response: CredentialResponse) {
    if (!response.credential) return;
    const googleUser = decodeJwt(response.credential);
    setPbError(null);
    try {
      const { pb_id, paid } = await upsertUser(googleUser.email, googleUser.name, googleUser.picture);
      setUser({ ...googleUser, pb_id, paid });
    } catch {
      setPbError('Could not connect to database. Copy feature unavailable.');
      setUser({ ...googleUser, pb_id: '', paid: false });
    }
  }

  async function refreshPaid() {
    if (!user?.email) return;
    const result = await fetchPaidStatus(user.email);
    if (result) {
      setUser(u => u ? { ...u, paid: result.paid, pb_id: result.id } : u);
    }
  }

  function logout() {
    setUser(null);
    setPbError(null);
  }

  return (
    <AuthContext.Provider value={{ user, pbError, login, logout, refreshPaid }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
