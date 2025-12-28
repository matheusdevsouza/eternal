import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { authMiddleware } from '@/lib/middleware';
import { logAuditEvent, AuditAction } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/logout Logout de Usuário
 * @description Invalida a sessão atual do usuário
 */

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const sessionCookie = request.cookies.get('session');

    if (sessionCookie) {
      try {
    const payload = verifyJWT(sessionCookie.value);
    
        if (payload?.sessionId) {
          const prisma = getPrisma();
    await prisma.session.delete({
      where: { id: payload.sessionId },
    });

          // Log de auditoria
          
          await logAuditEvent(auth.userId, AuditAction.LOGOUT, request, {
            sessionId: payload.sessionId,
          });
        }
      } catch (error) {
        
        // Token inválido, apenas limpa o cookie

      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout realizado com sucesso',
      },
      { status: 200 }
    );

    // Remove cookie
    
    response.cookies.delete('session');

    return response;
  } catch (error) {
    console.error('[LOGOUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}
