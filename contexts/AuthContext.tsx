'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Interface do Plano Efetivo (validado pelo servidor)
 * 
 * CRÍTICO: Esta é a ÚNICA fonte de verdade para exibição de plano.
 */

interface EffectivePlan {
  plan: string | null;
  displayName: string | null;
  isActive: boolean;
  reason: 'NO_SUBSCRIPTION' | 'SUBSCRIPTION_INACTIVE' | 'SUBSCRIPTION_EXPIRED' | 'ACTIVE';
  expiresAt: string | null;
}

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
  effectivePlan?: EffectivePlan;
}

/**
 * Interface do Contexto de Autenticação
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  effectivePlan: EffectivePlan | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  effectivePlan: null,
  logout: async () => {},
  refreshUser: async () => {},
});

/**
 * Provider de Autenticação
 * 
 * Gerencia o estado global de autenticação do usuário.
 * O effectivePlan vem diretamente do servidor e é a fonte de verdade.
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [effectivePlan, setEffectivePlan] = useState<EffectivePlan | null>(null);
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
          // CRÍTICO: Plano efetivo vem do servidor - não pode ser manipulado
          setEffectivePlan(data.user.effectivePlan || null);
        } else {
          setUser(null);
          setEffectivePlan(null);
        }
      } else {
        setUser(null);
        setEffectivePlan(null);
      }
    } catch (error) {
      console.error('[AUTH_CONTEXT] Falha ao buscar usuário', error);
      setUser(null);
      setEffectivePlan(null);
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
      setEffectivePlan(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('[AUTH_CONTEXT] Falha no logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, effectivePlan, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
