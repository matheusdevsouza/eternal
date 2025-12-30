'use client';

import { motion, Variants } from 'framer-motion';
import { Icons } from '../ui/Icons';

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
}

export default function Features() {
  const features: Feature[] = [
    {
      icon: <Icons.Camera className="w-8 h-8" />,
      title: 'Unlimited Photos',
      description: 'Add as many photos as you need to tell your love story'
    },
    {
      icon: <Icons.Music className="w-8 h-8" />,
      title: 'Personalized Music',
      description: 'Choose the perfect soundtrack to make the moment even more special'
    },
    {
      icon: <Icons.QRCode className="w-8 h-8" />,
      title: 'Exclusive QR Code',
      description: 'Generate a unique and personalized QR Code for easy sharing'
    },
    {
      icon: <Icons.Sparkles className="w-8 h-8" />,
      title: 'Premium Animations',
      description: 'Smooth visual effects that make every page unique and memorable'
    },
    {
      icon: <Icons.Gift className="w-8 h-8" />,
      title: 'Custom Themes',
      description: 'Choose from various elegant themes or create your own style'
    },
    {
      icon: <Icons.Heart className="w-8 h-8" />,
      title: 'Eternal and Secure',
      description: 'Your memories are kept forever with state-of-the-art security'
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
  );
}