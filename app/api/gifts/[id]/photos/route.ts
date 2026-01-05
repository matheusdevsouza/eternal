import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware, rateLimitMiddleware } from '@/lib/middleware';
import { canUserAddPhoto, getEffectivePlan } from '@/lib/subscription-service';
import { logAuditEvent, AuditAction } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Padrões de URL permitidos para fotos

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
 * Validação de URL de Foto
 * 
 * Valida se a URL da foto é segura (HTTPS).
 */

function isValidPhotoUrl(url: string): boolean {

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
 * @api {get} /api/gifts/:id/photos Listar Fotos do Presente
 * 
 * Retorna todas as fotos de um presente específico.
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
        photos: {
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

    // Retornar lista de fotos

    return NextResponse.json({
      success: true,
      photos: gift.photos,
      limit: effective.limits?.maxPhotosPerGift ?? 0,
      remaining: !effective.limits || effective.limits.maxPhotosPerGift === -1 
        ? -1 
        : Math.max(0, effective.limits.maxPhotosPerGift - gift.photos.length),
      planStatus: {
        isActive: effective.isActive,
        plan: effective.plan,
      },
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[LIST_PHOTOS_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao listar fotos' },
      { status: 500 }
    );
  }
}

/**
 * @api {post} /api/gifts/:id/photos Adicionar Foto
 * 
 * Adiciona uma nova foto ao presente.
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

    const rateLimitResponse = rateLimitMiddleware(request, `add-photo-${id}`, 20, 60 * 1000);
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
    const { url, caption } = body;

    // Validação do campo obrigatório

    if (!url) {
      return NextResponse.json(
        { error: 'URL da foto é obrigatória' },
        { status: 400 }
      );
    }

    // SEGURANÇA: Validar formato da URL

    if (!isValidPhotoUrl(url)) {
      return NextResponse.json(
        { error: 'URL inválida. Use apenas URLs HTTPS.' },
        { status: 400 }
      );
    }

    // Verificar propriedade e obter contagem atual de fotos

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

    // SEGURANÇA: Verificar limites do plano usando serviço de assinatura

    const canAdd = await canUserAddPhoto(auth.userId, gift.photos.length);

    // Limite de fotos atingido
    
    if (!canAdd.allowed) {
      return NextResponse.json(
        { 
          error: `Limite de ${canAdd.limit} fotos atingido. Faça upgrade para adicionar mais.`,
          upgrade: true,
          limit: canAdd.limit,
          remaining: canAdd.remaining,
        },
        { status: 403 }
      );
    }

    // Calcular próxima ordem

    const maxOrder = gift.photos.reduce((max, p) => Math.max(max, p.order), -1);

    // Criar foto no banco de dados

    const photo = await prisma.photo.create({
      data: {
        url,
        caption: caption?.substring(0, 500) || null,
        order: maxOrder + 1,
        giftId: id,
      },
    });

    // Log de criação

    console.log('[PHOTO_ADDED]', { giftId: id, photoId: photo.id, userId: auth.userId });

    // Retornar foto criada

    return NextResponse.json({
      success: true,
      message: 'Foto adicionada com sucesso',
      photo,
      remaining: canAdd.remaining - 1,
    }, { status: 201 });

  } catch (error) {

    // Tratamento de erro

    console.error('[ADD_PHOTO_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar foto' },
      { status: 500 }
    );
  }
}

/**
 * @api {put} /api/gifts/:id/photos Reordenar Fotos
 * 
 * Reordena as fotos de um presente.
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
    const { photoIds } = body;

    // Validação do parâmetro obrigatório

    if (!Array.isArray(photoIds)) {
      return NextResponse.json(
        { error: 'Lista de IDs de fotos é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar propriedade do presente

    const gift = await prisma.gift.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        photos: { select: { id: true } },
      },
    });

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    // Validar que todos os IDs pertencem a este presente

    const giftPhotoIds = new Set(gift.photos.map(p => p.id));
    for (const photoId of photoIds) {
      if (!giftPhotoIds.has(photoId)) {
        return NextResponse.json(
          { error: 'Uma ou mais fotos não pertencem a este presente' },
          { status: 400 }
        );
      }
    }

    // Atualizar ordem de cada foto

    const updates = photoIds.map((photoId: string, index: number) => 
      prisma.photo.updateMany({
        where: {
          id: photoId,
          giftId: id,
        },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    // Retornar sucesso

    return NextResponse.json({
      success: true,
      message: 'Ordem das fotos atualizada',
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[REORDER_PHOTOS_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao reordenar fotos' },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /api/gifts/:id/photos Remover Foto
 * 
 * Remove uma foto do presente.
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
    const photoId = searchParams.get('photoId');

    // Validação do parâmetro obrigatório

    if (!photoId) {
      return NextResponse.json(
        { error: 'ID da foto é obrigatório' },
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

    // Excluir foto (apenas se pertencer a este presente)

    const deleteResult = await prisma.photo.deleteMany({
      where: {
        id: photoId,
        giftId: id,
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { error: 'Foto não encontrada' },
        { status: 404 }
      );
    }

    // Log de exclusão

    console.log('[PHOTO_DELETED]', { giftId: id, photoId, userId: auth.userId });

    // Retornar sucesso

    return NextResponse.json({
      success: true,
      message: 'Foto removida com sucesso',
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[DELETE_PHOTO_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao remover foto' },
      { status: 500 }
    );
  }
}
