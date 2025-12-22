import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

/**
 * @api {post} /api/auth/logout Terminar Sessão do Utilizador
 * @description Invalida a sessão do utilizador removendo o token de sessão da base de dados
 * e limpando o cookie de autenticação do navegador.
 * * * Fluxo de Operação:
 * 1. Extração: Obtém o JWT do cookie de sessão.
 * 2. Validação: Verifica a integridade do JWT para extrair o ID da sessão.
 * 3. Invalidação (DB): Remove o registo da sessão para impedir reutilização do token.
 * 4. Limpeza (Client): Instrui o navegador a apagar o cookie.
 */

export async function POST(request: NextRequest) {
  try {

    /** * Recuperação do Cookie: Acedemos ao cookie 'session' definido como httpOnly
     * durante o processo de login.
     */

    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    /** * Verificação de Integridade: Antes de interagir com o banco de dados,
     * validamos se o JWT é autêntico e contém os dados necessários.
     */

    const payload = verifyJWT(sessionCookie.value);
    
    if (!payload || !payload.sessionId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    /** * Persistência de Invalidação: Removemos a sessão da base de dados.
     * Usamos um .catch silencioso para evitar falhas caso a sessão já tenha
     * expirado ou sido removida por outro processo (ex: limpeza automática).
     */

    await prisma.session.delete({
      where: { id: payload.sessionId },
    }).catch(() => {
    });

    /** * Resposta de Sucesso: Preparamos o objeto de resposta antes de anexar
     * as instruções de modificação de cookies.
     */

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout realizado com sucesso',
      },
      { status: 200 }
    );

    /** * Limpeza do Cliente: Remove explicitamente o cookie do navegador.
     * É crucial para garantir que, mesmo que o servidor falhe na invalidação da DB,
     * o navegador deixe de enviar o token.
     */

    response.cookies.delete('session');

    return response;
  } catch (error) {

    /** * Monitorização: Regista erros críticos para depuração técnica.
     * Mantém a resposta ao utilizador genérica por questões de segurança.
     */

    console.error('[AUTH_LOGOUT_ERROR]:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}