'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';

export default function NewGiftPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    recipientName: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a title for your gift');
      return;
    }

    if (!formData.message.trim()) {
      setError('Please write a message for your gift');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          theme: 'elegance',
          font: 'serif-luxe',
          animation: 'fade-in',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create gift');
        return;
      }

      router.push(`/dashboard/gifts/${data.gift.id}`);
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
            <Icons.Gift className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create a New Gift</h1>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Start by giving your gift a name and a heartfelt message. You can customize everything else in the editor.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <Icons.AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Gift Title <span className="text-[var(--primary)]">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., For My Love, Happy Birthday Mom..."
                maxLength={100}
                className="w-full px-4 py-4 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all text-lg"
              />
            </div>

            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium mb-2">
                Recipient Name <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <input
                id="recipientName"
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="Who is this gift for?"
                maxLength={100}
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Your Message <span className="text-[var(--primary)]">*</span>
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write something heartfelt and meaningful..."
                rows={6}
                maxLength={10000}
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all resize-none"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-2 flex justify-between">
                <span>You can add photos, music, and more in the editor</span>
                <span>{formData.message.length}/10000</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl font-medium hover:bg-[var(--bg-card-hover)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,51,102,0.25)]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Icons.Sparkles className="w-5 h-5" />
                  Create Gift & Open Editor
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)]">
          After creating, you'll be taken to the full editor where you can add photos, music, choose themes, and preview your gift.
        </p>
      </motion.div>
    </div>
  );
}
