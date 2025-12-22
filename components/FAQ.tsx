'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';

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
      question: 'O link expira?',
      answer: 'Não! No Eternal Gift, suas páginas são hospedadas de forma vitalícia para que você possa revisitá-las sempre.'
    },
    {
      question: 'Posso editar depois de publicar?',
      answer: 'No plano Eternal, a edição é ilimitada. Nos outros planos, você revisa tudo antes de gerar o link final.'
    },
    {
      question: 'Como a pessoa recebe o presente?',
      answer: 'Você recebe um link exclusivo e um QR Code em alta definição para imprimir em cartões ou enviar pelo WhatsApp.'
    },
    {
      question: 'Posso adicionar vídeos?',
      answer: 'Sim! Nos planos Premium e Eternal você pode adicionar vídeos curtos para tornar o presente ainda mais especial.'
    },
    {
      question: 'Os dados são seguros?',
      answer: 'Absolutamente! Utilizamos criptografia de ponta e servidores seguros. Suas memórias são privadas e protegidas.'
    }
  ];

  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-[var(--text)]">Perguntas</span>{' '}
            <span className="text-[var(--primary)]">Frequentes</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Tire suas dúvidas sobre o Eternal Gift
          </p>
        </motion.div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

