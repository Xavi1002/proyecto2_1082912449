// src/app/api/system/diagnose/route.ts
// Diagnóstico del sistema

import { NextRequest, NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';
import { isSupabaseConfigured, isSupabaseAdminConfigured } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const mode = await getSystemMode();
    const supabaseConfigured = isSupabaseConfigured();
    const supabaseAdminConfigured = isSupabaseAdminConfigured();
    const blobTokenConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;
    const jwtSecretConfigured = !!process.env.JWT_SECRET;
    const databaseConfigured = !!process.env.DATABASE_URL;

    return NextResponse.json({
      mode,
      status: {
        supabase_configured: supabaseConfigured,
        supabase_admin_configured: supabaseAdminConfigured,
        blob_token_configured: blobTokenConfigured,
        jwt_secret_configured: jwtSecretConfigured,
        database_configured: databaseConfigured,
      },
      environment: {
        node_env: process.env.NODE_ENV,
        app_mode: mode === 'seed' ? 'BOOTSTRAP' : 'PRODUCTION',
      },
      requirements_met: {
        can_login: mode === 'seed' || supabaseConfigured,
        can_create_audit: blobTokenConfigured,
        can_migrate_db: databaseConfigured && supabaseAdminConfigured,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al diagnosticar sistema', details: error?.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
