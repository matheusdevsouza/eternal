'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Icons } from '@/components/ui/Icons';
import { ToastContainer, toast } from '@/components/ui/Toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulando api call (!)
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] overflow-x-hidden transition-colors duration-300">
      <ToastContainer />
      <Navbar />
      

      <section className="relative py-32 md:py-40 flex items-center justify-center px-6 overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[120px] -z-10" style={{ background: 'var(--hero-gradient)' }} />
        
        <div className="max-w-6xl mx-auto text-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--badge-text)] text-xs font-bold mb-8"
          >
            <Icons.Sparkles className="w-3 h-3" />
            WE ARE HERE FOR YOU
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-[var(--text)]"
          >
            Get in <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
              Touch
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-2 max-w-2xl mx-auto"
          >
            Have questions, suggestions, or just want to say hi? 
            Fill out the form below or send us an email.
          </motion.p>
        </div>
      </section>


      <section className="py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <p className="text-[var(--text-secondary)] mb-12 text-lg leading-relaxed">
                We are always ready to help. Choose the best way to contact our team.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-6 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-[var(--text)]">Email</h3>
                    <p className="text-[var(--text-secondary)] mb-1">General inquiries and support</p>
                    <a href="mailto:hello@eternalgift.com" className="text-[var(--primary)] font-medium hover:underline">
                      hello@eternalgift.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-6 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-[var(--text)]">Chat Support</h3>
                    <p className="text-[var(--text-secondary)] mb-1">Available for Premium users</p>
                    <span className="text-[var(--text-secondary)]">Mon - Fri, 9am - 6pm</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text)]">Social Media</h3>
                      <p className="text-[var(--text-secondary)]">Follow us for updates</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all group/icon">
                      <Icons.Instagram className="w-5 h-5" />
                      <span className="text-sm font-medium">Instagram</span>
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all group/icon">
                      <Icons.TikTok className="w-5 h-5" />
                      <span className="text-sm font-medium">TikTok</span>
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all group/icon">
                      <Icons.Twitter className="w-5 h-5" />
                      <span className="text-sm font-medium">Twitter</span>
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all group/icon">
                      <Icons.Facebook className="w-5 h-5" />
                      <span className="text-sm font-medium">Facebook</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>


            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] p-8 md:p-10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-[var(--text)]">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all text-[var(--text)]"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-[var(--text)]">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all text-[var(--text)]"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2 text-[var(--text)]">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={(e: any) => handleChange(e)}
                    required
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all text-[var(--text)]"
                  >
                    <option value="">Select a subject</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-[var(--text)]">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all text-[var(--text)] resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[var(--primary)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
