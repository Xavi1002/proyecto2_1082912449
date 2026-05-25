import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace('/login')
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg rounded-3xl border border-white/15 bg-white/10 p-8 text-center text-white shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">HotelManager Pro</p>
        <h1 className="mt-4 text-3xl font-bold">Registro deshabilitado</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          La creación de usuarios la realiza administración. Serás redirigido al inicio de sesión.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Ir al login
        </Link>
      </div>
    </div>
  )
}
