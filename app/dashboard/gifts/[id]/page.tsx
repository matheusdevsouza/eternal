/**
 * @fileoverview Página de Edição de Presente
 * @description Editor completo de presente com abas para conteúdo, mídia, configurações e prévia.
 * Inclui gerenciamento de blocos, fotos, músicas e opções de design.
 * @module app/dashboard/gifts/[id]/page
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PLAN_CONFIG } from '@/lib/plan-config';
import { Icons } from '@/components/ui/Icons';
import { BlockEditor } from '@/components/builder/BlockEditor';
import { PhotoUploader } from '@/components/builder/PhotoUploader';
import { MusicManager } from '@/components/builder/MusicManager';
import { GiftPreview } from '@/components/builder/GiftPreview';
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
  duration?: number;
  order: number;
}

interface Gift {
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
  content?: GiftContent;
  published: boolean;
  publishedAt?: string;
  views: number;
  photos: Photo[];
  musics: Music[];
  qrCode?: {
    id: string;
    imageUrl: string;
  };
}

/** Configuração de temas disponíveis */
const themes = [
  { id: 'elegance', name: 'Elegance', color: '#FF3366', description: 'Classic & refined' },
  { id: 'romantic', name: 'Romantic', color: '#E91E63', description: 'Soft & loving' },
  { id: 'vintage', name: 'Vintage', color: '#8D6E63', description: 'Warm & nostalgic' },
  { id: 'modern', name: 'Modern', color: '#2196F3', description: 'Clean & bold' },
  { id: 'nature', name: 'Nature', color: '#4CAF50', description: 'Fresh & organic' },
  { id: 'dark', name: 'Dark', color: '#212121', description: 'Elegant & dramatic' },
];

/** Configuração de fontes disponíveis */
const fonts = [
  { id: 'serif-luxe', name: 'Serif Luxe', family: 'Georgia, serif', sample: 'Elegant' },
  { id: 'sans-clean', name: 'Sans Clean', family: 'Arial, sans-serif', sample: 'Modern' },
  { id: 'handwriting', name: 'Handwriting', family: 'cursive', sample: 'Personal' },
  { id: 'monospace', name: 'Monospace', family: 'monospace', sample: 'Unique' },
];

/** Configuração de animações disponíveis */
const animations = [
  { id: 'fade-in', name: 'Fade In', premium: false, description: 'Gentle reveal' },
  { id: 'slide-up', name: 'Slide Up', premium: false, description: 'Rising entrance' },
  { id: 'zoom', name: 'Zoom', premium: true, description: 'Dramatic focus' },
  { id: 'rotate', name: 'Rotate', premium: true, description: 'Playful spin' },
  { id: 'bounce', name: 'Bounce', premium: true, description: 'Energetic pop' },
];

type TabType = 'content' | 'media' | 'settings' | 'preview';

/** Props da página */
interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Página de Edição de Presente
 * 
 * Editor completo com abas para conteúdo, mídia, configurações e prévia.
 * Gerencia estado de formulário, salvamento e publicação.
 * 
 * @param {PageProps} props - Props da página
 * @returns {JSX.Element} Elemento React
 */
