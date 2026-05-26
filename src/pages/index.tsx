import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user) { router.replace('/login'); return }
    if (user.role === 'Cliente') { router.replace('/my-reservations'); return }
    router.replace('/dashboard')
  }, [isLoading, isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50">
      <p className="text-sm text-ink-500">Redirigiendo…</p>
    </div>
  )
}
