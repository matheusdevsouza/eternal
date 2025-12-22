'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Settings from './Settings';

interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  submenu?: { label: string; href: string; description?: string }[];
}

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
      label: 'Início',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    },
    {
      label: 'Como Funciona',
      submenu: [
        { label: 'Passo a Passo', href: '/como-funciona', description: 'Veja como criar seu presente' },
        { label: 'Recursos', href: '/recursos', description: 'Todas as funcionalidades' },
        { label: 'FAQ', href: '/faq', description: 'Perguntas frequentes' }
      ]
    },
    {
      label: 'Preços',
      onClick: () => scrollToSection('precos')
    },
    {
      label: 'Blog',
      submenu: [
        { label: 'Artigos', href: '/blog', description: 'Últimas publicações' },
        { label: 'Dicas de Presentes', href: '/blog/dicas', description: 'Ideias criativas' }
      ]
    },
    {
      label: 'Suporte',
      submenu: [
        { label: 'Central de Ajuda', href: '/suporte', description: 'Encontre respostas' },
        { label: 'Contato', href: '/contato', description: 'Fale conosco' }
      ]
    }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--navbar-bg)] backdrop-blur-xl border-b border-[var(--border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
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

          {/* Desktop Navigation */}
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

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block px-6 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-full text-sm font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Entrar
            </Link>
            <button
              onClick={() => scrollToSection('precos')}
              className="hidden sm:block px-6 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] rounded-full text-sm font-bold transition-all"
            >
              Ver Demo
            </button>

            {/* Settings */}
            <div className="hidden sm:block">
              <Settings />
            </div>

            {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[var(--border)] py-4"
            >
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center justify-between"
                        >
                          {item.label}
                          <svg
                            className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openDropdown === item.label && (
                          <div className="pl-4 space-y-1">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          item.onClick?.();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                      >
                        {item.label}
                      </button>
                    )}
                  </div>
                ))}
                <div className="pt-4 px-4 space-y-2 border-t border-[var(--border)] mt-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-full text-sm font-bold text-center transition-colors"
                  >
                    Entrar
                  </Link>
                  <button
                    onClick={() => {
                      scrollToSection('precos');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] rounded-full text-sm font-bold text-center transition-colors"
                  >
                    Ver Demo
                  </button>
                  <div className="flex justify-center pt-2">
                    <Settings />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
