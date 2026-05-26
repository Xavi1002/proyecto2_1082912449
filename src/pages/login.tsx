import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { AlertCircle } from '../components/icons'
import { Button, Input } from '../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.mustChangePassword) router.replace('/profile')
      else if (user?.role === 'Cliente') router.replace('/my-reservations')
      else router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router, user])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-sand-50">
      {/* Panel marca */}
      <div className="hidden md:flex flex-col justify-between bg-ink-900 text-white p-12">
        <div className="flex items-center gap-3">
          <span className="inline-flex w-11 h-11 items-center justify-center rounded-md bg-white/10 font-display text-lg">HM</span>
          <span className="font-display text-xl">HotelManager Pro</span>
        </div>
        <div>
          <h1 className="font-display text-4xl leading-tight text-white mb-3">Operación hotelera, sin fricción.</h1>
          <p className="text-white/70 max-w-md">Gestiona habitaciones, clientes y reservas desde un panel coherente y rápido.</p>
        </div>
        <div className="text-white/40 text-xs">© HotelManager Pro</div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl text-ink-900 mb-2">Iniciar sesión</h2>
          <p className="text-sm text-ink-500 mb-8">Accede con tus credenciales del sistema.</p>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 mb-4 bg-[#F5DDDB] border border-danger-500/30 rounded-md text-sm text-danger-500">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Correo"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
