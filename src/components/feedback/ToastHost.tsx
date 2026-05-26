import { useEffect, useState } from 'react'
import { AlertCircle, Check } from '../icons'

type ToastTone = 'info' | 'success' | 'warning' | 'error'

type ToastItem = {
  id: number
  message: string
  tone: ToastTone
}

let toastId = 0

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'success') {
    return <Check size={18} className="text-success-500 shrink-0 mt-0.5" />
  }
  if (tone === 'error') {
    return <AlertCircle size={18} className="text-danger-500 shrink-0 mt-0.5" />
  }
  if (tone === 'warning') {
    return <AlertCircle size={18} className="text-warning-500 shrink-0 mt-0.5" />
  }
  return <AlertCircle size={18} className="text-ink-500 shrink-0 mt-0.5" />
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string; tone?: ToastTone }>
      const message = customEvent.detail?.message?.trim()

      if (!message) {
        return
      }

      const nextToast: ToastItem = {
        id: ++toastId,
        message,
        tone: customEvent.detail?.tone || 'info',
      }

      setToasts((current) => [...current, nextToast])
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== nextToast.id))
      }, 4200)
    }

    window.addEventListener('hm:toast', handleToast)
    return () => window.removeEventListener('hm:toast', handleToast)
  }, [])

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 bottom-4 z-[2000] flex w-[min(92vw,22rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border border-sand-200 rounded-md shadow-paper px-4 py-3 flex items-start gap-3"
        >
          <ToastIcon tone={toast.tone} />
          <p className="text-sm text-ink-900 leading-6">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
