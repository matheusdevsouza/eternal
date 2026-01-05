'use client';

import { motion } from 'framer-motion';
import { Icons } from '../ui/Icons';
import Link from 'next/link';

/**
 * Hero Component
 * 
 * Seção de destaque inicial da landing page.
 * Apresenta a proposta de valor principal, título impactante e CTAs.
 */
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-20">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--hero-gradient)' }} />
      <motion.img 
        src="/background/gift.png" 
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: 0.55, 
          x: 0,
          y: [0, -15, 0]
        }}
        transition={{ 
          opacity: { duration: 0.8 },
          x: { duration: 0.8 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute left-4 md:left-12 lg:left-20 top-1/3 w-52 md:w-64 lg:w-72 -rotate-12 pointer-events-none select-none hidden md:block"
        style={{ zIndex: 0 }}
      />
      <motion.img 
        src="/background/balloon.png" 
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, x: 50 }}
        animate={{ 
          opacity: 0.4, 
          x: 0,
          y: [0, 12, 0]
        }}
        transition={{ 
          opacity: { duration: 0.8, delay: 0.2 },
          x: { duration: 0.8, delay: 0.2 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
        }}
        className="absolute right-16 md:right-24 lg:right-32 top-1/4 w-40 md:w-52 lg:w-60 rotate-[20deg] pointer-events-none select-none hidden lg:block"
        style={{ zIndex: 0 }}
      />
      
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
          <Link 
            href="/register"
            className="px-10 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-[0_4px_20px_rgba(255,51,102,0.25)] hover:shadow-[0_4px_25px_rgba(255,51,102,0.35)] hover:scale-105 active:scale-95 text-center"
          >
            Create My Gift Now
          </Link>
          <Link 
            href="/how-it-works"
            className="px-10 py-5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--primary)] text-[var(--text)] font-bold rounded-2xl transition-all text-center"
          >
            View an Example
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
