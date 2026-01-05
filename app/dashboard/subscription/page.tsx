'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PLAN_CONFIG } from '@/lib/plan-config';
import { Icons } from '@/components/ui/Icons';

export default function SubscriptionPage() {
  const { user, subscription, refreshUser } = useUser();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const currentPlan = user?.plan ? PLAN_CONFIG[user.plan as keyof typeof PLAN_CONFIG] : null;

  const handleCancel = async () => {
    setShowCancelModal(false);
    setCancelling(true);
    setError('');

    try {
      const response = await fetch('/api/subscription', { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao cancelar assinatura');
        return;
      }

      setSuccess(data.message);
      await refreshUser();
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Minha Assinatura</h1>
        <p className="text-[var(--text-secondary)]">
          Gerencie seu plano e veja o histórico de pagamentos
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[var(--primary)] to-pink-600 rounded-3xl p-8 text-white"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-sm mb-2">Plano Atual</p>
            <h2 className="text-3xl font-bold mb-2">
              {currentPlan?.displayName || user?.plan || 'Sem Plano'}
            </h2>
            <p className="text-white/80">{currentPlan?.priceDisplay || 'R$ 0'}/mês</p>
          </div>
          {subscription && (
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                subscription.status === 'ACTIVE' 
                  ? 'bg-white/20' 
                  : subscription.status === 'CANCELLED'
                  ? 'bg-yellow-500/30'
                  : 'bg-red-500/30'
              }`}>
                {subscription.status === 'ACTIVE' ? 'Ativo' : 
                 subscription.status === 'CANCELLED' ? 'Cancelado' : 
                 subscription.status}
              </span>
              {subscription.endDate && (
                <p className="text-white/60 text-sm mt-2">
                  {subscription.status === 'CANCELLED' ? 'Acesso até: ' : 'Renova em: '}
                  {new Date(subscription.endDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
      {currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]"
        >
          <h3 className="font-bold mb-4">Recursos do Plano</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {user?.plan !== 'ETERNAL' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]"
        >
          <h3 className="font-bold mb-4">Fazer Upgrade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PLAN_CONFIG).map(([key, plan]) => {
              if (key === user?.plan || (user?.plan === 'PREMIUM' && key === 'START')) return null;
              if (user?.plan === 'START' && key === 'START') return null;
              
              return (
                <div
                  key={key}
                  className={`p-6 rounded-xl border ${
                    plan.popular 
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                      : 'border-[var(--border)]'
                  }`}
                >
                  {plan.popular && (
                    <span className="text-xs font-bold text-[var(--primary)] mb-2 block">
                      MAIS POPULAR
                    </span>
                  )}
                  <h4 className="text-lg font-bold">{plan.displayName}</h4>
                  <p className="text-2xl font-bold text-[var(--primary)] my-2">
                    {plan.priceDisplay}<span className="text-sm text-[var(--text-secondary)]">/mês</span>
                  </p>
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                        <span className="text-green-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/checkout?plan=${key}`}
                    className={`block text-center py-3 rounded-xl font-bold transition-all ${
                      plan.popular
                        ? 'bg-[var(--primary)] text-white hover:opacity-90'
                        : 'bg-[var(--bg-card-hover)] hover:bg-[var(--border)]'
                    }`}
                  >
                    Fazer Upgrade
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
      {subscription && subscription.status === 'ACTIVE' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]"
        >
          <h3 className="font-bold mb-2">Cancelar Assinatura</h3>
          <p className="text-[var(--text-secondary)] mb-4">
            Ao cancelar, você terá acesso aos recursos do seu plano até o fim do período atual.
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
            className="px-6 py-3 bg-red-500/10 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {cancelling ? 'Cancelando...' : 'Cancelar Assinatura'}
          </button>
        </motion.div>
      )}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  Cancelar Assinatura?
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Tem certeza que deseja cancelar? Você terá acesso até o fim do período atual.
                </p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] transition-all font-medium"
                >
                  Manter Assinatura
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                >
                  Sim, Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
