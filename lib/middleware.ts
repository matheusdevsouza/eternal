import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitKey } from './security';
import { verifyJWT } from './auth';

/**
 * Middleware de Rate Limiting
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
 */
export async function authMiddleware(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const payload = verifyJWT(sessionCookie.value);
    
    if (!payload || !payload.userId) {
      return null;
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Middleware de Validação de CORS
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



