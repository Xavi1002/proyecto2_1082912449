// lib/supabase.ts
// Configuración del cliente de Supabase

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase no configurado. Modo seed activo. Variables requeridas:',
    'NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Cliente para operaciones públicas (en el navegador)
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Cliente con privilegios de admin (solo en servidor)
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Verifica si Supabase está disponible
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL !== undefined && SUPABASE_ANON_KEY !== undefined;
}

/**
 * Verifica si el cliente admin está disponible (solo servidor)
 */
export function isSupabaseAdminConfigured(): boolean {
  return SUPABASE_URL !== undefined && SUPABASE_SERVICE_ROLE_KEY !== undefined;
}
