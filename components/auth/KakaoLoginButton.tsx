'use client'

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface KakaoLoginButtonProps {
  className?: string
}

export default function KakaoLoginButton({ className }: KakaoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true)
      console.log('[CLIENT DEBUG] 카카오 로그인 시작')
      
      // 현재 URL에서 callbackUrl 파라미터 추출
      const urlParams = new URLSearchParams(window.location.search)
      const callbackUrl = urlParams.get('callbackUrl') || '/today'
      
      console.log('[CLIENT DEBUG] callbackUrl:', callbackUrl)
      console.log('[CLIENT DEBUG] window.location:', window.location.href)
      
      // NextAuth의 기본 리다이렉트 동작을 사용
      console.log('[CLIENT DEBUG] signIn 호출 전')
      
      const result = await signIn('kakao', { 
        callbackUrl: callbackUrl
        // redirect는 기본값(true)을 사용
      })
      
      // 리다이렉트가 되지 않았다면 결과 로깅
      console.log('[CLIENT DEBUG] signIn 완료 - 예상치 못한 결과:', result)
      
    } catch (error) {
      console.error('[CLIENT ERROR] 카카오 로그인 중 예외:', error)
      alert('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.')
      setIsLoading(false)
    }
  }


  return (
    <div className={`space-y-3 ${className || ''}`}>
      <Button 
        onClick={handleKakaoLogin}
        disabled={isLoading}
        className="w-full bg-yellow-400 active:bg-yellow-500 text-gray-900 font-semibold py-3 h-12 transition-colors touch-target focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
        size="lg"
        aria-label={isLoading ? "카카오 로그인 진행 중" : "카카오톡으로 마음배달 시작하기"}
      >
        <svg 
          className="w-5 h-5 mr-2" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678-.112-.472-.618L6.75 18.95c-2.69-1.373-4.5-3.65-4.5-6.28C2.25 6.665 6.201 3 12 3z"/>
        </svg>
        {isLoading ? '로그인 중...' : '카카오로 시작하기'}
      </Button>
    </div>
  )
}