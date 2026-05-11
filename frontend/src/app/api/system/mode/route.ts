// src/app/api/system/mode/route.ts
// Obtiene el modo de operación del sistema

import { NextRequest, NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET(req: NextRequest) {
  try {
    const mode = await getSystemMode();

    return NextResponse.json({
      mode,
      message: mode === 'seed'
        ? 'Sistema en modo SEED (sin Supabase configurado)'
        : 'Sistema en modo LIVE (conectado a Supabase)',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al obtener modo del sistema' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
