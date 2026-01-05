'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTheme } from '@/contexts/ThemeContext';

function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { theme } = useTheme();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token not found');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else if (data.expired) {
          setStatus('expired');
          setMessage(data.error);
        } else {
          setStatus('error');
          setMessage(data.error || 'Error verifying email');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Error connecting to server');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border)] p-8 sm:p-10 rounded-3xl shadow-2xl text-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50 blur-sm" />

          <div className="mb-8">
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
          </div>

          {status === 'verifying' && (
            <div className="py-8">
              <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold mb-2 tracking-tight">Verifying email...</h2>
              <p className="text-[var(--text-secondary)]">Please wait while we confirm your account</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="w-20 h-20 bg-[var(--success-bg)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--success-bg)]/20">
                <svg className="w-10 h-10 text-[var(--success-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-[var(--text)] tracking-tight">Email Verified!</h2>
              <p className="text-[var(--text-secondary)] mb-8 text-lg">{message}</p>
              <Link
                href="/login"
                className="block w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98]"
              >
                Sign In Now
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="w-20 h-20 bg-[var(--error-bg)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--error-bg)]/20">
                <svg className="w-10 h-10 text-[var(--error-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[var(--text)]">Verification Failed</h2>
              <p className="text-[var(--text-secondary)] mb-8">{message}</p>
              <Link
                href="/login"
                className="inline-block text-[var(--primary)] hover:text-[var(--primary-hover)] font-bold text-lg transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}

          {status === 'expired' && (
            <div className="py-4">
              <div className="w-20 h-20 bg-[var(--warning-bg)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--warning-bg)]/20">
                <svg className="w-10 h-10 text-[var(--warning-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[var(--text)]">Link Expired</h2>
              <p className="text-[var(--text-secondary)] mb-8">{message}</p>
              <Link
                href="/login"
                className="block w-full py-4 bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] font-bold rounded-xl transition-all"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary-light),_transparent_70%)] opacity-30 pointer-events-none" />
      
      <Navbar />
      <Suspense fallback={
        <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center relative z-10">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <VerificationContent />
      </Suspense>
      <Footer />
    </div>
  );
}
