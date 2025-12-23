'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from './Icons';

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--border)] rounded-full transition-all hover:scale-110 active:scale-95"
        aria-label="Configurações"
      >
        <Icons.Settings className="w-5 h-5 text-[var(--text)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-4">
                <h3 className="text-sm font-bold text-[var(--text)] mb-3 uppercase tracking-wider">
                  Configurações
                </h3>

                <div className="space-y-2">
                  <label className="text-xs text-[var(--text-secondary)] font-medium">
                    Tema
                  </label>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 bg-[var(--bg-deep)] hover:bg-[var(--border)] rounded-lg transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <>
                          <Icons.Moon className="w-5 h-5 text-[var(--primary)]" />
                          <span className="text-sm font-medium text-[var(--text)]">
                            Modo Escuro
                          </span>
                        </>
                      ) : (
                        <>
                          <Icons.Sun className="w-5 h-5 text-[var(--primary)]" />
                          <span className="text-sm font-medium text-[var(--text)]">
                            Modo Claro
                          </span>
                        </>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Suas preferências são salvas automaticamente.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

