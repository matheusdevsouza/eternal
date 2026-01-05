// Type definitions for Eternal Gift Platform

export type Plan = 'START' | 'PREMIUM' | 'ETERNAL';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

// =====================================================
// USER TYPES
// =====================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: Plan;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithSubscription extends User {
  subscription?: Subscription;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  plan: Plan;
  emailVerified: boolean;
}

// =====================================================
// SUBSCRIPTION TYPES
// =====================================================

export interface Subscription {
  id: string;
  plan: Plan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  cancelledAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionWithPayments extends Subscription {
  payments: Payment[];
}

// =====================================================
// PAYMENT TYPES
// =====================================================

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  gatewayId?: string;
  description?: string;
  userId: string;
  subscriptionId?: string;
  couponId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWithDetails extends Payment {
  user: User;
  subscription?: Subscription;
  coupon?: Coupon;
}

// =====================================================
// COUPON TYPES
// =====================================================

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  minPurchase?: number;
  validPlans: Plan[];
  validFrom: Date;
  validUntil?: Date;
  active: boolean;
  createdAt: Date;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  finalPrice?: number;
  error?: string;
}

// =====================================================
// GIFT TYPES
// =====================================================

export interface Gift {
  id: string;
  slug: string;
  title: string;
  message: string;
  recipientName?: string;
  theme: string;
  font: string;
  animation: string;
  backgroundColor?: string;
  textColor?: string;
  published: boolean;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface GiftWithMedia extends Gift {
  photos: Photo[];
  musics: Music[];
  qrCode?: QRCode;
}

export interface GiftWithUser extends Gift {
  user: User;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  order: number;
  giftId: string;
  createdAt: Date;
}

export interface Music {
  id: string;
  name: string;
  artist?: string;
  url: string;
  duration?: number;
  order: number;
  giftId: string;
  createdAt: Date;
}

export interface QRCode {
  id: string;
  imageUrl: string;
  customized: boolean;
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  giftId: string;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// CHECKOUT TYPES
// =====================================================

export interface CheckoutSession {
  id: string;
  plan: Plan;
  amount: number;
  discount: number;
  finalAmount: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  clientSecret: string;
  expiresAt: Date;
}

export interface CheckoutRequest {
  plan: Plan;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export interface CheckoutConfirmation {
  paymentId: string;
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// =====================================================
// DASHBOARD TYPES
// =====================================================

export interface DashboardStats {
  totalGifts: number;
  publishedGifts: number;
  draftGifts: number;
  totalViews: number;
  subscription?: Subscription;
}

export interface GiftStats {
  views: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
}

// =====================================================
// PLAN & PRICING TYPES
// =====================================================

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
  photos: number;
  music: boolean;
  edit: boolean;
}

export interface PlanLimits {
  maxGifts: number;
  maxPhotosPerGift: number;
  maxMusicPerGift: number;
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

// =====================================================
// FORM TYPES
// =====================================================

export interface GiftFormData {
  title: string;
  message: string;
  recipientName?: string;
  theme: string;
  font: string;
  animation: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// =====================================================
// MISC TYPES
// =====================================================

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Theme {
  id: string;
  name: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export interface Font {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting';
}

export interface Animation {
  id: string;
  name: string;
  preview: string;
  premium: boolean;
}
