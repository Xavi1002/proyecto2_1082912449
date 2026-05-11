// src/app/api/auth/logout/route.ts
// Logout - Elimina la cookie de sesión

import { NextRequest, NextResponse } from 'next/server';
import { getClearCookieHeader, getJWTFromCookie } from '@/lib/auth';
import { verifyJWT } from '@/lib/auth';
import { recordUserAudit } from '@/lib/dataService';

export async function POST(req: NextRequest) {
  try {
    // Registrar auditoría
    const cookieHeader = req.headers.get('cookie');
    const token = getJWTFromCookie(cookieHeader);

    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        try {
          await recordUserAudit(
            payload.userId,
            payload.email,
            payload.role,
            'logout',
            'user',
            'Logout exitoso'
          );
        } catch (error) {
          console.error('Error registrando logout:', error);
        }
      }
    }

    // Crear respuesta
    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada',
    });

    // Establecer cookie vacía para eliminar la sesión
    response.headers.append(
      'Set-Cookie',
      getClearCookieHeader()
    );

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error en logout' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
