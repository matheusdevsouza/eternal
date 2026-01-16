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
import { sendNewDeviceLoginEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/login Autenticação de Usuário
 */

export async function POST(request: NextRequest) {
  try {
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
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Busca usuário com assinatura

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            endDate: true,
          },
        },
      },
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
        console.log('[SECURITY] Conta bloqueada:', user.email);

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

    // Reset de segurança após login bem-sucedido

    const currentIP = getClientIP(request);
    const isNewDevice = user.lastLoginIP && user.lastLoginIP !== currentIP;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIP: currentIP,
      },
    });

    // Envia email de alerta para login de novo dispositivo

    if (isNewDevice) {
      sendNewDeviceLoginEmail(
        user.email,
        user.name || 'User',
        {
          ip: currentIP || 'Unknown',
          userAgent: getUserAgent(request) || undefined,
          timestamp: new Date(),
        }
      ).catch(err => console.error('[NEW_DEVICE_EMAIL_ERROR]', err));
    }

    // Gera JWT

    const jwt = generateJWT(
      {
        userId: user.id,
        email: user.email,
        sessionId: session.id,
      },
      rememberMe ? '28d' : '7d'
    );

    // Determina se usuário tem assinatura ativa
    const subscription = user.subscription;
    const now = new Date();

    const hasActiveSubscription = !!(subscription
      && subscription.status === 'ACTIVE'
      && (!subscription.endDate || subscription.endDate > now)
    );

    // Determina URL de redirecionamento baseado no status da assinatura
    const redirectUrl = hasActiveSubscription
      ? (process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001')
      : '/pricing';

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
        subscription: subscription ? {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          endDate: subscription.endDate,
        } : null,
        hasActiveSubscription,
        redirectUrl,
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
