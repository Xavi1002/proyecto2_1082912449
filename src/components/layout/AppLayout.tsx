import { ReactNode } from 'react'
import { useAuth } from '../../lib/useAuth'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-sand-50 flex">
      <Sidebar role={user?.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user || undefined} onLogout={logout} />
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
