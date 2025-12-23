'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado');
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
          setMessage(data.error || 'Erro ao verificar email');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Erro ao conectar com o servidor');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image 
              src="/logo.png" 
              alt="Eternal Gift" 
              width={140} 
              height={46}
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>

        {status === 'verifying' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Verificando email...</h2>
            <p className="text-[var(--text-secondary)]">Aguarde um momento</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">Email verificado!</h2>
            <p className="text-green-700 dark:text-green-300 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Fazer Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-900 dark:text-red-100">Erro na verificação</h2>
            <p className="text-red-700 dark:text-red-300 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block text-[var(--primary)] hover:underline font-medium"
            >
              Voltar para login
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-yellow-900 dark:text-yellow-100">Token expirado</h2>
            <p className="text-yellow-700 dark:text-yellow-300 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Voltar para login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] transition-colors duration-300">
      <Navbar />
      <Suspense fallback={
        <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <VerificationContent />
      </Suspense>
      <Footer />
    </div>
  );
}





