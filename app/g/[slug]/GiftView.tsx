/**
 * @fileoverview Componente de Visualização Pública do Presente
 * @description Renderiza o presente publicado com animações, galeria de fotos, player de música e blocos de conteúdo.
 * @module app/g/[slug]/GiftView
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BlockRender } from '@/components/builder/BlockRender';
import { Block } from '@/types/builder';

/** Interface para dados de foto */
interface Photo {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

/** Interface para dados de música */
interface Music {
  id: string;
  name: string;
  artist?: string;
  url: string;
  duration?: number;
}

interface GiftData {
  id: string;
  slug: string;
  title: string;
  message: string;
  recipientName?: string;
  theme: string;
  font: string;
  animation: string;
  backgroundColor?: string;
  textColor?: string;
  views: number;
  publishedAt?: string;
  photos: Photo[];
  musics: Music[];
  creatorName?: string;
  isPremium?: boolean;
  content?: {
    blocks: Block[];
  };
}

/** Props do componente GiftView */
interface GiftViewProps {
  /** Dados completos do presente para renderização */
  gift: GiftData;
}

/** Mapeamento de IDs de fonte para valores CSS */
const fontFamilies: Record<string, string> = {
  'serif-luxe': '"Playfair Display", Georgia, serif',
  'sans-clean': '"Inter", Arial, sans-serif',
  'handwriting': '"Dancing Script", cursive',
  'monospace': '"JetBrains Mono", monospace',
};

/** Paleta de cores para cada tema disponível */
const themeStyles: Record<string, { bg: string; accent: string; text: string }> = {
  elegance: { bg: '#FFF5F7', accent: '#FF3366', text: '#1a1a1a' },
  romantic: { bg: '#FCE4EC', accent: '#E91E63', text: '#1a1a1a' },
  vintage: { bg: '#EFEBE9', accent: '#8D6E63', text: '#3E2723' },
  modern: { bg: '#E3F2FD', accent: '#2196F3', text: '#0D47A1' },
  nature: { bg: '#E8F5E9', accent: '#4CAF50', text: '#1B5E20' },
  dark: { bg: '#121212', accent: '#FF3366', text: '#ffffff' },
};

/** Configurações de animação do Framer Motion */
const animationVariants: Record<string, any> = {
  'fade-in': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
  },
  rotate: {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    transition: { duration: 0.6 },
  },
  bounce: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

/**
 * Componente de Visualização Pública do Presente
 * 
 * Renderiza o presente publicado com animações, fotos, músicas e blocos.
 * Inclui galeria com transição automática e player de música flutuante.
 * 
 * @param {GiftViewProps} props - Propriedades do componente
 * @returns {JSX.Element} Elemento React
 */
export function GiftView({ gift }: GiftViewProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const theme = themeStyles[gift.theme] || themeStyles.elegance;
  const fontFamily = fontFamilies[gift.font] || fontFamilies['serif-luxe'];
  const animation = animationVariants[gift.animation] || animationVariants['fade-in'];
  
  const bgColor = gift.backgroundColor || theme.bg;
  const textColor = gift.textColor || theme.text;

  // Controle de reprodução de música
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Avanço automático da galeria de fotos
  useEffect(() => {
    if (gift.photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % gift.photos.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [gift.photos.length]);

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: bgColor, 
        color: textColor,
        fontFamily,
      }}
    >
      {gift.musics.length > 0 && (
        <audio ref={audioRef} src={gift.musics[0].url} loop />
      )}

      <motion.div
        {...animation}
        className="max-w-4xl mx-auto px-6 py-12 md:py-20"
      >
        <header className="text-center mb-12">
          {gift.recipientName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.2 }}
              className="text-lg mb-2"
            >
              Para
            </motion.p>
          )}
          {gift.recipientName && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: theme.accent }}
            >
              {gift.recipientName}
            </motion.h2>
          )}
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
          >
            {gift.title}
          </motion.h1>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="prose prose-lg max-w-none mb-16"
        >
          <p 
            className="text-center text-lg md:text-xl leading-relaxed whitespace-pre-wrap"
            style={{ color: textColor }}
          >
            {gift.message}
          </p>
        </motion.div>

        {gift.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-16"
          >
            <div 
              className="relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
              onClick={() => setShowFullGallery(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  src={gift.photos[currentPhotoIndex].url}
                  alt={gift.photos[currentPhotoIndex].caption || 'Foto'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {gift.photos[currentPhotoIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-center">
                    {gift.photos[currentPhotoIndex].caption}
                  </p>
                </div>
              )}
            </div>

            {gift.photos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {gift.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentPhotoIndex 
                        ? 'scale-125' 
                        : 'opacity-50 hover:opacity-75'
                    }`}
                    style={{ 
                      backgroundColor: index === currentPhotoIndex ? theme.accent : textColor 
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {gift.content?.blocks && gift.content.blocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-8 mb-16"
          >
            {gift.content.blocks.map((block) => (
              <BlockRender key={block.id} block={block} />
            ))}
          </motion.div>
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center pt-12 border-t"
          style={{ borderColor: `${textColor}20` }}
        >
          <p className="text-sm opacity-50 mb-4">
            Criado com ❤️ no Eternal Gift
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{ 
              backgroundColor: theme.accent, 
              color: '#ffffff' 
            }}
          >
            Criar meu presente
          </Link>
        </motion.footer>
      </motion.div>

      {gift.musics.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-3 px-6 py-3 rounded-full shadow-xl backdrop-blur-sm transition-all hover:scale-105"
            style={{ 
              backgroundColor: theme.accent,
              color: '#ffffff',
            }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{gift.musics[0].name}</p>
              {gift.musics[0].artist && (
                <p className="text-xs opacity-80">{gift.musics[0].artist}</p>
              )}
            </div>
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showFullGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowFullGallery(false)}
          >
            <button
              onClick={() => setShowFullGallery(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={gift.photos[currentPhotoIndex].url}
                alt={gift.photos[currentPhotoIndex].caption || ''}
                className="w-full max-h-[80vh] object-contain"
              />
              
              {gift.photos.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {gift.photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentPhotoIndex 
                          ? 'border-white' 
                          : 'border-transparent opacity-50 hover:opacity-75'
                      }`}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
