import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  validatePassword,
  isTokenExpired,
} from '@/lib/auth';
import { sendPasswordChangedEmail } from '@/lib/email';

/**
 * Endpoint para redefinição de senha de usuário via token.
 * * Este fluxo realiza:
 * 1. Validação de integridade dos dados e complexidade da senha.
 * 2. Verificação de validade, expiração e unicidade do token de reset.
 * 3. Atualização da credencial do usuário e reset de estados de bloqueio (lockout).
 * 4. Invalidação de sessões ativas para garantir segurança pós-troca.
 * 5. Notificação assíncrona via e-mail.
 * * @param {NextRequest} request - Requisição contendo token, password e confirmPassword no corpo (JSON).
 * @returns {Promise<NextResponse>} Resposta JSON com status da operação ou mensagens de erro detalhadas.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    /**
     * Validação de integridade: Garante que todos os parâmetros necessários 
     * foram enviados e que a confirmação de senha coincide com a nova senha.
     */

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

    /**
     * Validação de Segurança (Password Policy):
     * Verifica se a nova senha atende aos requisitos de complexidade 
     * definidos na biblioteca de autenticação do sistema.
     */

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Senha fraca', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    /**
     * Recuperação do Token:
     * Busca o registro do token no banco de dados incluindo os dados do 
     * usuário associado para processamento posterior.
     */

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

    /**
     * Verificação de Expiração (TTL):
     * Caso o token esteja expirado, removemos o registro do banco para 
     * limpeza de dados órfãos e retornamos status 410 (Gone).
     */

    if (isTokenExpired(resetToken.expiresAt)) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: 'Token expirado', expired: true },
        { status: 410 }
      );
    }

    /**
     * Prevenção de Reuso:
     * Garante que tokens de uso único não possam ser utilizados mais de uma vez, 
     * mitigando ataques de repetição.
     */

    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Token já utilizado' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    /**
     * Atualização Atômica do Usuário:
     * Além de atualizar a hash da senha, resetamos tentativas de login e 
     * removemos bloqueios temporários (brute-force protection).
     */

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    /**
     * Invalidação do Token:
     * Marca o token como utilizado para prevenir novas tentativas com o mesmo segredo.
     */

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    /**
     * Revogação de Acesso:
     * Por segurança, removemos todas as sessões ativas (tokens de acesso/cookies) 
     * do usuário. Isso força o re-login em todos os dispositivos após a troca de senha.
     */

    await prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    /**
     * Notificação de Segurança:
     * Dispara e-mail informando sobre a alteração. O erro é capturado 
     * silenciosamente no log para não interromper a resposta de sucesso ao cliente.
     */

    sendPasswordChangedEmail(
      resetToken.user.email,
      resetToken.user.name || 'Usuário'
    ).catch(error => console.error('Erro crítico no envio de confirmação de senha:', error));

    return NextResponse.json(
      {
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.',
      },
      { status: 200 }
    );
  } catch (error) {s

    /**
     * Tratamento de Exceções Globais:
     * Erros não mapeados durante o processamento resultam em 500 para evitar 
     * vazamento de informações sensíveis da stack de execução.
     */

    console.error('Falha na rota reset-password:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}