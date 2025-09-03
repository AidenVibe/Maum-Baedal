'use client'

import { useState, useCallback } from 'react'
import { shareToKakao, createShareLink, showShareResult, type ShareOptions } from '@/lib/services/shareService'
import { isTestModeParam } from '@/lib/dev-mock'

export interface UseQuestionShareProps {
  soloMode?: boolean
  questionContent: string
  assignmentId?: string
  serviceDay?: string
  onShareComplete?: (shareUrl: string) => void
}

export interface UseQuestionShareReturn {
  // 상태
  isSharing: boolean
  showSoloModeConfirm: boolean
  shareError: string | null
  
  // 액션
  handleShare: () => Promise<void>
  confirmSoloShare: () => Promise<void>
  cancelSoloShare: () => void
  
  // 직접 공유 (URL이 이미 있는 경우)
  shareDirectly: (shareUrl: string) => Promise<void>
}

export function useQuestionShare({
  soloMode = false,
  questionContent,
  assignmentId,
  serviceDay = new Date().toISOString().split('T')[0],
  onShareComplete
}: UseQuestionShareProps): UseQuestionShareReturn {
  const [isSharing, setIsSharing] = useState(false)
  const [showSoloModeConfirm, setShowSoloModeConfirm] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  
  // 실제 공유 실행
  const performShare = useCallback(async (shareUrl?: string): Promise<void> => {
    setIsSharing(true)
    setShareError(null)
    
    try {
      let finalShareUrl = shareUrl

      // 공유 URL이 없으면 생성
      if (!finalShareUrl) {
        if (!assignmentId) {
          throw new Error('공유 링크를 생성하기 위한 정보가 없습니다.')
        }

        const isTestMode = isTestModeParam()
        
        if (isTestMode) {
          // 테스트 모드에서는 Mock 데이터 사용
          await new Promise(resolve => setTimeout(resolve, 1000))
          finalShareUrl = 'https://dearq.app/join/test-share-token-' + Date.now()
        } else {
          // 실제 공유 링크 생성
          finalShareUrl = await createShareLink(assignmentId, isTestMode)
        }
      }

      // 카카오톡 공유 실행
      const shareOptions: ShareOptions = {
        shareUrl: finalShareUrl,
        questionContent,
        serviceDay,
        isTestMode: isTestModeParam()
      }

      const result = await shareToKakao(shareOptions)
      showShareResult(result)

      // 공유 완료 콜백 실행
      if (onShareComplete) {
        onShareComplete(finalShareUrl)
      }

    } catch (error) {
      console.error('Share error:', error)
      const errorMessage = error instanceof Error ? error.message : '공유 중 오류가 발생했습니다.'
      setShareError(errorMessage)
      showShareResult({ success: false, method: 'kakao', error: errorMessage })
    } finally {
      setIsSharing(false)
    }
  }, [questionContent, assignmentId, serviceDay, onShareComplete])

  // 공유 시작 (솔로모드 체크 포함)
  const handleShare = useCallback(async (): Promise<void> => {
    if (soloMode) {
      setShowSoloModeConfirm(true)
      return
    }
    
    await performShare()
  }, [soloMode, performShare])

  // 솔로모드 공유 확인
  const confirmSoloShare = useCallback(async (): Promise<void> => {
    setShowSoloModeConfirm(false)
    await performShare()
  }, [performShare])

  // 솔로모드 공유 취소
  const cancelSoloShare = useCallback((): void => {
    setShowSoloModeConfirm(false)
  }, [])

  // 직접 공유 (URL이 이미 있는 경우)
  const shareDirectly = useCallback(async (shareUrl: string): Promise<void> => {
    if (soloMode) {
      setShowSoloModeConfirm(true)
      // TODO: 직접 공유 URL을 저장해두고 confirmSoloShare에서 사용
      return
    }
    
    await performShare(shareUrl)
  }, [soloMode, performShare])

  return {
    // 상태
    isSharing,
    showSoloModeConfirm,
    shareError,
    
    // 액션
    handleShare,
    confirmSoloShare,
    cancelSoloShare,
    shareDirectly
  }
}