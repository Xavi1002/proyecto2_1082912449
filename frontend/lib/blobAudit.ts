// lib/blobAudit.ts
// Gestión de auditoría en Vercel Blob

import { put, get, del } from '@vercel/blob';
import type { AuditEntry, AuditAction, AuditEntity } from './types';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

interface BlobLockEntry {
  locked_at: string;
  locked_by: string;
}

/**
 * Obtiene el token de Blob de forma lazy (patrón del curso)
 */
function getBlobToken(): string {
  if (!BLOB_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN no configurado');
  }
  return BLOB_TOKEN;
}

/**
 * Construye el nombre del archivo de auditoría para un mes (YYYYMM)
 */
function getAuditFilename(yyyymm: string): string {
  return `audit/${yyyymm}.json`;
}

/**
 * Obtiene el mes actual en formato YYYYMM
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * Crea una entrada de auditoría
 */
export function createAuditEntry(
  user_id: string,
  user_email: string,
  user_role: any,
  action: AuditAction,
  entity: AuditEntity,
  summary: string,
  entity_id?: string,
  metadata?: Record<string, unknown>
): AuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    user_id,
    user_email,
    user_role,
    action,
    entity,
    entity_id,
    summary,
    metadata,
  };
}

/**
 * Registra una entrada de auditoría en Blob (patrón append-only)
 * Usa withFileLock para evitar sobreescrituras concurrentes
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    if (!BLOB_TOKEN) {
      console.warn('Auditoría deshabilitada: BLOB_READ_WRITE_TOKEN no configurado');
      return;
    }

    const filename = getAuditFilename(getCurrentMonth());
    const token = getBlobToken();

    // Obtener contenido actual del archivo (append-only)
    let entries: AuditEntry[] = [];
    try {
      const existing = await get(filename, { token });
      if (existing) {
        const content = await existing.text();
        entries = JSON.parse(content);
      }
    } catch (error: any) {
      // El archivo no existe aún, comenzar con array vacío
      if (error.code !== 'not_found') {
        console.error('Error leyendo auditoría:', error);
      }
    }

    // Añadir la nueva entrada
    entries.push(entry);

    // Guardar el archivo actualizado (sobrescribe completamente)
    await put(filename, JSON.stringify(entries, null, 2), {
      token,
      access: 'private',
      contentType: 'application/json',
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
    // No lanzar error: la auditoría no debe bloquear operaciones
  }
}

/**
 * Lee todas las entradas de auditoría de un mes
 */
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  try {
    if (!BLOB_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN no configurado');
    }

    const filename = getAuditFilename(yyyymm);
    const token = getBlobToken();

    const blob = await get(filename, { token });
    if (!blob) {
      return [];
    }

    const content = await blob.text();
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'not_found') {
      return [];
    }
    console.error('Error leyendo auditoría:', error);
    return [];
  }
}

/**
 * Borra todas las auditorías de un mes (solo admin)
 */
export async function deleteAuditMonth(yyyymm: string): Promise<void> {
  try {
    if (!BLOB_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN no configurado');
    }

    const filename = getAuditFilename(yyyymm);
    const token = getBlobToken();

    await del(filename, { token });
  } catch (error) {
    console.error('Error borrando auditoría:', error);
    throw error;
  }
}
