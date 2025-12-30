'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTA from '@/components/sections/CTA';
import { Icons } from '@/components/ui/Icons';
import { DemoProvider } from '@/components/demo/DemoContext';
import { DemoPreview } from '@/components/demo/DemoPreview';
import { PhotosDemo, MusicDemo, LetterDemo, ThemeDemo, QRCodeDemo, ShareDemo } from '@/components/demo/DemoCards';

export default function ComoFuncionaPage() {
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncHeights = () => {
      if (cardsContainerRef.current && previewContainerRef.current) {
        requestAnimationFrame(() => {
          if (cardsContainerRef.current && previewContainerRef.current) {
            const isMobile = window.innerWidth < 1024;
            
            if (!isMobile) {
              const cardsHeight = cardsContainerRef.current.offsetHeight;
              const finalHeight = Math.max(cardsHeight, 600);
              previewContainerRef.current.style.height = `${finalHeight}px`;
            }
          }
        });
      }
    };

    const initialTimeout = setTimeout(syncHeights, 100);
    window.addEventListener('resize', syncHeights);
    
    const observer = new MutationObserver(() => {
      setTimeout(syncHeights, 50);
    });
    
    if (cardsContainerRef.current) {
      observer.observe(cardsContainerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    const interval = setInterval(syncHeights, 1000);

    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener('resize', syncHeights);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

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
            SIMPLE AND INTUITIVE
          </motion.div>


          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-[var(--text)]"
          >
            Watch our <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              demo.
            </span>
          </motion.h1>


          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-2 max-w-2xl mx-auto"
          >
            Explore some of our features now in our interactive demo.
          </motion.p>
        </div>
      </section>


      <section className="py-16 px-6 bg-gradient-to-b from-transparent to-[var(--bg-section)]/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <DemoProvider>
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
              <div 
                ref={cardsContainerRef}
                className="w-full order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min"
              >
                <PhotosDemo />
                <MusicDemo />
                <LetterDemo />
                <ThemeDemo />
                <QRCodeDemo />
                <ShareDemo />
              </div>

              <div 
                ref={previewContainerRef}
                className="w-full order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start"
              >
                <DemoPreview />
              </div>
            </div>
          </DemoProvider>
        </div>
      </section>


      <CTA />
      
      <Footer />
    </div>
  );
}
