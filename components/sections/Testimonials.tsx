'use client';

import { motion, Variants } from 'framer-motion';
import { Icons } from '../ui/Icons';

interface Testimonial {
  name: string;
  couple: string;
  text: string;
  rating: number;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      name: 'Ana & João',
      couple: 'Ana & João',
      text: 'We created a gift for our 3rd anniversary and it was amazing! She cried with emotion seeing all our memories together in one place.',
      rating: 5
    },
    {
      name: 'Maria & Pedro',
      couple: 'Maria & Pedro',
      text: 'The best gift I\'ve ever given! Easy to create, beautiful to see, and eternal. She visits the page almost every day to reminisce about our moments.',
      rating: 5
    },
    {
      name: 'Carla & Lucas',
      couple: 'Carla & Lucas',
      text: 'I surprised my girlfriend on our anniversary. She didn\'t expect something so special and personalized. I recommend it to all couples!',
      rating: 5
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid md:grid-cols-3 gap-8"
    >
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all group flex flex-col"
        >
          <div className="flex items-center gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            ))}
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-6 italic flex-1">
            "{testimonial.text}"
          </p>
          <div className="flex items-center gap-3 mt-auto">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
              {testimonial.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-bold text-[var(--text)]">{testimonial.couple}</div>
              <div className="text-sm text-[var(--text-muted)]">Happy couples</div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}