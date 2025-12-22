import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SALT_ROUNDS = 12;

/**
 * Configurações de segurança
 */

export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, 
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, 
  VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
  RESET_TOKEN_EXPIRY: 60 * 60 * 1000, 
};

/**
 * Hash de senha usando bcrypt
 */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifica senha contra hash
 */

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Valida força da senha
 */

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`A senha deve ter no mínimo ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres`);
  }

  if (!password.match(/[a-z]/)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  if (!password.match(/[A-Z]/)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  if (!password.match(/\d/)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  if (!password.match(/[@$!%*?&]/)) {
    errors.push('A senha deve conter pelo menos um caractere especial (@$!%*?&)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gera token JWT
 */

export function generateJWT(payload: any, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifica e decodifica token JWT
 */

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Gera token aleatório seguro
 */

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Gera código numérico de 6 dígitos
 */

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sanitiza email
 */

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Valida formato de email
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Gera hash SHA-256
 */

export function generateSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Valida token de reset/verificação
 */

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Gera data de expiração
 */

export function getExpiryDate(milliseconds: number): Date {
  return new Date(Date.now() + milliseconds);
}

/**
 * Limita tentativas de login
 */

export function shouldLockAccount(attempts: number, lockedUntil: Date | null): boolean {
  if (lockedUntil && new Date() < lockedUntil) {
    return true;
  }
  return attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
}

/**
 * Calcula tempo restante de bloqueio
 */

export function getLockoutTimeRemaining(lockedUntil: Date | null): number {
  if (!lockedUntil) return 0;
  const remaining = lockedUntil.getTime() - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000 / 60) : 0;
}

/**
 * Extrai IP do request
 */

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}

/**
 * Extrai User-Agent do request
 */

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

