'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from './useToast'

interface GateOpenedToastProps {
  toastId: string
  conversationId: string
  onNavigate: () => void
}

export function GateOpenedToast({ toastId, conversationId, onNavigate }: GateOpenedToastProps) {
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
      removeToast(toastId)
    }, 300)
  }

  const handleViewConversation = () => {
    onNavigate()
    handleClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleViewConversation()
    }
  }

  return (
    <div
      className={`transform transition-all duration-500 ease-out ${
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-full opacity-0 scale-95'
      }`}
      role="alert"
      aria-live="assertive"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative w-full max-w-sm mx-auto">
        {/* 배경 글로우 효과 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
        
        {/* 메인 토스트 */}
        <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 상단 장식 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300"></div>
          
          <div className="p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="text-2xl animate-bounce">🎉</div>
                <div className="text-lg font-bold">마음의 문이 열렸어요!</div>
              </div>
              
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white transition-colors duration-200 p-1"
                aria-label="토스트 닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 메시지 */}
            <div className="mb-4">
              <p className="text-sm leading-relaxed">
                두 분 모두 답변을 완료하셨어요!<br />
                이제 서로의 마음을 확인해보세요 💙
              </p>
            </div>
            
            {/* 액션 버튼들 */}
            <div className="flex space-x-2">
              <button
                onClick={handleViewConversation}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                대화 보기
              </button>
              
              <button
                onClick={handleClose}
                className="px-4 py-2.5 text-white/80 hover:text-white transition-colors duration-200 text-sm"
              >
                나중에
              </button>
            </div>
          </div>
          
          {/* 하단 장식 파티클 */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="flex justify-center space-x-1 pb-2">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
              <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}