import crypto from 'crypto';

/**
 * Sistema de Criptografia para Dados Sensíveis
 * Utiliza AES-256-GCM para criptografia simétrica de dados sensíveis
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Deriva uma chave de 32 bytes a partir de uma string
 */

function deriveKey(password: string): Buffer {
  return crypto.pbkdf2Sync(password, 'eternal-salt', 100000, 32, 'sha256');
}

/**
 * Criptografa dados sensíveis usando AES-256-GCM
 */

export function encryptSensitiveData(data: string): string {
  try {
    const key = deriveKey(ENCRYPTION_KEY);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Retorna: IV + AuthTag + Dados Criptografados (tudo em hex)

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('[ENCRYPTION_ERROR]', error);
    throw new Error('Falha ao criptografar dados');
  }
}

/**
 * Descriptografa dados sensíveis
 */

export function decryptSensitiveData(encryptedData: string): string {
  try {
    const key = deriveKey(ENCRYPTION_KEY);
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Formato de dados criptografados inválido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[DECRYPTION_ERROR]', error);
    throw new Error('Falha ao descriptografar dados');
  }
}

/**
 * Rate Limiting em memória (para produção, usar Redis)
 */

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Limpa entradas expiradas do rate limit
 */

function cleanRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Verifica e aplica rate limiting
 */

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 
): { allowed: boolean; remaining: number; resetTime: number } {
  cleanRateLimitStore();
  
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {

    // Nova janela de tempo

    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }
  
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }
  
  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Gera um identificador único para rate limiting baseado em IP e User-Agent
 */

export function getRateLimitKey(request: Request, endpoint: string): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${endpoint}:${ip}:${crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16)}`;
}

/**
 * Validação de CSRF Token
 */

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  const expectedToken = crypto
    .createHmac('sha256', ENCRYPTION_KEY)
    .update(sessionToken)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}

/**
 * Sanitiza entrada para prevenir XSS
 */

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Valida formato de email com regex robusto
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Gera token seguro para verificação/reset
 */

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash seguro para tokens (usado em URLs)
 */

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}



