import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ResolvedEnv = {
  url: string | null;
  anonKey: string | null;
  serviceRoleKey: string | null;
  postgresUrl: string | null;
  urlVarName: string | null;
  serviceRoleVarName: string | null;
  postgresVarName: string | null;
};

let _checked = false;
let _warnedNotConfigured = false;
let _resolvedEnv: ResolvedEnv = {
  url: null,
  anonKey: null,
  serviceRoleKey: null,
  postgresUrl: null,
  urlVarName: null,
  serviceRoleVarName: null,
  postgresVarName: null,
};
let _client: SupabaseClient | null | undefined;
let _adminClient: SupabaseClient | null | undefined;

const pickEnvBySuffix = (suffixes: string[]): { key: string; value: string } | null => {
  for (const suffix of suffixes) {
    for (const [key, value] of Object.entries(process.env)) {
      if (!value) continue;
      if (key.endsWith(suffix)) {
        return { key, value };
      }
    }
  }
  return null;
};

const resolveEnv = (): void => {
  if (_checked) {
    return;
  }

  const resolvedUrl = pickEnvBySuffix(['_SUPABASE_URL'])
    || (process.env.NEXT_PUBLIC_SUPABASE_URL
      ? { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL }
      : null);

  const resolvedAnon = pickEnvBySuffix(['_SUPABASE_ANON_KEY', '_SUPABASE_PUBLISHABLE_KEY'])
    || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
      : null);

  const resolvedService = pickEnvBySuffix(['_SUPABASE_SERVICE_ROLE_KEY'])
    || (process.env.SUPABASE_SERVICE_ROLE_KEY
      ? { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY }
      : null);

  const resolvedPostgres = pickEnvBySuffix(['_POSTGRES_URL'])
    || (process.env.DATABASE_URL
      ? { key: 'DATABASE_URL', value: process.env.DATABASE_URL }
      : null);

  _resolvedEnv = {
    url: resolvedUrl?.value || null,
    anonKey: resolvedAnon?.value || null,
    serviceRoleKey: resolvedService?.value || null,
    postgresUrl: resolvedPostgres?.value || null,
    urlVarName: resolvedUrl?.key || null,
    serviceRoleVarName: resolvedService?.key || null,
    postgresVarName: resolvedPostgres?.key || null,
  };

  _checked = true;
};

export const getSupabaseClient = (): SupabaseClient | null => {
  resolveEnv();

  if (!_resolvedEnv.url || !_resolvedEnv.anonKey) {
    if (!_warnedNotConfigured) {
      console.warn('[supabase] No configurado');
      _warnedNotConfigured = true;
    }
    return null;
  }

  if (_client !== undefined) {
    return _client;
  }

  _client = createClient(_resolvedEnv.url, _resolvedEnv.anonKey);
  return _client;
};

export const requireSupabaseClient = (): SupabaseClient => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('[supabase] No configurado: faltan *_SUPABASE_URL o *_SUPABASE_ANON_KEY');
  }
  return client;
};

const getSupabaseAdminClient = (): SupabaseClient | null => {
  resolveEnv();

  if (!_resolvedEnv.url || !_resolvedEnv.serviceRoleKey) {
    return null;
  }

  if (_adminClient !== undefined) {
    return _adminClient;
  }

  _adminClient = createClient(_resolvedEnv.url, _resolvedEnv.serviceRoleKey);
  return _adminClient;
};

export const executeSql = async (query: string): Promise<unknown[]> => {
  resolveEnv();

  if (!_resolvedEnv.postgresUrl) {
    throw new Error('[supabase] No configurado: falta *_POSTGRES_URL');
  }

  const postgresModule = await import('postgres');
  const sql = postgresModule.default(_resolvedEnv.postgresUrl, {
    ssl: 'require',
    max: 1,
    prepare: false,
  });

  try {
    const result = await sql.unsafe(query);
    return result as unknown[];
  } finally {
    await sql.end();
  }
};

export const getSupabaseEnvInfo = (): Omit<ResolvedEnv, 'anonKey' | 'serviceRoleKey' | 'postgresUrl' | 'url'> & {
  hasUrl: boolean;
  hasAnonKey: boolean;
  hasServiceRoleKey: boolean;
  hasPostgresUrl: boolean;
} => {
  resolveEnv();
  return {
    urlVarName: _resolvedEnv.urlVarName,
    serviceRoleVarName: _resolvedEnv.serviceRoleVarName,
    postgresVarName: _resolvedEnv.postgresVarName,
    hasUrl: Boolean(_resolvedEnv.url),
    hasAnonKey: Boolean(_resolvedEnv.anonKey),
    hasServiceRoleKey: Boolean(_resolvedEnv.serviceRoleKey),
    hasPostgresUrl: Boolean(_resolvedEnv.postgresUrl),
  };
};

export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

export function isSupabaseAdminConfigured(): boolean {
  return getSupabaseAdminClient() !== null;
}
