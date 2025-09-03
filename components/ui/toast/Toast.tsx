'use client'

import React, { useEffect, useState } from 'react'
import { Toast as ToastType } from './types'
import { useToast } from './useToast'
import { GateOpenedToast } from './GateOpenedToast'

interface ToastProps {
  toast: ToastType
}

export function Toast({ toast }: ToastProps) {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // 등장 애니메이션을 위한 지연
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(showTimer)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeToast(toast.id)
    }, 200) // 애니메이션 완료 후 제거
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  // 게이트 공개 토스트는 특별한 컴포넌트 사용
  if (toast.type === 'gate-opened' && toast.action && toast.conversationId) {
    return (
      <GateOpenedToast 
        toastId={toast.id}
        conversationId={toast.conversationId}
        onNavigate={toast.action.onClick}
      />
    )
  }

  // 토스트 타입별 스타일
  const getToastStyles = () => {
    const baseStyles = "relative w-full max-w-sm mx-auto p-4 rounded-lg shadow-lg border transition-all duration-300"
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
      case 'gate-opened':
        return `${baseStyles} bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200 text-purple-800`
      default:
        return `${baseStyles} bg-white border-gray-200 text-gray-800`
    }
  }

  // 아이콘 렌더링
  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-green-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="flex-shrink-0 w-5 h-5 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'gate-opened':
        return (
          <div className="flex-shrink-0 w-6 h-6 text-purple-500">
            🎉
          </div>
        )
      default:
        return (
          <div className="flex-shrink-0 w-5 h-5 text-blue-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'
      }`}
      role="alert"
      aria-live="assertive"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={getToastStyles()}>
        <div className="flex items-start space-x-3">
          {renderIcon()}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">
              {toast.message}
            </p>
          </div>
          
          <div className="flex-shrink-0 flex space-x-2">
            {/* 액션 버튼 */}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toast.action?.onClick()
                  }
                }}
              >
                {toast.action.label}
              </button>
            )}
            
            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="토스트 닫기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}