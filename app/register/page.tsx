'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ToastContainer, toast } from '@/components/ui/Toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from '@/components/ui/Icons';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements = useMemo((): PasswordRequirement[] => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One number (0-9)', met: /\d/.test(password) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(password) },
  ], [password]);

  const metCount = requirements.filter(r => r.met).length;
  const strength = metCount === 0 ? 0 : metCount <= 2 ? 1 : metCount <= 4 ? 2 : 3;
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];
  const strengthColors = ['', 'var(--error-icon)', 'var(--warning-icon)', 'var(--success-icon)'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 p-4 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: strength >= level ? strengthColors[strength] : 'var(--border)'
              }}
            />
          ))}
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: strengthColors[strength] || 'var(--text-muted)' }}
        >
          {strengthLabels[strength]}
        </span>
      </div>
      
      <ul className="space-y-1.5">
        {requirements.map((req, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Icons.Check className="w-3.5 h-3.5 text-[var(--success-icon)]" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-[var(--border)]" />
            )}
            <span style={{ color: req.met ? 'var(--success-text)' : 'var(--text-muted)' }}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isPasswordStrong = useMemo(() => {
    const p = formData.password;
    return p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[@$!%*?&]/.test(p);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isPasswordStrong) {
      toast.error('Password does not meet the requirements');
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
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Error creating account');
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success(data.message || 'Account created successfully!');
      
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Error creating account. Check your connection and try again.');
      setLoading(false);
    }
  };

  if (success) {
     return (
        <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary-light),_transparent_70%)] opacity-30 pointer-events-none" />
          
          <ToastContainer />
          <Navbar />
          
          <div className="pt-28 pb-20 px-4 flex-grow flex items-center justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg"
            >
              <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border)] p-10 rounded-3xl shadow-2xl text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--success-icon)] to-transparent opacity-50" />
                 
                 <div className="w-20 h-20 bg-[var(--success-bg)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--success-bg)]">
                    <svg className="w-10 h-10 text-[var(--success-icon)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
                 
                 <h2 className="text-3xl font-bold mb-3 tracking-tight">Check your email</h2>
                 <p className="text-[var(--text-secondary)] mb-8 text-lg leading-relaxed">
                   We've sent a verification link to <br/>
                   <span className="font-semibold text-[var(--text)]">{formData.email}</span>
                 </p>
                 
                 <Link 
                   href="/login" 
                   className="block w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98]"
                 >
                   Go to Login
                 </Link>
              </div>
            </motion.div>
          </div>
          <Footer />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary-light),_transparent_70%)] opacity-30 pointer-events-none" />
      
      <ToastContainer />
      <Navbar />
      
      <div className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border)] p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50 blur-sm" />

            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6 transform hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logo.png" 
                  alt="Eternal Gift" 
                  width={160} 
                  height={53}
                  className="h-14 w-auto mx-auto"
                  style={{ filter: theme === 'light' ? 'var(--logo-filter)' : 'none' }}
                />
              </Link>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Create account</h1>
              <p className="text-[var(--text-secondary)]">Begin your journey of eternal memories</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] ml-1">
                  Full name
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                     <Icons.User className="w-5 h-5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all text-[var(--text)] placeholder-[var(--text-light)] shadow-inner"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] ml-1">
                  Email
                </label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                   </div>
                   <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all text-[var(--text)] placeholder-[var(--text-light)] shadow-inner"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] ml-1">
                  Password
                </label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                      <Icons.Lock className="w-5 h-5" />
                   </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all text-[var(--text)] placeholder-[var(--text-light)] shadow-inner"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors p-1"
                  >
                    {showPassword ? (
                         <Icons.EyeOff className="w-5 h-5" />
                    ) : (
                         <Icons.Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)] ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                      <Icons.Lock className="w-5 h-5" />
                   </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all text-[var(--text)] placeholder-[var(--text-light)] shadow-inner"
                    placeholder="Retype password"
                  />
                  <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors p-1"
                  >
                    {showConfirmPassword ? (
                        <Icons.EyeOff className="w-5 h-5" />
                    ) : (
                        <Icons.Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-[var(--error-text)] ml-1 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-start gap-3 pt-2">
                <div className="relative flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                    className="w-5 h-5 rounded border-[var(--border)] bg-[var(--bg-deep)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 transition-colors cursor-pointer"
                  />
                </div>
                <label htmlFor="terms" className="text-sm text-[var(--text-secondary)] leading-tight cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[var(--primary)] hover:underline font-medium">Terms of Use</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[var(--primary)] hover:underline font-medium">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordStrong}
                className="w-full mt-4 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(255,51,102,0.25)] hover:shadow-[0_4px_25px_rgba(255,51,102,0.35)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-bold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
