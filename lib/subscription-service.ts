/**
 * Serviço de Validação de Assinatura e Plano
 * 
 * Esta é a ÚNICA FONTE DA VERDADE para determinar o plano efetivo do usuário.
 * Todas as verificações de limite de plano DEVEM passar por este serviço.
 * 
 * REGRA CRÍTICA: SEM PAGAMENTO = SEM ACESSO
 * Usuários sem assinaturas ativas não podem usar nenhum recurso.
 */

import { getPrisma } from '@/lib/prisma';
import { Plan, SubscriptionStatus } from '@prisma/client';
import { PLAN_CONFIG, PlanLimits } from './plan-config';

/**
 * Interface de Resultado do Plano Efetivo
 */

export interface EffectivePlanResult {
  plan: Plan | null;
  limits: PlanLimits | null;
  isActive: boolean;
  hasSubscription: boolean;
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  expiresAt: Date | null;
  reason?: 'NO_SUBSCRIPTION' | 'SUBSCRIPTION_INACTIVE' | 'SUBSCRIPTION_EXPIRED' | 'ACTIVE';
}

/**
 * Obter o plano efetivo do usuário baseado em sua assinatura ATIVA.
 * 
 * Esta é a ÚNICA função que deve ser usada para determinar níveis de acesso.
 * 
 * REGRAS (ESTRITAS):
 * 1. Se usuário não tem assinatura -> SEM ACESSO (plano null)
 * 2. Se status da assinatura !== ACTIVE -> SEM ACESSO (plano null)
 * 3. Se subscription.endDate < agora -> SEM ACESSO (expirado)
 * 4. Caso contrário -> subscription.plan com acesso total
 */

export async function getEffectivePlan(userId: string): Promise<EffectivePlanResult> {
  const prisma = getPrisma();
  
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      id: true,
      plan: true,
      status: true,
      endDate: true,
    },
  });

  // SEM ASSINATURA = SEM ACESSO

  if (!subscription) {
    return {
      plan: null,
      limits: null,
      isActive: false,
      hasSubscription: false,
      subscriptionId: null,
      subscriptionStatus: null,
      expiresAt: null,
      reason: 'NO_SUBSCRIPTION',
    };
  }

  const now = new Date();

  // ASSINATURA NÃO ATIVA = SEM ACESSO

  if (subscription.status !== 'ACTIVE') {
    return {
      plan: null,
      limits: null,
      isActive: false,
      hasSubscription: true,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      expiresAt: subscription.endDate,
      reason: 'SUBSCRIPTION_INACTIVE',
    };
  }

  // ASSINATURA EXPIRADA = SEM ACESSO

  if (subscription.endDate && subscription.endDate < now) {

    // Auto-expirar em background (fire and forget)

    expireSubscriptionInternal(subscription.id, userId).catch(err => 
      console.error('[SUBSCRIPTION_EXPIRE_ERROR]', err)
    );

    return {
      plan: null,
      limits: null,
      isActive: false,
      hasSubscription: true,
      subscriptionId: subscription.id,
      subscriptionStatus: 'EXPIRED',
      expiresAt: subscription.endDate,
      reason: 'SUBSCRIPTION_EXPIRED',
    };
  }

  // ASSINATURA ATIVA VÁLIDA = ACESSO TOTAL

  return {
    plan: subscription.plan,
    limits: PLAN_CONFIG[subscription.plan].limits,
    isActive: true,
    hasSubscription: true,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    expiresAt: subscription.endDate,
    reason: 'ACTIVE',
  };
}

/**
 * Interno: Expirar assinatura e remover plano do usuário
 */

async function expireSubscriptionInternal(subscriptionId: string, userId: string): Promise<void> {
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
 * Verificar se o usuário pode adicionar mais fotos a um presente
 * 
 * REQUER ASSINATURA ATIVA
 */

export async function canUserAddPhoto(userId: string, currentPhotoCount: number): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  requiresUpgrade: boolean;
  requiresSubscription: boolean;
}> {
  const effective = await getEffectivePlan(userId);

  // Sem assinatura ativa = sem acesso

  if (!effective.isActive || !effective.limits) {
    return { 
      allowed: false, 
      limit: 0, 
      remaining: 0, 
      requiresUpgrade: false,
      requiresSubscription: true,
    };
  }
  
  const max = effective.limits.maxPhotosPerGift;
  
  if (max === -1) {
    return { allowed: true, limit: -1, remaining: -1, requiresUpgrade: false, requiresSubscription: false };
  }
  
  const remaining = Math.max(0, max - currentPhotoCount);
  return {
    allowed: currentPhotoCount < max,
    limit: max,
    remaining,
    requiresUpgrade: currentPhotoCount >= max,
    requiresSubscription: false,
  };
}

/**
 * Verificar se o usuário pode adicionar mais músicas a um presente
 * 
 * REQUER ASSINATURA ATIVA
 */

