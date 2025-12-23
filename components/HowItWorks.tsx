'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './Icons';

interface StepCardProps {
  number: string;
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  desc: string;
  index: number;
}

function StepCard({ number, icon, title, desc, index }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className="p-10 rounded-[32px] bg-[var(--bg-card)] border border-[var(--border)] relative group hover:border-[var(--border-hover)] transition-all"
    >
      <div className="text-5xl font-black text-[var(--card-number)] absolute top-6 right-8 group-hover:text-[var(--primary-light)] transition-colors">
        {number}
      </div>
      <div className="w-14 h-14 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-8">
        {React.cloneElement(icon, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-xl font-bold mb-4 text-[var(--text)]">{title}</h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: <Icons.Camera />,
      title: 'Escolha suas memórias',
      desc: 'Faça o upload das fotos mais marcantes do casal.',
    },
    {
      number: '02',
      icon: <Icons.Music />,
      title: 'Defina o ritmo',
      desc: 'Escolha aquela música que é o tema de vocês.',
    },
    {
      number: '03',
      icon: <Icons.Gift />,
      title: 'Surpreenda',
      desc: 'Gere o link ou QR Code e envie para quem você ama.',
    },
  ];

  return (
    <section id="funciona" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-[var(--text)]">Três passos para</span>{' '}
            <span className="text-[var(--primary)]">a surpresa perfeita</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Simples, rápido e inesquecível.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <StepCard key={step.number} {...step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}


