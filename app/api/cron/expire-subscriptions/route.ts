import { NextRequest, NextResponse } from 'next/server';
import { expireOverdueSubscriptions } from '@/lib/subscription-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron Job: Expiração de Assinaturas Vencidas
 * 
 * Este endpoint deve ser chamado por um agendador cron (ex: Vercel Cron, GitHub Actions)
 * para expirar assinaturas que ultrapassaram sua data de término.
 * 
 * SEGURANÇA: Valida CRON_SECRET para prevenir acesso não autorizado
 * 
 * Agendamento recomendado: A cada hora (0 * * * *)
 */

export async function GET(request: NextRequest) {
  try {

    // Validação do segredo do cron

    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('[CRON_EXPIRE] CRON_SECRET não configurado');
      return NextResponse.json(
        { error: 'Cron não configurado' },
        { status: 500 }
      );
    }

    // Verificação de autorização
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[CRON_EXPIRE] Tentativa de acesso não autorizado');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Execução do job de expiração
    
    console.log('[CRON_EXPIRE] Iniciando job de expiração de assinaturas...');
    
    const result = await expireOverdueSubscriptions();
    
    console.log(`[CRON_EXPIRE] Concluído. ${result.expired} assinaturas expiradas.`);

    // Retornar resultado

    return NextResponse.json({
      success: true,
      expired: result.expired,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[CRON_EXPIRE_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
