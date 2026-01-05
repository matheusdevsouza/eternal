import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { rateLimitMiddleware } from '@/lib/middleware';
import { PLAN_CONFIG } from '@/lib/plan-config';
import { Plan } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/coupons/validate Validação de Cupom
 * 
 * Valida um código de cupom e retorna informações de desconto.
 */

export async function POST(request: NextRequest) {
  try {

    // Rate Limiting

    const rateLimitResponse = rateLimitMiddleware(request, 'validate-coupon', 10, 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const prisma = getPrisma();
    const body = await request.json();
    const { code, plan } = body;

    // Validação dos parâmetros obrigatórios

    if (!code || !plan) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Código do cupom e plano são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // Normalização do código

    const normalizedCode = code.toUpperCase().trim();

    // Buscar cupom no banco de dados

    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'Cupom não encontrado',
      });
    }

    // Verificar se o cupom está ativo

    if (!coupon.active) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupom não está mais ativo',
      });
    }

    // Verificar período de validade

    const now = new Date();
    if (coupon.validFrom > now) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupom ainda não está válido',
      });
    }

    // Verificar se o cupom expirou

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupom expirou',
      });
    }

    // Verificar limite de usos

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupom atingiu o limite de usos',
      });
    }

    // Verificar se o cupom se aplica ao plano selecionado

    if (coupon.validPlans.length > 0 && !coupon.validPlans.includes(plan as Plan)) {
      return NextResponse.json({
        valid: false,
        error: 'Este cupom não é válido para o plano selecionado',
      });
    }

    // Calcular desconto

    const planConfig = PLAN_CONFIG[plan as Plan];
    if (!planConfig) {
      return NextResponse.json({
        valid: false,
        error: 'Plano inválido',
      });
    }

    const originalPrice = planConfig.price;
    let discount = 0;

    // Aplicar tipo de desconto (percentual ou valor fixo)

    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.floor(originalPrice * (coupon.discountValue / 100));
    } else {
      discount = coupon.discountValue;
    }

    // Verificar valor mínimo de compra

    if (coupon.minPurchase && originalPrice < coupon.minPurchase) {
      return NextResponse.json({
        valid: false,
        error: `Valor mínimo de compra: R$ ${(coupon.minPurchase / 100).toFixed(2)}`,
      });
    }

    // Calcular preço final

    const finalPrice = Math.max(0, originalPrice - discount);

    // Retornar dados do cupom validado

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      originalPrice,
      discount,
      finalPrice,
      discountDisplay: coupon.discountType === 'PERCENTAGE' 
        ? `${coupon.discountValue}% off`
        : `R$ ${(coupon.discountValue / 100).toFixed(2)} off`,
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[VALIDATE_COUPON_ERROR]', error);
    return NextResponse.json(
      { valid: false, error: 'Erro ao validar cupom' },
      { status: 500 }
    );
  }
}
