'use client';

import { motion } from 'framer-motion';
import { Icons } from './Icons';

interface Tier {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
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
        <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-2">{tier.name}</h3>
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

export default function Pricing() {
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
    <section id="precos" className="py-32 px-6 bg-gradient-to-b from-transparent to-[var(--bg-section)]/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-[var(--text)]">Escolha o seu</span>{' '}
            <span className="text-[var(--primary)]">nível de amor</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Planos que cabem no bolso, memórias que não têm preço.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <PricingCard key={tier.name} tier={tier} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}


