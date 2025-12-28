import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { hashPassword, validatePassword, sanitizeEmail, validateEmail } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/signup Registro de Novo Usuário
 */

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const { email, password, name } = body;

    // Validação de campos obrigatórios

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Sanitização e validação de email

    const sanitizedEmail = sanitizeEmail(email);
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Sanitização de nome

    const sanitizedName = name ? name.trim().substring(0, 100) : null;

    // Validação de senha

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Senha não atende aos requisitos de segurança', 
          details: passwordValidation.errors 
        },
        { status: 400 }
      );
    }

    // Verifica se email já existe

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha

    const hashedPassword = await hashPassword(password);

    // Cria usuário

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizedName,
        password: hashedPassword,
        emailVerified: false,
      },
    });

    console.log('[SIGNUP_SUCCESS] Novo usuário criado:', user.email);

    return NextResponse.json(
      {
        success: true,
        message: 'Conta criada com sucesso! Você já pode fazer login.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[SIGNUP_ERROR]', error);
    
    // Erro de constraint única (email duplicado)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
