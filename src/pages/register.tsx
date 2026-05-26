import Link from 'next/link'
import { Button } from '../components/ui'

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 p-8">
      <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-10 max-w-md text-center">
        <h1 className="font-display text-2xl text-ink-900 mb-2">Registro deshabilitado</h1>
        <p className="text-sm text-ink-500 mb-6">Las cuentas de cliente son creadas por la recepción del hotel.</p>
        <Link href="/login"><Button>Volver a iniciar sesión</Button></Link>
      </div>
    </div>
  )
}
