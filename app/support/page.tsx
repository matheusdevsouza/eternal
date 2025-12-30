'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Icons } from '@/components/ui/Icons';

export default function SupportPage() {
  const categories = [
    {
      title: 'Getting Started',
      icon: <Icons.Sparkles className="w-6 h-6" />,
      desc: 'Everything you need to know to start creating your gifts.',
      articles: 5
    },
    {
      title: 'Account & Billing',
      icon: <Icons.User className="w-6 h-6" />,
      desc: 'Manage your account, subscription and payment methods.',
      articles: 8
    },
    {
      title: 'Creating Gifts',
      icon: <Icons.Gift className="w-6 h-6" />,
      desc: 'Guides on how to customize photos, music, and letters.',
      articles: 12
    },
    {
      title: 'Technical Support',
      icon: <Icons.Settings className="w-6 h-6" />,
      desc: 'Troubleshooting and technical issues resolution.',
      articles: 6
    },
    {
      title: 'Privacy & Security',
      icon: <Icons.Lock className="w-6 h-6" />,
      desc: 'How we protect your data and memories.',
      articles: 4
    },
    {
      title: 'Sharing',
      icon: <Icons.Link className="w-6 h-6" />,
      desc: 'How to share your gifts via Link or QR Code.',
      articles: 7
    }
  ];

  const popularArticles = [
    'How to upload photos?',
    'Changing the background music',
    'How do I share my gift?',
    'Canceling subscription',
    'Resetting password'
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] overflow-x-hidden transition-colors duration-300">
      <Navbar />
      

      <section className="relative py-32 md:py-40 flex items-center justify-center px-6 overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--hero-gradient)' }} />
        
        <div className="max-w-4xl mx-auto text-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-xs font-bold mb-8"
          >
            <Icons.Sparkles className="w-3 h-3" />
            HELP CENTER
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-[var(--text)]"
          >
            How can we <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              help you?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto"
          >
            Find answers, guides and tutorials to help you create the perfect gift. 
            We are here to help you every step of the way.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-secondary)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text"
              placeholder="Search for articles, guides or tutorials..."
              className="w-full pl-12 pr-4 py-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all text-[var(--text)] shadow-lg"
            />
          </motion.div>
        </div>
      </section>


      <section className="py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  {category.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                  {category.desc}
                </p>
                <div className="flex items-center text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors">
                  {category.articles} articles
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-16 px-6 bg-[var(--bg-section)]/30 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Guides & Articles</h2>
              <p className="text-[var(--text-secondary)]">Tips and tricks to get the most out of your gift</p>
            </div>
            <Link 
              href="/blog" 
              className="text-[var(--primary)] font-bold hover:underline flex items-center"
            >
              View all articles
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularArticles.map((article, index) => (
              <Link 
                key={index}
                href="#" 
                className="group flex flex-col p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl hover:border-[var(--primary)] transition-all hover:-translate-y-1 hover:shadow-lg h-full"
              >
                <div className="mb-4 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Guide</div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                  {article}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6 flex-grow">
                  Learn how to make the most of this feature with our complete step-by-step guide.
                </p>
                <div className="flex items-center text-sm font-medium text-[var(--text-muted)] mt-auto pt-4 border-t border-[var(--border)]">
                  <span>5 min read</span>
                  <span className="mx-2">•</span>
                  <span className="group-hover:text-[var(--primary)] transition-colors flex items-center">
                    Read article 
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Still need help?</h2>
          <p className="text-[var(--text-secondary)] mb-10 text-lg">
            Our team is available 24/7 to solve your doubts and help you create the perfect gift.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:scale-105"
            >
              Contact Support
            </Link>
            <Link 
              href="/faq" 
              className="px-8 py-4 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] font-bold rounded-2xl hover:bg-[var(--border)] transition-all"
            >
              Browse FAQ
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
