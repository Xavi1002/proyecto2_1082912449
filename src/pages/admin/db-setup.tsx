import { useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { Badge, Button, Card } from '../../components/ui'
import { api } from '../../lib/api'

type ConnectionStatus = 'idle' | 'checking' | 'ok' | 'error'

export default function DbSetupPage() {
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [message, setMessage] = useState('')

  const checkConnection = async () => {
    setStatus('checking')
    setMessage('')
    try {
      const response = await api.get('/health')
      setStatus('ok')
      setMessage(response.data?.message || 'Servidor disponible')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.response?.data?.error || err.message || 'No fue posible conectar')
    }
  }

  return (
    <ProtectedRoute requiredRoles={['SuperAdmin']}>
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Administración</p>
        <h1 className="mt-2 font-display text-4xl text-ink-900">Base de datos</h1>
        <p className="mt-2 text-ink-500 max-w-2xl">
          Verifica el estado de la conexión y consulta el bootstrap inicial del entorno.
        </p>
      </header>

      <div className="max-w-md mx-auto">
        <Card padding="lg">
          <h2 className="font-display text-2xl text-ink-900">Diagnóstico de base de datos</h2>
          <p className="mt-2 text-sm text-ink-500">
            Aplica las migraciones del entorno y carga datos demo (1 SuperAdmin y 4 habitaciones) para
            comenzar a operar.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm text-ink-700">Estado:</span>
            {status === 'idle' && <Badge tone="neutral">Sin verificar</Badge>}
            {status === 'checking' && <Badge tone="info">Verificando…</Badge>}
            {status === 'ok' && <Badge tone="success">Conectado</Badge>}
            {status === 'error' && <Badge tone="danger">Sin conexión</Badge>}
          </div>

          {message && (
            <p className={`mt-3 text-xs ${status === 'error' ? 'text-danger-500' : 'text-ink-500'}`}>
              {message}
            </p>
          )}

          <div className="mt-6">
            <Button
              variant="primary"
              onClick={checkConnection}
              loading={status === 'checking'}
            >
              Verificar conexión
            </Button>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
