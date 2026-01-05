import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { 
  sanitizeEmail, 
  validateEmail, 
  generateSecureToken,
  getExpiryDate,
  SECURITY_CONFIG
} from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/resend-verification Reenvio de Email de Verificação
 */

export async function POST(request: NextRequest) {
  try {
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
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Se usuário não existe ou já está verificado, retornamos sucesso por segurança (evitar enumeration)
    // Mas se já verificado, podemos avisar que já está verificado se for UX preferível.
    // O prompt pede "mensagens que vazam informações sensíveis" a serem evitadas.
    // Então "Verifique seu email" é a mensagem safest.
    
    if (!user || user.emailVerified) {

      // Se já verificado, nada a fazer.

      return NextResponse.json(
        { success: true, message: 'Se o email existir e não estiver verificado, um novo link será enviado.' },
        { status: 200 }
      );
    }

    // Limpar tokens antigos

    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Gerar novo token

    const verificationToken = generateSecureToken();
    const tokenExpiry = getExpiryDate(SECURITY_CONFIG.VERIFICATION_TOKEN_EXPIRY);

    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: tokenExpiry,
      },
    });

    // Enviar email
    
    if (process.env.EMAIL_HOST || process.env.SMTP_HOST) {
       await sendVerificationEmail(user.email, user.name || 'User', verificationToken);
    }

    return NextResponse.json(
      { success: true, message: 'Email de verificação reenviado com sucesso.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[RESEND_VERIFICATION_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação.' },
      { status: 500 }
    );
  }
}
