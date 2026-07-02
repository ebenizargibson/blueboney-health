'use client'
import { useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return { toasts, toast }
}

export function ToastContainer({ toasts }: { toasts: { id: number; message: string; type: string }[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
            t.type === 'success'
              ? 'bg-[var(--h-teal)]'
              : t.type === 'error'
                ? 'bg-red-600'
                : 'bg-blue-600'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
