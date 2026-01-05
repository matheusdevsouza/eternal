'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PLAN_CONFIG } from '@/lib/plan-config';

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
  published: boolean;
  views: number;
  photos: Photo[];
  musics: Music[];
}

export default function EditGiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientName: '',
    theme: 'elegance',
    font: 'serif-luxe',
    animation: 'fade-in',
  });

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const planLimits = user?.plan ? PLAN_CONFIG[user.plan as keyof typeof PLAN_CONFIG]?.limits : null;

  useEffect(() => {
    async function fetchGift() {
      try {
        const response = await fetch(`/api/gifts/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Presente não encontrado');
          return;
        }

        setGift(data.gift);
        setFormData({
          title: data.gift.title,
          message: data.gift.message,
          recipientName: data.gift.recipientName || '',
          theme: data.gift.theme,
          font: data.gift.font,
          animation: data.gift.animation,
        });
      } catch (err) {
        setError('Erro ao carregar presente');
      } finally {
        setLoading(false);
      }
    }

    fetchGift();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/gifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao salvar');
        return;
      }

      setGift(data.gift);
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError('');

    try {
      const endpoint = gift?.published ? 'DELETE' : 'POST';
      const response = await fetch(`/api/gifts/${id}/publish`, { method: endpoint });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao publicar');
        return;
      }

      setGift({ ...gift!, published: data.gift.published });
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setPublishing(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhotoUrl) return;

    try {
      const response = await fetch(`/api/gifts/${id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newPhotoUrl, caption: newPhotoCaption }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao adicionar foto');
        return;
      }

      setGift({
        ...gift!,
        photos: [...gift!.photos, data.photo],
      });
      setNewPhotoUrl('');
      setNewPhotoCaption('');
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const handleDeletePhoto = async () => {
    if (!deletePhotoId) return;
    setDeletingPhoto(true);

    try {
      const response = await fetch(`/api/gifts/${id}/photos?photoId=${deletePhotoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGift({
          ...gift!,
          photos: gift!.photos.filter(p => p.id !== deletePhotoId),
        });
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
    } finally {
      setDeletingPhoto(false);
      setDeletePhotoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !gift) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/dashboard/gifts" className="text-[var(--primary)] hover:underline">
          Voltar para lista
        </Link>
      </div>
    );
  }

  if (!gift) return null;

  const photosRemaining = planLimits ? 
    (planLimits.maxPhotosPerGift === -1 ? -1 : planLimits.maxPhotosPerGift - gift.photos.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{gift.title}</h1>
          <p className="text-[var(--text-secondary)]">
            {gift.published ? (
              <span className="text-green-400">Publicado</span>
            ) : (
              <span className="text-yellow-400">Rascunho</span>
            )}
            {' • '}{gift.views} visualizações
          </p>
        </div>
        <div className="flex gap-3">
          {gift.published && (
            <Link
              href={`/g/${gift.slug}`}
              target="_blank"
              className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl font-medium hover:bg-[var(--bg-card-hover)] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver
            </Link>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              gift.published
                ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {publishing ? '...' : gift.published ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex gap-2 border-b border-[var(--border)]">
        {['details', 'photos', 'music'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition-all border-b-2 -mb-[2px] ${
              activeTab === tab
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            {tab === 'details' ? 'Detalhes' : tab === 'photos' ? `Fotos (${gift.photos.length})` : `Músicas (${gift.musics.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Destinatário</label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mensagem</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </motion.div>
      )}

      {activeTab === 'photos' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h3 className="font-bold mb-4">Adicionar Foto</h3>
            {photosRemaining !== 0 ? (
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="URL da imagem"
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)]"
                  />
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Legenda (opcional)"
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <button
                  onClick={handleAddPhoto}
                  className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all self-end"
                >
                  Adicionar
                </button>
              </div>
            ) : (
              <p className="text-[var(--text-secondary)]">
                Limite de fotos atingido. <Link href="/dashboard/subscription" className="text-[var(--primary)]">Faça upgrade</Link> para adicionar mais.
              </p>
            )}
            {photosRemaining > 0 && (
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                {photosRemaining} foto(s) restante(s) no seu plano
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gift.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto'}
                  className="w-full aspect-square object-cover rounded-xl"
                />
                <button
                  onClick={() => setDeletePhotoId(photo.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
                {photo.caption && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'music' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]"
        >
          {planLimits?.maxMusicPerGift === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)] mb-4">
                Músicas não estão disponíveis no plano Start.
              </p>
              <Link
                href="/dashboard/subscription"
                className="inline-block px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
              >
                Fazer Upgrade
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <p>Funcionalidade de música em desenvolvimento.</p>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {deletePhotoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeletePhotoId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  Remover Foto?
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Tem certeza que deseja remover esta foto? Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setDeletePhotoId(null)}
                  disabled={deletingPhoto}
                  className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] transition-all font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeletePhoto}
                  disabled={deletingPhoto}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-50"
                >
                  {deletingPhoto ? 'Removendo...' : 'Sim, Remover'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
