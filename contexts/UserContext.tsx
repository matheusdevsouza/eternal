'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AuthUser, Subscription } from '@/types';

/**
 * Interface do Contexto de Usuário
 */

interface UserContextType {
  user: AuthUser | null;
  subscription: Subscription | null;
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
 */

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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
      window.location.href = '/login';
    } catch (err) {
      console.error('[LOGOUT_ERROR]', err);
    }
  };

  /**
   * CRÍTICO: Verificar se o usuário possui assinatura ativa
   * 
   * Esta é a verificação do lado do cliente - o servidor valida independentemente.
   */

  const hasActiveSubscription = useMemo(() => {
    if (!subscription) return false;
    if (subscription.status !== 'ACTIVE') return false;
    
    // Verificar expiração

    if (subscription.endDate) {
      const endDate = new Date(subscription.endDate);
      if (endDate < new Date()) return false;
    }
    
    return true;
  }, [subscription]);

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        subscription,
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
