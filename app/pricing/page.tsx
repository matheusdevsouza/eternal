'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTA from '@/components/sections/CTA';
import { Icons } from '@/components/ui/Icons';
import FAQ from '@/components/sections/FAQ';
import Pricing from '@/components/sections/Pricing';

export default function PrecosPage() {
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
            PLANS THAT FIT YOUR POCKET
          </motion.div>


          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-[var(--text)]"
          >
            Choose your <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              perfect plan.
            </span>
          </motion.h1>


          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-2 max-w-2xl mx-auto"
          >
            Affordable plans, priceless memories. Choose the perfect plan for your needs.
          </motion.p>
        </div>
      </section>


      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-[var(--bg-section)]/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Pricing />
        </div>
      </section>


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
              <span className="text-[var(--text)]">Why choose</span>{' '}
              <span className="text-[var(--primary)]">Eternal Gift?</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Guarantees and benefits that make all the difference in your experience
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
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">No hidden fees</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Total Transparency. The price you see is the price you pay, no surprises or additional costs.
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
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">Cancel anytime</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Total flexibility. Cancel whenever you want, without bureaucracy or cancellation fees.
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
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">Dedicated Support</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Our team is always ready to help you whenever you need.
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
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">Free updates</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Receive all new features and improvements automatically, at no additional cost.
              </p>
            </motion.div>
          </div>
        </div>
      </section>


      <section className="py-24 px-6 border-y border-[var(--border)] bg-gradient-to-b from-[var(--bg-gradient-start)]/50 to-[var(--bg-gradient-end)]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-[var(--text)]">Frequently</span>{' '}
              <span className="text-[var(--primary)]">Asked Questions</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Get your questions answered about Eternal Gift
            </p>
          </motion.div>
          <FAQ />
        </div>
      </section>

      <CTA />
      
      <Footer />
    </div>
  );
}
