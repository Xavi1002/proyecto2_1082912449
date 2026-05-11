'use client';

// src/app/login/page.tsx
// Página de login con diseño visual específico de HotelManager Pro

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Redirigir según el rol
      if (data.user.role === 'cliente') {
        router.push('/my-reservations');
      } else {
        // superadmin, recepcionista
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Panel izquierdo - Gradiente azul oscuro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-800 to-blue-800 flex-col justify-center items-center p-12"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-md text-center text-white"
        >
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-12 h-12"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold mb-4">HotelManager Pro</h1>

          {/* Subtítulo */}
          <p className="text-slate-200 text-lg mb-6">
            Sistema de Gestión Hotelera
          </p>

          {/* Descripción */}
          <p className="text-slate-300 text-sm leading-relaxed">
            Digitaliza tu hotel. Gestiona habitaciones, reservas y clientes desde una plataforma integral.
          </p>
        </motion.div>
      </motion.div>

      {/* Panel derecho - Formulario */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12"
      >
        <div className="w-full max-w-md">
          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-lg border-t-4 border-blue-700 p-8">
            {/* Encabezado */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Bienvenido
              </h2>
              <p className="text-slate-500">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Nota: sin registro */}
            <p className="text-center text-slate-500 text-sm mt-8">
              ¿No tienes cuenta? Contacta al administrador
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-400 text-xs mt-6">
            HotelManager Pro © 2026 | Lógica y Programación
          </p>
        </div>
      </motion.div>
    </div>
  );
}
