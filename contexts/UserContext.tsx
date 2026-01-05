'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, Subscription } from '@/types';

/**
 * Interface do Plano Efetivo (validado pelo servidor)
 * 
 * CRÍTICO: Esta é a ÚNICA fonte de verdade para exibição de plano.
 * Não pode ser manipulada pelo cliente.
 */

interface EffectivePlan {
  plan: string | null;
  displayName: string | null;
  isActive: boolean;
  reason: 'NO_SUBSCRIPTION' | 'SUBSCRIPTION_INACTIVE' | 'SUBSCRIPTION_EXPIRED' | 'ACTIVE';
  expiresAt: string | null;
}

/**
 * Interface do Contexto de Usuário
 */

interface UserContextType {
  user: AuthUser | null;
  subscription: Subscription | null;
  effectivePlan: EffectivePlan | null;
  loading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Provider do Contexto de Usuário
 * 
 * Gerencia o estado global do usuário e assinatura.
 * O effectivePlan vem diretamente do servidor e é a fonte de verdade.
 */

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [effectivePlan, setEffectivePlan] = useState<EffectivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar dados do usuário na API
   */

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user');
      
      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          setSubscription(null);
          setEffectivePlan(null);
          return;
        }
        throw new Error('Erro ao carregar usuário');
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          plan: data.user.plan,
          emailVerified: data.user.emailVerified,
        });
        setSubscription(data.user.subscription || null);
        
        // CRÍTICO: Plano efetivo vem do servidor - não pode ser manipulado
        setEffectivePlan(data.user.effectivePlan || null);
      }
    } catch (err) {
      console.error('[USER_CONTEXT_ERROR]', err);
      setError('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realizar logout do usuário
   */

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setSubscription(null);
      setEffectivePlan(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('[LOGOUT_ERROR]', err);
    }
  };

  /**
   * CRÍTICO: Verificar se o usuário possui assinatura ativa
   * 
   * Usa effectivePlan do servidor como fonte de verdade.
   */

  const hasActiveSubscription = effectivePlan?.isActive ?? false;

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        subscription,
        effectivePlan,
        loading,
        error,
        hasActiveSubscription,
        refreshUser: fetchUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}
