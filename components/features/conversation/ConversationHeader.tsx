import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ConversationShareData } from "@/lib/share"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

interface ConversationHeaderProps {
  onBack: () => void
  onShare?: () => void  // 기존 호환성을 위해 선택적으로 만듦
  serviceDay: string
  conversation?: ConversationShareData  // 새로운 공유 시스템을 위한 전체 대화 데이터
}

export function ConversationHeader({ onBack, onShare, serviceDay, conversation }: ConversationHeaderProps) {
  // 서비스 데이를 날짜 객체로 변환
  const serviceDate = new Date(serviceDay + 'T00:00:00.000Z')
  const formattedDate = format(serviceDate, 'M월 d일', { locale: ko })

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          aria-label="뒤로 가기"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-base font-medium text-gray-900">
            {formattedDate}의 대화
          </h1>
        </div>

        {/* 공유 버튼 */}
        <button
          onClick={onShare || (() => {
            // 간단한 기본 공유 기능
            if (navigator.share) {
              navigator.share({
                title: `${formattedDate}의 대화 - 마음배달`,
                text: `${formattedDate}의 소중한 대화를 공유합니다`,
                url: window.location.href
              }).catch(console.error);
            } else {
              // 클립보드 복사 폴백
              navigator.clipboard.writeText(window.location.href).then(() => {
                alert('링크가 복사되었습니다!');
              }).catch(console.error);
            }
          })}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          aria-label="공유하기"
        >
          <Share2 className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  )
}