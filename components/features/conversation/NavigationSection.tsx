import { Card, CardContent } from "@/components/ui/card"

interface NavigationSectionProps {
  // TODO: 추후 확장을 위한 props
  // previousConversationId?: string
  // nextConversationId?: string
  // onPrevious?: () => void
  // onNext?: () => void
}

export function NavigationSection({}: NavigationSectionProps) {
  return (
    <div className="px-4 py-6">
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            {/* 네비게이션 제목 */}
            <h3 className="text-sm font-medium text-gray-700">
              다른 대화 보기
            </h3>
            
            {/* 네비게이션 버튼들 (비활성화 상태) */}
            <div className="flex items-center justify-between gap-4">
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                aria-label="이전 대화"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">이전 대화</span>
              </button>
              
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                aria-label="다음 대화"
              >
                <span className="text-sm font-medium">다음 대화</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* 안내 메시지 */}
            <p className="text-xs text-gray-500 mt-2">
              대화 간 이동 기능은 곧 추가될 예정입니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}