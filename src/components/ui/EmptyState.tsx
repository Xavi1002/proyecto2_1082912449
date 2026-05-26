import { ReactNode } from 'react'

type Props = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="bg-white border border-sand-200 rounded-xl shadow-paper px-6 py-16 text-center">
      {icon && <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sand-100 text-ink-500 mb-4">{icon}</div>}
      <h3 className="font-display text-xl text-ink-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-ink-500 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
