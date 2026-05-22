import { NextRequest, NextResponse } from 'next/server';
import { executeSql, getSupabaseEnvInfo, requireSupabaseClient } from '@/lib/supabase';

type StepResult = {
  name: string;
  ok: boolean;
  message: string;
  error?: string;
};

const quoteIdentifier = (value: string): string => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Identificador SQL inválido: ${value}`);
  }
  return `"${value}"`;
};

const createServiceRolePolicySql = (tableName: string): string => `
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = '${tableName}'
      AND policyname = '${tableName}_service_role_all'
  ) THEN
    CREATE POLICY ${tableName}_service_role_all
      ON ${tableName}
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
`;

const CREATE_TABLE_STEPS: Array<{ name: string; sql: string }> = [
  {
    name: 'users',
    sql: `
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(15) NOT NULL DEFAULT 'recepcionista'
    CHECK (role IN ('superadmin', 'recepcionista', 'cliente')),
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
${createServiceRolePolicySql('users')}
`,
  },
  {
    name: 'rooms',
    sql: `
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('simple', 'doble', 'suite')),
  status VARCHAR(15) NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'ocupada', 'mantenimiento')),
  price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
${createServiceRolePolicySql('rooms')}
`,
  },
  {
    name: 'clients',
    sql: `
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  phone VARCHAR(20),
  identification_number VARCHAR(30) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_identification_number ON clients(identification_number);
${createServiceRolePolicySql('clients')}
`,
  },
  {
    name: 'reservations',
    sql: `
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  price_per_night_snapshot DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'completada', 'cancelada')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (check_out > check_in)
);
CREATE INDEX IF NOT EXISTS idx_reservations_room_dates ON reservations(room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
${createServiceRolePolicySql('reservations')}
`,
  },
];

export async function GET() {
  try {
    requireSupabaseClient();

    await executeSql('SELECT 1;');

    const tables = (await executeSql(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)) as Array<{ table_name: string }>;

    const tableCounts: Record<string, number> = {};

    for (const row of tables) {
      const tableName = row.table_name;
      const quoted = quoteIdentifier(tableName);
      const countRows = (await executeSql(`SELECT COUNT(*)::int AS total FROM ${quoted};`)) as Array<{ total: number }>;
      tableCounts[tableName] = Number(countRows[0]?.total || 0);
    }

    return NextResponse.json({
      connected: true,
      env: getSupabaseEnvInfo(),
      tables: tableCounts,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      env: getSupabaseEnvInfo(),
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.action !== 'create-all') {
      return NextResponse.json(
        { ok: false, error: "Acción inválida. Usa { action: 'create-all' }" },
        { status: 400 }
      );
    }

    requireSupabaseClient();

    const steps: StepResult[] = [];

    for (const step of CREATE_TABLE_STEPS) {
      try {
        await executeSql(step.sql);
        steps.push({
          name: step.name,
          ok: true,
          message: `Tabla ${step.name} lista`,
        });
      } catch (error) {
        steps.push({
          name: step.name,
          ok: false,
          message: `Error creando ${step.name}`,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    try {
      await executeSql("NOTIFY pgrst, 'reload schema';");
      steps.push({ name: 'pgrst_reload', ok: true, message: 'Schema cache recargada' });
    } catch (error) {
      steps.push({
        name: 'pgrst_reload',
        ok: false,
        message: 'Error recargando schema cache',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    const ok = steps.every((step) => step.ok);
    return NextResponse.json({ ok, steps }, { status: ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
