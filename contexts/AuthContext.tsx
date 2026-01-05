'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Interface do Usuário Autenticado
 */

interface User {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  emailVerified: boolean;
  totalGifts?: number;
}

/**
 * Interface do Contexto de Autenticação
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

/**
 * Provider de Autenticação
 * 
 * Gerencia o estado global de autenticação do usuário.
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Buscar dados do usuário na API
   */

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AUTH_CONTEXT] Falha ao buscar usuário', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  /**
   * Realizar logout do usuário
   * 
   * Chama a API de logout e redireciona para a página de login.
   */

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('[AUTH_CONTEXT] Falha no logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
