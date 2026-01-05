'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
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


      <section id="precos" className="relative py-32 px-6 bg-gradient-to-b from-transparent to-[var(--bg-section)]/50 overflow-hidden">
        <motion.img 
          src="/background/heart.png" 
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 0.55, x: 0 }}
          viewport={{ once: true }}
          animate={{ y: [0, -12, 0], rotate: [-6, -3, -6] }}
          transition={{ 
            opacity: { duration: 0.6 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute left-8 md:left-16 lg:left-24 top-40 w-52 md:w-64 lg:w-72 pointer-events-none select-none hidden lg:block"
        />
        <motion.img 
          src="/background/heart.png" 
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 0.40, x: 0 }}
          viewport={{ once: true }}
          animate={{ y: [0, 10, 0], rotate: [12, 15, 12] }}
          transition={{ 
            opacity: { duration: 0.6, delay: 0.2 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }}
          className="absolute right-12 md:right-20 lg:right-28 bottom-32 w-40 md:w-52 pointer-events-none select-none hidden xl:block"
        />
        <motion.img 
          src="/background/heart.png" 
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.35, scale: 1 }}
          viewport={{ once: true }}
          animate={{ y: [0, -6, 0], rotate: [8, 12, 8] }}
          transition={{ 
            opacity: { duration: 0.6, delay: 0.3 },
            y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute right-8 md:right-12 lg:right-16 top-20 w-24 md:w-32 pointer-events-none select-none hidden lg:block"
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
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


      <section className="relative py-32 px-6 bg-gradient-to-b from-[var(--bg-deep)] to-[var(--bg-section)]/30 overflow-hidden">
        <motion.img 
          src="/background/heart-balloon.png" 
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 0.40, x: 0 }}
          viewport={{ once: true }}
          animate={{ y: [0, -12, 0], rotate: [8, 12, 8] }}
          transition={{ 
            opacity: { duration: 0.6 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute right-8 md:right-16 lg:right-24 top-40 w-44 md:w-52 lg:w-60 pointer-events-none select-none hidden lg:block"
        />
        <div className="max-w-7xl mx-auto relative z-10">
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


      <section id="faq" className="relative py-32 px-6 overflow-hidden">
        <motion.img 
          src="/background/question.png" 
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 0.55, scale: 1 }}
          viewport={{ once: true }}
          animate={{ y: [0, -8, 0], rotate: [6, 10, 6] }}
          transition={{ 
            opacity: { duration: 0.6 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute right-8 md:right-16 lg:right-24 top-40 w-44 md:w-52 lg:w-60 pointer-events-none select-none hidden lg:block"
        />
        <motion.img 
          src="/background/question.png" 
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 0.40, scale: 1 }}
          viewport={{ once: true }}
          animate={{ y: [0, 6, 0], rotate: [-8, -5, -8] }}
          transition={{ 
            opacity: { duration: 0.6, delay: 0.2 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
          }}
          className="absolute left-8 md:left-12 lg:left-20 top-1/2 -translate-y-1/2 w-32 md:w-40 lg:w-44 pointer-events-none select-none hidden xl:block"
        />
        <motion.img 
          src="/background/question.png" 
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.30, scale: 1 }}
          viewport={{ once: true }}
          animate={{ y: [0, 5, 0], rotate: [10, 14, 10] }}
          transition={{ 
            opacity: { duration: 0.6, delay: 0.4 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute right-16 md:right-24 bottom-40 w-20 md:w-28 pointer-events-none select-none hidden lg:block"
        />
        
        <div className="max-w-3xl mx-auto relative z-10">
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
