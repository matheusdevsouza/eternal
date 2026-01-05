/**
 * Validação de Variáveis de Ambiente
 * 
 * Este módulo valida que todas as variáveis de ambiente críticas estão definidas
 * antes da aplicação iniciar. Isso previne problemas em produção causados por
 * configuração ausente ou inválida.
 * 
 * SEGURANÇA: Estas verificações são executadas no momento da importação para falhar rapidamente.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validar todas as variáveis de ambiente críticas
 * 
 * Chame esta função na inicialização da aplicação.
 */

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // CRÍTICO: Segredo JWT

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET não está definido. A autenticação irá falhar.');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET é muito curto. Deve ter no mínimo 32 caracteres.');
  }

  // CRÍTICO: Chave de Criptografia

  if (!process.env.ENCRYPTION_KEY) {
    errors.push('ENCRYPTION_KEY não está definido. A criptografia usará chave aleatória (perda de dados no reinício).');
  } else if (process.env.ENCRYPTION_KEY.length < 32) {
    errors.push('ENCRYPTION_KEY é muito curto. Deve ter no mínimo 32 caracteres.');
  }

  // CRÍTICO: URL do Banco de Dados

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL não está definido. A conexão com o banco irá falhar.');
  }

  // AVISOS: Opcionais mas recomendados

  if (!process.env.SMTP_HOST) {
    warnings.push('SMTP_HOST não está definido. O envio de emails irá falhar.');
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    warnings.push('NEXT_PUBLIC_SITE_URL não está definido. Links em emails podem estar incorretos.');
  }

  if (!process.env.ALLOWED_ORIGINS) {
    warnings.push('ALLOWED_ORIGINS não está definido. Usando origem localhost padrão.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Afirmar que o ambiente é válido (lança exceção em caso de falha)
 * 
 * Use esta função na inicialização do servidor.
 */

export function assertValidEnvironment(): void {
  const result = validateEnvironment();
  
  // Registrar avisos

  for (const warning of result.warnings) {
    console.warn('[ENV_AVISO]', warning);
  }

  // Falhar com erros em produção

  if (!result.valid) {
    console.error('[ENV_CRÍTICO] Validação de ambiente falhou:');
    for (const error of result.errors) {
      console.error('  -', error);
    }
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Variáveis de ambiente críticas estão ausentes. Não é possível iniciar em modo produção.');
    } else {
      console.warn('[ENV_AVISO] Executando em modo desenvolvimento com variáveis ausentes.');
    }
  }
}

/**
 * Obter valor de ambiente seguro com verificação de tipo
 */

export function getEnvString(key: string, required: boolean = false): string | undefined {
  const value = process.env[key];
  
  if (required && !value) {
    throw new Error(`Variável de ambiente obrigatória ${key} não está definida.`);
  }
  
  return value;
}

/**
 * Obter valor numérico de ambiente
 */

export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`[ENV_AVISO] ${key} não é um número válido, usando padrão: ${defaultValue}`);
    return defaultValue;
  }
  
  return parsed;
}

/**
 * Obter valor booleano de ambiente
 */

export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  return value.toLowerCase() === 'true' || value === '1';
}

// Auto-validar na importação (apenas desenvolvimento - produção deve chamar explicitamente)

if (process.env.NODE_ENV === 'development') {
  const result = validateEnvironment();
  if (result.warnings.length > 0) {
    console.warn('[ENV] Avisos:', result.warnings.join(', '));
  }
  if (!result.valid) {
    console.error('[ENV] Erros de validação:', result.errors.join(', '));
  }
}
