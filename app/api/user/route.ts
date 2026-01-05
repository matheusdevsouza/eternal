import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {get} /api/user Get Current User
 * @description Returns the authenticated user's profile and subscription info
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

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        totalGifts: user._count.gifts,
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
 * @api {put} /api/user Update User Profile
 * @description Updates the authenticated user's profile
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
