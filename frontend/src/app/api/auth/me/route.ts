// src/app/api/auth/me/route.ts
// Obtiene el usuario autenticado

import { NextRequest, NextResponse } from 'next/server';
import { getJWTFromCookie, verifyJWT } from '@/lib/auth';
import { getUserById } from '@/lib/dataService';

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const token = getJWTFromCookie(cookieHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        must_change_password: user.must_change_password,
      },
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
