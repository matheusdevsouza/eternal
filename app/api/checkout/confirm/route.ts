import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware, rateLimitMiddleware } from '@/lib/middleware';
import { getPaymentGateway } from '@/lib/payment-gateway';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import { logAuditEvent, AuditAction } from '@/lib/audit';
import { syncUserPlan } from '@/lib/subscription-service';
import { PLAN_CONFIG } from '@/lib/plan-config';
import { Plan } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/checkout/confirm Confirmação de Pagamento
 * 
 * Confirma um pagamento e ativa a assinatura do usuário.
 * 
 * NOTAS DE SEGURANÇA:
 * - Utiliza targetPlan do banco de dados, NÃO da resposta do gateway
 * - Verifica idempotência para prevenir processamento duplicado
 * - Utiliza transação do banco de dados para atomicidade
 * - Valida que o pagamento pertence ao usuário autenticado
 */

export async function POST(request: NextRequest) {
  try {

    // Rate Limiting

    const rateLimitResponse = rateLimitMiddleware(request, 'checkout-confirm', 10, 60 * 1000);
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
    const body = await request.json();
    const { paymentId, gatewayId, cardData } = body;

    // Validação dos parâmetros obrigatórios

    if (!paymentId && !gatewayId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar pagamento - DEVE pertencer ao usuário autenticado
    // CRÍTICO: Verificação de propriedade

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: paymentId },
          { gatewayId: gatewayId },
        ],
        userId: auth.userId,
      },
      include: {
        user: true,
        coupon: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Verificação de idempotência: pagamento já processado

    if (payment.status === 'COMPLETED') {
      console.log('[PAYMENT_ALREADY_PROCESSED]', payment.id);
      return NextResponse.json({
        success: true,
        message: 'Pagamento já processado anteriormente',
        alreadyProcessed: true,
      });
    }

    // Validar status do pagamento

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Pagamento não pode ser confirmado. Status: ${payment.status}` },
        { status: 400 }
      );
    }

    // CRÍTICO: Obter plano do registro no banco de dados, NÃO do gateway

    const targetPlan = payment.targetPlan;
    if (!targetPlan) {
      console.error('[PAYMENT_NO_TARGET_PLAN]', payment.id);
      return NextResponse.json(
        { error: 'Pagamento inválido: plano não especificado' },
        { status: 400 }
      );
    }

    // Confirmar pagamento no gateway

    const gateway = getPaymentGateway();
    const confirmedPayment = await gateway.confirmPayment(payment.gatewayId!, cardData);

    // Tratamento de pagamento recusado

    if (confirmedPayment.status === 'failed') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'FAILED',
          processedAt: new Date(),
        },
      });

      console.log('[PAYMENT_FAILED]', payment.id);

      return NextResponse.json({
        success: false,
        error: 'Pagamento recusado. Verifique os dados e tente novamente.',
      });
    }

    // Tratamento de pagamento confirmado

    if (confirmedPayment.status === 'completed') {

      // Usar targetPlan do banco de dados (fonte da verdade)

      const plan = targetPlan;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Transação atômica para garantir consistência

      const result = await prisma.$transaction(async (tx) => {

        // Atualizar status do pagamento

        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: { 
            status: 'COMPLETED',
            processedAt: new Date(),
            gatewayResponse: confirmedPayment as any,
          },
        });

        // Incrementar uso do cupom

        if (payment.couponId) {
          await tx.coupon.update({
            where: { id: payment.couponId },
            data: { usedCount: { increment: 1 } },
          });
        }

        // Criar ou atualizar assinatura

        const subscription = await tx.subscription.upsert({
          where: { userId: auth.userId },
          create: {
            userId: auth.userId,
            plan,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate,
            autoRenew: true,
          },
          update: {
            plan,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate,
            autoRenew: true,
            cancelledAt: null,
          },
        });

        // Atualizar plano do usuário (desnormalizado para performance)

        await tx.user.update({
          where: { id: auth.userId },
          data: { plan },
        });

        // Vincular pagamento à assinatura

        await tx.payment.update({
          where: { id: payment.id },
          data: { subscriptionId: subscription.id },
        });

        return { subscription, payment: updatedPayment };
      });

      // Registro de evento de auditoria (não-bloqueante)

      logAuditEvent(auth.userId, AuditAction.PROFILE_UPDATE, request, {
        action: 'subscription_activated',
        plan,
        paymentId: payment.id,
        amount: payment.amount,
      }).catch(err => console.error('[AUDIT_LOG_ERROR]', err));

      // Envio de email de confirmação (não-bloqueante)

      const planConfig = PLAN_CONFIG[plan];
      sendPaymentConfirmationEmail(
        payment.user.email,
        payment.user.name || 'Usuário',
        planConfig.displayName,
        payment.amount
      ).catch(err => console.error('[EMAIL_ERROR]', err));

      // Log de assinatura ativada

      console.log('[SUBSCRIPTION_ACTIVATED]', {
        userId: auth.userId,
        plan,
        paymentId: payment.id,
        subscriptionId: result.subscription.id,
      });

      // Retornar dados da assinatura

      return NextResponse.json({
        success: true,
        message: 'Pagamento confirmado! Sua assinatura está ativa.',
        subscription: {
          id: result.subscription.id,
          plan: result.subscription.plan,
          status: result.subscription.status,
          startDate: result.subscription.startDate,
          endDate: result.subscription.endDate,
        },
      });
    }

    // Pagamento ainda em processamento

    return NextResponse.json({
      success: true,
      status: 'processing',
      message: 'Pagamento em processamento. Você será notificado quando confirmado.',
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[CHECKOUT_CONFIRM_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar pagamento' },
      { status: 500 }
    );
  }
}
