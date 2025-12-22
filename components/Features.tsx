'use client';

import { motion } from 'framer-motion';
import { Icons } from './Icons';

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
}

export default function Features() {
  const features: Feature[] = [
    {
      icon: <Icons.Camera className="w-8 h-8" />,
      title: 'Fotos Ilimitadas',
      description: 'Adicione quantas fotos quiser para contar sua história de amor'
    },
    {
      icon: <Icons.Music className="w-8 h-8" />,
      title: 'Música Personalizada',
      description: 'Escolha a trilha sonora perfeita para tornar o momento ainda mais especial'
    },
    {
      icon: <Icons.QRCode className="w-8 h-8" />,
      title: 'QR Code Exclusivo',
      description: 'Gere um QR Code único e personalizado para compartilhar facilmente'
    },
    {
      icon: <Icons.Sparkles className="w-8 h-8" />,
      title: 'Animações Premium',
      description: 'Efeitos visuais suaves que tornam cada página única e memorável'
    },
    {
      icon: <Icons.Gift className="w-8 h-8" />,
      title: 'Temas Personalizados',
      description: 'Escolha entre diversos temas elegantes ou crie o seu próprio estilo'
    },
    {
      icon: <Icons.Heart className="w-8 h-8" />,
      title: 'Eterno e Seguro',
      description: 'Suas memórias ficam guardadas para sempre com segurança de ponta'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-[var(--text)]">Recursos que</span>{' '}
            <span className="text-[var(--primary)]">fazem a diferença</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Tudo que você precisa para criar o presente perfeito em um só lugar
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all group hover:bg-[var(--bg-card-hover)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--icon-bg)] flex items-center justify-center text-[var(--primary)] mb-6 group-hover:bg-[var(--primary-light)] transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text)]">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


