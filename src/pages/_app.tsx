import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../lib/useAuth'
import { useAuth } from '../lib/useAuth'
import AppLayout from '../components/layout/AppLayout'
import ToastHost from '../components/feedback/ToastHost'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

type AppShellProps = Pick<AppProps, 'Component' | 'pageProps'>

function AppShell({ Component, pageProps }: AppShellProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const isPublicRoute = router.pathname === '/login' || router.pathname === '/register'

  if (isPublicRoute || !isAuthenticated) {
    return <Component {...pageProps} />
  }

  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <AuthProvider>
        <ToastHost />
        <AppShell Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </main>
  )
}
