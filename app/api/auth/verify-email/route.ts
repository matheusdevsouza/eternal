import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  validatePassword,
  isTokenExpired,
} from '@/lib/auth';
import { sendPasswordChangedEmail } from '@/lib/email';

/**
 * Endpoint para redefinição de senha de usuário via token de recuperação.
 * * Este fluxo é a etapa final do processo de recuperação de conta ("Forgot Password").
 * Ele realiza a validação de integridade do token, aplica políticas de segurança
 * de senha, invalida sessões existentes para garantir segurança e notifica o usuário.
 * * @param {NextRequest} request - Objeto da requisição contendo o corpo em JSON:
 * - token: O segredo único enviado por e-mail.
 * - password: A nova senha desejada.
 * - confirmPassword: A confirmação da nova senha.
 * * @returns {Promise<NextResponse>} JSON indicando sucesso ou erro com status HTTP apropriado.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    /**
     * Validação de Parâmetros:
     * Garante que todos os campos obrigatórios foram fornecidos e que
     * a senha e sua confirmação são idênticas antes de prosseguir.
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
     * Validação de Política de Senha:
     * Invoca o motor centralizado de validação para garantir que a nova senha
     * atenda aos requisitos de complexidade (ex: tamanho, caracteres especiais).
     */

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Senha fraca', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    /**
     * Busca e Validação de Existência do Token:
     * O token deve existir no banco e estar associado a um usuário válido.
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
     * Validação de Expiração (TTL):
     * Caso o token tenha expirado, removemos o registro do banco imediatamente
     * para limpeza (garbage collection manual) e informamos o cliente.
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
     * Proteção contra Ataques de Reuso (Replay Attacks):
     * Tokens de reset devem ser de uso único. Se o campo 'used' for verdadeiro,
     * a requisição é rejeitada por segurança.
     */

    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Token já utilizado' },
        { status: 400 }
      );
    }

    /**
     * Criptografia e Persistência:
     * Gera a hash da nova senha utilizando o algoritmo padrão definido em @/lib/auth.
     */

    const hashedPassword = await hashPassword(password);

    /**
     * Atualização de Credenciais e Segurança da Conta:
     * Além de atualizar a senha, resetamos o contador de tentativas falhas e
     * removemos qualquer bloqueio temporal (lockout) ativo no usuário.
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
     * Invalidação do Token Processado:
     * Marcamos o token como usado para impedir que o mesmo link seja
     * reutilizado em caso de vazamento histórico de logs de e-mail.
     */

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    /**
     * Revogação Global de Acesso (Session Invalidation):
     * Por segurança, removemos todas as sessões ativas do usuário. Isso garante
     * que, se a senha foi trocada devido a um comprometimento, o invasor seja
     * desconectado de todos os dispositivos imediatamente.
     */

    await prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    /**
     * Notificação de Segurança:
     * Dispara um e-mail informando o usuário sobre a alteração. O processo é
     * assíncrono (não aguardamos o envio) para otimizar o tempo de resposta da API.
     */

    sendPasswordChangedEmail(
      resetToken.user.email,
      resetToken.user.name || 'Usuário'
    ).catch(error => console.error('Falha ao enviar e-mail de confirmação pós-reset:', error));

    return NextResponse.json(
      {
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.',
      },
      { status: 200 }
    );
  } catch (error) {


    /**
     * Tratamento de Erros Inesperados:
     * Captura falhas de banco de dados ou erros de runtime. O status 500
     * é retornado para não expor detalhes da infraestrutura ao atacante.
     */

    console.error('Erro crítico na rota de reset de senha:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar redefinição. Tente novamente.' },
      { status: 500 }
    );
  }
}