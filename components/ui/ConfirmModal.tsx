'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';

interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmModalContextType {
  confirm: (options: ConfirmModalOptions) => Promise<boolean>;
}

const ConfirmModalContext = createContext<ConfirmModalContextType | undefined>(undefined);

export function ConfirmModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmModalOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmModalOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
    setResolvePromise(null);
    setOptions(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise?.(false);
    setResolvePromise(null);
    setOptions(null);
  };

  const getTypeStyles = () => {
    switch (options?.type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          iconBg: 'bg-red-500/10',
          button: 'bg-red-500 hover:bg-red-600',
        };
      case 'warning':
        return {
          icon: 'text-orange-500',
          iconBg: 'bg-orange-500/10',
          button: 'bg-orange-500 hover:bg-orange-600',
        };
      default:
        return {
          icon: 'text-[var(--primary)]',
          iconBg: 'bg-[var(--primary)]/10',
          button: 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:opacity-90',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <ConfirmModalContext.Provider value={{ confirm }}>
      {children}
      
      <AnimatePresence>
        {isOpen && options && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
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
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                  {options.type === 'danger' ? (
                    <svg className={`w-8 h-8 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : options.type === 'warning' ? (
                    <svg className={`w-8 h-8 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <Icons.Sparkles className={`w-8 h-8 ${styles.icon}`} />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  {options.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  {options.message}
                </p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] transition-all font-medium"
                >
                  {options.cancelText || 'Cancelar'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-all ${styles.button}`}
                >
                  {options.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmModalContext.Provider>
  );
}

export function useConfirmModal() {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error('useConfirmModal must be used within a ConfirmModalProvider');
  }
  return context;
}
