'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from '@/components/ui/Icons';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Error sending email');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary-light),_transparent_70%)] opacity-30 pointer-events-none" />
      
      <Navbar />
      
      <div className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border)] p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50 blur-sm" />

            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6 transform hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logo.png" 
                  alt="Eternal Gift" 
                  width={160} 
                  height={53}
                  className="h-14 w-auto mx-auto"
                  style={{ filter: theme === 'light' ? 'var(--logo-filter)' : 'none' }}
                />
              </Link>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Recover Password</h1>
              <p className="text-[var(--text-secondary)]">Restore access to your sanctuary</p>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-[var(--success-bg)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--success-bg)]/20">
                  <svg className="w-10 h-10 text-[var(--success-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-[var(--text)]">Check your inbox</h3>
                <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                  We've sent password reset instructions to<br/>
                  <span className="font-semibold text-[var(--text)]">{email}</span>
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] font-semibold rounded-xl transition-all group"
                >
                  <span className="group-hover:text-[var(--primary)] transition-colors">Back to Login</span>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl p-4 flex items-center gap-3">
                     <span className="flex-shrink-0 text-[var(--error-text)] font-bold">!</span>
                     <p className="text-sm text-[var(--error-text)] font-medium leading-tight">{error}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                       </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all text-[var(--text)] placeholder-[var(--text-light)] shadow-inner"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="pt-2">
                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(255,51,102,0.25)] hover:shadow-[0_4px_25px_rgba(255,51,102,0.35)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {loading ? 'Sending Instructions...' : 'Send Instructions'}
                    </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                  >
                    Go back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
