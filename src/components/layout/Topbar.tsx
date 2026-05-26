import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, LogOut, UserCircle } from '../icons'
import Avatar from '../ui/Avatar'

type Props = {
  user?: { name: string; email: string; role: string }
  onLogout: () => void
}

export default function Topbar({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false)
  if (!user) return null
  return (
    <header className="h-16 bg-white border-b border-sand-200 flex items-center justify-end px-6">
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 h-10 px-2 rounded-md hover:bg-sand-50 transition"
        >
          <Avatar name={user.name} size="sm" />
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-sm font-medium text-ink-900">{user.name}</div>
            <div className="text-xs text-ink-500">{user.role}</div>
          </div>
          <ChevronDown size={16} className="text-ink-400" />
        </button>
        {open && (
          <div className="absolute right-0 top-12 w-56 bg-white border border-sand-200 rounded-xl shadow-paper p-2 z-30">
            <Link href="/profile" className="flex items-center gap-2 px-3 h-10 rounded-md text-sm text-ink-900 hover:bg-sand-50">
              <UserCircle size={18} className="text-ink-500" /> Mi perfil
            </Link>
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 h-10 rounded-md text-sm text-danger-500 hover:bg-sand-50">
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
