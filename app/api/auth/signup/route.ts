import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  validatePassword,
  isTokenExpired,
} from '@/lib/auth';
import { sendPasswordChangedEmail } from '@/lib/email';

/**
 * Processa a redefinição de senha do usuário através de um token de recuperação.
 * * Este fluxo é a etapa final do processo de recuperação de conta. Ele garante a 
 * integridade do token, aplica políticas de complexidade de senha, limpa estados 
 * de segurança do usuário (como tentativas de login e bloqueios) e invalida 
 * sessões ativas para garantir uma troca de credenciais segura.
 * * @param {NextRequest} request - Objeto da requisição contendo token, password e confirmPassword.
 * @returns {Promise<NextResponse>} Resposta JSON estruturada com status da operação.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    /**
     * Validação de Integridade de Dados:
     * Verifica se os campos obrigatórios estão presentes e se há paridade entre 
     * a senha e sua confirmação antes de iniciar operações custosas de banco de dados.
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
     * Validação de Política de Senha (Password Policy):
     * Invoca o motor de validação centralizado para garantir que a nova senha 
     * cumpra os requisitos mínimos de entropia e segurança do sistema.
     */

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Senha fraca', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    /**
     * Recuperação e Verificação do Token:
     * O token deve ser único no sistema. Incluímos o usuário na consulta 
     * para facilitar a atualização de perfil no próximo passo.
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
     * Verificação de Ciclo de Vida do Token (TTL):
     * Caso o token esteja expirado, realizamos uma limpeza imediata (Garbage Collection manual)
     * para evitar acúmulo de tokens inválidos no banco.
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
     * Mesmo que o token esteja no prazo de validade, ele deve ser de uso único.
     */

    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Token já utilizado' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    /**
     * Atualização Atômica de Perfil e Estado de Segurança:
     * Ao trocar a senha, reiniciamos o contador de tentativas de login e 
     * removemos qualquer bloqueio temporal (lockout) ativo.
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
     * Marcamos o token como usado. Mantemos o registro para fins de auditoria, 
     * em vez de deletar o registro imediatamente.
     */

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    /**
     * Revogação Global de Acesso (Session Invalidation):
     * Medida Crítica de Segurança: Removemos todas as sessões (cookies/tokens) 
     * do usuário em todos os dispositivos para garantir que o acesso antigo 
     * não possa mais ser utilizado após a alteração de credenciais.
     */

    await prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    /**
     * Notificação de Segurança Assíncrona:
     * Disparamos o e-mail de confirmação sem 'await' para reduzir a latência 
     * percebida pelo usuário final. Erros de envio são capturados apenas para log.
     */

    sendPasswordChangedEmail(
      resetToken.user.email,
      resetToken.user.name || 'Usuário'
    ).catch(error => console.error('Erro crítico no serviço de e-mail pós-reset:', error));

    return NextResponse.json(
      {
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.',
      },
      { status: 200 }
    );
  } catch (error) {

    /**
     * Tratamento de Exceções de Runtime:
     * Captura falhas de conexão com DB ou erros inesperados. Retorna 500 para 
     * ocultar detalhes técnicos sensíveis do cliente externo.
     */

    console.error('Falha catastrófica no endpoint de redefinição:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar redefinição. Tente novamente.' },
      { status: 500 }
    );
  }
}