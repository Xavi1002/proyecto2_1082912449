import { useAuth } from '../lib/useAuth'
import ProtectedRoute from '../components/ProtectedRoute'
import { api } from '../lib/api'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Avatar, Badge, Button, Card, Input } from '../components/ui'

function ProfileContent() {
  const router = useRouter()
  const { user, getCurrentUser } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      setLoading(true)
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      setMessage('Contraseña actualizada. Ya puedes usar el portal normalmente.')
      setCurrentPassword('')
      setNewPassword('')
      await getCurrentUser()
      if (user?.role === 'Cliente') {
        setTimeout(() => {
          router.replace('/my-reservations')
        }, 700)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'No fue posible cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Mi cuenta</p>
        <h1 className="mt-2 font-display text-4xl text-ink-900">Perfil</h1>
        <p className="mt-2 text-ink-500">Tus datos de acceso y cambio de contraseña.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Datos */}
        <Card padding="md" className="lg:col-span-1">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user?.name || '·'} size="lg" />
            <div>
              <h2 className="font-display text-xl text-ink-900">{user?.name}</h2>
              <p className="text-sm text-ink-500">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-sand-200">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Rol</p>
              <p className="text-sm text-ink-900 mt-1">{user?.role}</p>
            </div>
            {user?.mustChangePassword && (
              <Badge tone="warning">Debes cambiar tu contraseña</Badge>
            )}
          </div>
        </Card>

        {/* Cambio de contraseña */}
        <Card padding="md" className="lg:col-span-2">
          <h2 className="font-display text-xl text-ink-900 mb-1">Cambiar contraseña</h2>
          <p className="text-sm text-ink-500 mb-6">Mínimo 6 caracteres. La sesión actual se mantiene.</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-[#F5DDDB] border border-danger-500/30 rounded-md text-sm text-danger-500">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 px-3 py-2.5 bg-[#E5F0EA] border border-success-500/30 rounded-md text-sm text-success-500">
              {message}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Contraseña actual"
              name="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="submit" loading={loading}>Guardar cambios</Button>
          </form>
        </Card>
      </div>
    </>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
