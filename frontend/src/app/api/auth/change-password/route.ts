// src/app/api/auth/change-password/route.ts
// Cambiar contraseña

import { NextRequest, NextResponse } from 'next/server';
import { getJWTFromCookie, verifyJWT } from '@/lib/auth';
import { changeUserPassword } from '@/lib/dataService';
import { ChangePasswordRequestSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { current_password, new_password } = ChangePasswordRequestSchema.parse(body);

    await changeUserPassword(payload.userId, current_password, new_password);

    return NextResponse.json({
      success: true,
      message: 'Contraseña cambiada exitosamente',
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    if (error.statusCode === 409) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error.statusCode === 404) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Error al cambiar contraseña' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
