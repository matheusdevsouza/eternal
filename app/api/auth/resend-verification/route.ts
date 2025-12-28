import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { sanitizeEmail, generateSecureToken, getExpiryDate, SECURITY_CONFIG } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimitMiddleware, contentTypeMiddleware } from '@/lib/middleware';
import { isValidEmail } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/resend-verification Reenvio de Email de Verificação
 * @description Reenvia email de verificação para usuário não verificado
 */

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimitMiddleware(request, 'resend-verification', 3, 60 * 60 * 1000);
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

    if (!user) {

      // Não revela se o email existe ou não (segurança)

      return NextResponse.json(
        {
          success: true,
          message: 'Se o email estiver cadastrado, você receberá um email de verificação.',
        },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email já foi verificado' },
        { status: 400 }
      );
    }

    // Remove tokens antigos

    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Gera novo token

    const verificationToken = generateSecureToken();
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: getExpiryDate(SECURITY_CONFIG.VERIFICATION_TOKEN_EXPIRY),
      },
    });

    // Envia email
    
    sendVerificationEmail(
      user.email,
      user.name || 'Usuário',
      verificationToken
    ).catch(error => console.error('[EMAIL_ERROR]', error));

    return NextResponse.json(
      {
        success: true,
        message: 'Email de verificação reenviado com sucesso!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[RESEND_VERIFICATION_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao reenviar email de verificação' },
      { status: 500 }
    );
  }
}
