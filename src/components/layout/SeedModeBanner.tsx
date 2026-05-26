import { AlertCircle } from '../icons'

export default function SeedModeBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#F5E9D9] border border-warning-500/30 rounded-md">
      <AlertCircle size={20} className="text-warning-500 shrink-0 mt-0.5" />
      <div className="text-sm text-ink-700">
        Modo demo: los datos mostrados son ejemplo. Inicia la base con bootstrap para datos reales.
      </div>
    </div>
  )
}
