'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../ui/Icons';

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
      title: 'Choose your memories',
      desc: 'Upload the couple\'s most striking photos.',
    },
    {
      number: '02',
      icon: <Icons.Music />,
      title: 'Set the rhythm',
      desc: 'Choose the song that is your theme.',
    },
    {
      number: '03',
      icon: <Icons.Gift />,
      title: 'Surprise',
      desc: 'Generate the link or QR Code and send it to the one you love.',
    },
  ];

  return (
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <StepCard key={step.number} {...step} index={index} />
          ))}
        </div>
  );
}


