'use client'

import React, { createContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastContextValue } from './types'
import { useRouter } from 'next/navigation'

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const router = useRouter()

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000 // 기본 5초
    }

    setToasts(prev => {
      // 최대 3개까지만 표시
      const updated = [newToast, ...prev].slice(0, 3)
      return updated
    })

    // 자동 닫힘 타이머 (persistent가 아닌 경우)
    if (!toast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  const showGateOpened = useCallback((conversationId: string) => {
    addToast({
      type: 'gate-opened',
      message: '축하해요! 마음의 문이 활짝 열렸습니다!',
      duration: 8000, // 게이트 공개는 더 오래 표시
      conversationId,
      action: {
        label: '대화 보기',
        onClick: () => router.push(`/conversation/${conversationId}`)
      }
    })
  }, [addToast, router])

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    showGateOpened
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export { ToastContext }