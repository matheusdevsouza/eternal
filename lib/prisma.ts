import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

/**
 * Lazy init para evitar que o Next (build / edge-like evaluation) tente criar PrismaClient
 * durante a fase de "Collecting page data".
 */

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Se estivermos num contexto edge-like, não inicializamos Prisma aqui.
  // (No runtime Node real, isso não existe.)

  if (typeof (globalThis as any).EdgeRuntime === 'object') {
    throw new Error(
      'PrismaClient não pode ser inicializado em EdgeRuntime. Garanta runtime=\"nodejs\" e inicialização lazy.'
    );
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}


