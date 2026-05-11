// lib/withRole.ts
// Middleware para verificar que el usuario tiene un rol permitido

import { NextResponse } from 'next/server';
import type { AuthRequest } from './withAuth';
import type { UserRole } from './types';

/**
 * Middleware que verifica si el usuario tiene uno de los roles permitidos
 * Si no lo tiene, retorna un error 403
 */
export function withRole(allowedRoles: UserRole[]) {
  return (
    handler: (req: AuthRequest) => Promise<NextResponse | Response>
  ) => {
    return async (req: AuthRequest) => {
      const user = req.user;

      if (!user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Acceso denegado: rol no permitido' },
          { status: 403 }
        );
      }

      return handler(req);
    };
  };
}
