import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * @api {get} /api/public/gifts/:slug Buscar Presente Público
 * 
 * Retorna um presente publicado para visualização pública (sem autenticação).
 */

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const prisma = getPrisma();

    // Buscar presente com mídias

    const gift = await prisma.gift.findUnique({
      where: { slug },
      include: {
        photos: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            url: true,
            caption: true,
            order: true,
          },
        },
        musics: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            artist: true,
            url: true,
            duration: true,
          },
        },
        user: {
          select: {
            name: true,
            plan: true,
          },
        },
      },
    });

    // Verificar se presente existe

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se presente está publicado

    if (!gift.published) {
      return NextResponse.json(
        { error: 'Este presente não está disponível' },
        { status: 403 }
      );
    }

    // Incrementar contador de visualizações (assíncrono, não aguarda)

    prisma.gift.update({
      where: { id: gift.id },
      data: { views: { increment: 1 } },
    }).catch(err => console.error('[VIEW_INCREMENT_ERROR]', err));

    // Retornar dados do presente sem informações sensíveis

    return NextResponse.json({
      success: true,
      gift: {
        id: gift.id,
        slug: gift.slug,
        title: gift.title,
        message: gift.message,
        recipientName: gift.recipientName,
        theme: gift.theme,
        font: gift.font,
        animation: gift.animation,
        backgroundColor: gift.backgroundColor,
        textColor: gift.textColor,
        views: gift.views + 1,
        publishedAt: gift.publishedAt,
        photos: gift.photos,
        musics: gift.musics,
        creatorName: gift.user.name,
        isPremium: gift.user.plan !== 'START',
      },
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[GET_PUBLIC_GIFT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao buscar presente' },
      { status: 500 }
    );
  }
}
