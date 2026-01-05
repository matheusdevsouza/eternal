import { getPrisma } from './prisma';
import { getClientIP, getUserAgent } from './auth';

/**
 * Sistema de Auditoria de Segurança
 * Registra todas as ações importantes do sistema para análise e compliance
 */

export enum AuditAction {

  // Autenticação

  LOGIN = 'login',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  SIGNUP = 'signup',
  
  // Password

  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_COMPLETE = 'password_reset_complete',
  
  // Email

  EMAIL_VERIFIED = 'email_verified',
  EMAIL_VERIFICATION_SENT = 'email_verification_sent',
  
  // Segurança da conta

  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SESSION_CREATED = 'session_created',
  SESSION_DELETED = 'session_deleted',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  
  // Perfil

  PROFILE_UPDATE = 'profile_update',
  
  // Presentes

  CREATE_GIFT = 'create_gift',
  UPDATE_GIFT = 'update_gift',
  DELETE_GIFT = 'delete_gift',
  PUBLISH_GIFT = 'publish_gift',
  UNPUBLISH_GIFT = 'unpublish_gift',
  
  // Midia

  ADD_PHOTO = 'add_photo',
  DELETE_PHOTO = 'delete_photo',
  ADD_MUSIC = 'add_music',
  DELETE_MUSIC = 'delete_music',
  
  // Inscrições e pagamentos

  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
}

/**
 * Registra evento de auditoria
 */

export async function logAuditEvent(
  userId: string | null,
  action: AuditAction,
  request: Request,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const prisma = getPrisma();
    
    await prisma.auditLog.create({
      data: {
        userId: userId || undefined,
        action,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: metadata || undefined,
      },
    });
  } catch (error) {

    // Não falha a operação principal se o log falhar

    console.error('[AUDIT_ERROR]', error);
  }
}

/**
 * Busca logs de auditoria de um usuário
 */

export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
) {
  const prisma = getPrisma();
  
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

