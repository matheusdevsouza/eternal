import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './middleware';
import { getPrisma } from './prisma';
import { Plan, SubscriptionStatus } from '@prisma/client';

/**
 * Interface de Resultado da Verificação de Assinatura
 */

export interface SubscriptionCheckResult {
  allowed: boolean;
  reason?: 'NOT_AUTHENTICATED' | 'NO_SUBSCRIPTION' | 'SUBSCRIPTION_INACTIVE' | 'SUBSCRIPTION_EXPIRED' | 'EMAIL_NOT_VERIFIED';
  userId?: string;
  subscription?: {
    id: string;
    plan: Plan;
    status: SubscriptionStatus;
    endDate: Date | null;
  };
  user?: {
    id: string;
    email: string;
    plan: Plan | null;
    emailVerified: boolean;
  };
}

/**
 * Validar que o usuário possui uma assinatura ativa
 * 
 * Esta é a ÚNICA fonte da verdade para acesso de assinatura.
 * 
 * Use este middleware em todas as rotas protegidas:
 * - /api/gifts/*
 * - /api/dashboard/*
 * - Qualquer endpoint de recurso premium
 */

export async function requireActiveSubscription(request: NextRequest): Promise<SubscriptionCheckResult> {
  const auth = await authMiddleware(request);
  
  if (!auth) {
    return { allowed: false, reason: 'NOT_AUTHENTICATED' };
  }

  const prisma = getPrisma();
  
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      plan: true,
      emailVerified: true,
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          endDate: true,
          startDate: true,
        },
      },
    },
  });

  if (!user) {
    return { allowed: false, reason: 'NOT_AUTHENTICATED' };
  }

  // Email deve estar verificado

  if (!user.emailVerified) {
    return { 
      allowed: false, 
      reason: 'EMAIL_NOT_VERIFIED',
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        emailVerified: user.emailVerified,
      },
    };
  }

  // Sem assinatura

  if (!user.subscription) {
    return { 
      allowed: false, 
      reason: 'NO_SUBSCRIPTION',
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        emailVerified: user.emailVerified,
      },
    };
  }

  const subscription = user.subscription;

  // Assinatura não ativa (PENDING, CANCELLED, REFUNDED, etc.)

  if (subscription.status !== 'ACTIVE') {
    return { 
      allowed: false, 
      reason: 'SUBSCRIPTION_INACTIVE',
      userId: user.id,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        endDate: subscription.endDate,
      },
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        emailVerified: user.emailVerified,
      },
    };
  }

  // Assinatura expirada (endDate ultrapassada)

  if (subscription.endDate && subscription.endDate < new Date()) {

    // Auto-expirar em background (fire and forget)

    expireSubscription(subscription.id, user.id).catch((err) => {
      console.error('[SUBSCRIPTION_EXPIRE_ERROR]', err);
    });

    return { 
      allowed: false, 
      reason: 'SUBSCRIPTION_EXPIRED',
      userId: user.id,
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: 'EXPIRED',
        endDate: subscription.endDate,
      },
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        emailVerified: user.emailVerified,
      },
    };
  }

  // Todas as verificações passaram!

  return { 
    allowed: true,
    userId: user.id,
    subscription: {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      endDate: subscription.endDate,
    },
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      emailVerified: user.emailVerified,
    },
  };
}

/**
 * Expirar assinatura e rebaixar usuário
 */

async function expireSubscription(subscriptionId: string, userId: string): Promise<void> {
  const prisma = getPrisma();
  
  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscriptionId },
      data: { 
        status: 'EXPIRED',
        autoRenew: false,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan: null },
    }),
  ]);

  console.log('[SUBSCRIPTION_EXPIRED]', { subscriptionId, userId });
}

/**
 * Revogar assinatura em caso de reembolso
 */

export async function revokeSubscriptionOnRefund(subscriptionId: string, userId: string): Promise<void> {
  const prisma = getPrisma();
  
  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscriptionId },
      data: { 
        status: 'REFUNDED',
        autoRenew: false,
        cancelledAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan: null },
    }),
  ]);

  console.log('[SUBSCRIPTION_REFUNDED]', { subscriptionId, userId });
}

/**
 * Helper para retornar resposta 403 padrão quando assinatura é requerida
 */

export function subscriptionRequiredResponse(result: SubscriptionCheckResult): NextResponse {
  const messages: Record<string, string> = {
    'NOT_AUTHENTICATED': 'Faça login para continuar',
    'NO_SUBSCRIPTION': 'Você precisa de uma assinatura ativa para acessar este recurso',
    'SUBSCRIPTION_INACTIVE': 'Sua assinatura não está ativa. Renove para continuar.',
    'SUBSCRIPTION_EXPIRED': 'Sua assinatura expirou. Renove para continuar.',
    'EMAIL_NOT_VERIFIED': 'Verifique seu email antes de continuar',
  };

  const statusCodes: Record<string, number> = {
    'NOT_AUTHENTICATED': 401,
    'EMAIL_NOT_VERIFIED': 403,
    'NO_SUBSCRIPTION': 403,
    'SUBSCRIPTION_INACTIVE': 403,
    'SUBSCRIPTION_EXPIRED': 403,
  };

  return NextResponse.json(
    { 
      error: messages[result.reason || 'NO_SUBSCRIPTION'],
      code: result.reason,
      requiresSubscription: true,
    },
    { status: statusCodes[result.reason || 'NO_SUBSCRIPTION'] }
  );
}

/**
 * Verificar se o usuário pode usar um recurso específico baseado no plano
 */

export function canUseFeature(plan: Plan | null, feature: string): boolean {
  if (!plan) return false;
  
  // Importar config de plano dinamicamente para evitar dependências circulares

  const { PLAN_CONFIG } = require('./plan-config');
  const config = PLAN_CONFIG[plan];
  
  if (!config) return false;
  
  const limits = config.limits;
  
  switch (feature) {
    case 'music':
      return limits.maxMusicPerGift !== 0;
    case 'customQRCode':
      return limits.customQRCode;
    case 'customDomain':
      return limits.customDomain;
    case 'premiumAnimations':
      return limits.premiumAnimations;
    case 'analytics':
      return limits.analytics;
    case 'prioritySupport':
      return limits.prioritySupport;
    default:
      return true;
  }
}
