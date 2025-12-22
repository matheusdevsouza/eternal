'use client';

import { motion } from 'framer-motion';
import { Icons } from './Icons';

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
      couple: 'Ana e João',
      text: 'Criamos um presente para nosso aniversário de 3 anos e foi incrível! Ela chorou de emoção ao ver todas as nossas memórias juntas em um lugar só.',
      rating: 5
    },
    {
      name: 'Maria & Pedro',
      couple: 'Maria e Pedro',
      text: 'O melhor presente que já dei! Fácil de criar, lindo de ver e eterno. Ela visita a página quase todo dia para relembrar nossos momentos.',
      rating: 5
    },
    {
      name: 'Carla & Lucas',
      couple: 'Carla e Lucas',
      text: 'Surpreendi minha namorada no nosso aniversário. Ela não esperava algo tão especial e personalizado. Recomendo para todos os casais!',
      rating: 5
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-[var(--bg-deep)] to-[var(--bg-section)]/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-[var(--text)]">O que nossos</span>{' '}
            <span className="text-[var(--primary)]">casais dizem</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Histórias reais de pessoas que transformaram seus momentos em presentes eternos
          </p>
        </motion.div>

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
              className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all group"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                ))}
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold text-[var(--text)]">{testimonial.couple}</div>
                  <div className="text-sm text-[var(--text-muted)]">Casais felizes</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

