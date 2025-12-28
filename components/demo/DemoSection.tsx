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
    <section id="demo" className="py-20 px-6 bg-[var(--bg-deep)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-[var(--text)]">Experimente a</span>{' '}
            <span className="text-[var(--primary)]">Magia</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Veja como é fácil criar um presente digital inesquecível. 
            Clique em cada card para ver a demonstração interativa.
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