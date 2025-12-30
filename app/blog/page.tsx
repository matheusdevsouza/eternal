'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Icons } from '@/components/ui/Icons';

export default function BlogPage() {
  const articles = [
    {
      title: 'How to create an unforgettable digital gift',
      excerpt: 'Discover the secrets to creating a gift that will touch the heart of someone you love forever.',
      category: 'Guide',
      date: 'Dec 28, 2024',
      readTime: '5 min read',
      image: '/blog/gift-guide.jpg',
    },
    {
      title: 'The psychology behind eternal memories',
      excerpt: 'Why preserving our moments is so important for our emotional well-being and connection.',
      category: 'Science',
      date: 'Dec 25, 2024',
      readTime: '8 min read',
      image: '/blog/memories.jpg',
    },
    {
      title: '10 creative ideas for anniversaries',
      excerpt: 'Running out of ideas? Here are 10 unique ways to celebrate your love.',
      category: 'Inspiration',
      date: 'Dec 20, 2024',
      readTime: '4 min read',
      image: '/blog/ideas.jpg',
    },
    {
      title: 'How to choose the perfect soundtrack',
      excerpt: 'Music connects souls. Learn how to pick the song that defines your relationship.',
      category: 'Tips',
      date: 'Dec 15, 2024',
      readTime: '6 min read',
      image: '/blog/music.jpg',
    },
    {
      title: 'Sharing options: Private vs Public',
      excerpt: 'Understanding the security and privacy settings for your eternal pages.',
      category: 'Security',
      date: 'Dec 10, 2024',
      readTime: '3 min read',
      image: '/blog/security.jpg',
    },
    {
      title: 'New Feature: Video Messages',
      excerpt: 'We just launched video support! See how to add personal messages to your gift.',
      category: 'Update',
      date: 'Dec 05, 2024',
      readTime: '2 min read',
      image: '/blog/update.jpg',
    }
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
            BLOG & NEWS
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-[var(--text)]"
          >
            Stories that <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              inspire love.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-2 max-w-2xl mx-auto"
          >
            Tips, guides, and inspiration to help you celebrate your most precious moments.
          </motion.p>
        </div>
      </section>


      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href="#" className="group h-full flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden hover:border-[var(--primary)] transition-all hover:shadow-xl hover:-translate-y-1">

                  <div className="h-48 bg-[var(--bg-section)] relative overflow-hidden group-hover:opacity-90 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)] opacity-20">
                        <Icons.Camera className="w-12 h-12" />
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xs font-bold mb-4">
                        <span className="text-[var(--primary)] uppercase tracking-wider">{article.category}</span>
                        <span className="text-[var(--text-muted)]">•</span>
                        <span className="text-[var(--text-secondary)]">{article.date}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                        {article.title}
                    </h3>
                    
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 line-clamp-3">
                        {article.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-[var(--border)] flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)] font-medium">{article.readTime}</span>
                        <span className="font-bold text-[var(--text)] flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read more
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-24 px-6 relative overflow-hidden border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl font-bold mb-6">Stay updated</h2>
            <p className="text-[var(--text-secondary)] mb-8 text-lg">
                Subscribe to our newsletter to receive the latest gift ideas and features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-6 py-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] text-[var(--text)]"
                />
                <button className="px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all">
                    Subscribe
                </button>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
