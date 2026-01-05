import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware';
import { getEffectivePlan } from '@/lib/subscription-service';
import { PLAN_CONFIG } from '@/lib/plan-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {get} /api/user Obter Usuário Atual
 * @description Retorna o perfil e informações de assinatura do usuário autenticado
 * 
 * CRÍTICO: Usa getEffectivePlan() como a ÚNICA FONTE DE VERDADE para o status do plano.
 * O plano efetivo retornado é validado no servidor e não pode ser manipulado pelo cliente.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();
    
    // Buscar informações básicas do usuário
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        emailVerified: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            startDate: true,
            endDate: true,
            autoRenew: true,
            cancelledAt: true,
          },
        },
        _count: {
          select: {
            gifts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // CRÍTICO: Obter plano efetivo validado pelo servidor
    // Esta é a ÚNICA FONTE DE VERDADE para exibição do plano
    const effective = await getEffectivePlan(auth.userId);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        totalGifts: user._count.gifts,
        // Dados do plano validados pelo servidor - não podem ser manipulados pelo cliente
        effectivePlan: {
          plan: effective.plan,
          displayName: effective.plan ? PLAN_CONFIG[effective.plan].displayName : null,
          isActive: effective.isActive,
          reason: effective.reason,
          expiresAt: effective.expiresAt,
        }
      },
    });
  } catch (error) {
    console.error('[GET_USER_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

/**
 * @api {put} /api/user Atualizar Perfil do Usuário
 * @description Atualiza o perfil do usuário autenticado
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();
    const body = await request.json();
    const { name } = body;

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        name: name?.trim().substring(0, 100) || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: updatedUser,
    });
  } catch (error) {
    console.error('[UPDATE_USER_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
