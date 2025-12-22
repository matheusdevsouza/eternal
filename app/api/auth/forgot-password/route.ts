import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sanitizeEmail,
  validateEmail,
  generateSecureToken,
  getExpiryDate,
  SECURITY_CONFIG,
} from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

/**
 * @api {post} /api/auth/forgot-password Solicitar redefinição de senha
 * @description Inicia o processo de recuperação de conta gerando um token seguro 
 * e enviando um e-mail com instruções para o usuário.
 * * Estratégia de Segurança:
 * 1. Sanitização e validação rigorosa de entrada.
 * 2. Proteção contra enumeração de contas (Account Enumeration): O endpoint 
 * sempre retorna status 200, independentemente da existência do e-mail no banco.
 * 3. Invalidação de tokens prévios para evitar múltiplos tokens ativos simultâneos.
 */

export async function POST(request: NextRequest) {
  try {
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

    /**
     * Localiza o usuário pelo e-mail sanitizado.
     * Usamos findUnique para garantir performance através de índices.
     */

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    /**
     * Resposta genérica para evitar vazamento de dados (Enumeration Attack).
     * Atacantes não conseguem distinguir se um e-mail está cadastrado ou não.
     */

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: 'Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.',
        },
        { status: 200 }
      );
    }

    /**
     * Limpeza de estado: removemos qualquer token de redefinição pendente
     * para garantir que apenas o link mais recente seja válido.
     */

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    /**
     * Geração e persistência do novo token.
     * O tempo de expiração é definido centralmente em SECURITY_CONFIG.
     */

    const resetToken = generateSecureToken();
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: getExpiryDate(SECURITY_CONFIG.RESET_TOKEN_EXPIRY),
      },
    });

    /**
     * Disparo assíncrono do e-mail.
     * Não aguardamos o envio (await) para não bloquear a resposta do servidor,
     * mas capturamos logs de erro para auditoria interna.
     */

    sendPasswordResetEmail(user.email, user.name || 'Usuário', resetToken)
      .catch(error => console.error('[AUTH_ERROR] Falha no disparo de e-mail de reset:', error));

    return NextResponse.json(
      {
        success: true,
        message: 'Se este email estiver cadastrado, você receberá instruções para redefinir sua senha.',
      },
      { status: 200 }
    );
  } catch (error) {

    /**
     * Erros inesperados (banco fora do ar, erro de parse JSON, etc).
     * Registramos o erro detalhado no servidor mas retornamos uma mensagem opaca ao cliente.
     */

    console.error('[CRITICAL_ERROR] forgot-password flow:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}