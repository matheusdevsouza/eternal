'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StepCardProps {
  number: string;
  image: string;
  title: string;
  desc: string;
  index: number;
}

function StepCard({ number, image, title, desc, index }: StepCardProps) {
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
      <div className="w-20 h-20 mb-6 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
        <img 
          src={image} 
          alt="" 
          className="w-full h-full object-contain drop-shadow-lg"
        />
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
      image: '/background/camera.png',
      title: 'Choose your memories',
      desc: 'Upload the couple\'s most striking photos.',
    },
    {
      number: '02',
      image: '/background/song.png',
      title: 'Set the rhythm',
      desc: 'Choose the song that is your theme.',
    },
    {
      number: '03',
      image: '/background/gift.png',
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
