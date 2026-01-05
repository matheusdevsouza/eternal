'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PLAN_CONFIG } from '@/lib/plan-config';
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

interface DashboardStats {
  totalGifts: number;
  publishedGifts: number;
  draftGifts: number;
  totalViews: number;
  recentGifts: Gift[];
}

export default function DashboardPage() {
  const { user, subscription } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/gifts?limit=5');
        const data = await response.json();
        
        if (data.success) {
          const gifts = data.data as Gift[];
          setStats({
            totalGifts: data.pagination.total,
            publishedGifts: gifts.filter(g => g.published).length,
            draftGifts: gifts.filter(g => !g.published).length,
            totalViews: gifts.reduce((sum, g) => sum + g.views, 0),
            recentGifts: gifts,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { 
      label: 'Total Gifts', 
      value: stats?.totalGifts || 0, 
      icon: Icons.Gift,
      description: 'Created so far',
    },
    { 
      label: 'Published', 
      value: stats?.publishedGifts || 0, 
      icon: Icons.Sparkles,
      description: 'Live online',
    },
    { 
      label: 'Drafts', 
      value: stats?.draftGifts || 0, 
      icon: Icons.FileText,
      description: 'In progress',
    },
    { 
      label: 'Views', 
      value: stats?.totalViews || 0, 
      icon: Icons.Eye,
      description: 'Total visits',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--text-secondary)] text-sm animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden bg-[var(--bg-card)] rounded-3xl p-8 sm:p-10 border border-[var(--border)] shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--accent)]/5 pointer-events-none" />
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-300 group-hover:scale-110">
            <Icons.Sparkles className="w-64 h-64 text-[var(--primary)] translate-x-12 -translate-y-12 rotate-12" />
        </div>

        <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--text)] to-[var(--text-secondary)]">
                    Hello, {user?.name?.split(' ')[0] || 'Creator'}
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-xl">
                    Welcome to your digital sanctuary. You have <strong className="text-[var(--text)]">{stats?.draftGifts || 0} drafts</strong> waiting for you.
                    </p>
                </div>
                <div className="flex gap-3">
                     <Link
                        href="/dashboard/gifts/new"
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(255,51,102,0.25)] hover:shadow-[0_4px_25px_rgba(255,51,102,0.35)] hover:scale-105 active:scale-95"
                    >
                        <Icons.Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Create Gift</span>
                    </Link>
                </div>
            </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none transition-transform duration-300 group-hover:scale-125">
              <stat.icon className="w-24 h-24 text-[var(--primary)]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center transition-colors">
                    <stat.icon className="w-6 h-6" />
                  </div>
              </div>
              
              <div>
                  <p className="text-3xl font-bold text-[var(--text)] tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                       <p className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</p>
                       <span className="text-xs text-[var(--text-light)]">• {stat.description}</span>
                  </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
            <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    <Icons.LayoutDashboard className="w-5 h-5 text-[var(--primary)]" />
                    Recent Gifts
                 </h2>
                 <Link href="/dashboard/gifts" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1 group">
                    View All
                    <Icons.ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                 </Link>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                 {stats?.recentGifts && stats.recentGifts.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                        {stats.recentGifts.map((gift) => (
                            <div 
                                key={gift.id}
                                className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-4 group"
                            >
                                <div className="w-16 h-16 rounded-lg bg-[var(--bg-deep)] flex-shrink-0 relative overflow-hidden border border-[var(--border)]">
                                    {gift.coverPhoto ? (
                                        <img src={gift.coverPhoto} alt={gift.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-[var(--text-light)]">
                                            <Icons.Gift className="w-6 h-6 opacity-50" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)] transition-colors">
                                        {gift.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-1">
                                        <span className="flex items-center gap-1">
                                            <Icons.Camera className="w-3 h-3" /> {gift.photosCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icons.Music className="w-3 h-3" /> {gift.musicsCount}
                                        </span>
                                        <span className="truncate">
                                            Edited on {new Date(gift.updatedAt).toLocaleDateString('en-US')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <div className="text-right hidden sm:block">
                                        <div className="text-sm font-bold text-[var(--text)]">{gift.views}</div>
                                        <div className="text-xs text-[var(--text-secondary)]">Views</div>
                                     </div>
                                     <Link
                                        href={`/dashboard/gifts/${gift.id}`}
                                        className="p-2 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
                                        title="Edit Gift"
                                     >
                                         <Icons.Settings className="w-4 h-4" />
                                     </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="py-12 px-6 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-deep)] flex items-center justify-center mb-4 text-[var(--text-secondary)]">
                             <Icons.Gift className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text)] mb-2">No gifts yet</h3>
                        <p className="text-[var(--text-secondary)] max-w-xs mx-auto mb-6">
                            Start creating your eternal memory today. Takes less than 5 minutes.
                        </p>
                        <Link
                            href="/dashboard/gifts/new"
                            className="px-6 py-2 bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] font-medium rounded-lg transition-all"
                        >
                            Create First Gift
                        </Link>
                    </div>
                 )}
            </div>
        </motion.div>
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="space-y-6"
        >
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Icons.CreditCard className="w-5 h-5 text-[var(--primary)]" />
                Plan Status
            </h2>
            
            <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-deep)] rounded-2xl border border-[var(--border)] p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform duration-300 group-hover:scale-110">
                     <Icons.CreditCard className="w-32 h-32 -rotate-12 translate-x-12 -translate-y-6" />
                </div>
                
                <div className="relative z-10">
                     <span className="inline-block px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-xs rounded-full mb-4 border border-[var(--primary)]/20">
                         {PLAN_CONFIG[user?.plan as keyof typeof PLAN_CONFIG]?.displayName || 'FREE'}
                     </span>
                     
                     <div className="mb-6">
                        <p className="text-sm text-[var(--text-secondary)] mb-1">Current Plan</p>
                        <p className="text-2xl font-bold text-[var(--text)] capitalize">
                            {subscription?.status === 'ACTIVE' ? 'Active' : (subscription?.status || 'Inactive')}
                        </p>
                     </div>

                     <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <Icons.Check className="w-4 h-4 text-green-500" />
                            <span>Unlimited Pages</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <Icons.Check className="w-4 h-4 text-green-500" />
                            <span>HD Photo Support</span>
                        </li>
                         <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <Icons.Check className="w-4 h-4 text-[var(--text-muted)]" />
                            <span>Priority Support</span>
                        </li>
                     </ul>

                     <Link
                        href="/dashboard/subscription"
                        className="block w-full py-3 text-center bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] font-semibold rounded-xl transition-all"
                     >
                        Manage Subscription
                     </Link>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
