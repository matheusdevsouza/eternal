import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitKey } from './security';
import { verifyJWT } from './auth';

/**
 * Middleware de Rate Limiting
 * 
 * Limita o número de requisições por endpoint em uma janela de tempo.
 */

export function rateLimitMiddleware(
  request: NextRequest,
  endpoint: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000
): NextResponse | null {
  const key = getRateLimitKey(request, endpoint);
  const rateLimit = checkRateLimit(key, maxRequests, windowMs);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Muitas tentativas. Tente novamente mais tarde.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  }
  
  return null;
}

/**
 * Middleware de Autenticação
 * 
 * Valida o JWT E verifica se a sessão existe no banco de dados.
 * Isso garante que sessões revogadas sejam imediatamente invalidadas.
 */

export async function authMiddleware(request: NextRequest): Promise<{ userId: string; email: string; sessionId: string; authenticated?: boolean } | null> {
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const payload = verifyJWT(sessionCookie.value);
    
    if (!payload || !payload.userId || !payload.sessionId) {
      return null;
    }

    // CRÍTICO: Validar que a sessão existe no banco de dados e não expirou

    const { getPrisma } = await import('@/lib/prisma');
    const prisma = getPrisma();
    
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      select: { 
        id: true, 
        userId: true, 
        expiresAt: true,
        token: true,
      },
    });

    // Sessão não existe (foi deletada/revogada)

    if (!session) {
      console.log('[AUTH_MIDDLEWARE] Sessão não encontrada no banco:', payload.sessionId);
      return null;
    }

    // Sessão expirada

    if (session.expiresAt < new Date()) {
      console.log('[AUTH_MIDDLEWARE] Sessão expirada:', payload.sessionId);
      
      // Limpar sessão expirada

      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Verificar se userId corresponde

    if (session.userId !== payload.userId) {
      console.log('[AUTH_MIDDLEWARE] UserId não corresponde:', session.userId, payload.userId);
      return null;
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      sessionId: session.id,
      authenticated: true,
    };
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE_ERROR]', error);
    return null;
  }
}

/**
 * Middleware de Validação de CORS
 * 
 * Verifica se a origem da requisição está na lista de origens permitidas.
 */

export function corsMiddleware(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: 'Origem não permitida' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Middleware de Validação de Content-Type
 * 
 * Verifica se requisições POST/PUT/PATCH possuem Content-Type application/json.
 */

export function contentTypeMiddleware(request: NextRequest): NextResponse | null {
  const contentType = request.headers.get('content-type');
  
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type deve ser application/json' },
        { status: 400 }
      );
    }
  }
  
  return null;
}
