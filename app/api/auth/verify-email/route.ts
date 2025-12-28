import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { isTokenExpired } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { rateLimitMiddleware } from '@/lib/middleware';
import { logAuditEvent, AuditAction } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/verify-email Verificação de Email
 * @description Verifica o email do usuário através de token
 */

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimitMiddleware(request, 'verify-email', 5, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const prisma = getPrisma();
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      );
    }

    if (isTokenExpired(verificationToken.expiresAt)) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { error: 'Token expirado', expired: true },
        { status: 410 }
      );
    }

    // Verifica se já foi verificado

    if (verificationToken.user.emailVerified) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { error: 'Email já foi verificado' },
        { status: 400 }
      );
    }

    // Atualiza usuário

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Remove token usado

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Envia email de boas-vindas

    sendWelcomeEmail(
      verificationToken.user.email,
      verificationToken.user.name || 'Usuário'
    ).catch(error => console.error('[EMAIL_ERROR]', error));

    // Log de auditoria
    
    await logAuditEvent(verificationToken.userId, AuditAction.EMAIL_VERIFIED, request);

    return NextResponse.json(
      {
        success: true,
        message: 'Email verificado com sucesso!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao verificar email' },
      { status: 500 }
    );
  }
}
