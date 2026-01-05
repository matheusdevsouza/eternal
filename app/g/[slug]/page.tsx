'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

interface Music {
  id: string;
  name: string;
  artist: string | null;
  url: string;
  duration: number | null;
}

interface Gift {
  id: string;
  slug: string;
  title: string;
  message: string;
  recipientName: string | null;
  theme: string;
  font: string;
  animation: string;
  backgroundColor: string | null;
  textColor: string | null;
  views: number;
  publishedAt: string | null;
  photos: Photo[];
  musics: Music[];
  creatorName: string | null;
  isPremium: boolean;
}

// Theme configurations
const themeStyles: Record<string, { bg: string; text: string; accent: string }> = {
  elegance: { bg: '#0F0507', text: '#FFF1F2', accent: '#FF3366' },
  romantic: { bg: '#1A0B0E', text: '#FFE4E6', accent: '#E91E63' },
  vintage: { bg: '#2D2420', text: '#F5E6D3', accent: '#8D6E63' },
  modern: { bg: '#0A1628', text: '#E2E8F0', accent: '#2196F3' },
  nature: { bg: '#0A1A0F', text: '#E8F5E9', accent: '#4CAF50' },
  dark: { bg: '#121212', text: '#FFFFFF', accent: '#9C27B0' },
};

// Font configurations
const fontStyles: Record<string, string> = {
  'serif-luxe': 'Georgia, serif',
  'sans-clean': 'Inter, Arial, sans-serif',
  'handwriting': 'Dancing Script, cursive',
  'monospace': 'JetBrains Mono, monospace',
};

export default function PublicGiftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchGift() {
      try {
        const response = await fetch(`/api/public/gifts/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Presente não encontrado');
          return;
        }

        setGift(data.gift);
      } catch (err) {
        setError('Erro ao carregar presente');
      } finally {
        setLoading(false);
      }
    }

    fetchGift();
  }, [slug]);

  const theme = gift ? themeStyles[gift.theme] || themeStyles.elegance : themeStyles.elegance;
  const fontFamily = gift ? fontStyles[gift.font] || fontStyles['serif-luxe'] : fontStyles['serif-luxe'];

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div 
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
        ></div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: '#0F0507', color: '#FFF1F2' }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold mb-2">Presente não encontrado</h1>
          <p className="text-[#FFF1F2]/60 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#FF3366] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % gift.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + gift.photos.length) % gift.photos.length);
  };

  return (
    <>
      <div 
        className="min-h-screen py-12 px-4"
        style={{ 
          backgroundColor: gift.backgroundColor || theme.bg,
          color: gift.textColor || theme.text,
          fontFamily,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {gift.recipientName && (
              <p className="text-sm uppercase tracking-widest opacity-60 mb-4">
                Para
              </p>
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {gift.recipientName || gift.title}
            </h1>
            {gift.recipientName && (
              <p className="text-xl opacity-80">{gift.title}</p>
            )}
          </motion.div>

          {gift.photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative mb-12"
            >
              <div className="aspect-square rounded-3xl overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={gift.photos[currentPhotoIndex].id}
                    src={gift.photos[currentPhotoIndex].url}
                    alt={gift.photos[currentPhotoIndex].caption || 'Foto'}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>

                {gift.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-all"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-all"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {gift.photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {gift.photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentPhotoIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {gift.photos[currentPhotoIndex].caption && (
                <p className="text-center mt-4 text-sm opacity-60">
                  {gift.photos[currentPhotoIndex].caption}
                </p>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div 
              className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap"
              style={{ lineHeight: '1.8' }}
            >
              {gift.message}
            </div>
          </motion.div>

          {gift.musics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-12 p-6 rounded-2xl"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <div>
                  <p className="font-medium">{gift.musics[0].name}</p>
                  {gift.musics[0].artist && (
                    <p className="text-sm opacity-60">{gift.musics[0].artist}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center pt-8 border-t"
            style={{ borderColor: `${theme.text}20` }}
          >
            <p className="text-sm opacity-40 mb-2">
              Criado com ❤️ usando
            </p>
            <Link
              href="/"
              className="inline-block font-bold hover:opacity-80 transition-all"
              style={{ color: theme.accent }}
            >
              Eternal Gift
            </Link>
            <p className="text-xs opacity-30 mt-4">
              {gift.views} visualização{gift.views !== 1 ? 'ões' : ''}
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
