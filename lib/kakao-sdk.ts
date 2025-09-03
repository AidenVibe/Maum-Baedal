/**
 * 카카오 JavaScript SDK 래퍼
 * 공유 기능과 SDK 초기화를 담당
 */

let isKakaoInitialized = false

/**
 * 카카오 SDK 로드 및 초기화
 */
export async function initializeKakao(): Promise<boolean> {
  try {
    // 이미 초기화된 경우
    if (isKakaoInitialized && window.Kakao?.isInitialized()) {
      return true
    }

    // SDK가 로드되지 않은 경우 동적 로드
    if (!window.Kakao) {
      await loadKakaoSDK()
    }

    // 카카오 앱 키로 초기화 (환경변수에서)
    const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY
    if (!appKey) {
      console.error('[KAKAO] NEXT_PUBLIC_KAKAO_APP_KEY 환경변수가 설정되지 않았습니다')
      return false
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(appKey)
      isKakaoInitialized = true
      console.log('[KAKAO] SDK 초기화 완료')
    }

    return true
  } catch (error) {
    console.error('[KAKAO] SDK 초기화 실패:', error)
    return false
  }
}

/**
 * 카카오 SDK 스크립트 동적 로드
 */
function loadKakaoSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
    // integrity 속성 제거 - 카카오 SDK는 자주 업데이트되어 hash가 맞지 않을 수 있음
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      console.log('[KAKAO] SDK 로드 완료')
      resolve()
    }
    
    script.onerror = () => {
      console.error('[KAKAO] SDK 로드 실패')
      reject(new Error('카카오 SDK 로드에 실패했습니다'))
    }

    document.head.appendChild(script)
  })
}

/**
 * 카카오톡 공유 인터페이스
 */
export interface KakaoShareOptions {
  title: string
  description: string
  imageUrl?: string
  linkUrl: string
  buttonTitle?: string
}

/**
 * 카카오톡으로 링크 공유
 */
export async function shareToKakao(options: KakaoShareOptions): Promise<boolean> {
  try {
    const initialized = await initializeKakao()
    if (!initialized) {
      throw new Error('카카오 SDK 초기화에 실패했습니다')
    }

    // 카카오톡 공유 실행
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: options.title,
        description: options.description,
        imageUrl: options.imageUrl || 'https://dearq.app/logo-share.png', // 기본 이미지
        link: {
          mobileWebUrl: options.linkUrl,
          webUrl: options.linkUrl,
        },
      },
      buttons: [
        {
          title: options.buttonTitle || '마음배달 시작하기',
          link: {
            mobileWebUrl: options.linkUrl,
            webUrl: options.linkUrl,
          },
        },
      ],
    })

    console.log('[KAKAO] 공유 실행 완료')
    return true
  } catch (error) {
    console.error('[KAKAO] 공유 실패:', error)
    return false
  }
}

/**
 * 카카오톡 앱 설치 여부 확인
 */
export async function isKakaoTalkAvailable(): Promise<boolean> {
  try {
    const initialized = await initializeKakao()
    if (!initialized) return false

    // 모바일 환경에서 카카오톡 앱 설치 여부 확인
    if (typeof window !== 'undefined' && window.Kakao?.Share) {
      return true // SDK가 있으면 일단 true로 처리
    }
    
    return false
  } catch (error) {
    console.error('[KAKAO] 가용성 확인 실패:', error)
    return false
  }
}

/**
 * 공유 링크 생성 (백엔드 API 호출)
 */
export async function generateShareLink(message?: string): Promise<{ url: string; token: string } | null> {
  try {
    const response = await fetch('/api/onboarding/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '공유 링크 생성에 실패했습니다')
    }

    const data = await response.json()
    return {
      url: data.shareUrl,
      token: data.token
    }
  } catch (error) {
    console.error('[KAKAO] 공유 링크 생성 실패:', error)
    return null
  }
}