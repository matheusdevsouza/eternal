'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)]">
      <Navbar />

      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4">Pagamento Confirmado! 🎉</h1>

          <p className="text-[var(--text-secondary)] mb-8">
            Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos do seu plano.
          </p>

          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] mb-8">
            <h3 className="font-bold mb-4">Próximos passos:</h3>
            <ul className="text-left space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-sm flex-shrink-0">1</span>
                <span>Acesse seu painel e crie seu primeiro presente</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-sm flex-shrink-0">2</span>
                <span>Adicione fotos, mensagens e músicas especiais</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-sm flex-shrink-0">3</span>
                <span>Publique e compartilhe com quem você ama</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001'}`}
              className="px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Ir para o Painel
            </Link>
            <Link
              href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001'}/gifts/new`}
              className="px-8 py-4 bg-[var(--bg-card)] border border-[var(--border)] font-bold rounded-xl hover:bg-[var(--bg-card-hover)] transition-all"
            >
              Criar Presente
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
