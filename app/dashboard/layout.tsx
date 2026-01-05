'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from '@/components/ui/Icons';

function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/dashboard/gifts', label: 'My Gifts', icon: 'Gift' },
    { href: '/dashboard/gifts/new', label: 'New Gift', icon: 'Plus' },
    { href: '/dashboard/subscription', label: 'Subscription', icon: 'CreditCard' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-[var(--bg-card)] border-r border-[var(--border)] transition-all duration-300 z-40 flex flex-col ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="h-20 flex items-center justify-center px-6 border-b border-[var(--border)]/50 relative">
        {!collapsed && (
          <Link href="/" className="flex-1 flex justify-center">
            <Image 
              src="/logo.png" 
              alt="Eternal Gift" 
              width={120} 
              height={40}
              className="h-8 w-auto transition-transform duration-200 hover:scale-110"
              style={{ filter: 'var(--logo-filter)' }}
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all ${collapsed ? '' : 'absolute right-4'}`}
        >
          <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      {user && (
        <div className={`p-6 border-b border-[var(--border)]/50 ${collapsed ? 'px-4' : ''}`}>
          <div className={`flex items-center gap-4 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--primary)]/20">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                 <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[var(--bg-card)]" />
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="font-bold text-sm truncate text-[var(--text)]">{user.name || 'User'}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                 <div className="mt-1.5 flex">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      user.plan 
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20' 
                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                    }`}>
                        {user.plan || 'NO PLAN'}
                    </span>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = Icons[item.icon as keyof typeof Icons] || Icons.Sparkles;

            return (
                <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                    isActive
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg shadow-[var(--primary)]/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)]'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
                >
                <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-current'} transition-colors`} />
                
                {!collapsed && (
                    <span className="font-medium text-sm tracking-wide">{item.label}</span>
                )}
                 {collapsed && isActive && (
                     <div className="absolute inset-0 bg-[var(--primary)] opacity-20 blur-md rounded-xl -z-10" />
                 )}
                </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[var(--border)]/50 space-y-2">
        <ThemeToggle collapsed={collapsed} />
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full text-[var(--text-secondary)] hover:bg-[var(--error-bg)] hover:text-[var(--error-text)] hover:border-[var(--error-border)] border border-transparent transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <Icons.LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="font-medium text-sm">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] transition-all group ${collapsed ? 'justify-center' : ''}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Icons.Sun className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
      ) : (
        <Icons.Moon className="w-5 h-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
      )}
      {!collapsed && (
        <span className="font-medium text-sm">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}

function SubscriptionRequiredBanner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)] p-4">
      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Icons.CreditCard className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
          Subscription Required
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          To access the dashboard and create eternal gifts, you need an active subscription.
        </p>
        <Link
          href="/pricing"
          className="block w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(255,51,102,0.25)] hover:shadow-[0_4px_25px_rgba(255,51,102,0.35)] hover:scale-[1.01] active:scale-[0.98]"
        >
          View Plans
        </Link>
        <Link
          href="/"
          className="block mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        >
          Back to site
        </Link>
      </div>
    </div>
  );
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { user, subscription, loading, hasActiveSubscription } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Not authenticated
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    
    // Authenticated but no active subscription - redirect to pricing
    if (!loading && user && !hasActiveSubscription) {
      router.push('/pricing?upgrade=true');
      return;
    }
  }, [user, loading, hasActiveSubscription, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Icons.Sparkles className="w-6 h-6 text-[var(--primary)] animate-pulse" />
            </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Fallback while redirect happens
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Icons.Sparkles className="w-6 h-6 text-[var(--primary)] animate-pulse" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] flex">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col transition-all duration-300">
        <header className="h-20 sticky top-0 z-30 bg-[var(--bg-deep)]/80 backdrop-blur-xl border-b border-[var(--border)] px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text)] to-[var(--text-secondary)]">
               Painel
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
                Bem-vindo de volta, {user.name?.split(' ')[0]}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
                href="/" 
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)]"
            >
              <Icons.Sparkles className="w-4 h-4 text-[var(--primary)] opacity-50 group-hover:opacity-100 transition-opacity" />
              <span>Voltar ao site</span>
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto">
             {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}
