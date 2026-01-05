import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {get} /api/subscription Buscar Assinatura Atual
 * 
 * Retorna os detalhes da assinatura atual do usuário.
 */

export async function GET(request: NextRequest) {
  try {

    // Autenticação

    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();

    // Buscar assinatura com histórico de pagamentos
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: auth.userId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
            createdAt: true,
          },
        },
      },
    });

    // Buscar plano atual do usuário

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { plan: true },
    });

    // Retornar dados da assinatura

    return NextResponse.json({
      success: true,
      subscription,
      currentPlan: user?.plan || 'START',
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[GET_SUBSCRIPTION_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar assinatura' },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /api/subscription Cancelar Assinatura
 * 
 * Cancela a assinatura atual do usuário.
 */

export async function DELETE(request: NextRequest) {
  try {

    // Autenticação

    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();

    // Buscar assinatura
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: auth.userId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já está cancelada

    if (subscription.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Assinatura já foi cancelada' },
        { status: 400 }
      );
    }

    // Atualizar status da assinatura

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        autoRenew: false,
      },
    });

    // Nota: Rebaixar usuário para plano START ao fim do período de cobrança
    // Por enquanto, mantemos o plano atual até a data de término
    
    // Log de cancelamento

    console.log('[SUBSCRIPTION_CANCELLED]', auth.userId);

    // Retornar confirmação

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso. Você terá acesso até o fim do período atual.',
      subscription: updatedSubscription,
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[CANCEL_SUBSCRIPTION_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
