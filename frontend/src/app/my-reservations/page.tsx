'use client';

// src/app/my-reservations/page.tsx
// Portal del cliente - Ver sus reservas

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyReservationsPage() {
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

        // Solo clientes pueden acceder aquí
        if (data.user.role !== 'cliente') {
          router.push('/dashboard');
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
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Mis Reservas</h1>
        <p className="text-slate-600 mb-8">Hola, {user?.name}</p>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-600">Fase 5: Tu historial de reservas aparecerá aquí</p>
        </div>
      </div>
    </div>
  );
}
