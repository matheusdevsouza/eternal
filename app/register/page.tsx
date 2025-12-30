'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ToastContainer, toast } from '@/components/ui/Toast';

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!acceptTerms) {
      toast.warning('You must accept the terms of use');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {

        toast.error(data.error || 'Error creating account');
        setLoading(false);
        return;
      }

      toast.success(data.message || 'Account created successfully!');

      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Error creating account. Check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0507] text-[#FFF1F2]">
      <ToastContainer />
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Image 
                src="/logo.png" 
                alt="Eternal Gift" 
                width={140} 
                height={46}
                className="h-12 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-[#FFF1F2]/60">Start creating unforgettable gifts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#1A0B0E] border border-[#2D1318] rounded-xl outline-none focus:border-[#FF3366] transition-all text-[#FFF1F2]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#1A0B0E] border border-[#2D1318] rounded-xl outline-none focus:border-[#FF3366] transition-all text-[#FFF1F2]"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-[#1A0B0E] border border-[#2D1318] rounded-xl outline-none focus:border-[#FF3366] transition-all text-[#FFF1F2]"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#1A0B0E] border border-[#2D1318] rounded-xl outline-none focus:border-[#FF3366] transition-all text-[#FFF1F2]"
                placeholder="Type again"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
                className="mt-1 w-4 h-4 rounded border-[#2D1318] bg-[#1A0B0E] text-[#FF3366] focus:ring-[#FF3366] focus:ring-offset-0"
              />
              <label htmlFor="terms" className="text-sm text-[#FFF1F2]/60">
                I agree to the{' '}
                <Link href="/terms" className="text-[#FF3366] hover:underline">Terms of Use</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#FF3366] hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FF3366] hover:bg-[#FF4D7D] text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#FFF1F2]/60">
              Already have an account?{' '}
              <Link href="/login" className="text-[#FF3366] hover:text-[#FF4D7D] font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}


