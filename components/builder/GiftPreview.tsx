/**
 * @fileoverview Componente de Preview de Presente
 * @description Renderiza uma prévia visual de como o presente ficará quando publicado.
 * Inclui alternância entre visualização desktop/mobile e prévia de música.
 * @module components/builder/GiftPreview
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';
import { BlockRender } from './BlockRender';
import { Block, GiftContent } from '@/types/builder';

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
}

interface GiftPreviewData {
  title: string;
  message: string;
  recipientName?: string;
  theme: string;
  font: string;
  animation: string;
  backgroundColor?: string;
  textColor?: string;
  content?: GiftContent;
  photos: Photo[];
  musics: Music[];
}

/** Props do componente GiftPreview */
interface GiftPreviewProps {
  /** Dados do presente para renderização */
  gift: GiftPreviewData;
}

/** Mapeamento de IDs de fonte para valores CSS */
const fontFamilies: Record<string, string> = {
  'serif-luxe': 'Georgia, serif',
  'sans-clean': 'Arial, sans-serif',
  'handwriting': 'cursive',
  'monospace': 'monospace',
};

/** Paleta de cores para cada tema disponível */
const themeColors: Record<string, { bg: string; accent: string }> = {
  elegance: { bg: '#FFF5F7', accent: '#FF3366' },
  romantic: { bg: '#FCE4EC', accent: '#E91E63' },
  vintage: { bg: '#EFEBE9', accent: '#8D6E63' },
  modern: { bg: '#E3F2FD', accent: '#2196F3' },
  nature: { bg: '#E8F5E9', accent: '#4CAF50' },
  dark: { bg: '#212121', accent: '#FF3366' },
};

/**
 * Componente de Preview de Presente
 * 
 * Renderiza uma prévia visual de como o presente ficará quando publicado,
 * incluindo alternância entre modos desktop e mobile.
 * 
 * @param {GiftPreviewProps} props - Propriedades do componente
 * @returns {JSX.Element} Elemento React
 */
export function GiftPreview({ gift }: GiftPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [playingMusic, setPlayingMusic] = useState(false);

  const theme = themeColors[gift.theme] || themeColors.elegance;
  const fontFamily = fontFamilies[gift.font] || fontFamilies['serif-luxe'];
  const bgColor = gift.backgroundColor || theme.bg;
  const textColor = gift.textColor || (gift.theme === 'dark' ? '#ffffff' : '#1a1a1a');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'desktop' 
                ? 'bg-[var(--primary)] text-white' 
                : 'bg-[var(--bg-deep)] text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            <Icons.Monitor className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'mobile' 
                ? 'bg-[var(--primary)] text-white' 
                : 'bg-[var(--bg-deep)] text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            <Icons.Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Mobile</span>
          </button>
        </div>
        <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live Preview
        </span>
      </div>

      <div 
        className={`mx-auto bg-[var(--bg-deep)] rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-300 ${
          viewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 mx-4">
            <div className="px-3 py-1.5 bg-[var(--bg-deep)] rounded-lg text-xs text-[var(--text-secondary)] text-center truncate flex items-center justify-center gap-2">
              <Icons.Lock className="w-3 h-3" />
              eternalgift.com/g/your-gift
            </div>
          </div>
        </div>

        <div 
          className="min-h-[600px] overflow-y-auto"
          style={{ 
            backgroundColor: bgColor,
            color: textColor,
            fontFamily,
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 md:p-12 max-w-3xl mx-auto"
          >
            {gift.recipientName && (
              <div className="text-center mb-8">
                <p className="opacity-60 mb-1">For</p>
                <h2 
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: theme.accent }}
                >
                  {gift.recipientName}
                </h2>
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">
              {gift.title || 'Your Title Here'}
            </h1>

            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-center whitespace-pre-wrap leading-relaxed">
                {gift.message || 'Your heartfelt message will appear here...'}
              </p>
            </div>

            {gift.photos.length > 0 && (
              <div className="mb-12">
                <div className={`grid gap-4 ${
                  gift.photos.length === 1 
                    ? 'grid-cols-1' 
                    : gift.photos.length === 2 
                    ? 'grid-cols-2' 
                    : 'grid-cols-2 md:grid-cols-3'
                }`}>
                  {gift.photos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="aspect-square rounded-xl overflow-hidden shadow-lg"
                    >
                      <img 
                        src={photo.url} 
                        alt={photo.caption || ''} 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {gift.content?.blocks && gift.content.blocks.length > 0 && (
              <div className="space-y-6 mb-12">
                {gift.content.blocks.map((block) => (
                  <BlockRender key={block.id} block={block} preview />
                ))}
              </div>
            )}

            {gift.musics.length > 0 && (
              <div 
                className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-xl"
                style={{ backgroundColor: theme.accent }}
              >
                <button 
                  onClick={() => setPlayingMusic(!playingMusic)}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {playingMusic ? (
                    <Icons.Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Icons.Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                <div className="text-white">
                  <p className="text-sm font-medium">{gift.musics[0].name}</p>
                  {gift.musics[0].artist && (
                    <p className="text-xs opacity-80">{gift.musics[0].artist}</p>
                  )}
                </div>
              </div>
            )}

            <div className="text-center pt-12 opacity-50 text-sm">
              Made with ❤️ on Eternal Gift
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
