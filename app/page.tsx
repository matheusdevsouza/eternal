'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import HowItWorks from '@/components/sections/HowItWorks';
import Features from '@/components/sections/Features';
import DemoSection from '@/components/demo/DemoSection';
import Pricing from '@/components/sections/Pricing';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <Hero />
      <Stats />
      

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
              <span className="text-[var(--text)]">Three steps to</span>{' '}
              <span className="text-[var(--primary)]">the perfect surprise</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Simple, fast, and unforgettable.
            </p>
          </motion.div>
          <HowItWorks />
        </div>
      </section>


      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-[var(--text)]">Features that</span>{' '}
              <span className="text-[var(--primary)]">make the difference</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Everything you need to create the perfect gift in one place
            </p>
          </motion.div>
          <Features />
        </div>
      </section>

      <DemoSection />


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
              <span className="text-[var(--text)]">Choose your</span>{' '}
              <span className="text-[var(--primary)]">love level</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Affordable plans, priceless memories.
            </p>
          </motion.div>
          <Pricing />
        </div>
      </section>


      <section className="py-32 px-6 bg-gradient-to-b from-[var(--bg-deep)] to-[var(--bg-section)]/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-[var(--text)]">What our</span>{' '}
              <span className="text-[var(--primary)]">couples say</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Real stories from people who transformed their moments into eternal gifts
            </p>
          </motion.div>
          <Testimonials />
        </div>
      </section>


      <section id="faq" className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
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
