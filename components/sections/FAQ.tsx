'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../ui/Icons';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

function FAQItem({ question, answer, index }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-card)]"
    >
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full p-6 flex items-center justify-between text-left hover:bg-[var(--bg-card-hover)] transition-colors"
      >
        <span className="font-bold text-[var(--text)]">{question}</span>
        <div className={`transition-transform duration-300 text-[var(--text)] ${open ? 'rotate-180' : ''}`}>
          <Icons.ChevronDown />
        </div>
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="p-6 pt-4 text-[var(--text-secondary)] text-sm leading-relaxed border-t border-[var(--border)]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const faqs = [
    {
      question: 'Does the link expire?',
      answer: 'No! At Eternal Gift, your pages are hosted for life so you can revisit them forever.'
    },
    {
      question: 'Can I edit after publishing?',
      answer: 'In the Eternal plan, editing is unlimited. In other plans, you review everything before generating the final link.'
    },
    {
      question: 'How does the person receive the gift?',
      answer: 'You receive a unique link and a high-definition QR Code to print on cards or send via WhatsApp.'
    },
    {
      question: 'Can I add videos?',
      answer: 'Yes! In Premium and Eternal plans, you can add short videos to make the gift even more special.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely! We use state-of-the-art encryption and secure servers. Your memories are private and protected.'
    },
    {
      question: 'How many pages can I create per month?',
      answer: 'In all plans, you can create as many pages as you want during your monthly subscription period! There are no page limits.'
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes! You can cancel your subscription at any time. Pages created during the active period will remain available even after cancellation.'
    },
    {
      question: 'Is it possible to share with a password?',
      answer: 'Yes! You can password-protect your pages to ensure only authorized people have access to your special gift.'
    },
    {
      question: 'What image format is accepted?',
      answer: 'We accept JPG, PNG, GIF, and WEBP. We recommend images with at least 1920x1080 pixels for best viewing quality.'
    },
    {
      question: 'Can I use custom music?',
      answer: 'Yes! In Premium and Eternal plans, you can upload your own MP3 music to make the gift even more personalized.'
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
      ))}
    </div>
  );
}

