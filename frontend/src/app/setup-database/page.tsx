'use client';

import { useMemo, useState } from 'react';

type ConnectionResponse = {
  connected: boolean;
  error?: string;
  env?: {
    urlVarName: string | null;
    serviceRoleVarName: string | null;
    postgresVarName: string | null;
    hasUrl: boolean;
    hasAnonKey: boolean;
    hasServiceRoleKey: boolean;
    hasPostgresUrl: boolean;
  };
  tables?: Record<string, number>;
};

type SetupStep = {
  name: string;
  ok: boolean;
  message: string;
  error?: string;
};

type CreateResponse = {
  ok: boolean;
  error?: string;
  steps?: SetupStep[];
};

const spinner = (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
);

export default function SetupDatabasePage() {
  const [isTesting, setIsTesting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectionResponse | null>(null);
  const [creationResult, setCreationResult] = useState<CreateResponse | null>(null);

  const tableEntries = useMemo(() => Object.entries(connectionResult?.tables || {}), [connectionResult]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setCreationResult(null);

    try {
      const response = await fetch('/api/setup-database', { method: 'GET' });
      const payload = (await response.json()) as ConnectionResponse;
      setConnectionResult(payload);
    } catch (error) {
      setConnectionResult({
        connected: false,
        error: error instanceof Error ? error.message : 'Error de red',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateAll = async () => {
    setIsCreating(true);

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-all' }),
      });

      const payload = (await response.json()) as CreateResponse;
      setCreationResult(payload);
    } catch (error) {
      setCreationResult({
        ok: false,
        error: error instanceof Error ? error.message : 'Error de red',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Setup Base de Datos</h1>
        <p className="mt-2 text-sm text-slate-600">
          Herramienta temporal para probar conexión y crear tablas en Supabase.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">1) Test de Conexión</h2>
            <p className="text-sm text-slate-600">Verifica conexión, variables detectadas y conteo de tablas.</p>
          </div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="inline-flex items-center gap-2">{isTesting ? spinner : null}Probar Conexión</span>
          </button>
        </div>

        {connectionResult ? (
          <div className="space-y-4">
            <div
              className={[
                'rounded-lg border px-4 py-3 text-sm',
                connectionResult.connected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-rose-300 bg-rose-50 text-rose-900',
              ].join(' ')}
            >
              {connectionResult.connected ? 'Conectado correctamente' : 'No se pudo conectar'}
            </div>

            {connectionResult.env ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-semibold">Variables detectadas</p>
                <ul className="mt-2 space-y-1">
                  <li>URL: {connectionResult.env.urlVarName || 'No encontrada'}</li>
                  <li>Service Role: {connectionResult.env.serviceRoleVarName || 'No encontrada'}</li>
                  <li>Postgres URL: {connectionResult.env.postgresVarName || 'No encontrada'}</li>
                </ul>
              </div>
            ) : null}

            {tableEntries.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-2">Tabla</th>
                      <th className="px-4 py-2">Filas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableEntries.map(([table, count]) => (
                      <tr key={table} className="border-t border-slate-100">
                        <td className="px-4 py-2 text-slate-900">{table}</td>
                        <td className="px-4 py-2 text-slate-700">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {connectionResult.error ? (
              <pre className="overflow-auto rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900">
                {connectionResult.error}
              </pre>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">2) Crear Tablas</h2>
            <p className="text-sm text-slate-600">Ejecuta DDL idempotente con RLS y policy de service_role.</p>
          </div>
          <button
            type="button"
            onClick={handleCreateAll}
            disabled={isCreating}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="inline-flex items-center gap-2">{isCreating ? spinner : null}Crear Todas las Tablas</span>
          </button>
        </div>

        {creationResult ? (
          <div className="space-y-3">
            <div
              className={[
                'rounded-lg border px-4 py-3 text-sm',
                creationResult.ok
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-rose-300 bg-rose-50 text-rose-900',
              ].join(' ')}
            >
              {creationResult.ok ? 'Proceso completado correctamente' : 'Proceso completado con errores'}
            </div>

            {(creationResult.steps || []).map((step) => (
              <div
                key={`${step.name}-${step.message}`}
                className={[
                  'rounded-lg border px-4 py-3 text-sm',
                  step.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900',
                ].join(' ')}
              >
                <p className="font-semibold">
                  {step.name} {step.ok ? '✅' : '❌'}
                </p>
                <p>{step.message}</p>
                {step.error ? <pre className="mt-2 overflow-auto text-xs">{step.error}</pre> : null}
              </div>
            ))}

            {creationResult.error ? (
              <pre className="overflow-auto rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900">
                {creationResult.error}
              </pre>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
