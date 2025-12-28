'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Features from '@/components/Features';
import Stats from '@/components/Stats';
import CTA from '@/components/CTA';
import { Icons } from '@/components/Icons';

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] overflow-x-hidden transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 overflow-hidden pt-20">
        {/* Gradient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--hero-gradient)' }} />
        
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-xs font-bold mb-8"
          >
            <Icons.Sparkles className="w-3 h-3" />
            RECURSOS COMPLETOS
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight"
          >
            <span className="text-[var(--text)]">Recursos que</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              Fazem a Diferença
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto"
          >
            Tudo que você precisa para criar o presente perfeito em um só lugar. 
            Explore todas as funcionalidades que tornam suas memórias ainda mais especiais.
          </motion.p>
        </div>
      </section>

      {/* Features Component */}
      <Features />

      {/* Additional Features Section */}
      <section className="py-24 border-y border-[var(--border)] bg-gradient-to-b from-[var(--bg-gradient-start)]/50 to-[var(--bg-gradient-end)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Personalização Total</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Escolha entre diversos temas elegantes ou crie seu próprio estilo único. 
                Personalize cores, fontes e layouts para refletir sua personalidade.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Temas pré-configurados
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Editor visual intuitivo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Customização completa
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Compartilhamento Inteligente</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Compartilhe suas memórias da forma que preferir. Links únicos, 
                QR Codes personalizados ou domínios próprios para um toque ainda mais especial.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Links curtos e personalizados
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  QR Code customizado
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Domínio próprio (Premium)
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Segurança e Privacidade</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Suas memórias estão seguras conosco. Utilizamos criptografia de ponta 
                e seguimos os mais altos padrões de segurança e privacidade.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Criptografia SSL/TLS
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Conformidade com RGPD
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Backup automático
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Suporte Dedicado</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Nossa equipe está sempre pronta para ajudar. Suporte prioritário 
                para planos Premium e Eternal, além de documentação completa.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Suporte por e-mail
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Central de ajuda completa
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Tutoriais em vídeo
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* CTA Section */}
      <CTA />
      
      <Footer />
    </div>
  );
}
