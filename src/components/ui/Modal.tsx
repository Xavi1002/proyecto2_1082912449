import { ReactNode, useEffect } from 'react'
import { X } from '../icons'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div className="relative bg-white border border-sand-200 rounded-xl shadow-paper w-full max-w-lg max-h-[90vh] overflow-auto">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-sand-200">
            <h2 className="font-display text-xl text-ink-900">{title}</h2>
            <button onClick={onClose} className="text-ink-500 hover:text-ink-900" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-sand-200 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
