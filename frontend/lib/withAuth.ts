// lib/withAuth.ts
// Middleware para proteger rutas que requieren autenticación

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from './auth';
import type { JWTPayload } from './types';

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware que verifica si el usuario está autenticado
 * Si no lo está, retorna un error 401
 * Si lo está, asigna el payload del JWT a req.user
 */
export async function withAuth(
  handler: (req: AuthRequest) => Promise<NextResponse | Response>
) {
  return async (req: NextRequest) => {
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
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Asignar el payload a una propiedad personalizada de NextRequest
    const authRequest = req as AuthRequest;
    authRequest.user = payload;

    return handler(authRequest);
  };
}

/**
 * Helper para extraer el usuario de una solicitud autenticada
 */
export function getUserFromRequest(req: AuthRequest): JWTPayload | null {
  return req.user || null;
}
