'use client'

import { useEffect } from 'react'

/**
 * 브라우저 확장 프로그램으로 인한 에러를 조용히 무시하는 컴포넌트
 * 
 * 무시하는 에러들:
 * - "The message port closed before a response was received"
 * - content.js 관련 에러
 * - 브라우저 확장 프로그램 통신 에러
 */
export function ErrorSuppressor() {
  useEffect(() => {
    // 브라우저 확장 프로그램 관련 에러를 무시하는 핸들러
    const handleError = (event: ErrorEvent) => {
      const message = event.message?.toLowerCase() || ''
      const source = event.filename?.toLowerCase() || ''
      
      // 브라우저 확장 프로그램 관련 에러 패턴들
      const extensionErrorPatterns = [
        'the message port closed before a response was received',
        'content.js',
        'extension context invalidated',
        'could not establish connection',
        'chrome-extension://',
        'moz-extension://',
        'safari-web-extension://',
        'context invalidated',
        'message channel closed',
        'port closed',
      ]
      
      // 패턴이 매치되면 에러를 무시 (preventDefault)
      const isExtensionError = extensionErrorPatterns.some(pattern => 
        message.includes(pattern) || source.includes(pattern)
      )
      
      if (isExtensionError) {
        event.preventDefault()
        event.stopPropagation()
        // 개발 모드에서만 조용히 로그 남기기
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Suppressed Extension Error]:', event.message)
        }
        return true // 에러 처리됨을 표시
      }
      
      return false // 다른 에러는 정상 처리
    }
    
    // Promise rejection 에러도 처리
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString()?.toLowerCase() || ''
      
      const extensionErrorPatterns = [
        'the message port closed before a response was received',
        'extension context invalidated',
        'could not establish connection',
        'message channel closed',
      ]
      
      const isExtensionError = extensionErrorPatterns.some(pattern => 
        reason.includes(pattern)
      )
      
      if (isExtensionError) {
        event.preventDefault()
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Suppressed Extension Promise Rejection]:', event.reason)
        }
        return true
      }
      
      return false
    }
    
    // 이벤트 리스너 등록
    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
    
    // 정리 함수
    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
    }
  }, [])
  
  return null // 이 컴포넌트는 UI를 렌더링하지 않음
}