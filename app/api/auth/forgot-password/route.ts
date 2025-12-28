import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { sanitizeEmail, generateSecureToken, getExpiryDate, SECURITY_CONFIG } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { rateLimitMiddleware, contentTypeMiddleware } from '@/lib/middleware';
import { isValidEmail } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/forgot-password Solicitação de Reset de Senha
 * @description Envia email com link para redefinição de senha
 */

export async function POST(request: NextRequest) {
  try {

    // Rate limiting mais restritivo para prevenir abuso
    
    const rateLimitResponse = rateLimitMiddleware(request, 'forgot-password', 3, 60 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    const contentTypeResponse = contentTypeMiddleware(request);
    if (contentTypeResponse) return contentTypeResponse;

    const prisma = getPrisma();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Não revela se o email existe ou não (para maior segurança)

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: 'Se o email estiver cadastrado, você receberá um email com instruções para redefinir sua senha.',
        },
        { status: 200 }
      );
    }

    // Invalida tokens antigos

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Gera novo token

    const resetToken = generateSecureToken();
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: getExpiryDate(SECURITY_CONFIG.RESET_TOKEN_EXPIRY),
      },
    });

    // Envia email
    
    sendPasswordResetEmail(
      user.email,
      user.name || 'Usuário',
      resetToken
    ).catch(error => console.error('[EMAIL_ERROR]', error));

    return NextResponse.json(
      {
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um email com instruções para redefinir sua senha.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
