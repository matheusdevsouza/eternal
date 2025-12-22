import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  sanitizeEmail,
  validateEmail,
  shouldLockAccount,
  getLockoutTimeRemaining,
  generateSecureToken,
  getExpiryDate,
  generateJWT,
  getClientIP,
  getUserAgent,
  SECURITY_CONFIG,
} from '@/lib/auth';
import { sendSecurityAlertEmail } from '@/lib/email';

/**
 * @api {post} /api/auth/login Autenticação de Usuário
 * @description Realiza o login do usuário, validando credenciais, gerando uma sessão 
 * no banco de dados e retornando um JWT via cookie HTTP-only.
 * * Medidas de Proteção Implementadas:
 * 1. Sanitização de Entrada: Previne variações de escrita de e-mail.
 * 2. Rate Limiting / Brute Force: Bloqueio temporário após X tentativas falhas (configurável).
 * 3. Alerta de Segurança: Notificação automática por e-mail em caso de bloqueio.
 * 4. Cookies Seguros: JWT persistido com flags httpOnly, secure e sameSite.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    /** * Validação de Presença: Garante que os campos mínimos foram preenchidos
     * antes de iniciar operações de banco ou criptografia.
     */

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    /** * Validação Formato: Verifica integridade do e-mail pós-sanitização.
     */
    
    const sanitizedEmail = sanitizeEmail(email);
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    /** * Recuperação de Perfil: Busca o usuário pelo e-mail único.
     */

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    /** * Verificação de Estado da Conta: Implementa a lógica de lockout.
     * Se a conta estiver bloqueada, calcula o tempo restante e impede a verificação da senha.
     */

    if (shouldLockAccount(user.loginAttempts, user.lockedUntil)) {
      const minutesRemaining = getLockoutTimeRemaining(user.lockedUntil);
      
      if (minutesRemaining > 0) {
        return NextResponse.json(
          {
            error: 'Conta temporariamente bloqueada por múltiplas tentativas de login falhas',
            lockedMinutes: minutesRemaining,
          },
          { status: 423 }
        );
      }
      
      /** * Auto-Desbloqueio: Se o tempo de expiração do bloqueio passou,
       * reseta o estado do usuário para permitir nova tentativa.
       */

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    /** * Validação Criptográfica: Compara o hash da senha enviada com o armazenado.
     */

    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {

      /** * Fluxo de Falha: Incrementa contadores e verifica se o limite de tentativas foi atingido.
       */

      const newAttempts = user.loginAttempts + 1;
      const shouldLock = newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: shouldLock
            ? getExpiryDate(SECURITY_CONFIG.LOCKOUT_DURATION)
            : null,
        },
      });

      if (shouldLock) {

        /** * Alerta Reativo: Dispara e-mail de aviso ao usuário informando o bloqueio da conta.
         */

        sendSecurityAlertEmail(
          user.email,
          user.name || 'Usuário',
          `Detectamos ${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS} tentativas de login falhas. Sua conta foi temporariamente bloqueada por 15 minutos.`
        ).catch(error => console.error('[SECURITY_ALERT_ERROR] Falha no disparo de alerta:', error));

        return NextResponse.json(
          {
            error: 'Múltiplas tentativas de login falhas. Conta bloqueada por 15 minutos.',
          },
          { status: 423 }
        );
      }

      const attemptsLeft = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          error: 'Email ou senha incorretos',
          attemptsLeft,
        },
        { status: 401 }
      );
    }

    /** * Verificação de Ativação: Garante que o usuário confirmou o e-mail antes do acesso.
     */

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email não verificado',
          message: 'Por favor, verifique seu email antes de fazer login',
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    /** * Reset de Segurança: Após sucesso, limpa falhas anteriores e atualiza timestamp de acesso.
     */

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    /** * Gestão de Sessão:
     * 1. Gera um token opaco para persistência no banco (revogável).
     * 2. Define a duração baseada na preferência "Remember Me".
     */

    const sessionToken = generateSecureToken();
    const sessionDuration = rememberMe
      ? SECURITY_CONFIG.SESSION_DURATION * 4 
      : SECURITY_CONFIG.SESSION_DURATION; 

    const session = await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt: getExpiryDate(sessionDuration),
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
      },
    });

    /** * Geração de JWT: Cria o token assinado contendo o payload essencial para o front-end.
     */

    const jwt = generateJWT(
      {
        userId: user.id,
        email: user.email,
        sessionId: session.id,
      },
      rememberMe ? '28d' : '7d'
    );

    /** * Construção da Resposta: Prepara o JSON de retorno e anexa o cookie de sessão.
     */

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          emailVerified: user.emailVerified,
        },
      },
      { status: 200 }
    );

    /** * Configuração do Cookie: Flags rigorosas para mitigar XSS e CSRF.
     */

    response.cookies.set('session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 28 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {

    /** * Tratamento de Erro Global: Logs detalhados para o servidor, 
     * mensagem opaca para o cliente final.
     */

    console.error('[CRITICAL_ERROR] Login flow failure:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}