'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDemo } from './DemoContext';
import { 
  PhotosDemo, MusicDemo, LetterDemo, 
  ThemeDemo, QRCodeDemo, ShareDemo 
} from './DemoCards';

/**
 * DemoPreview Component
 * 
 * Container principal para exibição dos demos interativos.
 * Gerencia a renderização condicional dos cards de demo em modo expandido (preview).
 * 
 * Funcionalidades:
 * - Gerenciamento de estado de visibilidade
 * - Renderização do card correto baseado no contexto
 * - Placeholder quando nenhum demo está ativo
 * 
 * @component
 * @module components/demo/DemoPreview
 * @requires ./DemoContext
 * @requires ./DemoCards
 */
export function DemoPreview() {
  const { previewCard, setPreviewCard } = useDemo();
  const previewRef = useRef<HTMLDivElement>(null);
  const [cardReady, setCardReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    setCardReady(false);
    
    if (previewCard) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => {
          setCardReady(true);
        }, 100);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [previewCard]);

  const handleClose = () => {
    setPreviewCard(null);
    setCardReady(false);
  };

  const renderPreviewCard = () => {
    if (!previewCard) return null;
    
    const previewProps = { 
      isPreview: true, 
      cardReady,
      onClose: handleClose 
    };

    switch (previewCard) {
      case 'photos':
        return <PhotosDemo {...previewProps} />;
      case 'music':
        return <MusicDemo {...previewProps} />;
      case 'letter':
        return <LetterDemo {...previewProps} />;
      case 'theme':
        return <ThemeDemo {...previewProps} />;
      case 'qrcode':
        return <QRCodeDemo {...previewProps} />;
      case 'share':
        return <ShareDemo {...previewProps} />;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={previewRef}
      data-preview-container
      className="w-full rounded-2xl border-2 border-dashed border-[var(--border)] relative
                 min-h-[500px] 
                 lg:min-h-[600px] lg:h-full"
      style={{ 
        pointerEvents: previewCard ? 'auto' : 'none'
      }}
    >

      {!previewCard && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <p className="text-[var(--text-secondary)] text-sm md:text-base text-center max-w-md">
            Click the <span className="font-bold text-[var(--primary)]">"Start Demo"</span> button on any card to see the interactive demo.
          </p>
        </div>
      )}
      

      {previewCard && (
        <div 
          className={`w-full transition-opacity duration-400 ease-out rounded-2xl min-h-[500px] lg:min-h-[600px] ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        >
          {renderPreviewCard()}
        </div>
      )}
    </div>
  );
}

