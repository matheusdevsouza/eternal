import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware, rateLimitMiddleware } from '@/lib/middleware';
import { sendAccountDeletedEmail } from '@/lib/email';
import { logAuditEvent, AuditAction } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {delete} /api/user/delete Excluir Conta do Usuário
 * 
 * Exclui permanentemente a conta do usuário autenticado e todos os dados associados.
 * 
 * SEGURANÇA:
 * - Requer autenticação
 * - Requer confirmação explícita "DELETE"
 * - Envia e-mail de confirmação após exclusão
 * - Registra evento de auditoria antes da exclusão
 */

export async function DELETE(request: NextRequest) {
  try {

    // Limite de Taxa

    const rateLimitResponse = rateLimitMiddleware(request, 'account-delete', 3, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    // Autenticação

    const auth = await authMiddleware(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const prisma = getPrisma();
    const body = await request.json();
    const { confirmation } = body;

    // Requer confirmação explícita

    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type DELETE to confirm account deletion' },
        { status: 400 }
      );
    }

    // Buscar usuário para e-mail

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Armazenar e-mail e nome para e-mail pós-exclusão
    const userEmail = user.email;
    const userName = user.name || 'User';

    // Registrar evento de auditoria ANTES da exclusão

    await logAuditEvent(auth.userId, AuditAction.ACCOUNT_DELETED, request, {
      action: 'account_deleted',
      email: userEmail,
    });

    // Excluir usuário (cascata para todos os dados relacionados)

    await prisma.user.delete({
      where: { id: auth.userId },
    });

    console.log('[ACCOUNT_DELETED]', {
      userId: auth.userId,
      email: userEmail,
    });

    // Enviar e-mail de confirmação (não bloqueante)

    sendAccountDeletedEmail(userEmail, userName).catch(err => 
      console.error('[EMAIL_ERROR]', err)
    );

    return NextResponse.json({
      success: true,
      message: 'Your account has been permanently deleted',
    });

  } catch (error) {
    console.error('[ACCOUNT_DELETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
