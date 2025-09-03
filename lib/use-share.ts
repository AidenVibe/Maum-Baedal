'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  shareWithWebAPI, 
  copyToClipboard, 
  generateImage,
  shareImage,
  copyImageToClipboard,
  downloadImage,
  generateShareText,
  ConversationShareData 
} from './share'

export interface ShareOptions {
  type: 'url' | 'text' | 'image'
  action: 'share' | 'copy' | 'download'
}

export function useShare(conversation: ConversationShareData, baseUrl: string = '') {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  
  const shareUrl = `${baseUrl}/conversation/${conversation.id}`
  const shareText = generateShareText(conversation)
  
  /**
   * URL만 공유
   */
  const shareUrl_ = useCallback(async () => {
    const success = await shareWithWebAPI({
      title: '마음배달 - 가족과의 따뜻한 대화',
      text: '가족과 나눈 따뜻한 대화를 확인해보세요 ✨',
      url: shareUrl
    })
    
    if (!success) {
      // Fallback: URL 복사
      const copied = await copyToClipboard(shareUrl)
      if (copied) {
        toast.success('링크가 클립보드에 복사되었습니다')
      } else {
        toast.error('공유에 실패했습니다')
      }
    }
  }, [shareUrl])
  
  /**
   * 텍스트 + URL 공유
   */
  const shareText_ = useCallback(async () => {
    const fullText = `${shareText}\n\n${shareUrl}`
    
    const success = await shareWithWebAPI({
      title: '마음배달 - 가족과의 따뜻한 대화',
      text: fullText,
      url: shareUrl
    })
    
    if (!success) {
      // Fallback: 텍스트 복사
      const copied = await copyToClipboard(fullText)
      if (copied) {
        toast.success('대화 내용이 클립보드에 복사되었습니다')
      } else {
        toast.error('공유에 실패했습니다')
      }
    }
  }, [shareText, shareUrl])
  
  /**
   * 텍스트만 클립보드에 복사
   */
  const copyText = useCallback(async () => {
    const fullText = `${shareText}\n\n${shareUrl}`
    const copied = await copyToClipboard(fullText)
    
    if (copied) {
      toast.success('대화 내용이 클립보드에 복사되었습니다')
    } else {
      toast.error('복사에 실패했습니다')
    }
  }, [shareText, shareUrl])
  
  /**
   * 이미지 생성
   */
  const generateShareImage = useCallback(async (elementId: string) => {
    if (generatedImage) {
      return generatedImage
    }
    
    setIsGeneratingImage(true)
    
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('이미지를 생성할 요소를 찾을 수 없습니다')
      }
      
      const imageDataUrl = await generateImage(element, {
        width: 1200,
        height: 630,
        backgroundColor: '#ffffff'
      })
      
      if (!imageDataUrl) {
        throw new Error('이미지 생성에 실패했습니다')
      }
      
      setGeneratedImage(imageDataUrl)
      return imageDataUrl
    } catch (error) {
      console.error('Image generation error:', error)
      toast.error('이미지 생성에 실패했습니다')
      return null
    } finally {
      setIsGeneratingImage(false)
    }
  }, [generatedImage])
  
  /**
   * 이미지 공유
   */
  const shareImage_ = useCallback(async (elementId: string) => {
    const imageDataUrl = await generateShareImage(elementId)
    if (!imageDataUrl) return
    
    const success = await shareImage(imageDataUrl, conversation, shareUrl)
    
    if (!success) {
      // Fallback: 텍스트 공유
      await shareText_()
    }
  }, [generateShareImage, conversation, shareUrl, shareText_])
  
  /**
   * 이미지를 클립보드에 복사
   */
  const copyImage = useCallback(async (elementId: string) => {
    const imageDataUrl = await generateShareImage(elementId)
    if (!imageDataUrl) return
    
    const success = await copyImageToClipboard(imageDataUrl)
    
    if (success) {
      toast.success('이미지가 클립보드에 복사되었습니다')
    } else {
      // Fallback: 이미지 다운로드
      downloadImage(imageDataUrl, `마음배달_${conversation.serviceDay}.png`)
      toast.success('이미지가 다운로드되었습니다')
    }
  }, [generateShareImage, conversation.serviceDay])
  
  /**
   * 이미지 다운로드
   */
  const downloadImage_ = useCallback(async (elementId: string) => {
    const imageDataUrl = await generateShareImage(elementId)
    if (!imageDataUrl) return
    
    downloadImage(imageDataUrl, `마음배달_${conversation.serviceDay}.png`)
    toast.success('이미지가 다운로드되었습니다')
  }, [generateShareImage, conversation.serviceDay])
  
  /**
   * 통합 공유 함수
   */
  const share = useCallback(async (options: ShareOptions, elementId?: string) => {
    switch (options.type) {
      case 'url':
        if (options.action === 'share') {
          await shareUrl_()
        } else if (options.action === 'copy') {
          const copied = await copyToClipboard(shareUrl)
          if (copied) {
            toast.success('링크가 클립보드에 복사되었습니다')
          } else {
            toast.error('복사에 실패했습니다')
          }
        }
        break
        
      case 'text':
        if (options.action === 'share') {
          await shareText_()
        } else if (options.action === 'copy') {
          await copyText()
        }
        break
        
      case 'image':
        if (!elementId) {
          toast.error('이미지를 생성할 요소 ID가 필요합니다')
          return
        }
        
        if (options.action === 'share') {
          await shareImage_(elementId)
        } else if (options.action === 'copy') {
          await copyImage(elementId)
        } else if (options.action === 'download') {
          await downloadImage_(elementId)
        }
        break
    }
  }, [shareUrl_, shareText_, copyText, shareImage_, copyImage, downloadImage_, shareUrl])
  
  return {
    share,
    shareUrl: shareUrl_,
    shareText: shareText_,
    copyText,
    shareImage: shareImage_,
    copyImage,
    downloadImage: downloadImage_,
    generateShareImage,
    isGeneratingImage,
    generatedImage,
    shareData: {
      url: shareUrl,
      text: shareText
    }
  }
}