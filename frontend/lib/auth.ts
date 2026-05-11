// lib/auth.ts
// Utilidades de autenticación con JWT y bcryptjs

import { jwtVerify, SignJWT } from 'jose';
import { compareSync, hashSync } from 'bcryptjs';
import type { JWTPayload, User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = '7d';

const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Hashea una contraseña con bcryptjs
 */
export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

/**
 * Verifica una contraseña contra su hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

/**
 * Crea un JWT para un usuario
 */
export async function createJWT(user: User): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

/**
 * Verifica un JWT y retorna el payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secretKey);
    return verified.payload as any as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Obtiene el JWT de las cookies (en servidor)
 */
export function getJWTFromCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const authCookie = cookies.find(c => c.startsWith('hotelmanager_auth='));

  if (!authCookie) return null;

  return authCookie.substring('hotelmanager_auth='.length);
}

/**
 * Crea la cookie Set-Cookie header
 */
export function getSetCookieHeader(token: string, maxAge?: number): string {
  const maxAgeSeconds = maxAge || 7 * 24 * 60 * 60; // 7 días por defecto
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  
  return `hotelmanager_auth=${token}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

/**
 * Crea la cookie para cerrar sesión (vacía)
 */
export function getClearCookieHeader(): string {
  return 'hotelmanager_auth=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0';
}