export default function EditGiftPage({ params }: PageProps) {
  const router = useRouter();
  const { user } = useUser();
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [giftId, setGiftId] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientName: '',
    theme: 'elegance',
    font: 'serif-luxe',
    animation: 'fade-in',
    backgroundColor: '',
    textColor: '',
  });

  const [blocks, setBlocks] = useState<Block[]>([]);

  const planLimits = user?.plan ? PLAN_CONFIG[user.plan as keyof typeof PLAN_CONFIG]?.limits : null;
  const canUsePremiumAnimations = planLimits?.premiumAnimations || false;

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      setGiftId(resolvedParams.id);
    }
    init();
  }, [params]);

  useEffect(() => {
    if (!giftId) return;

    async function fetchGift() {
      try {
        const response = await fetch(`/api/gifts/${giftId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load gift');
          return;
        }

        setGift(data.gift);
        setFormData({
          title: data.gift.title || '',
          message: data.gift.message || '',
          recipientName: data.gift.recipientName || '',
          theme: data.gift.theme || 'elegance',
          font: data.gift.font || 'serif-luxe',
          animation: data.gift.animation || 'fade-in',
          backgroundColor: data.gift.backgroundColor || '',
          textColor: data.gift.textColor || '',
        });

        if (data.gift.content?.blocks) {
          setBlocks(data.gift.content.blocks);
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    }

    fetchGift();
  }, [giftId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!gift) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const content: GiftContent = {
        blocks,
        settings: {
          theme: formData.theme,
          font: formData.font,
          animation: formData.animation,
          globalStyles: {
            backgroundColor: formData.backgroundColor,
            textColor: formData.textColor,
          },
        },
      };

      const response = await fetch(`/api/gifts/${gift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save');
        return;
      }

      setSuccess('Changes saved successfully!');
      setHasUnsavedChanges(false);
      setGift(prev => prev ? { ...prev, ...data.gift } : null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!gift) return;
    setPublishing(true);
    setError('');

    try {
      const method = gift.published ? 'DELETE' : 'POST';
      const response = await fetch(`/api/gifts/${gift.id}/publish`, { method });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to publish');
        return;
      }

      setGift(prev => prev ? { 
        ...prev, 
        published: !prev.published,
        publishedAt: data.gift.publishedAt,
        slug: data.gift.slug || prev.slug,
      } : null);

      setSuccess(gift.published ? 'Gift unpublished' : 'Gift is now live!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Connection error');
    } finally {
      setPublishing(false);
    }
  };

  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  }, []);

  const handlePhotosChange = useCallback((photos: Photo[]) => {
    setGift(prev => prev ? { ...prev, photos } : null);
  }, []);

  const handleMusicsChange = useCallback((musics: Music[]) => {
    setGift(prev => prev ? { ...prev, musics } : null);
  }, []);

  const tabs: { id: TabType; label: string; icon: keyof typeof Icons }[] = [
    { id: 'content', label: 'Content', icon: 'FileText' },
    { id: 'media', label: 'Media', icon: 'Camera' },
    { id: 'settings', label: 'Design', icon: 'Palette' },
    { id: 'preview', label: 'Preview', icon: 'Eye' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm animate-pulse">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <Icons.X className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold">Gift not found</h2>
        <p className="text-[var(--text-secondary)]">{error || 'This gift doesn\'t exist or you don\'t have permission to edit it.'}</p>
        <button
          onClick={() => router.push('/dashboard/gifts')}
          className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl"
        >
          Back to My Gifts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/gifts')}
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all"
          >
            <Icons.ChevronDown className="w-5 h-5 rotate-90" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{gift.title}</h1>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                gift.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {gift.published ? 'Published' : 'Draft'}
              </span>
              <span>•</span>
              <span>{gift.views} views</span>
              {hasUnsavedChanges && (
                <>
                  <span>•</span>
                  <span className="text-orange-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                    Unsaved changes
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {gift.published && (
            <a
              href={`/g/${gift.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-all"
            >
              <Icons.ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Live</span>
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icons.Check className="w-4 h-4" />
            )}
            <span>Save</span>
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`flex items-center gap-2 px-6 py-2 font-bold rounded-xl transition-all ${
              gift.published
                ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                : 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white hover:opacity-90 shadow-[0_4px_20px_rgba(255,51,102,0.25)]'
            }`}
          >
            {publishing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : gift.published ? (
              <Icons.EyeOff className="w-4 h-4" />
            ) : (
              <Icons.Sparkles className="w-4 h-4" />
            )}
            <span>{gift.published ? 'Unpublish' : 'Publish'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success-text)] px-4 py-3 rounded-xl"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-1">
        <div className="flex">
          {tabs.map((tab) => {
            const IconComponent = Icons[tab.icon];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all rounded-xl ${
                  activeTab === tab.id
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Icons.FileText className="w-5 h-5 text-[var(--primary)]" />
                Basic Information
              </h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title <span className="text-[var(--primary)]">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>

              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium mb-2">
                  Recipient Name
                </label>
                <input
                  id="recipientName"
                  name="recipientName"
                  type="text"
                  value={formData.recipientName}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message <span className="text-[var(--primary)]">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  maxLength={10000}
                  className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all resize-none"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1 text-right">
                  {formData.message.length}/10000
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icons.Plus className="w-5 h-5 text-[var(--primary)]" />
                Content Blocks
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Add extra content like images, videos, buttons, and more.
              </p>
              <BlockEditor blocks={blocks} onChange={handleBlocksChange} />
            </div>
          </motion.div>
        )}

        {activeTab === 'media' && (
          <motion.div
            key="media"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <PhotoUploader
                giftId={gift.id}
                photos={gift.photos}
                onChange={handlePhotosChange}
                maxPhotos={planLimits?.maxPhotosPerGift || 5}
              />
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <MusicManager
                giftId={gift.id}
                musics={gift.musics}
                onChange={handleMusicsChange}
                maxMusics={planLimits?.maxMusicPerGift || 0}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icons.Palette className="w-5 h-5 text-[var(--primary)]" />
                Theme
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, theme: theme.id });
                      setHasUnsavedChanges(true);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.theme === theme.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] bg-[var(--bg-deep)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg mb-3"
                      style={{ backgroundColor: theme.color }}
                    />
                    <p className="font-medium">{theme.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="text-lg font-bold mb-4">Typography</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, font: font.id });
                      setHasUnsavedChanges(true);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.font === font.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] bg-[var(--bg-deep)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <p className="text-2xl mb-2" style={{ fontFamily: font.family }}>Aa</p>
                    <p className="text-sm font-medium">{font.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{font.sample}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="text-lg font-bold mb-4">Entry Animation</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    type="button"
                    disabled={anim.premium && !canUsePremiumAnimations}
                    onClick={() => {
                      if (!anim.premium || canUsePremiumAnimations) {
                        setFormData({ ...formData, animation: anim.id });
                        setHasUnsavedChanges(true);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all relative ${
                      formData.animation === anim.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] bg-[var(--bg-deep)]'
                    } ${anim.premium && !canUsePremiumAnimations ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--primary)]/50'}`}
                  >
                    {anim.premium && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded">
                        PRO
                      </span>
                    )}
                    <p className="font-medium">{anim.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{anim.description}</p>
                  </button>
                ))}
              </div>
              {!canUsePremiumAnimations && (
                <p className="text-xs text-[var(--text-secondary)] mt-3">
                  Premium animations available on Premium and Eternal plans.{' '}
                  <a href="/dashboard/subscription" className="text-[var(--primary)] hover:underline">Upgrade now</a>
                </p>
              )}
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="text-lg font-bold mb-4">Custom Colors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={formData.backgroundColor || '#ffffff'}
                      onChange={(e) => {
                        setFormData({ ...formData, backgroundColor: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-14 h-14 rounded-lg border border-[var(--border)] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => {
                        setFormData({ ...formData, backgroundColor: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Leave empty for theme default"
                      className="flex-1 px-4 py-2 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={formData.textColor || '#000000'}
                      onChange={(e) => {
                        setFormData({ ...formData, textColor: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-14 h-14 rounded-lg border border-[var(--border)] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => {
                        setFormData({ ...formData, textColor: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Leave empty for theme default"
                      className="flex-1 px-4 py-2 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {gift.published && (
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Icons.Link className="w-5 h-5 text-[var(--primary)]" />
                  Public Link
                </h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/g/${gift.slug}`}
                    readOnly
                    className="flex-1 px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)]"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/g/${gift.slug}`);
                      setSuccess('Link copied to clipboard!');
                      setTimeout(() => setSuccess(''), 2000);
                    }}
                    className="px-4 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <Icons.Copy className="w-5 h-5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GiftPreview
              gift={{
                ...gift,
                ...formData,
                content: {
                  blocks,
                  settings: {
                    theme: formData.theme,
                    font: formData.font,
                    animation: formData.animation,
                    globalStyles: {
                      backgroundColor: formData.backgroundColor,
                      textColor: formData.textColor,
                    },
                  },
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
