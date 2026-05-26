import { ReactNode } from 'react'
import Card from '../ui/Card'

type Props = {
  label: string
  value: string | number
  icon: ReactNode
  hint?: string
}

export default function KpiCard({ label, value, icon, hint }: Props) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
          <p className="mt-3 font-display text-4xl text-ink-900 leading-none">{value}</p>
          {hint && <p className="mt-2 text-xs text-ink-500">{hint}</p>}
        </div>
        <div className="inline-flex w-10 h-10 items-center justify-center rounded-md bg-sand-100 text-ink-700">
          {icon}
        </div>
      </div>
    </Card>
  )
}
