import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return

    if (user.role === 'Cliente') {
      router.replace('/my-reservations')
      return
    }

    router.replace('/dashboard')
  }, [isLoading, isAuthenticated, user, router])

  return (
    <main style={styles.main}>
      <div style={styles.panel}>
        {isLoading ? <p>Cargando sesión...</p> : <p>Redirigiendo al panel correspondiente...</p>}
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: 'calc(100vh - 72px)',
    background: 'linear-gradient(180deg, #f4efe7 0%, #eef3f7 100%)',
    padding: '2rem 1rem 3rem',
  },
  panel: {
    maxWidth: '960px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '3rem',
    boxShadow: '0 20px 60px rgba(18, 38, 63, 0.08)',
  },
} as const
