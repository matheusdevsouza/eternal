import { Plan } from '@prisma/client';

/**
 * Configuração de Planos - Plataforma Eternal Gift
 * 
 * Configuração centralizada para todos os recursos e limites de planos.
 */

export interface PlanLimits {
  maxGifts: number;           // -1 = ilimitado
  maxPhotosPerGift: number;   // -1 = ilimitado
  maxMusicPerGift: number;    // -1 = ilimitado
  maxPhotoSizeMB: number;
  maxMusicSizeMB: number;
  customQRCode: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  lifetimeEditing: boolean;
  premiumAnimations: boolean;
  timeCounter: boolean;
  analytics: boolean;
}

export interface PlanConfig {
  name: string;
  displayName: string;
  price: number;              // Preço em centavos (BRL)
  priceDisplay: string;       // Preço formatado para exibição
  description: string;
  popular: boolean;
  limits: PlanLimits;
  features: string[];
}

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  START: {
    name: 'START',
    displayName: 'Start',
    price: 2900,
    priceDisplay: 'R$ 29',
    description: 'Perfeito para começar com presentes digitais',
    popular: false,
    limits: {
      maxGifts: -1,
      maxPhotosPerGift: 5,
      maxMusicPerGift: 0,
      maxPhotoSizeMB: 5,
      maxMusicSizeMB: 0,
      customQRCode: false,
      customDomain: false,
      prioritySupport: false,
      lifetimeEditing: false,
      premiumAnimations: false,
      timeCounter: false,
      analytics: false,
    },
    features: [
      'Páginas ilimitadas',
      'Fotos HD ilimitadas por página',
      'Texto personalizado',
      'Link público',
      'QR Code padrão',
    ],
  },
  PREMIUM: {
    name: 'PREMIUM',
    displayName: 'Premium',
    price: 5900,
    priceDisplay: 'R$ 59',
    description: 'Escolha mais popular para momentos especiais',
    popular: true,
    limits: {
      maxGifts: -1,
      maxPhotosPerGift: 15,
      maxMusicPerGift: 1,
      maxPhotoSizeMB: 10,
      maxMusicSizeMB: 10,
      customQRCode: true,
      customDomain: false,
      prioritySupport: false,
      lifetimeEditing: false,
      premiumAnimations: true,
      timeCounter: true,
      analytics: true,
    },
    features: [
      'Páginas ilimitadas',
      'Até 15 fotos HD por página',
      'Música de fundo',
      'Contador de tempo',
      'Animações premium',
      'QR Code personalizado',
    ],
  },
  ETERNAL: {
    name: 'ETERNAL',
    displayName: 'Eternal',
    price: 9900,
    priceDisplay: 'R$ 99',
    description: 'Experiência definitiva para memórias eternas',
    popular: false,
    limits: {
      maxGifts: -1,
      maxPhotosPerGift: 30,
      maxMusicPerGift: -1,
      maxPhotoSizeMB: 20,
      maxMusicSizeMB: 50,
      customQRCode: true,
      customDomain: true,
      prioritySupport: true,
      lifetimeEditing: true,
      premiumAnimations: true,
      timeCounter: true,
      analytics: true,
    },
    features: [
      'Páginas ilimitadas',
      'Até 30 fotos HD por página',
      'Músicas ilimitadas',
      'Domínio personalizado',
      'Edição vitalícia',
      'Suporte prioritário',
    ],
  },
};

/**
 * Obter configuração do plano
 */

export function getPlanConfig(plan: Plan): PlanConfig {
  return PLAN_CONFIG[plan];
}

/**
 * Obter limites do plano
 */

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_CONFIG[plan].limits;
}

/**
 * Verificar se pode adicionar mais fotos a um presente
 */

export function canAddPhoto(plan: Plan, currentCount: number): boolean {
  const max = PLAN_CONFIG[plan].limits.maxPhotosPerGift;
  return max === -1 || currentCount < max;
}

/**
 * Verificar se pode adicionar mais músicas a um presente
 */

export function canAddMusic(plan: Plan, currentCount: number): boolean {
  const max = PLAN_CONFIG[plan].limits.maxMusicPerGift;
  return max === -1 || currentCount < max;
}

/**
 * Obter vagas de fotos restantes
 */

export function getRemainingPhotoSlots(plan: Plan, currentCount: number): number {
  const max = PLAN_CONFIG[plan].limits.maxPhotosPerGift;
  if (max === -1) return -1;
  return Math.max(0, max - currentCount);
}

/**
 * Obter vagas de músicas restantes
 */

export function getRemainingMusicSlots(plan: Plan, currentCount: number): number {
  const max = PLAN_CONFIG[plan].limits.maxMusicPerGift;
  if (max === -1) return -1;
  return Math.max(0, max - currentCount);
}

/**
 * Verificar se um recurso está disponível para o plano
 */

export function hasFeature(plan: Plan, feature: keyof PlanLimits): boolean {
  const value = PLAN_CONFIG[plan].limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return false;
}

/**
 * Calcular diferença de preço para upgrade
 */

export function getUpgradePrice(currentPlan: Plan, targetPlan: Plan): number {
  const current = PLAN_CONFIG[currentPlan].price;
  const target = PLAN_CONFIG[targetPlan].price;
  return Math.max(0, target - current);
}

/**
 * Obter planos disponíveis para upgrade
 */

export function getAvailableUpgrades(currentPlan: Plan): Plan[] {
  const plans: Plan[] = ['START', 'PREMIUM', 'ETERNAL'];
  const currentIndex = plans.indexOf(currentPlan);
  return plans.slice(currentIndex + 1);
}

/**
 * Formatar preço para exibição
 */

export function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

/**
 * Obter plano por preço
 */

export function getPlanByPrice(price: number): Plan | null {
  for (const [plan, config] of Object.entries(PLAN_CONFIG)) {
    if (config.price === price) return plan as Plan;
  }
  return null;
}
