'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, MessageCircle } from "lucide-react"
import { useQuestionShare } from "@/lib/hooks/useQuestionShare"
import { SoloModeConfirmModal } from "@/components/shared/SoloModeConfirmModal"

interface QuestionCardProps {
  question: string
  questionId?: string
  assignmentId?: string
  category?: string
  soloMode?: boolean
  canShare?: boolean
  shareUrl?: string
  onShare?: () => void
  isTestMode?: boolean
  hasCompanion?: boolean  // 동반자 있는지 여부
}

export function QuestionCard({ 
  question, 
  questionId = 'test-question', 
  assignmentId = 'test-assignment', 
  category = 'general',
  soloMode = false, 
  canShare = true,
  shareUrl,
  onShare,
  isTestMode = false,
  hasCompanion = true  // 기본값은 동반자 있음
}: QuestionCardProps) {
  // 중앙화된 공유 로직 사용
  const {
    isSharing,
    showSoloModeConfirm,
    handleShare,
    confirmSoloShare,
    cancelSoloShare
  } = useQuestionShare({
    soloMode,
    questionContent: question,
    assignmentId,
    serviceDay: new Date().toISOString().split('T')[0],
    onShareComplete: (shareUrl) => {
      if (onShare) {
        onShare()
      }
    }
  })


  return (
    <Card className="rounded-xl shadow-sm bg-gradient-to-br from-violet-50 to-white border-violet-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between text-violet-600" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
          <span>오늘의 질문</span>
          {soloMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-violet-100 text-violet-600 px-2 py-1 rounded-full">
                혼자서 시작
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>
          {question}
        </p>
        
        {/* 질문 공유 버튼 (모든 모드에서 표시) */}
        <div className="pt-2 border-t border-violet-100">
          <Button
            onClick={handleShare}
            disabled={isSharing}
            variant="default"
            size="sm"
            className="w-full min-h-[44px] font-bold transition-all duration-300 
                     bg-yellow-400 active:bg-yellow-500 
                     disabled:bg-gray-400
                     text-gray-900 border border-yellow-500
                     shadow-lg active:shadow-md 
                     transform active:translate-y-0.5
                     rounded-lg"
            style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 700 }}
          >
            {isSharing ? (
              <>
                <Share2 className="w-5 h-5 mr-2 animate-spin text-gray-900" />
                <span className="text-base text-gray-900">공유 중...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 mr-2 drop-shadow-sm text-gray-900" />
                <span className="text-base text-gray-900">질문 공유하기 (카카오톡)</span>
              </>
            )}
          </Button>
          <p className="text-xs text-violet-600 mt-3 text-center font-medium leading-relaxed" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>
            🥰 가족에게 질문을 공유해서 함께 고민해보세요!
          </p>
        </div>

        {/* 솔로모드 공유 확인 모달 */}
        <SoloModeConfirmModal
          isOpen={showSoloModeConfirm}
          onConfirm={confirmSoloShare}
          onCancel={cancelSoloShare}
          isLoading={isSharing}
        />
      </CardContent>
    </Card>
  )
}

