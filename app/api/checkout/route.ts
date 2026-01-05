import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware, rateLimitMiddleware } from '@/lib/middleware';
import { PLAN_CONFIG } from '@/lib/plan-config';
import { getPaymentGateway } from '@/lib/payment-gateway';
import { Plan } from '@prisma/client';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Geração de Chave de Idempotência
 * 
 * Gera uma chave única baseada no usuário, plano e timestamp.
 * Previne duplicações de pagamento numa janela de 1 minuto.
 */

function generateIdempotencyKey(userId: string, plan: string): string {
  const timestamp = Math.floor(Date.now() / 60000);
  return crypto
    .createHash('sha256')
    .update(`${userId}:${plan}:${timestamp}`)
    .digest('hex');
}

/**
 * @api {post} /api/checkout Criação de Sessão de Checkout
 * 
 * Cria uma nova sessão de checkout para compra de assinatura.
 * 
 * NOTAS DE SEGURANÇA:
 * - Armazena targetPlan no banco de dados (fonte da verdade)
 * - Gera chave de idempotência para prevenir duplicatas
 * - Valida se o usuário possui sessão ativa
 */

export async function POST(request: NextRequest) {
  try {

    // Rate Limiting

    const rateLimitResponse = rateLimitMiddleware(request, 'checkout', 5, 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    // Autenticação

    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Faça login para continuar' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();
    const body = await request.json();
    const { plan, paymentMethod, couponCode } = body;

    // Validação do plano - abordagem whitelist

    const validPlans: Plan[] = ['START', 'PREMIUM', 'ETERNAL'];
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Validação do método de pagamento - abordagem whitelist

    const validMethods = ['credit_card', 'pix', 'boleto'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      );
    }

    // Buscar usuário com assinaturas

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se usuário já possui assinatura ativa para o mesmo plano ou superior

    if (user.subscription && user.subscription.status === 'ACTIVE') {
      const planOrder: Plan[] = ['START', 'PREMIUM', 'ETERNAL'];
      const currentPlanIndex = planOrder.indexOf(user.subscription.plan);
      const newPlanIndex = planOrder.indexOf(plan);
      
      if (newPlanIndex <= currentPlanIndex) {
        return NextResponse.json(
          { error: 'Você já possui este plano ou superior' },
          { status: 400 }
        );
      }
    }

    // Verificar pagamento pendente existente (idempotência)

    const idempotencyKey = generateIdempotencyKey(auth.userId, plan);
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: auth.userId,
        status: 'PENDING',
        targetPlan: plan,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    // Retornar sessão de checkout existente se houver

    if (existingPayment) {
      return NextResponse.json({
        success: true,
        checkout: {
          paymentId: existingPayment.id,
          gatewayId: existingPayment.gatewayId,
          amount: existingPayment.amount,
          plan,
          isExisting: true,
        },
      });
    }

    // Calcular preço a partir de fonte confiável

    const planConfig = PLAN_CONFIG[plan as Plan];
    let originalPrice = planConfig.price;
    let discount = 0;
    let couponId: string | null = null;

    // Aplicar cupom se fornecido

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.active) {
        const now = new Date();
        const isValid = 
          coupon.validFrom <= now &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
          (coupon.validPlans.length === 0 || coupon.validPlans.includes(plan as Plan));

        if (isValid) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.floor(originalPrice * (coupon.discountValue / 100));
          } else {
            discount = coupon.discountValue;
          }
          couponId = coupon.id;
        }
      }
    }

    const finalAmount = Math.max(0, originalPrice - discount);

    // Criar intenção de pagamento no gateway

    const gateway = getPaymentGateway();
    const paymentIntent = await gateway.createPaymentIntent({
      amount: finalAmount,
      currency: 'BRL',
      method: paymentMethod,
      customerEmail: user.email,
      customerName: user.name || undefined,
      description: `Assinatura ${planConfig.displayName} - Eternal Gift`,
      metadata: {
        userId: user.id,
        plan,
        couponId,
      },
    });

    // Criar registro de pagamento pendente COM targetPlan (fonte da verdade)
    // CRÍTICO: Armazenar plano no banco de dados, NÃO nos metadados do gateway

    const payment = await prisma.payment.create({
      data: {
        amount: finalAmount,
        currency: 'BRL',
        status: 'PENDING',
        method: paymentMethod,
        gatewayId: paymentIntent.id,
        description: `Assinatura ${planConfig.displayName}`,
        targetPlan: plan as Plan,
        idempotencyKey,
        userId: user.id,
        couponId,
      },
    });

    // Log de checkout criado

    console.log('[CHECKOUT_CREATED]', {
      paymentId: payment.id,
      userId: user.id,
      plan,
      amount: finalAmount,
    });

    // Retornar dados do checkout

    return NextResponse.json({
      success: true,
      checkout: {
        paymentId: payment.id,
        gatewayId: paymentIntent.id,
        clientSecret: paymentIntent.clientSecret,
        amount: finalAmount,
        originalAmount: originalPrice,
        discount,
        currency: 'BRL',
        plan,
        planName: planConfig.displayName,
        paymentMethod,
        pixQRCode: paymentIntent.pixQRCode,
        pixCode: paymentIntent.pixCode,
        boletoUrl: paymentIntent.boletoUrl,
        boletoCode: paymentIntent.boletoCode,
        expiresAt: paymentIntent.expiresAt,
      },
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[CHECKOUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao processar checkout' },
      { status: 500 }
    );
  }
}
