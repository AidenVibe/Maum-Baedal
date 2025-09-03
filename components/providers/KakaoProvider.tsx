'use client'

import { useEffect } from 'react'

interface KakaoProviderProps {
  children: React.ReactNode
}

export function KakaoProvider({ children }: KakaoProviderProps) {
  useEffect(() => {
    // 카카오 SDK 로드 및 초기화
    const initKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
        // 환경변수에서 카카오 앱 키 가져오기 (클라이언트용 JavaScript 키)
        const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
        
        if (kakaoAppKey) {
          window.Kakao.init(kakaoAppKey)
          console.log('✅ 카카오 SDK 초기화 완료')
        } else {
          console.warn('⚠️ NEXT_PUBLIC_KAKAO_JS_KEY 환경변수가 설정되지 않았습니다.')
        }
      }
    }

    // 카카오 SDK 스크립트 로드
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
    script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4'
    script.crossOrigin = 'anonymous'
    script.async = true
    
    script.onload = initKakao
    script.onerror = () => {
      console.error('❌ 카카오 SDK 로드 실패')
    }

    document.head.appendChild(script)

    // cleanup
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return <>{children}</>
}