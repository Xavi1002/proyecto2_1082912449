import { ReactNode } from 'react'

type KpiCardProps = {
  title: string
  value: number
  tone: 'available' | 'occupied' | 'maintenance' | 'active'
  icon: ReactNode
}

const toneClass: Record<KpiCardProps['tone'], string> = {
  available: 'border-[#16A34A] bg-[#F0FDF4] text-[#166534]',
  occupied: 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]',
  maintenance: 'border-[#D97706] bg-[#FFFBEB] text-[#92400E]',
  active: 'border-[#1D4ED8] bg-[#DBEAFE] text-[#1E3A8A]',
}

export default function KpiCard({ title, value, tone, icon }: KpiCardProps) {
  return (
    <article className={`rounded-xl border p-5 ${toneClass[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide">{title}</p>
        <span>{icon}</span>
      </div>
      <p className="mt-4 text-4xl font-bold leading-none">{value}</p>
    </article>
  )
}
