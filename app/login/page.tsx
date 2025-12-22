'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-[#0F0507] text-[#FFF1F2]">
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
            <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta</h1>
            <p className="text-[#FFF1F2]/60">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 bg-[#1A0B0E] border border-[#2D1318] rounded-xl outline-none focus:border-[#FF3366] transition-all text-[#FFF1F2]"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Senha
                </label>
                <Link href="/recuperar-senha" className="text-sm text-[#FF3366] hover:text-[#FF4D7D] transition-colors">
                  Esqueceu?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#1A0B0E] border border-[#2D1318] rounded-xl outline-none focus:border-[#FF3366] transition-all text-[#FFF1F2]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FF3366] hover:bg-[#FF4D7D] text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#FFF1F2]/60">
              Não tem uma conta?{' '}
              <Link href="/registro" className="text-[#FF3366] hover:text-[#FF4D7D] font-medium transition-colors">
                Criar conta
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-[#2D1318]">
            <div className="text-center text-sm text-[#FFF1F2]/40">
              Ao entrar, você concorda com nossos{' '}
              <Link href="/termos" className="text-[#FF3366] hover:underline">Termos de Uso</Link>
              {' '}e{' '}
              <Link href="/privacidade" className="text-[#FF3366] hover:underline">Política de Privacidade</Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}


