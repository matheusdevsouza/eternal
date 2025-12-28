/**
 * Funções de autenticação compatíveis com Edge Runtime
 * Não usa módulos Node.js como 'jsonwebtoken' ou 'crypto'
 */

const JWT_SECRET = process.env.JWT_SECRET || '';

/**
 * Decodifica JWT sem verificar assinatura (apenas para leitura no Edge)
 * Para verificação completa, use nas rotas de API (Node.js runtime)
 */

export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Verifica se token JWT está expirado (Edge-compatible)
 */

export function isJWTExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Gera token aleatório seguro usando Web Crypto API
 */

export function generateSecureToken(length: number = 32): string {
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Gera hash SHA-256 usando Web Crypto API
 */

export async function generateSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
