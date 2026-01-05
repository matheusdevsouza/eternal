import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware, rateLimitMiddleware } from '@/lib/middleware';
import { canUserCreateGift, getEffectivePlan } from '@/lib/subscription-service';
import { sanitizeInput } from '@/lib/security';
import { logAuditEvent, AuditAction } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Whitelist de valores permitidos

const ALLOWED_THEMES = ['elegance', 'romantic', 'vintage', 'modern', 'nature', 'dark'];
const ALLOWED_FONTS = ['serif-luxe', 'sans-clean', 'handwriting', 'monospace'];
const ALLOWED_ANIMATIONS = ['fade-in', 'slide-up', 'zoom', 'rotate', 'bounce'];
const PREMIUM_ANIMATIONS = ['zoom', 'rotate', 'bounce'];

/**
 * Geração de Slug Único
 * 
 * Gera um identificador único para o presente baseado no título.
 */

function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * @api {get} /api/gifts Listar Presentes do Usuário
 * 
 * Retorna todos os presentes do usuário autenticado.
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

    // Rate Limiting por usuário

    const rateLimitResponse = rateLimitMiddleware(request, `list-gifts-${auth.userId}`, 30, 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);

    // Parâmetros de paginação e filtro
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Construção da cláusula WHERE

    const where: any = { userId: auth.userId };
    
    if (status === 'published') {
      where.published = true;
    } else if (status === 'draft') {
      where.published = false;
    }

    // Filtro de busca

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Buscar presentes com contagem

    const [gifts, total] = await Promise.all([
      prisma.gift.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          photos: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              photos: true,
              musics: true,
            },
          },
        },
      }),
      prisma.gift.count({ where }),
    ]);

    // Retornar lista de presentes

    return NextResponse.json({
      success: true,
      data: gifts.map(gift => ({
        ...gift,
        coverPhoto: gift.photos[0]?.url || null,
        photosCount: gift._count.photos,
        musicsCount: gift._count.musics,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[LIST_GIFTS_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao listar presentes' },
      { status: 500 }
    );
  }
}

/**
 * @api {post} /api/gifts Criar Novo Presente
 * 
 * Cria um novo presente para o usuário autenticado.
 * 
 * SEGURANÇA:
 * - Valida status da assinatura antes de permitir criação
 * - Usa whitelist para tema, fonte e animação
 * - Sanitiza todas as entradas de texto
 */

export async function POST(request: NextRequest) {
  try {

    // Rate Limiting

    const rateLimitResponse = rateLimitMiddleware(request, 'create-gift', 10, 60 * 1000);
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
    const { 
      title, 
      message, 
      recipientName,
      theme = 'elegance',
      font = 'serif-luxe',
      animation = 'fade-in',
      backgroundColor,
      textColor,
    } = body;

    // Validação dos campos obrigatórios

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Título e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    // Sanitização das entradas

    const sanitizedTitle = sanitizeInput(title).substring(0, 100);
    const sanitizedMessage = sanitizeInput(message).substring(0, 10000);
    const sanitizedRecipientName = recipientName ? sanitizeInput(recipientName).substring(0, 100) : null;

    // SEGURANÇA: Validar tema, fonte e animação contra whitelist

    const validTheme = ALLOWED_THEMES.includes(theme) ? theme : 'elegance';
    const validFont = ALLOWED_FONTS.includes(font) ? font : 'serif-luxe';
    
    // Verificar animação - premium requer plano premium

    let validAnimation = ALLOWED_ANIMATIONS.includes(animation) ? animation : 'fade-in';
    
    // Obter plano efetivo para verificar acesso a animações premium

    const effective = await getEffectivePlan(auth.userId);
    
    if (PREMIUM_ANIMATIONS.includes(validAnimation) && (!effective.limits || !effective.limits.premiumAnimations)) {
      validAnimation = 'fade-in';
    }

    // SEGURANÇA: Verificar limites do plano usando serviço de assinatura

    const canCreate = await canUserCreateGift(auth.userId);
    
    // Usuário não possui assinatura ativa

    if (canCreate.requiresSubscription) {
      return NextResponse.json(
        { 
          error: 'Você precisa de uma assinatura ativa para criar presentes.',
          requiresSubscription: true,
          reason: canCreate.reason,
        },
        { status: 403 }
      );
    }

    // Limite de presentes atingido
    
    if (!canCreate.allowed) {
      return NextResponse.json(
        { 
          error: 'Limite de presentes atingido para seu plano. Faça upgrade para criar mais.',
          upgrade: true,
          limit: canCreate.limit,
          currentCount: canCreate.currentCount,
        },
        { status: 403 }
      );
    }

    // Gerar slug único

    let slug = generateSlug(sanitizedTitle);
    let attempts = 0;
    
    while (attempts < 5) {
      const existing = await prisma.gift.findUnique({ where: { slug } });
      if (!existing) break;
      slug = generateSlug(sanitizedTitle);
      attempts++;
    }

    // Criar presente no banco de dados

    const gift = await prisma.gift.create({
      data: {
        slug,
        title: sanitizedTitle,
        message: sanitizedMessage,
        recipientName: sanitizedRecipientName,
        theme: validTheme,
        font: validFont,
        animation: validAnimation,
        backgroundColor,
        textColor,
        userId: auth.userId,
      },
    });

    // Registro de evento de auditoria (não-bloqueante)

    logAuditEvent(auth.userId, AuditAction.CREATE_GIFT, request, {
      giftId: gift.id,
      title: sanitizedTitle,
    }).catch(err => console.error('[AUDIT_LOG_ERROR]', err));

    // Log de criação

    console.log('[GIFT_CREATED]', { giftId: gift.id, userId: auth.userId });

    // Retornar presente criado

    return NextResponse.json({
      success: true,
      message: 'Presente criado com sucesso',
      gift: {
        id: gift.id,
        slug: gift.slug,
        title: gift.title,
        published: gift.published,
        createdAt: gift.createdAt,
      },
      remaining: canCreate.remaining - 1,
    }, { status: 201 });

  } catch (error) {

    // Tratamento de erro

    console.error('[CREATE_GIFT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao criar presente' },
      { status: 500 }
    );
  }
}
