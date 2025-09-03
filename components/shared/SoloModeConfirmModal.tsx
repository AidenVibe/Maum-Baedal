'use client'

import { Button } from '@/components/ui/button'

interface SoloModeConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function SoloModeConfirmModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}: SoloModeConfirmModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
        {/* 모달 컨텐츠 */}
        <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💝 함께모드로 전환됩니다
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              질문을 공유해서 상대방이 답변하면<br />
              <span className="font-medium text-purple-600">혼자하기 → 함께하기</span>로 바뀌어요.<br />
              <br />
              앞으로는 이 분과만 매일 질문을 주고받게 됩니다.
            </p>
          </div>
          
          {/* 버튼 그룹 */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 min-h-[44px] font-semibold border-2 border-gray-300 
                       text-gray-600 hover:bg-gray-50 hover:border-gray-400
                       active:bg-gray-100 active:border-gray-500
                       transition-all duration-200 rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}
            >
              취소
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 min-h-[44px] font-bold 
                       bg-yellow-400 active:bg-yellow-500
                       text-gray-900 border border-yellow-500
                       shadow-lg active:shadow-md 
                       transform active:translate-y-0.5
                       rounded-lg transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 700 }}
            >
              {isLoading ? '공유 중...' : '공유하기'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SoloModeConfirmModal