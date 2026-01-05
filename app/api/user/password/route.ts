import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware';
import { 
  verifyPassword, 
  hashPassword,
  SECURITY_CONFIG,
} from '@/lib/auth';
import { sendPasswordChangedEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {put} /api/user/password Alterar Senha
 * 
 * Processa a alteração de senha para usuários autenticados.
 */

export async function PUT(request: NextRequest) {
  try {
    const prisma = getPrisma();

    // Autenticação

    const auth = await authMiddleware(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validação dos campos obrigatórios

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      );
    }

    // Validar força da nova senha

    if (newPassword.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `A senha deve ter no mínimo ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    // Buscar usuário

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar senha atual

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 401 }
      );
    }

    // Verificar se a nova senha é igual à atual

    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'A nova senha deve ser diferente da senha atual' },
        { status: 400 }
      );
    }

    // Gerar hash da nova senha

    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha no banco de dados

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Invalidar todas as outras sessões (medida de segurança)

    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        id: {
          not: auth.sessionId || undefined,
        },
      },
    });

    // Enviar email de confirmação

    try {
      await sendPasswordChangedEmail(user.email, user.name || 'Usuário');
    } catch (emailError) {
      console.error('[PASSWORD_CHANGE] Erro ao enviar email:', emailError);
      // Não falhar a requisição se o email falhar
    }

    // Retornar sucesso

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso',
    });

  } catch (error) {

    // Tratamento de erro

    console.error('[PASSWORD_CHANGE_ERROR]', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar senha. Tente novamente.' },
      { status: 500 }
    );
  }
}
