'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Features from '@/components/sections/Features';
import Stats from '@/components/sections/Stats';
import CTA from '@/components/sections/CTA';
import { Icons } from '@/components/ui/Icons';

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] overflow-x-hidden transition-colors duration-300">
      <Navbar />
      
      <section className="relative py-32 md:py-40 flex items-center justify-center px-6 overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--hero-gradient)' }} />
        
        <div className="max-w-6xl mx-auto text-center w-full">

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-xs font-bold mb-8"
          >
            <Icons.Sparkles className="w-3 h-3" />
            COMPLETE FEATURES
          </motion.div>


          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight"
          >
            <span className="text-[var(--text)]">Features that</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              Make the Difference
            </span>
          </motion.h1>


          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-2 max-w-2xl mx-auto"
          >
            Everything you need to create the perfect gift in one place. 
            Explore all the features that make your memories even more special.
          </motion.p>
        </div>
      </section>


      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Features />
        </div>
      </section>


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
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Total Customization</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Choose from various elegant themes or create your own unique style. 
                Customize colors, fonts, and layouts to reflect your personality.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Pre-configured themes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Intuitive visual editor
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Complete customization
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
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Smart Sharing</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Share your memories however you prefer. Unique links, 
                custom QR Codes, or own domains for an even more special touch.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Short and custom links
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Custom QR Code
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Own Domain (Premium)
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
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Security and Privacy</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Your memories are safe with us. We use state-of-the-art encryption 
                and follow the highest security and privacy standards.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  SSL/TLS Encryption
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  GDPR Compliance
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Automatic backup
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
              <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Dedicated Support</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Our team is always ready to help. Priority support 
                for Premium and Eternal plans, plus complete documentation.
              </p>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Email support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Complete Help Center
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--primary)]">✓</span>
                  Video tutorials
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>


      <Stats />


      <CTA />
      
      <Footer />
    </div>
  );
}
