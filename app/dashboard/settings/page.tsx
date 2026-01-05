'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from '@/components/ui/Icons';

interface Session {
  id: string;
  device: string;
  lastActive: string;
  current: boolean;
}

/**
 * Página de Configurações do Dashboard
 * 
 * Permite ao usuário gerenciar perfil, segurança e notificações.
 */

export default function SettingsPage() {
  const { user, refreshUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    giftPublished: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  // Atualizar dados de perfil quando o usuário mudar
  useEffect(() => {
    if (user?.name) {
      setProfileData({ name: user.name });
    }
  }, [user]);

  /**
   * Salva as alterações do perfil do usuário.
   */
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

  /**
   * Altera a senha do usuário.
   */
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Icons.User },
    { id: 'security', label: 'Security', icon: Icons.Shield },
    { id: 'notifications', label: 'Notifications', icon: Icons.Bell },
    { id: 'danger', label: 'Danger Zone', icon: Icons.AlertTriangle },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--text-secondary)]">
          Manage your account preferences and security
        </p>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <Icons.Check className="w-5 h-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccess('');
              }}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-lg">{user?.name || 'User'}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] cursor-not-allowed"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>

            <button
              onClick={handleProfileSave}
              disabled={saving}
              className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icons.Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Icons.Palette className="w-5 h-5 text-[var(--primary)]" />
              Appearance
            </h3>
            
            <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Choose between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Icons.Sun className="w-4 h-4" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Icons.Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Icons.Lock className="w-5 h-5 text-[var(--primary)]" />
              Change Password
            </h3>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
              className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Icons.Info className="w-5 h-5 text-[var(--primary)]" />
              Account Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <div>
                  <p className="font-medium">Email Verified</p>
                  <p className="text-sm text-[var(--text-secondary)]">Your email verification status</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  user?.emailVerified 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-[var(--text-secondary)]">Your subscription tier</p>
                </div>
                <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-full text-xs font-bold">
                  {user?.plan || 'NO PLAN'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-deep)] flex items-center justify-center">
                  <Icons.Shield className="w-5 h-5 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <h3 className="font-bold">Two-Factor Authentication</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Add an extra layer of security</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-[var(--bg-deep)] text-[var(--text-secondary)] rounded-full text-xs font-medium">
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>
      )}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Icons.Bell className="w-5 h-5 text-[var(--primary)]" />
              Email Notifications
            </h3>
            
            <div className="space-y-1">
              {[
                { 
                  key: 'emailUpdates', 
                  label: 'Account Updates', 
                  description: 'Important account and security notifications' 
                },
                { 
                  key: 'giftPublished', 
                  label: 'Gift Published', 
                  description: 'Notifications when your gifts are published' 
                },
                { 
                  key: 'weeklyDigest', 
                  label: 'Weekly Digest', 
                  description: 'Summary of your gift views and activity' 
                },
                { 
                  key: 'marketingEmails', 
                  label: 'Marketing Emails', 
                  description: 'Tips, features, and promotional content' 
                },
              ].map((item, index) => (
                <div 
                  key={item.key}
                  className={`flex items-center justify-between py-4 ${
                    index < 3 ? 'border-b border-[var(--border)]' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ 
                      ...prev, 
                      [item.key]: !prev[item.key as keyof typeof notifications] 
                    }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key as keyof typeof notifications]
                        ? 'bg-[var(--primary)]'
                        : 'bg-[var(--bg-deep)] border border-[var(--border)]'
                    }`}
                  >
                    <span 
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'left-7'
                          : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      {activeTab === 'danger' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/20">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-red-400">
              <Icons.AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              These actions are irreversible. Please proceed with caution.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors font-medium"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
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
                  <Icons.AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  Delete Account?
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  This action cannot be undone. All your data, gifts, and subscription will be permanently deleted.
                </p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implementar exclusão de conta
                    setShowDeleteModal(false);
                    setError('Account deletion is not yet implemented');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
