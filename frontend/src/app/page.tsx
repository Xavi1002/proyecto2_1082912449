'use client';

// src/app/page.tsx
// Página de inicio - Redirecciona al login o dashboard

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          // Usuario autenticado
          const data = await response.json();
          
          if (data.user.role === 'cliente') {
            router.push('/my-reservations');
          } else {
            router.push('/dashboard');
          }
        } else {
          // No autenticado
          router.push('/login');
        }
      } catch (error) {
        // Error en la petición
        router.push('/login');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return null;
}