export async function canUserAddMusic(userId: string, currentMusicCount: number): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  requiresUpgrade: boolean;
  featureAvailable: boolean;
  requiresSubscription: boolean;
}> {
  const effective = await getEffectivePlan(userId);

  // Sem assinatura ativa = sem acesso

  if (!effective.isActive || !effective.limits) {
    return { 
      allowed: false, 
      limit: 0, 
      remaining: 0, 
      requiresUpgrade: false,
      featureAvailable: false,
      requiresSubscription: true,
    };
  }
  
  const max = effective.limits.maxMusicPerGift;

  // Música não disponível para este plano

  if (max === 0) {
    return { 
      allowed: false, 
      limit: 0, 
      remaining: 0, 
      requiresUpgrade: true,
      featureAvailable: false,
      requiresSubscription: false,
    };
  }
  
  if (max === -1) {
    return { allowed: true, limit: -1, remaining: -1, requiresUpgrade: false, featureAvailable: true, requiresSubscription: false };
  }
  
  const remaining = Math.max(0, max - currentMusicCount);
  return {
    allowed: currentMusicCount < max,
    limit: max,
    remaining,
    requiresUpgrade: currentMusicCount >= max,
    featureAvailable: true,
    requiresSubscription: false,
  };
}

/**
 * Verificar se o usuário pode criar mais presentes
 * 
 * REQUER ASSINATURA ATIVA
 */

export async function canUserCreateGift(userId: string): Promise<{
  allowed: boolean;
  limit: number;
  currentCount: number;
  remaining: number;
  requiresSubscription: boolean;
  reason?: string;
}> {
  const prisma = getPrisma();
  const effective = await getEffectivePlan(userId);

  // SEM ASSINATURA ATIVA = NÃO PODE CRIAR

  if (!effective.isActive || !effective.limits) {
    return { 
      allowed: false, 
      limit: 0, 
      currentCount: 0, 
      remaining: 0,
      requiresSubscription: true,
      reason: effective.reason,
    };
  }
  
  const max = effective.limits.maxGifts;
  
  if (max === -1) {
    return { allowed: true, limit: -1, currentCount: 0, remaining: -1, requiresSubscription: false };
  }
  
  const currentCount = await prisma.gift.count({ where: { userId } });
  const remaining = Math.max(0, max - currentCount);
  
  return {
    allowed: currentCount < max,
    limit: max,
    currentCount,
    remaining,
    requiresSubscription: false,
  };
}

/**
 * Verificar se o usuário tem acesso a um recurso premium
 * 
 * REQUER ASSINATURA ATIVA
 */

export async function hasFeatureAccess(userId: string, feature: keyof PlanLimits): Promise<boolean> {
  const effective = await getEffectivePlan(userId);
  
  if (!effective.isActive || !effective.limits) {
    return false;
  }
  
  const value = effective.limits[feature];
  
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return false;
}

/**
 * Verificar se a assinatura é válida para uma ação de plano específica
 * 
 * Use antes de qualquer operação premium.
 */

export async function validatePlanAccess(userId: string, requiredPlan: Plan): Promise<{
  hasAccess: boolean;
  currentPlan: Plan | null;
  message: string;
  requiresSubscription: boolean;
}> {
  const effective = await getEffectivePlan(userId);

  // Sem assinatura ativa

  if (!effective.isActive || !effective.plan) {
    return { 
      hasAccess: false, 
      currentPlan: null, 
      message: 'Você precisa de uma assinatura ativa para acessar este recurso',
      requiresSubscription: true,
    };
  }
  
  const planOrder: Plan[] = ['START', 'PREMIUM', 'ETERNAL'];
  
  const currentIndex = planOrder.indexOf(effective.plan);
  const requiredIndex = planOrder.indexOf(requiredPlan);
  
  if (currentIndex >= requiredIndex) {
    return { hasAccess: true, currentPlan: effective.plan, message: 'Acesso concedido', requiresSubscription: false };
  }
  
  return {
    hasAccess: false,
    currentPlan: effective.plan,
    message: `Este recurso requer o plano ${requiredPlan} ou superior`,
    requiresSubscription: false,
  };
}

/**
 * Sincronizar campo user.plan com a assinatura (para desnormalização)
 * 
 * Deve ser chamado após mudanças na assinatura.
 */

export async function syncUserPlan(userId: string): Promise<void> {
  const prisma = getPrisma();
  const effective = await getEffectivePlan(userId);
  
  await prisma.user.update({
    where: { id: userId },
    data: { plan: effective.plan },
  });
}

/**
 * Expirar todas as assinaturas que ultrapassaram seu endDate
 * 
 * Chamado pelo cron job.
 */

export async function expireOverdueSubscriptions(): Promise<{ expired: number }> {
  const prisma = getPrisma();
  const now = new Date();

  // Encontrar todas as assinaturas ATIVAS que ultrapassaram seu endDate

  const overdueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
    },
    select: {
      id: true,
      userId: true,
    },
  });
  
  if (overdueSubscriptions.length === 0) {
    return { expired: 0 };
  }

  // Expirar cada assinatura

  for (const sub of overdueSubscriptions) {
    try {
      await expireSubscriptionInternal(sub.id, sub.userId);
    } catch (err) {
      console.error('[EXPIRE_SUBSCRIPTION_ERROR]', sub.id, err);
    }
  }
  
  console.log(`[CRON_EXPIRE] ${overdueSubscriptions.length} assinaturas expiradas`);
  
  return { expired: overdueSubscriptions.length };
}
