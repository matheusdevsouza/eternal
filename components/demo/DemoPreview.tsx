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
      className="w-full rounded-2xl border-2 border-dashed border-[var(--border)] relative
                 min-h-[500px] 
                 lg:min-h-[600px] lg:h-full"
      style={{ 
        pointerEvents: previewCard ? 'auto' : 'none'
      }}
    >
      {/* Área de placeholder sempre visível como background */}
      {!previewCard && (
        <div className="flex items-center justify-center p-6 min-h-[500px]">
          <p className="text-[var(--text-secondary)] text-sm md:text-base text-center max-w-md">
            Clique no botão <span className="font-bold text-[var(--primary)]">"Iniciar Demo"</span> em qualquer card para ver a demonstração interativa.
          </p>
        </div>
      )}
      
      {/* Card que aparece e substitui o placeholder */}
      {previewCard && (
        <div 
          className={`w-full transition-all duration-400 ease-out rounded-2xl ${
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

