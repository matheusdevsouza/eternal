'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
        setError(data.error || 'Erro ao enviar email');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] transition-colors duration-300">
      <Navbar />
      
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
            <h1 className="text-3xl font-bold mb-2">Recuperar Senha</h1>
            <p className="text-[var(--text-secondary)]">
              Digite seu email e enviaremos instruções para redefinir sua senha
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-green-900 dark:text-green-100">Email enviado!</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.
              </p>
              <Link
                href="/login"
                className="inline-block text-sm text-[var(--primary)] hover:underline"
              >
                Voltar para login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 text-center">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all text-[var(--text)]"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--primary)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Instruções'}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Voltar para login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}





