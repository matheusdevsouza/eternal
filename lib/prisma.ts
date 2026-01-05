/**
 * Singleton do Prisma Client com Adaptador PostgreSQL
 * 
 * Prisma 7.2.0 "Config File Mode" usa por padrão o engine Wasm ("client")
 * que requer um driver adapter.
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Criar instância do Prisma Client
 */

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não está definido no ambiente.');
  }

  // Usar pool 'pg' e adapter

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });
  
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
  });
}

/**
 * Obter instância do Prisma Client
 * 
 * Utiliza padrão singleton para reutilizar conexões.
 */

export function getPrisma(): PrismaClient {
  if (global.__prisma) {
    return global.__prisma;
  }

  if (typeof (globalThis as any).EdgeRuntime === 'object') {
    throw new Error('Prisma Adapter-PG não pode executar em Edge Runtime.');
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    global.__prisma = client;
  }

  return client;
}

/**
 * Desconectar Prisma Client
 */

export async function disconnectPrisma(): Promise<void> {
  if (global.__prisma) {
    await global.__prisma.$disconnect();
    global.__prisma = undefined;
  }
}

export default getPrisma;
