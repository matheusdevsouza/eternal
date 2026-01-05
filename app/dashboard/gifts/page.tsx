'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';

interface Gift {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  views: number;
  coverPhoto: string | null;
  photosCount: number;
  musicsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function GiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGifts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        status: filter,
      });
      if (search) params.set('search', search);

      const response = await fetch(`/api/gifts?${params}`);
      const data = await response.json();

      if (data.success) {
        setGifts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGifts();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/gifts/${deleteModal.id}`, { method: 'DELETE' });
      if (response.ok) {
        setGifts(gifts.filter(g => g.id !== deleteModal.id));
      }
    } catch (error) {
      console.error('Error deleting gift:', error);
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Gifts</h1>
          <p className="text-[var(--text-secondary)]">
            Manage all your digital gifts
          </p>
        </div>
        <Link
          href="/dashboard/gifts/new"
          className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Gift
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gifts..."
              className="w-full px-4 py-3 pl-12 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
        <div className="flex gap-2">
          {['all', 'published', 'draft'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === f
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'published' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : gifts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gifts.map((gift, index) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden group"
            >
              <div className="aspect-video bg-[var(--bg-deep)] relative overflow-hidden">
                {gift.coverPhoto ? (
                  <img
                    src={gift.coverPhoto}
                    alt={gift.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                    <Icons.Gift className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    gift.published
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-black'
                  }`}>
                    {gift.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{gift.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  {gift.photosCount} photos • {gift.views} views
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/gifts/${gift.id}`}
                    className="flex-1 px-3 py-2 bg-[var(--bg-card-hover)] rounded-lg text-center text-sm font-medium hover:bg-[var(--primary)]/10 transition-colors"
                  >
                    Edit
                  </Link>
                  {gift.published && (
                    <Link
                      href={`/g/${gift.slug}`}
                      target="_blank"
                      className="px-3 py-2 bg-[var(--bg-card-hover)] rounded-lg text-sm font-medium hover:bg-[var(--primary)]/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  )}
                  <button
                    onClick={() => setDeleteModal({ id: gift.id, title: gift.title })}
                    className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-deep)] flex items-center justify-center text-[var(--text-secondary)]">
            <Icons.Gift className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">No gifts found</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Start by creating your first digital gift!
          </p>
          <Link
            href="/dashboard/gifts/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Gift
          </Link>
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchGifts(page)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                page === pagination.page
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteModal(null)}
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
                  Delete Gift?
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
                </p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
