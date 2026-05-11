'use client';

// src/app/admin/db-setup/page.tsx
// Panel de configuración y bootstrap del sistema

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DbSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systemMode, setSystemMode] = useState<'seed' | 'live' | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapResult, setBootstrapResult] = useState<any>(null);
  const [secret, setSecret] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }

        const data = await response.json();

        // Solo SuperAdmin puede acceder
        if (data.user.role !== 'superadmin') {
          router.push('/dashboard');
          return;
        }

        setUser(data.user);

        // Obtener modo del sistema
        const modeRes = await fetch('/api/system/mode');
        const modeData = await modeRes.json();
        setSystemMode(modeData.mode);

        // Obtener diagnóstico
        const diagRes = await fetch('/api/system/diagnose');
        const diagData = await diagRes.json();
        setDiagnostics(diagData);

        setLoading(false);
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleBootstrap = async () => {
    if (!secret) {
      alert('Ingresa el secret de bootstrap');
      return;
    }

    setBootstrapping(true);
    try {
      const response = await fetch('/api/system/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret }),
      });

      const data = await response.json();
      setBootstrapResult(data);

      if (data.success) {
        alert('✓ Bootstrap completado exitosamente');
        // Recargar diagnóstico
        const diagRes = await fetch('/api/system/diagnose');
        const diagData = await diagRes.json();
        setDiagnostics(diagData);
      } else {
        alert('✗ Bootstrap completado con errores');
      }
    } catch (error) {
      alert('Error en bootstrap');
    } finally {
      setBootstrapping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Database Setup</h1>
        <p className="text-slate-600 mb-8">SuperAdmin Only - Bootstrap y diagnóstico del sistema</p>

        {/* Modo del sistema */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Sistema</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium text-slate-900">Modo:</span>{' '}
              <span className={systemMode === 'seed' ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold'}>
                {systemMode?.toUpperCase()}
              </span>
            </p>
            {systemMode === 'seed' && (
              <p className="text-amber-600 text-sm">ℹ️ Sistema en modo SEED. Login disponible con credenciales del seed.</p>
            )}
          </div>
        </div>

        {/* Diagnóstico */}
        {diagnostics && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Diagnóstico</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-slate-600 text-sm">Supabase</p>
                <p className={diagnostics.status.supabase_configured ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.status.supabase_configured ? '✓' : '✗'}
                </p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">Supabase Admin</p>
                <p className={diagnostics.status.supabase_admin_configured ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.status.supabase_admin_configured ? '✓' : '✗'}
                </p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">Blob Token</p>
                <p className={diagnostics.status.blob_token_configured ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.status.blob_token_configured ? '✓' : '✗'}
                </p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">JWT Secret</p>
                <p className={diagnostics.status.jwt_secret_configured ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.status.jwt_secret_configured ? '✓' : '✗'}
                </p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">Database</p>
                <p className={diagnostics.status.database_configured ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.status.database_configured ? '✓' : '✗'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bootstrap */}
        {systemMode === 'seed' || (diagnostics?.status.database_configured && diagnostics?.status.supabase_admin_configured) ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Bootstrap</h2>
            <p className="text-slate-600 mb-4">
              Ejecuta las migraciones SQL y carga el seed inicial (SuperAdmin + 4 habitaciones demo).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Secret de Bootstrap
                </label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Ingresa el secret"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={bootstrapping}
                />
              </div>

              <button
                onClick={handleBootstrap}
                disabled={bootstrapping}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {bootstrapping ? 'Bootstrapping...' : 'Ejecutar Bootstrap'}
              </button>

              {bootstrapResult && (
                <div className={`p-4 rounded-lg ${bootstrapResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="font-semibold mb-2">
                    {bootstrapResult.success ? '✓ Bootstrap exitoso' : '✗ Bootstrap con errores'}
                  </p>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(bootstrapResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
