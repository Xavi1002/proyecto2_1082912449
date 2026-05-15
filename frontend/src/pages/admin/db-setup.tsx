import ProtectedRoute from '../../components/ProtectedRoute'

export default function DbSetupPage() {
  return (
    <ProtectedRoute requiredRoles={['SuperAdmin']}>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-hm-text-secondary">Administración</p>
        <h1 className="mt-2 text-3xl font-bold text-hm-text-main">Configuración de Base de Datos</h1>
      </header>

      <section className="rounded-xl border border-hm-border bg-white p-6">
        <p className="text-lg font-semibold text-hm-text-main">
          Aplicará 4 migrations y cargará: 1 usuario SuperAdmin y 4 habitaciones demo.
        </p>
        <p className="mt-3 text-hm-text-secondary">
          Usa este panel para ejecutar el bootstrap inicial y validar que el entorno esté listo para operar.
        </p>
      </section>
    </ProtectedRoute>
  )
}
