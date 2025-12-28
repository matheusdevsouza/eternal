import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
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
import { rateLimitMiddleware, contentTypeMiddleware } from '@/lib/middleware';
import { isValidEmail } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/login Autenticação de Usuário
 * @description Sistema completo de login com proteções avançadas
 */

export async function POST(request: NextRequest) {
  try {

    // Rate limiting mais restritivo para login

    const rateLimitResponse = rateLimitMiddleware(request, 'login', 5, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;

    // Content-Type validation

    const contentTypeResponse = contentTypeMiddleware(request);
    if (contentTypeResponse) return contentTypeResponse;

    const prisma = getPrisma();
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    // Validação de campos

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Sanitização e validação de email

    const sanitizedEmail = sanitizeEmail(email);
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Busca usuário

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      
      // Delay artificial para prevenir timing attacks

      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verifica bloqueio de conta

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
      
      // Auto-desbloqueio se o tempo passou
    
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Verifica senha
    
    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
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
    
        // Log de auditoria
    
        await logAuditEvent(user.id, AuditAction.ACCOUNT_LOCKED, request, {
          attempts: newAttempts,
        });

        sendSecurityAlertEmail(
          user.email,
          user.name || 'Usuário',
          `Detectamos ${SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS} tentativas de login falhas. Sua conta foi temporariamente bloqueada por 15 minutos.`
        ).catch(error => console.error('[SECURITY_ALERT_ERROR]', error));

        return NextResponse.json(
          {
            error: 'Múltiplas tentativas de login falhas. Conta bloqueada por 15 minutos.',
          },
          { status: 423 }
        );
      }

      // Log de tentativa falha
    
      await logAuditEvent(user.id, AuditAction.LOGIN_FAILED, request, {
        attempts: newAttempts,
        attemptsLeft: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts,
      });

      const attemptsLeft = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          error: 'Email ou senha incorretos',
          attemptsLeft,
        },
        { status: 401 }
      );
    }

    // Verifica se email foi verificado
    
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

    // Reset de segurança após login bem-sucedido
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIP: getClientIP(request),
      },
    });

    // Log de auditoria
    
    await logAuditEvent(user.id, AuditAction.LOGIN, request, {
      rememberMe,
      sessionId: session.id,
    });

    // Cria sessão
    
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

    // Gera JWT
    
    const jwt = generateJWT(
      {
        userId: user.id,
        email: user.email,
        sessionId: session.id,
      },
      rememberMe ? '28d' : '7d'
    );

    // Resposta
    
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

    // Cookie seguro
    
    response.cookies.set('session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 28 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
