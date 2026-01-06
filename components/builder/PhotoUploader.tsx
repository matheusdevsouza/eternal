/**
 * @fileoverview Componente de Upload de Fotos
 * @description Gerencia upload de fotos via URL com zona drag & drop e controle de limites do plano.
 * @module components/builder/PhotoUploader
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';

/** Interface para dados de foto */
interface Photo {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

/** Props do componente PhotoUploader */
interface PhotoUploaderProps {
  /** ID do presente */
  giftId: string;
  /** Lista de fotos atuais */
  photos: Photo[];
  /** Callback para atualizar lista de fotos */
  onChange: (photos: Photo[]) => void;
  /** Limite máximo de fotos (-1 = ilimitado) */
  maxPhotos: number;
}

/**
 * Componente de Upload de Fotos
 * 
 * Gerencia adição de fotos via URL com zona drag & drop,
 * barra de progresso de limite e controle de acesso.
 * 
 * @param {PhotoUploaderProps} props - Propriedades do componente
 * @returns {JSX.Element} Elemento React
 */
export function PhotoUploader({ giftId, photos, onChange, maxPhotos }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAtLimit = maxPhotos !== -1 && photos.length >= maxPhotos;
  const limitPercentage = maxPhotos === -1 ? 0 : (photos.length / maxPhotos) * 100;

  /** Adiciona foto via URL */
  const addPhotoFromUrl = async () => {
    if (!newPhotoUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    if (!newPhotoUrl.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await fetch(`/api/gifts/${giftId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newPhotoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add photo');
        return;
      }

      onChange([...photos, data.photo]);
      setNewPhotoUrl('');
      setShowUrlInput(false);
    } catch (err) {
      setError('Connection error');
    } finally {
      setUploading(false);
    }
  };

  /** Remove foto via API */
  const deletePhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/gifts/${giftId}/photos?photoId=${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onChange(photos.filter(p => p.id !== photoId));
      }
    } catch (err) {
      setError('Failed to delete photo');
    }
  };

  /** Handler para evento drag over */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  /** Handler para evento drag leave */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  /** Handler para evento drop */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // For now, we only support URL-based uploads
    // File upload would require additional backend/storage setup
    setShowUrlInput(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Icons.Camera className="w-5 h-5 text-[var(--primary)]" />
            Photos
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Add photos to make your gift more personal
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium">
            {photos.length}/{maxPhotos === -1 ? '∞' : maxPhotos}
          </span>
          {maxPhotos !== -1 && (
            <div className="w-20 h-2 bg-[var(--bg-deep)] rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  limitPercentage >= 100 ? 'bg-red-500' : limitPercentage >= 80 ? 'bg-yellow-500' : 'bg-[var(--primary)]'
                }`}
                style={{ width: `${Math.min(limitPercentage, 100)}%` }}
              />
            </div>
          )}
        </div>
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

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <motion.div 
              key={photo.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group aspect-square rounded-xl overflow-hidden border border-[var(--border)]"
            >
              <img
                src={photo.url}
                alt={photo.caption || `Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end">
                  <span className="text-white text-xs font-medium">{index + 1}</span>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete photo"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isAtLimit ? (
        <div className="space-y-4">
          <div
            onClick={() => setShowUrlInput(true)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver 
                ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                dragOver ? 'bg-[var(--primary)]/20' : 'bg-[var(--bg-deep)]'
              }`}>
                <Icons.Image className={`w-8 h-8 ${dragOver ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} />
              </div>
              <div>
                <p className="font-medium text-[var(--text)]">
                  Click to add photos
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  or paste an image URL
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showUrlInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                    className="flex-1 px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && addPhotoFromUrl()}
                  />
                  <button
                    onClick={addPhotoFromUrl}
                    disabled={uploading}
                    className="px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icons.Plus className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUrlInput(false);
                      setNewPhotoUrl('');
                    }}
                    className="px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-card-hover)] transition-all"
                  >
                    <Icons.X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  Paste the full URL of an image hosted online (HTTPS only). Supported: JPG, PNG, WebP, GIF.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Limit Reached */
        <div className="text-center py-6 bg-[var(--bg-deep)] rounded-2xl border border-[var(--border)]">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
            <Icons.AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="font-medium text-[var(--text)] mb-1">Photo limit reached</p>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Your plan allows up to {maxPhotos} photos per gift.
          </p>
          <a 
            href="/dashboard/subscription" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-medium rounded-xl hover:opacity-90 transition-all"
          >
            <Icons.Crown className="w-4 h-4" />
            Upgrade for more
          </a>
        </div>
      )}
    </div>
  );
}
