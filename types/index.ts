export type Plan = 'START' | 'PREMIUM' | 'ETERNAL';

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: Plan;
  createdAt: Date;
}

export interface Gift {
  id: string;
  slug: string;
  title: string;
  message: string;
  theme: string;
  font: string;
  animation: string;
  published: boolean;
  views: number;
  createdAt: Date;
  userId: string;
  photos: Photo[];
  musics: Music[];
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface Music {
  id: string;
  name: string;
  artist?: string;
  url: string;
  duration?: number;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
  photos: number;
  music: boolean;
  edit: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}


