'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from '@/components/ui/Icons';
import { ToastContainer, toast } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsVerification(false);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const redirectUrl = data.redirectUrl || '/pricing';
        window.location.href = redirectUrl;
      } else {
        setError(data.error || 'Login failed');
        if (data.needsVerification) {
          setNeedsVerification(true);
        }
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Verification email sent! Check your inbox.');
      } else {
        toast.error(data.error || 'Failed to resend email.');
      }
    } catch (err) {
      toast.error('Error connecting to server.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary-light),_transparent_70%)] opacity-30 pointer-events-none" />
      
      <ToastContainer />
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
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome back</h1>
              <p className="text-[var(--text-secondary)]">Sign in to your digital sanctuary</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl p-4 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--error-icon-bg)] flex items-center justify-center flex-shrink-0 mt-0.5">
                       <span className="text-[var(--error-icon)] text-xs font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--error-text)] font-medium leading-tight">{error}</p>
                      {needsVerification && (
                        <button 
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendLoading}
                          className="mt-2 text-xs text-[var(--error-text)] underline hover:opacity-80 disabled:opacity-50 font-semibold"
                        >
                          {resendLoading ? 'Sending email...' : 'Resend verification link'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                     <Icons.User className="w-5 h-5" />
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)]">
                    Password
                  </label>
                  <Link href="/recover-password" className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                     <Icons.Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all text-[var(--text)] placeholder-[var(--text-light)] shadow-inner"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <Icons.EyeOff className="w-5 h-5" />
                    ) : (
                      <Icons.Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(255,51,102,0.25)] hover:shadow-[0_4px_25px_rgba(255,51,102,0.35)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[var(--bg-card)] text-[var(--text-muted)]">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--bg-card-hover)] transition-all font-medium text-[var(--text)]"
                  onClick={() => toast.info('Google login coming soon!')}
                >
                  <Icons.Google className="w-5 h-5" />
                  Google
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--bg-card-hover)] transition-all font-medium text-[var(--text)]"
                  onClick={() => toast.info('Apple login coming soon!')}
                >
                  <Icons.Apple className="w-5 h-5" />
                  Apple
                </button>
              </div>

              <p className="text-sm text-[var(--text-secondary)] text-center">
                Don't have an account?{' '}
                <Link href="/register" className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-bold transition-colors">
                  Create free account
                </Link>
              </p>
              
              <div className="w-full h-px bg-[var(--border)]" />
              
              <div className="text-xs text-[var(--text-muted)] flex justify-center gap-2">
                <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms of Use</Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
