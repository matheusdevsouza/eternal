import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * @api {post} /api/gifts/:id/publish Publicar Presente
 * 
 * Publica um presente tornando-o acessível publicamente.
 */

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Verificar propriedade do presente

    const gift = await prisma.gift.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        photos: true,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já está publicado

    if (gift.published) {
      return NextResponse.json(
        { error: 'Presente já está publicado' },
        { status: 400 }
      );
    }

    // Validar conteúdo mínimo do presente

    if (!gift.title || !gift.message) {
      return NextResponse.json(
        { error: 'Presente precisa ter título e mensagem para ser publicado' },
        { status: 400 }
      );
    }

    // Publicar presente

    const updatedGift = await prisma.gift.update({
      where: { id },
      data: {
        published: true,
        publishedAt: new Date(),
      },
    });

    // Log de publicação

    console.log('[GIFT_PUBLISHED]', id, auth.userId);

    // Retornar presente publicado

    return NextResponse.json({
      success: true,
      message: 'Presente publicado com sucesso!',
      gift: {
        id: updatedGift.id,
        slug: updatedGift.slug,
        published: updatedGift.published,
        publishedAt: updatedGift.publishedAt,
        publicUrl: `/g/${updatedGift.slug}`,
      },
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[PUBLISH_GIFT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao publicar presente' },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /api/gifts/:id/publish Despublicar Presente
 * 
 * Despublica um presente tornando-o privado novamente.
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

    // Verificar propriedade do presente

    const gift = await prisma.gift.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se está publicado

    if (!gift.published) {
      return NextResponse.json(
        { error: 'Presente não está publicado' },
        { status: 400 }
      );
    }

    // Despublicar presente

    const updatedGift = await prisma.gift.update({
      where: { id },
      data: {
        published: false,
      },
    });

    // Log de despublicação

    console.log('[GIFT_UNPUBLISHED]', id, auth.userId);

    // Retornar presente despublicado

    return NextResponse.json({
      success: true,
      message: 'Presente despublicado',
      gift: {
        id: updatedGift.id,
        published: updatedGift.published,
      },
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[UNPUBLISH_GIFT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao despublicar presente' },
      { status: 500 }
    );
  }
}
