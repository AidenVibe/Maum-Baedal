import html2canvas from 'html2canvas'
import { toast } from 'sonner'

export interface ShareData {
  title: string
  text: string
  url: string
}

export interface ConversationShareData {
  id: string
  question: string
  answers: Array<{
    content: string
    user: {
      nickname: string
    }
  }>
  serviceDay: string
}

/**
 * ConversationDetailResponse를 ConversationShareData로 변환
 */
export function convertToShareData(conversation: any): ConversationShareData {
  return {
    id: conversation.id,
    question: conversation.question.content,
    answers: conversation.answers.map((answer: any) => ({
      content: answer.content,
      user: {
        nickname: answer.user.nickname
      }
    })),
    serviceDay: conversation.serviceDay
  }
}

/**
 * 대화 데이터를 공유용 텍스트로 변환
 */
export function generateShareText(conversation: ConversationShareData): string {
  const date = new Date(conversation.serviceDay).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric'
  })
  
  const answersText = conversation.answers
    .map(answer => `👤 ${answer.user.nickname}: ${answer.content}`)
    .join('\n')
  
  return `💝 마음배달 - ${date}의 대화

Q: ${conversation.question}

${answersText}

#마음배달 #가족대화`
}

/**
 * 웹 공유 API를 사용한 공유
 */
export async function shareWithWebAPI(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    return false
  }
  
  try {
    await navigator.share(data)
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // 사용자가 공유를 취소한 경우
      return true
    }
    console.error('Web Share API error:', error)
    return false
  }
}

/**
 * 클립보드에 텍스트 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
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
    return true
  } catch (error) {
    console.error('Clipboard copy error:', error)
    return false
  }
}

/**
 * HTML 요소를 이미지로 변환
 */
export async function generateImage(
  element: HTMLElement,
  options?: {
    width?: number
    height?: number
    backgroundColor?: string
  }
): Promise<string | null> {
  try {
    const canvas = await html2canvas(element, {
      width: options?.width || 1200,
      height: options?.height || 630,
      backgroundColor: options?.backgroundColor || '#ffffff',
      scale: 2, // 고해상도
      useCORS: true,
      allowTaint: true,
      logging: false
    })
    
    return canvas.toDataURL('image/png', 0.9)
  } catch (error) {
    console.error('Image generation error:', error)
    return null
  }
}

/**
 * 이미지 데이터를 공유
 */
export async function shareImage(
  imageDataUrl: string,
  conversation: ConversationShareData,
  shareUrl: string
): Promise<boolean> {
  try {
    // DataURL을 Blob으로 변환
    const response = await fetch(imageDataUrl)
    const blob = await response.blob()
    
    const file = new File([blob], `마음배달_${conversation.serviceDay}.png`, {
      type: 'image/png'
    })
    
    const shareData: ShareData & { files?: File[] } = {
      title: '마음배달 - 가족과의 따뜻한 대화',
      text: generateShareText(conversation),
      url: shareUrl,
      files: [file]
    }
    
    // 파일 공유 지원 확인
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData)
      return true
    }
    
    // 파일 공유가 지원되지 않으면 텍스트만 공유
    return await shareWithWebAPI({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url
    })
  } catch (error) {
    console.error('Image share error:', error)
    return false
  }
}

/**
 * 이미지를 클립보드에 복사
 */
export async function copyImageToClipboard(imageDataUrl: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      return false
    }
    
    const response = await fetch(imageDataUrl)
    const blob = await response.blob()
    
    const clipboardItem = new ClipboardItem({
      [blob.type]: blob
    })
    
    await navigator.clipboard.write([clipboardItem])
    return true
  } catch (error) {
    console.error('Image clipboard copy error:', error)
    return false
  }
}

/**
 * 이미지 다운로드
 */
export function downloadImage(
  imageDataUrl: string, 
  filename: string = `마음배달_${new Date().toISOString().split('T')[0]}.png`
): void {
  const link = document.createElement('a')
  link.href = imageDataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}