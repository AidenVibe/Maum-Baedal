'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ShareInvitationProps {
  userName: string
  onBack: () => void
}

export default function ShareInvitation({ userName, onBack }: ShareInvitationProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSkipForNow = () => {
    // Solo mode로 시작 - /today로 이동
    window.location.href = '/today'
  }

  const shareMessage = shareUrl ? 
    `🌅 ${userName}님이 마음배달에 초대합니다!

매일 한 질문으로 가족과 따뜻한 대화를 나눠보세요 ✨

👉 ${shareUrl}

#마음배달 #가족대화` : 
    `🌅 ${userName}님이 마음배달에 초대합니다!

매일 한 질문으로 가족과 따뜻한 대화를 나눠보세요 ✨

먼저 시작하신 후 질문을 받으면 공유할 수 있어요!

#마음배달 #가족대화`

  const handleKakaoShare = async () => {
    setIsSharing(true)
    
    try {
      // 공유 링크가 없으면 바로 시작하도록 안내
      if (!shareUrl) {
        toast.error('먼저 시작하신 후 오늘의 질문을 받으면 공유할 수 있어요!')
        return
      }

      // 카카오톡 공유 API 호출
      if (window.Kakao) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '배달 왔어요! 함께 대화해요',
            description: shareMessage,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl
            }
          }
        })
      } else {
        // 카카오 SDK가 없으면 클립보드에 복사
        await navigator.clipboard.writeText(shareMessage)
        toast.success('초대 메시지가 클립보드에 복사되었습니다!')
      }
    } catch (error) {
      // 클립보드 복사로 폴백
      try {
        await navigator.clipboard.writeText(shareMessage)
        toast.success('초대 메시지가 클립보드에 복사되었습니다!')
      } catch (clipboardError) {
        toast.error('공유에 실패했습니다. 다시 시도해 주세요.')
      }
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage)
      toast.success('초대 메시지가 복사되었습니다!')
    } catch (error) {
      toast.error('복사에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* 뒤로 가기 */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
        이전으로
      </Button>

      {/* 안내 메시지 */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            새로운 방식으로 시작하세요!
          </h2>
          <p className="text-sm text-blue-700">
            먼저 혼자 시작한 후, 오늘의 질문을 받으면 가족에게 공유할 수 있어요
          </p>
        </CardContent>
      </Card>

      {/* 새로운 공유 방식 설명 */}
      <Card className="border-2 border-violet-200">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              🌟 더 간편해진 초대 방식
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">먼저 혼자서 시작하기</p>
                  <p className="text-xs text-gray-500">복잡한 초대코드 입력 없이 바로 시작</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">오늘의 질문을 받고 답변 작성</p>
                  <p className="text-xs text-gray-500">먼저 답변을 작성해야 공유 가능</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">카카오톡으로 질문 링크 공유</p>
                  <p className="text-xs text-gray-500">가족이 클릭만 하면 바로 참여</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시작 방법들 */}
      <div className="space-y-3">
        {/* 바로 시작하기 */}
        <Button
          onClick={handleSkipForNow}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 h-12 touch-target"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          먼저 시작하기 (혼자서도 OK!)
        </Button>

        {/* 메시지만 미리 복사 (선택사항) */}
        <Button
          onClick={handleCopyMessage}
          variant="outline"
          className="w-full py-3 h-12 touch-target"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          초대 메시지 미리 복사하기
        </Button>
      </div>

      {/* 도움말 */}
      <div className="mt-6 p-4 bg-green-50 rounded-xl">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-green-500 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,17H11V15H13M13,13H11V7H13"/>
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-1">
              어떻게 진행되나요?
            </h4>
            <p className="text-xs text-green-700 leading-relaxed">
              혼자 시작해서 오늘의 질문에 답변을 작성하면, 
              그 질문을 가족에게 바로 공유할 수 있어요! 
              가족이 링크를 클릭하면 자동으로 연결됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}