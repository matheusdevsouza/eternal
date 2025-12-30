'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Settings from '../ui/Settings';

/**
 * Estrutura de item de navegação.
 * Define links simples, ações ou submenus.
 * 
 * @interface NavItem
 * @property {string} label - Texto visível do link
 * @property {string} [href] - URL de destino (opcional se tiver submenu ou onClick)
 * @property {Function} [onClick] - Ação personalizada ao clicar
 * @property {Array} [submenu] - Lista de itens para dropdown
 * @property {string} submenu.label - Texto do subitem
 * @property {string} submenu.href - Link do subitem
 * @property {string} [submenu.description] - Descrição curta para o subitem
 */
interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  submenu?: { label: string; href: string; description?: string }[];
}

/**
 * Navbar Component
 * 
 * Barra de navegação principal da aplicação.
 * Responsável pela navegação global, menu mobile e ações principais.
 * 
 * Funcionalidades:
 * - Navegação desktop com dropdowns
 * - Menu mobile adaptativo (fullscreen)
 * - Navegação suave (scroll) para seções
 * - Integração com Settings
 * 
 * @component
 * @module components/layout/Navbar
 */
export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    },
    {
      label: 'How It Works',
      submenu: [
        { label: 'Step by Step', href: '/how-it-works', description: 'See how to create your gift' },
        { label: 'Features', href: '/features', description: 'All features' },
        { label: 'FAQ', href: '/faq', description: 'Frequently asked questions' }
      ]
    },
    {
      label: 'Pricing',
      href: '/pricing'
    },
    {
      label: 'Blog',
      submenu: [
        { label: 'Articles', href: '/blog', description: 'Latest posts' },
        { label: 'Gift Tips', href: '/blog/tips', description: 'Creative ideas' }
      ]
    },
    {
      label: 'Support',
      submenu: [
        { label: 'Help Center', href: '/support', description: 'Find answers' },
        { label: 'Contact', href: '/contact', description: 'Talk to us' }
      ]
    }
  ];

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-[var(--navbar-bg)] backdrop-blur-xl border-b border-[var(--border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          <Link href="/" className="flex items-center transition-all duration-300 hover:scale-110">
            <Image 
              src="/logo.png" 
              alt="Eternal Gift" 
              width={120} 
              height={40}
              className="h-10 w-auto"
              style={{ filter: 'var(--logo-filter)' }}
              priority
            />
          </Link>


          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.submenu && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.submenu ? (
                  <>
                    <button className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-lg flex items-center gap-1 group">
                      {item.label}
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''} group-hover:translate-y-0.5`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden"
                        >
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              className="block px-4 py-3 hover:bg-[var(--border)] transition-colors group"
                            >
                              <div className="font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                                {subItem.label}
                              </div>
                              {subItem.description && (
                                <div className="text-xs text-[var(--text-secondary)] mt-1">
                                  {subItem.description}
                                </div>
                              )}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    onClick={item.onClick}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-lg"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-lg"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>


          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block px-6 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-full text-sm font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
            <Link
              href="/how-it-works"
              className="hidden sm:block px-6 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] rounded-full text-sm font-bold transition-all"
            >
              View Demo
            </Link>


            <div className="hidden sm:block">
              <Settings />
            </div>


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>


    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="lg:hidden fixed inset-0 top-20 bg-[var(--bg-deep)] z-[100] overflow-y-auto"
        >
          <div className="min-h-full flex flex-col p-6">
            <div className="space-y-2 flex-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                        className="w-full px-4 py-4 text-left text-base font-bold text-[var(--text)] hover:text-[var(--primary)] transition-colors flex items-center justify-between rounded-xl hover:bg-[var(--bg-card)]"
                      >
                        {item.label}
                        <svg
                          className={`w-5 h-5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {openDropdown === item.label && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-4 space-y-1 overflow-hidden"
                          >
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-lg hover:bg-[var(--bg-card)]"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => {
                        item.onClick?.();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-4 text-left text-base font-bold text-[var(--text)] hover:text-[var(--primary)] transition-colors rounded-xl hover:bg-[var(--bg-card)]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        item.onClick?.();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-4 text-left text-base font-bold text-[var(--text)] hover:text-[var(--primary)] transition-colors rounded-xl hover:bg-[var(--bg-card)]"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-6 space-y-3 border-t border-[var(--border)] mt-6">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-6 py-4 bg-[var(--primary)] hover:opacity-90 text-white rounded-2xl text-base font-bold text-center transition-all shadow-lg"
              >
                Sign In
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-6 py-4 bg-[var(--bg-card)] border-2 border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] rounded-2xl text-base font-bold text-center transition-all"
              >
                View Demo
              </Link>
              <div className="flex justify-center pt-4">
                <Settings />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
