import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware, rateLimitMiddleware } from '@/lib/middleware';
import { sendSubscriptionCancelledEmail } from '@/lib/email';
import { logAuditEvent, AuditAction } from '@/lib/audit';
import { syncUserPlan } from '@/lib/subscription-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/subscription/cancel Cancel Subscription
 * 
 * Cancela a renovação automática da assinatura do usuário.
 * 
 * COMPORTAMENTO:
 * - Mantém status ACTIVE até endDate
 * - Define autoRenew = false
 * - Define cancelledAt = now
 * - Envia email de confirmação com data final de acesso
 * 
 * O usuário continua tendo acesso total até o fim do período pago.
 */

export async function POST(request: NextRequest) {
  try {

    // Rate Limiting

    const rateLimitResponse = rateLimitMiddleware(request, 'subscription-cancel', 5, 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    // Autenticação

    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();

    // Buscar assinatura do usuário - DEVE pertencer ao usuário autenticado

    const subscription = await prisma.subscription.findUnique({
      where: { userId: auth.userId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Verificar se usuário possui assinatura

    if (!subscription) {
      return NextResponse.json(
        { error: 'Você não possui uma assinatura ativa' },
        { status: 404 }
      );
    }

    // Verificar se assinatura já está expirada ou cancelada

    if (subscription.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Sua assinatura já expirou' },
        { status: 400 }
      );
    }

    // Verificar se já foi cancelada (autoRenew = false)

    if (!subscription.autoRenew || subscription.cancelledAt) {
      return NextResponse.json({
        success: true,
        message: 'Sua assinatura já foi cancelada anteriormente',
        alreadyCancelled: true,
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          endDate: subscription.endDate,
          cancelledAt: subscription.cancelledAt,
        },
      });
    }

    // Cancelar renovação automática
    // Mantém status ACTIVE - usuário tem acesso até endDate

    const now = new Date();

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        autoRenew: false,
        cancelledAt: now,
        // NÃO altera status - permanece ACTIVE até endDate
      },
    });

    // Registro de evento de auditoria (não-bloqueante)

    logAuditEvent(auth.userId, AuditAction.PROFILE_UPDATE, request, {
      action: 'subscription_cancelled',
      plan: subscription.plan,
      endDate: subscription.endDate,
    }).catch(err => console.error('[AUDIT_LOG_ERROR]', err));

    // Envio de email de confirmação (não-bloqueante)

    if (subscription.endDate) {
      sendSubscriptionCancelledEmail(
        subscription.user.email,
        subscription.user.name || 'User',
        subscription.endDate
      ).catch(err => console.error('[EMAIL_ERROR]', err));
    }

    // Log de cancelamento

    console.log('[SUBSCRIPTION_CANCELLED]', {
      userId: auth.userId,
      subscriptionId: subscription.id,
      plan: subscription.plan,
      endDate: subscription.endDate,
    });

    // Retornar confirmação

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso. Você terá acesso até o fim do período pago.',
      subscription: {
        id: updatedSubscription.id,
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        endDate: updatedSubscription.endDate,
        cancelledAt: updatedSubscription.cancelledAt,
        autoRenew: updatedSubscription.autoRenew,
      },
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[SUBSCRIPTION_CANCEL_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
