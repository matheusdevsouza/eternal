'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from '@/components/ui/Icons';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Página de Configurações
 * 
 * Interface principal para gerenciamento de conta, segurança e assinatura.
 */

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, refreshUser, effectivePlan } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Redirecionar se não autenticado
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Atualizar dados de perfil quando o usuário mudar
  
  useEffect(() => {
    if (user?.name) {
      setProfileData({ name: user.name });
    }
  }, [user]);

  const handleProfileSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save');
        return;
      }

      setSuccess('Profile updated successfully!');
      await refreshUser();
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }

      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete account');
        return;
      }

      // Redirecionar para a página inicial após exclusão
      window.location.href = '/';
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: Icons.User },
    { id: 'security', label: 'Security', icon: Icons.Lock },
    { id: 'subscription', label: 'Subscription', icon: Icons.Crown },
    { id: 'danger', label: 'Danger Zone', icon: Icons.AlertCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)]">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-[var(--text-secondary)]">Manage your account and preferences</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Barra Lateral */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-deep)] hover:text-[var(--text)]'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Conteúdo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 lg:p-8">
                {/* Mensagens de Erro/Sucesso */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[var(--error-text)]"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-[var(--success-bg)] border border-[var(--success-border)] rounded-xl text-[var(--success-text)]"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Aba da Conta */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">Account Information</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] cursor-not-allowed"
                      />
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Email cannot be changed</p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[var(--bg-deep)] rounded-xl">
                      <div className={`w-3 h-3 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm">
                        {user.emailVerified ? 'Email verified' : 'Email not verified'}
                      </span>
                    </div>

                    <button
                      onClick={handleProfileSave}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}

                {/* Aba de Segurança */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">Change Password</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                      className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                )}

                {/* Aba de Assinatura */}
                {activeTab === 'subscription' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">Subscription</h2>
                    
                    {effectivePlan?.isActive ? (
                      <div className="p-6 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary-dark)]/10 border border-[var(--primary)]/30 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Icons.Crown className="w-8 h-8 text-[var(--primary)]" />
                          <div>
                            <h3 className="text-lg font-bold">Plan: {effectivePlan.displayName}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">Active subscription</p>
                          </div>
                        </div>
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center gap-2 text-[var(--primary)] font-medium hover:underline"
                        >
                          Go to Dashboard
                          <Icons.ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                        </Link>
                      </div>
                    ) : (
                      <div className="p-6 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Icons.Sparkles className="w-8 h-8 text-[var(--warning-icon)]" />
                          <div>
                            <h3 className="text-lg font-bold text-[var(--warning-text)]">No Active Plan</h3>
                            <p className="text-sm text-[var(--warning-text)]/80">Subscribe to unlock all features</p>
                          </div>
                        </div>
                        <p className="text-[var(--text-secondary)] mb-4">
                          Choose a plan to start creating beautiful digital gifts for your loved ones.
                        </p>
                        <Link
                          href="/pricing"
                          className="inline-block px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
                        >
                          View Plans
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                  {/* Zona de Perigo */}
                {activeTab === 'danger' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h2>
                    
                    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <h3 className="text-lg font-bold text-red-500 mb-2">Delete Account</h3>
                      <p className="text-[var(--text-secondary)] mb-4">
                        Once you delete your account, there is no going back. All your data, gifts, and settings will be permanently removed.
                      </p>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal de Exclusão de Conta */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-red-500 mb-4">Confirm Account Deletion</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <p className="text-sm mb-4">
                Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-red-500/30 rounded-xl text-[var(--text)] focus:outline-none focus:border-red-500 mb-4"
                placeholder="Type DELETE"
              />
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); setError(''); }}
                  className="flex-1 px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl font-medium hover:bg-[var(--border)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteConfirmation !== 'DELETE'}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
