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
  const currentPlanKey = user?.plan || '';

  const handleCancel = async () => {
    setShowCancelModal(false);
    setCancelling(true);
    setError('');

    try {
      const response = await fetch('/api/subscription', { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to cancel subscription');
        return;
      }

      setSuccess(data.message);
      await refreshUser();
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  // Get available upgrade options (exclude current plan and lower plans)
  const getUpgradeOptions = () => {
    const planOrder = ['START', 'PREMIUM', 'ETERNAL'];
    const currentIndex = planOrder.indexOf(currentPlanKey);
    
    return Object.entries(PLAN_CONFIG).filter(([key]) => {
      const keyIndex = planOrder.indexOf(key);
      return keyIndex > currentIndex;
    });
  };

  const upgradeOptions = getUpgradeOptions();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Subscription</h1>
        <p className="text-[var(--text-secondary)]">
          Manage your plan and billing preferences
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--error-icon-bg)] flex items-center justify-center">
              <Icons.AlertCircle className="w-4 h-4 text-[var(--error-icon)]" />
            </div>
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success-text)] px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--success-icon-bg)] flex items-center justify-center">
              <Icons.Check className="w-4 h-4 text-[var(--success-icon)]" />
            </div>
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-[var(--primary)] to-pink-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Icons.Crown className="w-40 h-40 -rotate-12 translate-x-8 -translate-y-4" />
        </div>
        
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-white/60 text-sm mb-2">Current Plan</p>
            <h2 className="text-3xl font-bold mb-2">
              {currentPlan?.displayName || user?.plan || 'No Plan'}
            </h2>
            <p className="text-white/80">{currentPlan?.priceDisplay || '$0'}/month</p>
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
                {subscription.status === 'ACTIVE' ? 'Active' : 
                 subscription.status === 'CANCELLED' ? 'Cancelled' : 
                 subscription.status}
              </span>
              {subscription.endDate && (
                <p className="text-white/60 text-sm mt-2">
                  {subscription.status === 'CANCELLED' ? 'Access until: ' : 'Renews on: '}
                  {new Date(subscription.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
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
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Icons.Check className="w-5 h-5 text-[var(--primary)]" />
            Plan Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Icons.Check className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-[var(--text-secondary)]">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {upgradeOptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Icons.Sparkles className="w-5 h-5 text-[var(--primary)]" />
            Upgrade Your Experience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upgradeOptions.map(([key, plan]) => (
              <div
                key={key}
                className={`p-6 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                  plan.popular 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block px-2 py-1 bg-[var(--primary)] text-white text-xs font-bold rounded mb-3">
                    MOST POPULAR
                  </span>
                )}
                <h4 className="text-lg font-bold">{plan.displayName}</h4>
                <p className="text-2xl font-bold text-[var(--primary)] my-2">
                  {plan.priceDisplay}<span className="text-sm text-[var(--text-secondary)]">/month</span>
                </p>
                <ul className="space-y-2 mb-4">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-green-400" /> {f}
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
                  Upgrade to {plan.displayName}
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {upgradeOptions.length === 0 && currentPlanKey === 'ETERNAL' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Icons.Crown className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">You're on the Eternal Plan!</h3>
              <p className="text-[var(--text-secondary)]">
                You have access to all features. Enjoy unlimited creativity!
              </p>
            </div>
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
          <h3 className="font-bold mb-2">Cancel Subscription</h3>
          <p className="text-[var(--text-secondary)] mb-4">
            If you cancel, you'll still have access to your plan features until the end of your current billing period.
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
            className="px-6 py-3 bg-red-500/10 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
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
                  <Icons.AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  Cancel Subscription?
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Are you sure? You'll retain access until the end of your current billing period.
                </p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] transition-all font-medium"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
