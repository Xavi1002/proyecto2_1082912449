// lib/pgMigrate.ts
// Ejecuta migraciones SQL en Supabase Postgres

import { createPool, Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

let _pool: Pool | null = null;

/**
 * Crea o retorna una conexión a la base de datos
 */
function getPool(): Pool {
  if (_pool) {
    return _pool;
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL no configurado');
  }

  _pool = createPool({
    connectionString: DATABASE_URL,
  });

  return _pool;
}

/**
 * Obtiene todas las migraciones aplicadas
 */
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT filename FROM _migrations ORDER BY applied_at DESC"
    );
    return result.rows.map((row: any) => row.filename);
  } catch (error) {
    // Tabla no existe aún
    return [];
  }
}

/**
 * Obtiene todos los archivos de migración del directorio
 */
function getMigrationFiles(): string[] {
  try {
    const migrationsPath = join(process.cwd(), 'supabase', 'migrations');
    const files = readdirSync(migrationsPath);
    return files
      .filter(f => f.endsWith('.sql'))
      .sort();
  } catch (error) {
    console.error('Error leyendo migraciones:', error);
    return [];
  }
}

/**
 * Lee el contenido de un archivo de migración
 */
function readMigrationFile(filename: string): string {
  const migrationsPath = join(process.cwd(), 'supabase', 'migrations', filename);
  return readFileSync(migrationsPath, 'utf-8');
}

/**
 * Aplica todas las migraciones pendientes
 * Retorna { success, appliedCount, errors }
 */
export async function applyMigrations(): Promise<{
  success: boolean;
  appliedCount: number;
  errors: { file: string; error: string }[];
}> {
  try {
    const applied = await getAppliedMigrations();
    const available = getMigrationFiles();
    const pending = available.filter(f => !applied.includes(f));

    const errors: { file: string; error: string }[] = [];
    const pool = getPool();

    for (const migrationFile of pending) {
      try {
        const sql = readMigrationFile(migrationFile);
        console.log(`Aplicando migración: ${migrationFile}`);
        await pool.query(sql);
        console.log(`✓ Migración aplicada: ${migrationFile}`);
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        console.error(`✗ Error en migración ${migrationFile}:`, errorMsg);
        errors.push({
          file: migrationFile,
          error: errorMsg,
        });
      }
    }

    return {
      success: errors.length === 0,
      appliedCount: pending.length - errors.length,
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      appliedCount: 0,
      errors: [
        {
          file: 'all',
          error: error?.message || String(error),
        },
      ],
    };
  }
}

/**
 * Ejecuta una query SQL directamente (solo para setup/diagnóstico)
 */
export async function executeQuery(sql: string): Promise<any> {
  const pool = getPool();
  return pool.query(sql);
}

/**
 * Cierra la conexión a la base de datos
 */
export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
