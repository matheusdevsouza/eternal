import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');

    if (sessionCookie) {
      const payload = verifyJWT(sessionCookie.value);
      if (payload && payload.sessionId) {
        const prisma = getPrisma();

        // Deleta a sessão do banco de dados
        await prisma.session.delete({
          where: { id: payload.sessionId },
        }).catch(() => {}); 
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Limpeza dos cookies
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[LOGOUT_ERROR]', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
