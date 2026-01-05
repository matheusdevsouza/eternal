'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PLAN_CONFIG } from '@/lib/plan-config';

const themes = [
  { id: 'elegance', name: 'Elegância', color: '#FF3366' },
  { id: 'romantic', name: 'Romântico', color: '#E91E63' },
  { id: 'vintage', name: 'Vintage', color: '#8D6E63' },
  { id: 'modern', name: 'Moderno', color: '#2196F3' },
  { id: 'nature', name: 'Natureza', color: '#4CAF50' },
  { id: 'dark', name: 'Escuro', color: '#212121' },
];

const fonts = [
  { id: 'serif-luxe', name: 'Serif Luxe', family: 'Georgia, serif' },
  { id: 'sans-clean', name: 'Sans Clean', family: 'Arial, sans-serif' },
  { id: 'handwriting', name: 'Escrita', family: 'cursive' },
  { id: 'monospace', name: 'Monospace', family: 'monospace' },
];

const animations = [
  { id: 'fade-in', name: 'Fade In', premium: false },
  { id: 'slide-up', name: 'Slide Up', premium: false },
  { id: 'zoom', name: 'Zoom', premium: true },
  { id: 'rotate', name: 'Rotação', premium: true },
  { id: 'bounce', name: 'Bounce', premium: true },
];

export default function NewGiftPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientName: '',
    theme: 'elegance',
    font: 'serif-luxe',
    animation: 'fade-in',
  });

  const planLimits = user?.plan ? PLAN_CONFIG[user.plan as keyof typeof PLAN_CONFIG]?.limits : null;
  const canUsePremiumAnimations = planLimits?.premiumAnimations || false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar presente');
        return;
      }

      router.push(`/dashboard/gifts/${data.gift.id}`);
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Criar Novo Presente</h1>
          <p className="text-[var(--text-secondary)]">
            Preencha as informações abaixo para criar seu presente digital
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] space-y-4">
            <h2 className="text-lg font-bold mb-4">Informações Básicas</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Título do Presente *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
                placeholder="Ex: Para meu amor"
              />
            </div>

            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium mb-2">
                Nome do Destinatário
              </label>
              <input
                id="recipientName"
                name="recipientName"
                type="text"
                value={formData.recipientName}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
                placeholder="Ex: Maria"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Mensagem *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                maxLength={10000}
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all resize-none"
                placeholder="Escreva sua mensagem especial aqui..."
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {formData.message.length}/10000 caracteres
              </p>
            </div>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h2 className="text-lg font-bold mb-4">Tema</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: theme.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.theme === theme.id
                      ? 'border-[var(--primary)]'
                      : 'border-transparent bg-[var(--bg-deep)]'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: theme.color }}
                  />
                  <p className="text-xs text-center">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h2 className="text-lg font-bold mb-4">Fonte</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fonts.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, font: font.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.font === font.id
                      ? 'border-[var(--primary)]'
                      : 'border-transparent bg-[var(--bg-deep)]'
                  }`}
                >
                  <p className="text-lg mb-1" style={{ fontFamily: font.family }}>Aa</p>
                  <p className="text-xs text-center">{font.name}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h2 className="text-lg font-bold mb-4">Animação</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {animations.map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  disabled={anim.premium && !canUsePremiumAnimations}
                  onClick={() => {
                    if (!anim.premium || canUsePremiumAnimations) {
                      setFormData({ ...formData, animation: anim.id });
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all relative ${
                    formData.animation === anim.id
                      ? 'border-[var(--primary)]'
                      : 'border-transparent bg-[var(--bg-deep)]'
                  } ${anim.premium && !canUsePremiumAnimations ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {anim.premium && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-yellow-500 text-black text-[8px] font-bold rounded">
                      PRO
                    </span>
                  )}
                  <p className="text-sm text-center">{anim.name}</p>
                </button>
              ))}
            </div>
            {!canUsePremiumAnimations && (
              <p className="text-xs text-[var(--text-secondary)] mt-3">
                * Animações premium disponíveis nos planos Premium e Eternal
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl font-medium hover:bg-[var(--bg-card-hover)] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Presente'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
