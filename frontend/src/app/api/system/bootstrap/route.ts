// src/app/api/system/bootstrap/route.ts
// Ejecuta migraciones y carga el seed

import { NextRequest, NextResponse } from 'next/server';
import { applyMigrations, executeQuery, closePool } from '@/lib/pgMigrate';
import { getSeedRooms, getSeedAdmin } from '@/lib/seedReader';
import { supabaseAdmin } from '@/lib/supabase';
import { recordUserAudit } from '@/lib/dataService';

export async function POST(req: NextRequest) {
  try {
    // Verificar que el secret es correcto
    const { secret } = await req.json();
    const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET || 'dev-bootstrap-secret';

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Secret de bootstrap incorrecto' },
        { status: 403 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase no configurado' },
        { status: 500 }
      );
    }

    const results: any = {
      migrations: null,
      seed: null,
      errors: [],
    };

    // 1. Aplicar migraciones
    try {
      const migrationResults = await applyMigrations();
      results.migrations = migrationResults;

      if (!migrationResults.success && migrationResults.errors.length > 0) {
        results.errors.push(...migrationResults.errors);
      }
    } catch (error: any) {
      results.errors.push({
        step: 'migrations',
        error: error?.message || String(error),
      });
    }

    // 2. Cargar seed (SuperAdmin + habitaciones demo)
    try {
      // Verificar que no haya usuarios aún
      const { count: userCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (userCount === 0) {
        // Insertar SuperAdmin del seed
        const admin = getSeedAdmin();
        if (admin) {
          await supabaseAdmin.from('users').insert({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            password_hash: admin.password_hash,
            is_active: true,
            must_change_password: false,
          });

          results.seed = {
            admin_created: true,
            admin_email: admin.email,
          };
        }
      } else {
        results.seed = {
          admin_created: false,
          message: 'Ya existen usuarios en el sistema',
        };
      }

      // Verificar que no haya habitaciones aún
      const { count: roomCount } = await supabaseAdmin
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      if (roomCount === 0) {
        // Insertar habitaciones demo
        const seedRooms = getSeedRooms();
        const roomsToInsert = seedRooms.map(room => ({
          room_number: room.room_number,
          type: room.type,
          status: room.status,
          price_per_night: room.price_per_night,
        }));

        await supabaseAdmin.from('rooms').insert(roomsToInsert);

        results.seed = {
          ...results.seed,
          rooms_created: true,
          rooms_count: seedRooms.length,
        };
      }
    } catch (error: any) {
      results.errors.push({
        step: 'seed',
        error: error?.message || String(error),
      });
    }

    // 3. Registrar auditoría
    try {
      if (results.seed?.admin_created) {
        await recordUserAudit(
          getSeedAdmin()?.id || 'bootstrap',
          getSeedAdmin()?.email || 'bootstrap@system',
          'superadmin',
          'bootstrap',
          'system',
          'Bootstrap completado: migraciones y seed aplicados'
        );
      }
    } catch (error: any) {
      console.error('Error registrando auditoría:', error);
    }

    // 4. Cerrar pool de conexiones
    try {
      await closePool();
    } catch (error: any) {
      console.error('Error cerrando pool:', error);
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      ...results,
    });
  } catch (error: any) {
    console.error('Bootstrap error:', error);
    return NextResponse.json(
      { error: 'Error en bootstrap', details: error?.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
