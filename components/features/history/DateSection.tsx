'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Calendar, MessageCircle } from 'lucide-react'
import CompanionConversationBlock, { type CompanionConversationData } from './CompanionConversationBlock'
import { companionColors } from './CompanionConversationBlock'

interface DateSectionProps {
  date: string
  conversations: CompanionConversationData[]
  onConversationClick?: (conversationId: string) => void
  onWatchAd?: (conversationId: string) => void
  onSkipAnswer?: (conversationId: string) => void
  onAnswerNow?: (conversationId: string) => void
}

export default function DateSection({ 
  date, 
  conversations,
  onConversationClick,
  onWatchAd,
  onSkipAnswer,
  onAnswerNow
}: DateSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    
    return date.toLocaleDateString('ko-KR', { 
      month: 'long', 
      day: 'numeric', 
      weekday: 'short' 
    })
  }
  
  const getDateStatus = () => {
    const completedCount = conversations.filter(c => c.status === 'opened').length
    const waitingCount = conversations.filter(c => c.status === 'waiting').length
    const incompleteCount = conversations.filter(c => c.status === 'incomplete').length
    
    return { completedCount, waitingCount, incompleteCount }
  }
  
  const { completedCount, waitingCount, incompleteCount } = getDateStatus()
  
  return (
    <Card className="rounded-xl shadow-sm bg-gradient-to-br from-violet-50/30 to-white border-violet-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* 날짜 정보 */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-violet-600">
              {formatDate(date)}
            </span>
            <span className="text-xs text-slate-500">
              {date}
            </span>
          </div>
          
          {/* 동반자별 색상 점과 통계 */}
          <div className="flex items-center space-x-2">
            {/* 참여 동반자 색상점 */}
            <div className="flex items-center space-x-1">
              {conversations.map(conv => {
                const colorConfig = companionColors[conv.companionColor]
                return (
                  <div 
                    key={conv.companionId} 
                    className={`w-3 h-3 rounded-full ${colorConfig.dot}`}
                    title={conv.companionLabel || conv.companionNickname}
                  />
                )
              })}
            </div>
            
            {/* 대화 수 */}
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <MessageCircle className="w-3 h-3" />
              <span>{conversations.length}개 대화</span>
            </div>
          </div>
        </div>
        
        {/* 상태별 요약 (옵션) */}
        {(waitingCount > 0 || incompleteCount > 0) && (
          <div className="flex items-center space-x-3 mt-2 text-xs">
            {completedCount > 0 && (
              <span className="text-green-600 font-medium">
                완료 {completedCount}개
              </span>
            )}
            {waitingCount > 0 && (
              <span className="text-yellow-600 font-medium">
                대기 {waitingCount}개
              </span>
            )}
            {incompleteCount > 0 && (
              <span className="text-red-500 font-medium">
                미완료 {incompleteCount}개
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {conversations.map(conversation => (
          <CompanionConversationBlock 
            key={conversation.id}
            conversation={conversation}
            onClick={onConversationClick ? () => onConversationClick(conversation.id) : undefined}
            onWatchAd={onWatchAd}
            onSkipAnswer={onSkipAnswer}
            onAnswerNow={onAnswerNow}
          />
        ))}
      </CardContent>
    </Card>
  )
}