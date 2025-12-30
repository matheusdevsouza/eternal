'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Icons } from '@/components/ui/Icons';

export default function GiftTipsPage() {
  const tips = [
    {
      title: '5 Photos that tell a story',
      desc: 'How to select photos that create a narrative arc for your relationship timeline.',
      icon: <Icons.Camera className="w-6 h-6" />
    },
    {
      title: 'Writing the perfect note',
      desc: 'Struggling with words? Use these templates to express your feelings.',
      icon: <Icons.Heart className="w-6 h-6" />
    },
    {
      title: 'Music selection guide',
      desc: 'Match the mood of your photos with the right genre and tempo.',
      icon: <Icons.Music className="w-6 h-6" />
    },
    {
      title: 'Surprise reveal ideas',
      desc: 'Creative ways to present the QR code to your partner.',
      icon: <Icons.Gift className="w-6 h-6" />
    },
    {
      title: 'Anniversary themes',
      desc: 'Color palettes and styles for different relationship milestones.',
      icon: <Icons.Sparkles className="w-6 h-6" />
    },
    {
      title: 'Sharing privately',
      desc: 'How to ensure your intimate moments stay just between the two of you.',
      icon: <Icons.Lock className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] overflow-x-hidden transition-colors duration-300">
      <Navbar />


      <section className="relative py-32 md:py-40 flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--hero-gradient)' }} />
        
        <div className="max-w-4xl mx-auto text-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-xs font-bold mb-8"
          >
            <Icons.Sparkles className="w-3 h-3" />
            EXPERT ADVICE
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-[var(--text)]"
          >
            Creative <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              Gift Tips
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-2 max-w-2xl mx-auto"
          >
            Make your gift even more meaningful with our curated collection of tips and creative ideas.
          </motion.p>
        </div>
      </section>


      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl hover:bg-[var(--bg-card-hover)] hover:border-[var(--primary)]/50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6 group-hover:scale-110 transition-transform">
                  {tip.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  {tip.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                  {tip.desc}
                </p>
                <div className="flex items-center text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  View Tip
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--border)] p-12 rounded-[40px] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 text-[var(--primary)]">
                <Icons.Sparkles className="w-32 h-32" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4 relative z-10">Ready to apply these tips?</h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto relative z-10">
                Start creating your digital gift now and use these tips to make it perfect.
            </p>
            <Link 
                href="/pricing"
                className="inline-block px-10 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 relative z-10"
            >
                Create My Gift
            </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
