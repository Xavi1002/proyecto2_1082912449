import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { Fraunces, Inter } from 'next/font/google'
import { AuthProvider } from '../lib/useAuth'
import { useAuth } from '../lib/useAuth'
import AppLayout from '../components/layout/AppLayout'
import ToastHost from '../components/feedback/ToastHost'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
})

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
    <div className={`${fraunces.variable} ${inter.variable}`}>
      <AuthProvider>
        <ToastHost />
        <AppShell Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </div>
  )
}
