// src/app/api/auth/login/route.ts
// Login - Crea JWT en cookie

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createJWT, getSetCookieHeader, verifyPassword } from '@/lib/auth';
import { LoginRequestSchema } from '@/lib/schemas';
import { recordUserAudit, updateLastLogin } from '@/lib/dataService';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginRequestSchema.parse(body);

    // Autenticar usuario
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 401 }
      );
    }

    // Crear JWT
    const token = await createJWT(user);

    // Registrar auditoría y actualizar último login (sin bloquear)
    try {
      await recordUserAudit(user.id, user.email, user.role, 'login', 'user', 'Login exitoso');
      await updateLastLogin(user.id);
    } catch (error) {
      console.error('Error registrando login:', error);
    }

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        must_change_password: user.must_change_password,
      },
    });

    // Establecer cookie HttpOnly
    response.headers.append(
      'Set-Cookie',
      getSetCookieHeader(token)
    );

    return response;
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en login' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
