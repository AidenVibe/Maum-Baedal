// 공유 관련 순수 로직을 담은 서비스
import { toast } from 'sonner'

// 카카오 SDK 타입 정의
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void
      isInitialized: () => boolean
      Share: {
        sendDefault: (options: {
          objectType: string
          content: {
            title: string
            description: string
            imageUrl?: string
            link: {
              mobileWebUrl: string
              webUrl: string
            }
          }
          buttons?: {
            title: string
            link: {
              mobileWebUrl: string
              webUrl: string
            }
          }[]
        }) => Promise<void>
      }
    }
  }
}

export interface ShareOptions {
  shareUrl: string
  questionContent: string
  serviceDay: string
  isTestMode?: boolean
}

export interface ShareResult {
  success: boolean
  method: 'kakao' | 'webshare' | 'clipboard'
  error?: string
}

/**
 * 공유 컨텐츠 생성
 */
export function createShareContent(options: ShareOptions) {
  const date = new Date(options.serviceDay).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric'
  })

  return {
    title: `💝 마음배달 - ${date}의 질문`,
    description: options.questionContent,
    imageUrl: 'https://dearq.app/og-image.png',
    url: options.shareUrl,
    text: `${options.questionContent}\n\n함께 답해볼까요?`
  }
}

/**
 * 카카오톡 공유
 */
export async function shareToKakao(options: ShareOptions): Promise<ShareResult> {
  try {
    const content = createShareContent(options)

    // 카카오 SDK가 로드되어 있는지 확인
    if (typeof window !== 'undefined' && window.Kakao && window.Kakao.Share) {
      await window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: content.title,
          description: content.description,
          imageUrl: content.imageUrl,
          link: {
            mobileWebUrl: options.shareUrl,
            webUrl: options.shareUrl
          }
        },
        buttons: [
          {
            title: '답변하러 가기',
            link: {
              mobileWebUrl: options.shareUrl,
              webUrl: options.shareUrl
            }
          }
        ]
      })

      return { success: true, method: 'kakao' }
    } else {
      // 카카오 SDK가 없으면 폴백으로 진행
      return await fallbackShare(options)
    }
  } catch (error) {
    console.error('Kakao share error:', error)
    // 카카오톡 공유 실패 시 폴백으로 진행
    return await fallbackShare(options)
  }
}

/**
 * 폴백 공유 (Web Share API 또는 클립보드)
 */
export async function fallbackShare(options: ShareOptions): Promise<ShareResult> {
  try {
    const content = createShareContent(options)
    const shareData = {
      title: content.title,
      text: content.text,
      url: options.shareUrl
    }

    // Web Share API 사용 가능한 경우
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return { success: true, method: 'webshare' }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return { success: false, method: 'webshare', error: '공유가 취소되었습니다.' }
        }
        // Web Share 실패 시 클립보드로 폴백
      }
    }

    // 클립보드 복사로 폴백
    await copyToClipboard(`${content.text}\n\n${options.shareUrl}`)
    return { success: true, method: 'clipboard' }
  } catch (error) {
    console.error('Fallback share error:', error)
    return { 
      success: false, 
      method: 'clipboard', 
      error: error instanceof Error ? error.message : '공유 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 클립보드 복사
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  } catch (error) {
    console.error('Clipboard copy error:', error)
    throw error
  }
}

/**
 * 공유 API 호출 (서버에서 공유 링크 생성)
 */
export async function createShareLink(assignmentId: string, isTestMode = false): Promise<string> {
  const response = await fetch('/api/share/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(isTestMode && { 'X-Test-Mode': 'true' })
    },
    body: JSON.stringify({
      assignmentId,
      message: '함께 오늘의 질문에 답해볼까요?'
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || '공유 링크 생성에 실패했습니다.')
  }

  return data.shareUrl
}

/**
 * 공유 결과에 따른 토스트 메시지 표시
 */
export function showShareResult(result: ShareResult) {
  if (result.success) {
    switch (result.method) {
      case 'kakao':
        toast.success('카카오톡으로 질문을 공유했습니다!')
        break
      case 'webshare':
        toast.success('질문을 공유했습니다!')
        break
      case 'clipboard':
        toast.success('링크가 클립보드에 복사되었습니다!')
        break
    }
  } else {
    toast.error(result.error || '공유 중 오류가 발생했습니다.')
  }
}