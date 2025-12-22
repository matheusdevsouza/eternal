import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sanitizeEmail,
  validateEmail,
  generateSecureToken,
  getExpiryDate,
  SECURITY_CONFIG,
} from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

/**
 * @api {post} /api/auth/resend-verification Reenviar E-mail de Verificação
 * @description Gera um novo token de validação de conta e dispara o e-mail de instruções.
 * * Estratégia de Operação:
 * 1. Validação de Estado: Impede o reenvio para contas que já foram validadas.
 * 2. Ciclo de Vida do Token: Implementa uma política de "token único ativo", 
 * removendo pendências anteriores antes de gerar a nova.
 * 3. Expiração Dinâmica: O tempo de vida do token é gerido via SECURITY_CONFIG.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    /** * Validação de Entrada: Garante que o campo foi submetido.
     */

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    /** * Sanitização: Normaliza o input para evitar erros de case-sensitivity
     * ou espaços em branco acidentais antes da consulta à DB.
     */

    const sanitizedEmail = sanitizeEmail(email);
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    /** * Localização do Perfil: Verificamos a existência do utilizador.
     * Nota: Diferente do "Esqueci a Senha", aqui retornamos 404 para feedback
     * direto no fluxo de onboarding/ativação.
     */

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    /** * Regra de Negócio: Evita o processamento e o envio de e-mails desnecessários
     * se a conta já estiver num estado verificado.
     */

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email já verificado' },
        { status: 400 }
      );
    }

    /** * Gestão de Concorrência: Removemos quaisquer tokens de verificação 
     * gerados anteriormente. Isto previne que links antigos (e potencialmente expirados)
     * confundam o utilizador ou causem conflitos de validação.
     */

    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    /** * Geração de Credencial Temporária:
     * O token é gerado com alta entropia e guardado com um timestamp de expiração.
     */

    const verificationToken = generateSecureToken();
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: getExpiryDate(SECURITY_CONFIG.VERIFICATION_TOKEN_EXPIRY),
      },
    });

    /** * Notificação Assíncrona: Disparo do e-mail. 
     * Usamos 'await' aqui para garantir que o utilizador só recebe a confirmação 
     * de sucesso se o serviço de e-mail aceitar o envio.
     */

    await sendVerificationEmail(
      user.email,
      user.name || 'Usuário',
      verificationToken
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Email de verificação reenviado com sucesso!',
      },
      { status: 200 }
    );
  } catch (error) {

    /** * Tratamento de Exceção: Logamos o erro técnico para rastreabilidade 
     * mas mantemos a interface do utilizador segura com mensagens amigáveis.
     */

    console.error('[AUTH_RESEND_ERROR] Falha ao reenviar verificação:', error);
    return NextResponse.json(
      { error: 'Erro ao reenviar email. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}