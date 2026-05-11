'use client';

// src/app/dashboard/page.tsx
// Dashboard - KPIs y reservas (Recepcionista y SuperAdmin)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }

        const data = await response.json();
        
        // Solo recepcionista y superadmin pueden acceder
        if (data.user.role === 'cliente') {
          router.push('/my-reservations');
          return;
        }

        setUser(data.user);
        setLoading(false);
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600 mb-8">Bienvenido, {user?.name}</p>

        {/* Placeholder para KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Habitaciones Disponibles</p>
            <p className="text-4xl font-bold text-green-600">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Ocupadas</p>
            <p className="text-4xl font-bold text-red-600">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">En Mantenimiento</p>
            <p className="text-4xl font-bold text-amber-600">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Reservas Hoy</p>
            <p className="text-4xl font-bold text-blue-600">-</p>
          </div>
        </div>

        {/* Placeholder para reservas del día */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Reservas del Día</h2>
          <p className="text-slate-600">Fase 2: Listado de reservas</p>
        </div>
      </div>
    </div>
  );
}
