'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTA from '@/components/CTA';
import { Icons } from '@/components/Icons';
import FAQ from '@/components/FAQ';

interface Tier {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-card)]"
    >
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full p-6 flex items-center justify-between text-left hover:bg-[var(--bg-card-hover)] transition-colors"
      >
        <span className="font-bold text-[var(--text)]">{question}</span>
        <div className={`transition-transform duration-300 text-[var(--text)] ${open ? 'rotate-180' : ''}`}>
          <Icons.ChevronDown />
        </div>
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="p-6 pt-4 text-[var(--text-secondary)] text-sm leading-relaxed border-t border-[var(--border)]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PricingCard({ tier, index }: { tier: Tier; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className={`p-8 rounded-[40px] border ${
        tier.popular 
          ? 'border-[var(--primary)] bg-[var(--bg-card)] scale-105 shadow-[0_0_60px_var(--shadow-color)]' 
          : 'border-[var(--border)] bg-[var(--bg-deep)]'
      } flex flex-col relative`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
          Mais Popular
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-[var(--text)]">R${tier.price}</span>
          <span className="text-[var(--text-light)] text-sm">/mês</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-10 flex-1">
        {tier.features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <div className="w-5 h-5 rounded-full bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)]">
              <Icons.Check className="w-3 h-3" />
            </div>
            {feature}
          </div>
        ))}
      </div>
      
      <button 
        className={`w-full py-4 rounded-2xl font-bold transition-all ${
          tier.popular 
            ? 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white' 
            : 'bg-[var(--bg-card-hover)] hover:bg-[var(--border)] text-[var(--text)] border border-[var(--border)]'
        }`}
      >
        Começar agora
      </button>
    </motion.div>
  );
}

export default function PrecosPage() {
  const tiers: Tier[] = [
    {
      name: 'Start',
      price: '29',
      features: [
        'Páginas ilimitadas',
        'Até 5 Fotos HD por página',
        'Texto personalizado',
        'Link público',
        'QR Code padrão'
      ]
    },
    {
      name: 'Premium',
      price: '59',
      popular: true,
      features: [
        'Páginas ilimitadas',
        'Até 15 Fotos HD por página',
        'Música de fundo',
        'Contador de tempo',
        'Animações premium',
        'QR Code customizado'
      ]
    },
    {
      name: 'Eternal',
      price: '99',
      features: [
        'Páginas ilimitadas',
        'Até 30 Fotos HD por página',
        'Música ilimitada',
        'Domínio personalizado',
        'Edição Vitalícia',
        'Suporte Prioritário'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] overflow-x-hidden transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-20">
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
            PLANOS QUE CABEM NO SEU BOLSO
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-[var(--text)]"
          >
            Escolha seu <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              plano perfeito.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto"
          >
            Planos que cabem no seu bolso, memórias que não têm preço. Escolha o plano perfeito para suas necessidades.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-[var(--bg-section)]/50 -mt-32 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <PricingCard key={tier.name} tier={tier} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 border-y border-[var(--border)] bg-gradient-to-b from-[var(--bg-gradient-start)]/50 to-[var(--bg-gradient-end)]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-[var(--text)]">Por que escolher</span>{' '}
              <span className="text-[var(--primary)]">o Eternal Gift?</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Garantias e benefícios que fazem toda a diferença na sua experiência
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">Sem taxas ocultas</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Transparência total. O preço que você vê é o preço que você paga, sem surpresas ou custos adicionais.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">Cancelamento a qualquer momento</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Flexibilidade total. Cancele quando quiser, sem burocracias ou taxas de cancelamento.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">Suporte em português</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Nossa equipe brasileira está sempre pronta para ajudar você em português, quando você precisar.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">Atualizações gratuitas</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Receba todas as novas funcionalidades e melhorias automaticamente, sem custo adicional.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

     <FAQ />

      {/* CTA Section */}
      <CTA />
      
      <Footer />
    </div>
  );
}
