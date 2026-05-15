import { useEffect, useState } from 'react'

type ToastTone = 'info' | 'success' | 'warning' | 'error'

type ToastItem = {
  id: number
  message: string
  tone: ToastTone
}

const toneStyles: Record<ToastTone, string> = {
  info: 'border-sky-400/40 bg-sky-500/15 text-sky-50',
  success: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-50',
  warning: 'border-amber-400/40 bg-amber-500/15 text-amber-50',
  error: 'border-rose-400/40 bg-rose-500/15 text-rose-50',
}

let toastId = 0

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
    <div className="fixed right-4 top-4 z-[2000] flex w-[min(92vw,22rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${toneStyles[toast.tone]}`}
        >
          <p className="text-sm font-medium leading-6">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}