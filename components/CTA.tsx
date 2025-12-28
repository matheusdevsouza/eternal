'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-br from-[var(--bg-deep)] via-[var(--bg-section)] to-[var(--bg-deep)]">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{ 
        backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            <span className="text-[var(--text)]">Pronto para criar seu</span>{' '}
            <span className="text-[var(--primary)]">presente eterno?</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de casais que já transformaram seus momentos em memórias digitais inesquecíveis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/precos"
              className="px-10 py-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-2xl transition-all shadow-[0_0_40px_var(--shadow-color)] hover:scale-105 active:scale-95"
            >
              Ver Planos e Preços
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] text-[var(--text)] font-bold rounded-2xl transition-all"
            >
              Já tenho conta
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


