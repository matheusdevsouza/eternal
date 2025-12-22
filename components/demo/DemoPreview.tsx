'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDemo } from './DemoContext';
import { 
  PhotosDemo, MusicDemo, LetterDemo, 
  ThemeDemo, QRCodeDemo, ShareDemo 
} from './DemoCards';

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
      className="hidden md:block w-full h-full rounded-2xl border-2 border-dashed border-[var(--border)] relative"
      style={{ 
        pointerEvents: previewCard ? 'auto' : 'none',
        minHeight: '600px'
      }}
    >
      {/* Área de placeholder sempre visível como background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className={`text-[var(--text-secondary)] text-sm text-center transition-opacity duration-300 ${
          previewCard ? 'opacity-0' : 'opacity-100'
        }`}>
          Clique no botão "Iniciar Demo" para começar a demonstração.
        </p>
      </div>
      
      {/* Card que aparece e preenche todo o espaço por cima do background */}
      {previewCard && (
        <div 
          className={`absolute -inset-2 transition-all duration-400 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
          style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        >
          {renderPreviewCard()}
        </div>
      )}
    </div>
  );
}

