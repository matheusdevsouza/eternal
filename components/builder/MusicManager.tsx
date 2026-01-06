/**
 * @fileoverview Componente de Gerenciamento de Músicas
 * @description Gerencia adição, listagem e remoção de músicas de fundo para presentes.
 * Inclui recurso premium gating e player de prévia.
 * @module components/builder/MusicManager
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';

/** Interface para dados de música */
interface Music {
  id: string;
  name: string;
  artist?: string;
  url: string;
  duration?: number;
  order: number;
}

/** Props do componente MusicManager */
interface MusicManagerProps {
  /** ID do presente */
  giftId: string;
  /** Lista de músicas atuais */
  musics: Music[];
  /** Callback para atualizar lista de músicas */
  onChange: (musics: Music[]) => void;
  /** Limite máximo de músicas (-1 = ilimitado, 0 = não disponível) */
  maxMusics: number;
}

/**
 * Componente de Gerenciamento de Músicas
 * 
 * Gerencia adição, prévia e remoção de músicas de fundo para o presente.
 * Inclui validação de recursos premium e controle de limites do plano.
 * 
 * @param {MusicManagerProps} props - Propriedades do componente
 * @returns {JSX.Element} Elemento React
 */
export function MusicManager({ giftId, musics, onChange, maxMusics }: MusicManagerProps) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    url: '',
  });

  const isFeatureAvailable = maxMusics !== 0;
  const isAtLimit = maxMusics !== -1 && musics.length >= maxMusics;

  /** Adiciona uma nova música via API */
  const addMusic = async () => {
    if (!formData.url.trim() || !formData.name.trim()) {
      setError('Please enter a name and URL');
      return;
    }

    if (!formData.url.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }

    setAdding(true);
    setError('');

    try {
      const response = await fetch(`/api/gifts/${giftId}/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add music');
        return;
      }

      onChange([...musics, data.music]);
      setFormData({ name: '', artist: '', url: '' });
      setShowAddForm(false);
    } catch (err) {
      setError('Connection error');
    } finally {
      setAdding(false);
    }
  };

  /** Remove uma música via API */
  const deleteMusic = async (musicId: string) => {
    try {
      const response = await fetch(`/api/gifts/${giftId}/music?musicId=${musicId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onChange(musics.filter(m => m.id !== musicId));
        if (playingId === musicId) setPlayingId(null);
      }
    } catch (err) {
      setError('Failed to delete music');
    }
  };

  /** Alterna reprodução de prévia de música */
  const togglePlay = (musicId: string) => {
    setPlayingId(playingId === musicId ? null : musicId);
  };

  // Renderiza tela de upgrade se recurso não disponível para o plano
  if (!isFeatureAvailable) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icons.Music className="w-5 h-5 text-[var(--text-secondary)]" />
              Background Music
            </h3>
          </div>
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full">
            PREMIUM
          </span>
        </div>

        <div className="text-center py-8 bg-gradient-to-br from-[var(--bg-deep)] to-[var(--primary)]/5 rounded-2xl border border-[var(--border)]">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
            <Icons.Music className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h4 className="font-bold text-lg mb-2">Add Music to Your Gift</h4>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-4">
            Make your gift even more special with background music. Available on Premium and Eternal plans.
          </p>
          <a 
            href="/dashboard/subscription" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(255,51,102,0.25)]"
          >
            <Icons.Crown className="w-5 h-5" />
            Upgrade Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Icons.Music className="w-5 h-5 text-[var(--primary)]" />
            Background Music
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Add music that plays when viewing your gift
          </p>
        </div>
        <span className="text-sm font-medium">
          {musics.length}/{maxMusics === -1 ? '∞' : maxMusics}
        </span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] px-4 py-2 rounded-xl text-sm flex items-center gap-2"
          >
            <Icons.AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError('')} className="ml-auto hover:opacity-70">
              <Icons.X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {musics.length > 0 && (
        <div className="space-y-3">
          {musics.map((music, index) => (
            <motion.div
              key={music.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-4 bg-[var(--bg-deep)] rounded-xl border border-[var(--border)] group hover:border-[var(--primary)]/30 transition-all"
            >
              <button
                onClick={() => togglePlay(music.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  playingId === music.id 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:text-white'
                }`}
              >
                {playingId === music.id ? (
                  <Icons.Pause className="w-5 h-5" />
                ) : (
                  <Icons.Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--text)] truncate">{music.name}</p>
                {music.artist && (
                  <p className="text-sm text-[var(--text-secondary)] truncate">{music.artist}</p>
                )}
              </div>

              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-1 rounded-full">
                #{index + 1}
              </span>

              <button
                onClick={() => deleteMusic(music.id)}
                className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Remove music"
              >
                <Icons.Trash className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {!isAtLimit ? (
        <div className="space-y-4">
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-2xl text-[var(--text-secondary)] hover:border-[var(--primary)]/50 hover:text-[var(--text)] transition-all flex items-center justify-center gap-2"
            >
              <Icons.Plus className="w-5 h-5" />
              Add Music
            </button>
          )}

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-[var(--bg-deep)] rounded-2xl border border-[var(--border)] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Song Name <span className="text-[var(--primary)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Our Song"
                        className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Artist <span className="text-[var(--text-muted)]">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.artist}
                        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                        placeholder="e.g., Ed Sheeran"
                        className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Audio URL <span className="text-[var(--primary)]">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com/song.mp3"
                      className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Use a direct link to an MP3 or audio file (HTTPS only)
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({ name: '', artist: '', url: '' });
                      }}
                      className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-card-hover)] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addMusic}
                      disabled={adding}
                      className="flex-1 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {adding ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Icons.Music className="w-4 h-4" />
                          Add Music
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Limite atingido */
        <div className="text-center py-6 bg-[var(--bg-deep)] rounded-2xl border border-[var(--border)]">
          <p className="text-[var(--text-secondary)]">
            You've reached the music limit for your plan.
          </p>
          <a href="/dashboard/subscription" className="text-[var(--primary)] text-sm hover:underline">
            Upgrade for more
          </a>
        </div>
      )}
    </div>
  );
}
