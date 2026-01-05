'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DemoProvider } from './DemoContext';
import { DemoPreview } from './DemoPreview';
import { PhotosDemo, MusicDemo, LetterDemo, ThemeDemo, QRCodeDemo, ShareDemo } from './DemoCards';

/**
 * Componente de seção principal para a área de demonstração interativa.
 * * Responsável por orquestrar o layout entre a grade de cards de demonstração
 * e a área de visualização (preview). Inclui lógica para manter as alturas
 * dos containers sincronizadas, garantindo uma experiência visual fluida.
 */

export default function DemoSection() {
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    /**
     * Calcula e sincroniza a altura do container de preview com a altura
     * real da grade de cards. Utiliza requestAnimationFrame para garantir 
     * que o cálculo ocorra após as transformações de layout do navegador.
     */

    const syncHeights = () => {
      if (cardsContainerRef.current && previewContainerRef.current) {
        requestAnimationFrame(() => {
          if (cardsContainerRef.current && previewContainerRef.current) {
            const isMobile = window.innerWidth < 1024;
            
            if (!isMobile) {

              // Desktop: sincroniza com altura dos cards

              const cardsHeight = cardsContainerRef.current.offsetHeight;
              const finalHeight = Math.max(cardsHeight, 600);
              previewContainerRef.current.style.height = `${finalHeight}px`;
            }

            // Mobile: remove altura inline para permitir crescimento automático

          }
        });
      }
    };

    const initialTimeout = setTimeout(syncHeights, 100);

    window.addEventListener('resize', syncHeights);
    
    /**
     * Observador de mutação para reagir a mudanças dinâmicas no DOM dos cards
     * (ex: expansão de conteúdo ou carregamento de assets) que afetem a altura.
     */
    
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
    <section id="demo" className="relative py-20 px-6 bg-[var(--bg-deep)] transition-colors duration-300 overflow-hidden">
      <motion.img 
        src="/background/star.png" 
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.45, scale: 1 }}
        viewport={{ once: true }}
        animate={{ y: [0, -10, 0], rotate: [12, 18, 12] }}
        transition={{ 
          opacity: { duration: 0.6 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute left-8 md:left-16 lg:left-24 top-32 w-36 md:w-44 lg:w-52 pointer-events-none select-none hidden lg:block"
      />
      <motion.img 
        src="/background/star.png" 
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.35, scale: 1 }}
        viewport={{ once: true }}
        animate={{ y: [0, 8, 0], rotate: [-8, -12, -8] }}
        transition={{ 
          opacity: { duration: 0.6, delay: 0.3 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          rotate: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
        }}
        className="absolute right-12 md:right-20 lg:right-28 bottom-40 w-32 md:w-40 pointer-events-none select-none hidden xl:block"
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
            <span className="text-[var(--text)]">Experience the</span>{' '}
            <span className="text-[var(--primary)]">Magic</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            See how easy it is to create an unforgettable digital gift. 
            Click on each card to see the interactive demo.
          </p>
        </motion.div>

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
  );
}