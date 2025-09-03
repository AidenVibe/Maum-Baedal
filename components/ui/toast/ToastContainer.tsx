'use client'

import React from 'react'
import { useToast } from './useToast'
import { Toast } from './Toast'

export function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}
    >
      <div className="space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}