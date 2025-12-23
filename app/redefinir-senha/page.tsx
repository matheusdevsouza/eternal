'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasswordErrors([]);

    if (!token) {
      setError('Token não encontrado');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Erro ao redefinir senha');
        if (data.details) {
          setPasswordErrors(data.details);
        }
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-2 text-red-900 dark:text-red-100">Token não encontrado</h2>
            <p className="text-red-700 dark:text-red-300 mb-6">
              Link inválido ou expirado
            </p>
            <Link
              href="/recuperar-senha"
              className="inline-block text-[var(--primary)] hover:underline font-medium"
            >
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2">Redefinir Senha</h1>
          <p className="text-[var(--text-secondary)]">
            Crie uma nova senha forte para sua conta
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-green-900 dark:text-green-100">Senha redefinida!</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
              Sua senha foi alterada com sucesso.
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Redirecionando para o login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">{error}</p>
                {passwordErrors.length > 0 && (
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 mt-2">
                    {passwordErrors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Nova Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all text-[var(--text)]"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all text-[var(--text)]"
                placeholder="Digite novamente"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">Requisitos da senha:</p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Mínimo 8 caracteres</li>
                <li>• Uma letra maiúscula</li>
                <li>• Uma letra minúscula</li>
                <li>• Um número</li>
                <li>• Um caractere especial (@$!%*?&)</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[var(--primary)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] transition-colors duration-300">
      <Navbar />
      <Suspense fallback={
        <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
      <Footer />
    </div>
  );
}





