import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware';
import { sanitizeInput } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * @api {get} /api/gifts/:id Buscar Presente por ID
 * 
 * Retorna um presente específico com todas as mídias.
 */

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Autenticação

    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();

    // Buscar presente com verificação de propriedade

    const gift = await prisma.gift.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        musics: {
          orderBy: { order: 'asc' },
        },
        qrCode: true,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // Retornar presente

    return NextResponse.json({
      success: true,
      gift,
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[GET_GIFT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar presente' },
      { status: 500 }
    );
  }
}

/**
 * @api {put} /api/gifts/:id Atualizar Presente
 * 
 * Atualiza um presente específico do usuário.
 */

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    // Verificar propriedade

    const existing = await prisma.gift.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // Construir dados de atualização

    const updateData: any = {};
    
    if (body.title !== undefined) {
      updateData.title = sanitizeInput(body.title).substring(0, 100);
    }
    if (body.message !== undefined) {
      updateData.message = sanitizeInput(body.message).substring(0, 10000);
    }
    if (body.recipientName !== undefined) {
      updateData.recipientName = body.recipientName 
        ? sanitizeInput(body.recipientName).substring(0, 100) 
        : null;
    }
    if (body.theme !== undefined) {
      updateData.theme = body.theme;
    }
    if (body.font !== undefined) {
      updateData.font = body.font;
    }
    if (body.animation !== undefined) {
      updateData.animation = body.animation;
    }
    if (body.backgroundColor !== undefined) {
      updateData.backgroundColor = body.backgroundColor;
    }
    if (body.textColor !== undefined) {
      updateData.textColor = body.textColor;
    }
    if (body.content !== undefined) {
      updateData.content = body.content;
    }

    // Atualizar presente

    const gift = await prisma.gift.update({
      where: { id },
      data: updateData,
    });

    // Retornar presente atualizado

    return NextResponse.json({
      success: true,
      message: 'Presente atualizado com sucesso',
      gift,
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[UPDATE_GIFT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar presente' },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /api/gifts/:id Excluir Presente
 * 
 * Exclui um presente específico e todas as mídias relacionadas.
 */

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Autenticação

    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();

    // Verificar propriedade

    const existing = await prisma.gift.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // Excluir presente (cascata para fotos, músicas, qrcode)

    await prisma.gift.delete({
      where: { id },
    });

    // Log de exclusão

    console.log('[GIFT_DELETED]', id, auth.userId);

    // Retornar sucesso

    return NextResponse.json({
      success: true,
      message: 'Presente excluído com sucesso',
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[DELETE_GIFT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao excluir presente' },
      { status: 500 }
    );
  }
}
