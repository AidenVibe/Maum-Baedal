'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  useConversationNavigation, 
  useConversationKeyboardNavigation,
  formatServiceDay,
  getRelativeDateText 
} from '@/lib/hooks/useConversationNavigation'

interface ConversationNavigationProps {
  conversationId: string
  className?: string
}

export default function ConversationNavigation({ 
  conversationId, 
  className = '' 
}: ConversationNavigationProps) {
  const { navigation, loading, error, navigateTo } = useConversationNavigation(conversationId)
  
  // 키보드 단축키 지원
  useConversationKeyboardNavigation(navigation, navigateTo)

  if (loading) {
    return (
      <div className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-600 text-sm text-center">{error}</p>
      </div>
    )
  }

  if (!navigation) return null

  return (
    <nav className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 이전 대화 */}
      <div className="flex items-center min-w-0 flex-1">
        {navigation.previous ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo(navigation.previous!.id)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-2"
            title={`이전: ${navigation.previous.questionPreview}`}
          >
            <ChevronLeftIcon className="w-4 h-4 flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="text-xs text-gray-500">
                {getRelativeDateText(navigation.previous.serviceDay)}
              </div>
              <div className="text-sm truncate max-w-24">
                {navigation.previous.questionPreview}
              </div>
            </div>
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 px-2">
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="text-sm">첫 번째 대화</span>
          </div>
        )}
      </div>

      {/* 현재 대화 정보 */}
      <div className="flex flex-col items-center px-4">
        <div className="text-sm font-medium text-gray-900">
          {formatServiceDay(navigation.current.serviceDay)}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-48 text-center">
          {navigation.current.questionPreview}
        </div>
      </div>

      {/* 다음 대화 */}
      <div className="flex items-center justify-end min-w-0 flex-1">
        {navigation.next ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo(navigation.next!.id)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-2"
            title={`다음: ${navigation.next.questionPreview}`}
          >
            <div className="text-right min-w-0">
              <div className="text-xs text-gray-500">
                {getRelativeDateText(navigation.next.serviceDay)}
              </div>
              <div className="text-sm truncate max-w-24">
                {navigation.next.questionPreview}
              </div>
            </div>
            <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 px-2">
            <span className="text-sm">마지막 대화</span>
            <ChevronRightIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* 키보드 단축키 안내 (접근성) */}
      <div className="sr-only" aria-live="polite">
        Alt + 왼쪽 화살표로 이전 대화, Alt + 오른쪽 화살표로 다음 대화로 이동할 수 있습니다.
      </div>
    </nav>
  )
}

// 간단한 인라인 네비게이션 (모바일용)
export function ConversationNavigationMobile({ 
  conversationId, 
  className = '' 
}: ConversationNavigationProps) {
  const { navigation, loading, navigateTo } = useConversationNavigation(conversationId)
  
  useConversationKeyboardNavigation(navigation, navigateTo)

  if (loading || !navigation) return null

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {navigation.previous ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateTo(navigation.previous!.id)}
          className="flex items-center gap-1"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">이전</span>
        </Button>
      ) : (
        <div className="w-16" /> // 공간 유지
      )}
      
      <div className="text-center">
        <div className="text-xs text-gray-500">
          {getRelativeDateText(navigation.current.serviceDay)}
        </div>
      </div>

      {navigation.next ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateTo(navigation.next!.id)}
          className="flex items-center gap-1"
        >
          <span className="hidden sm:inline">다음</span>
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      ) : (
        <div className="w-16" /> // 공간 유지
      )}
    </div>
  )
}