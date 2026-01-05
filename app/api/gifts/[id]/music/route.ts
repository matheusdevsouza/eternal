import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware, rateLimitMiddleware } from '@/lib/middleware';
import { canUserAddMusic, getEffectivePlan } from '@/lib/subscription-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Padrões de URL permitidos para músicas

const ALLOWED_URL_PATTERNS = [
  /^https:\/\//i,
];

// Padrões de URL bloqueados

const BLOCKED_URL_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^file:/i,
  /^blob:/i,
];

/**
 * Validação de URL de Música
 * 
 * Valida se a URL da música é segura (HTTPS).
 */

function isValidMusicUrl(url: string): boolean {

  // Verificar padrões bloqueados

  for (const pattern of BLOCKED_URL_PATTERNS) {
    if (pattern.test(url)) return false;
  }
  
  // Verificar se pelo menos um padrão permitido corresponde

  for (const pattern of ALLOWED_URL_PATTERNS) {
    if (pattern.test(url)) return true;
  }
  
  return false;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * @api {get} /api/gifts/:id/music Listar Músicas do Presente
 * 
 * Retorna todas as músicas de um presente específico.
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

    // Verificar propriedade do presente

    const gift = await prisma.gift.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        musics: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // Obter limites do plano efetivo

    const effective = await getEffectivePlan(auth.userId);

    // Retornar lista de músicas

    return NextResponse.json({
      success: true,
      musics: gift.musics,
      limit: effective.limits?.maxMusicPerGift ?? 0,
      remaining: !effective.limits || effective.limits.maxMusicPerGift === -1 
        ? -1 
        : Math.max(0, effective.limits.maxMusicPerGift - gift.musics.length),
      canAddMusic: effective.limits?.maxMusicPerGift !== 0,
      planStatus: {
        isActive: effective.isActive,
        plan: effective.plan,
      },
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[LIST_MUSIC_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao listar músicas' },
      { status: 500 }
    );
  }
}

/**
 * @api {post} /api/gifts/:id/music Adicionar Música
 * 
 * Adiciona uma música ao presente.
 * 
 * SEGURANÇA:
 * - Valida status da assinatura (não apenas o plano)
 * - Valida formato da URL (apenas HTTPS)
 * - Rate limited
 */

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Rate Limiting

    const rateLimitResponse = rateLimitMiddleware(request, `add-music-${id}`, 10, 60 * 1000);
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
    const { name, artist, url, duration } = body;

    // Validação dos campos obrigatórios

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Nome e URL da música são obrigatórios' },
        { status: 400 }
      );
    }

    // SEGURANÇA: Validar formato da URL

    if (!isValidMusicUrl(url)) {
      return NextResponse.json(
        { error: 'URL inválida. Use apenas URLs HTTPS.' },
        { status: 400 }
      );
    }

    // Verificar propriedade e obter contagem atual de músicas

    const gift = await prisma.gift.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        musics: true,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // SEGURANÇA: Verificar limites do plano usando serviço de assinatura

    const canAdd = await canUserAddMusic(auth.userId, gift.musics.length);

    // Plano não inclui músicas
    
    if (!canAdd.featureAvailable) {
      return NextResponse.json(
        { 
          error: 'Seu plano não inclui músicas. Faça upgrade para adicionar músicas.',
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // Limite de músicas atingido

    if (!canAdd.allowed) {
      return NextResponse.json(
        { 
          error: `Limite de ${canAdd.limit} música(s) atingido para seu plano`,
          upgrade: true,
          limit: canAdd.limit,
          remaining: canAdd.remaining,
        },
        { status: 403 }
      );
    }

    // Calcular próxima ordem

    const maxOrder = gift.musics.reduce((max, m) => Math.max(max, m.order), -1);

    // Criar música no banco de dados

    const music = await prisma.music.create({
      data: {
        name: name.substring(0, 200),
        artist: artist?.substring(0, 200) || null,
        url,
        duration: duration || null,
        order: maxOrder + 1,
        giftId: id,
      },
    });

    // Log de criação

    console.log('[MUSIC_ADDED]', { giftId: id, musicId: music.id, userId: auth.userId });

    // Retornar música criada

    return NextResponse.json({
      success: true,
      message: 'Música adicionada com sucesso',
      music,
      remaining: canAdd.remaining - 1,
    }, { status: 201 });

  } catch (error) {

    // Tratamento de erro

    console.error('[ADD_MUSIC_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar música' },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /api/gifts/:id/music Remover Música
 * 
 * Remove uma música do presente.
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
    const { searchParams } = new URL(request.url);
    const musicId = searchParams.get('musicId');

    // Validação do parâmetro obrigatório

    if (!musicId) {
      return NextResponse.json(
        { error: 'ID da música é obrigatório' },
        { status: 400 }
      );
    }

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

    // Excluir música

    const deleteResult = await prisma.music.deleteMany({
      where: {
        id: musicId,
        giftId: id,
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { error: 'Música não encontrada' },
        { status: 404 }
      );
    }

    // Log de exclusão

    console.log('[MUSIC_DELETED]', { giftId: id, musicId, userId: auth.userId });

    // Retornar sucesso

    return NextResponse.json({
      success: true,
      message: 'Música removida com sucesso',
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[DELETE_MUSIC_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao remover música' },
      { status: 500 }
    );
  }
}
