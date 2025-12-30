'use client';

import { motion } from 'framer-motion';
import { Icons } from '../ui/Icons';

/**
 * Hero Component
 * 
 * Seção de destaque inicial da landing page.
 * Apresenta a proposta de valor principal, título impactante e CTAs.
 * 
 * Elementos:
 * - Badge animado com ícone
 * - Título principal com gradiente de texto
 * - Subtítulo descritivo
 * - Botões de ação (CTA) primário e secundário
 * 
 * @component
 * @module components/sections/Hero
 */
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-20">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--hero-gradient)' }} />
      
      <div className="max-w-4xl mx-auto text-center w-full">

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-xs font-bold mb-8"
        >
          <Icons.Sparkles className="w-3 h-3" />
          THE MOST EMOTIONAL GIFT IN THE WORLD
        </motion.div>


        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
          className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-[var(--text)]"
        >
          Memories that <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            never age.
          </span>
        </motion.h1>


        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto"
        >
          Create a digital sanctuary for your moments. Add sound tracks, 
          open letters, and photos that tell your love story in an eternal link.
        </motion.p>


        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="px-10 py-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-2xl transition-all shadow-[0_0_40px_var(--shadow-color)] hover:scale-105 active:scale-95">
            Create My Gift Now
          </button>
          <button className="px-10 py-5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] text-[var(--text)] font-bold rounded-2xl transition-all">
            View an Example
          </button>
        </motion.div>
      </div>
    </section>
  );
}

