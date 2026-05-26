import { ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const tones: Record<Tone, string> = {
  neutral: 'bg-sand-100 text-ink-700',
  success: 'bg-[#E5F0EA] text-success-500',
  warning: 'bg-[#F5E9D9] text-warning-500',
  danger: 'bg-[#F5DDDB] text-danger-500',
  info: 'bg-[#E0E6F2] text-ink-900',
}

export default function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 h-6 text-xs font-medium rounded-full ${tones[tone]}`}>
      {children}
    </span>
  )
}
