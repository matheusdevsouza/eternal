import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { hashPassword, validatePassword, isTokenExpired } from '@/lib/auth';
import { sendPasswordChangedEmail } from '@/lib/email';
import { rateLimitMiddleware, contentTypeMiddleware } from '@/lib/middleware';
import { logAuditEvent, AuditAction } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/reset-password Redefinição de Senha
 * @description Redefine a senha do usuário usando token de reset
 */

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimitMiddleware(request, 'reset-password', 5, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const contentTypeResponse = contentTypeMiddleware(request);
    if (contentTypeResponse) return contentTypeResponse;

    const prisma = getPrisma();
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      );
    }

    // Validação de senha

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Senha fraca', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Busca token

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      );
    }

    // Verifica expiração

    if (isTokenExpired(resetToken.expiresAt)) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: 'Token expirado', expired: true },
        { status: 410 }
      );
    }

    // Verifica se já foi usado

    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Token já utilizado' },
        { status: 400 }
      );
    }

    // Hash da nova senha

    const hashedPassword = await hashPassword(password);

    // Atualiza usuário

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Marca token como usado

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Invalida todas as sessões

    await prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    // Envia email de confirmação
    
    sendPasswordChangedEmail(
      resetToken.user.email,
      resetToken.user.name || 'Usuário'
    ).catch(error => console.error('[EMAIL_ERROR]', error));

    // Log de auditoria
    
    await logAuditEvent(resetToken.userId, AuditAction.PASSWORD_RESET_COMPLETE, request);

    return NextResponse.json(
      {
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
