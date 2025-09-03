'use client'

import { useState } from 'react'
import { CheckCircle, Clock, AlertCircle, ChevronRight, Play, X, Edit3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// 동반자별 색상 체계
export const companionColors = {
  primary: { 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    text: 'text-blue-600', 
    dot: 'bg-blue-500',
    hover: 'hover:bg-blue-100' 
  },
  secondary: { 
    bg: 'bg-pink-50', 
    border: 'border-pink-200', 
    text: 'text-pink-600', 
    dot: 'bg-pink-500',
    hover: 'hover:bg-pink-100' 
  },
  tertiary: { 
    bg: 'bg-green-50', 
    border: 'border-green-200', 
    text: 'text-green-600', 
    dot: 'bg-green-500',
    hover: 'hover:bg-green-100' 
  },
  quaternary: { 
    bg: 'bg-orange-50', 
    border: 'border-orange-200', 
    text: 'text-orange-600', 
    dot: 'bg-orange-500',
    hover: 'hover:bg-orange-100' 
  },
  quinary: { 
    bg: 'bg-purple-50', 
    border: 'border-purple-200', 
    text: 'text-purple-600', 
    dot: 'bg-purple-500',
    hover: 'hover:bg-purple-100' 
  },
  senary: { 
    bg: 'bg-teal-50', 
    border: 'border-teal-200', 
    text: 'text-teal-600', 
    dot: 'bg-teal-500',
    hover: 'hover:bg-teal-100' 
  }
}

export type CompanionColor = keyof typeof companionColors

// 가족 관계별 아이콘 매핑
const relationshipIcons: { [key: string]: string } = {
  '엄마': '👩',
  '어머니': '👩', 
  '엄마님': '👩',
  '아빠': '👨',
  '아버지': '👨',
  '아빠님': '👨',
  '형': '👦',
  '누나': '👧',
  '언니': '👧',
  '오빠': '👦',
  '동생': '🧒',
  '친구': '🤝',
  '연인': '💝',
  '남친': '💝',
  '여친': '💝',
  '배우자': '💑',
  '부인': '💑',
  '남편': '💑'
}

interface CompanionAvatarProps {
  label?: string
  nickname: string
  size?: 'sm' | 'md'
}

function CompanionAvatar({ label, nickname, size = 'md' }: CompanionAvatarProps) {
  const iconSize = size === 'sm' ? 'text-sm' : 'text-base'
  
  // 레이블에서 관계 아이콘 찾기
  const relationIcon = label ? relationshipIcons[label] || relationshipIcons[Object.keys(relationshipIcons).find(key => label.includes(key)) || ''] : null
  
  return (
    <div className={`flex items-center justify-center ${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} bg-white rounded-full border-2 border-white shadow-sm`}>
      {relationIcon ? (
        <span className={iconSize}>{relationIcon}</span>
      ) : (
        <span className={`${iconSize} text-slate-500`}>👤</span>
      )}
    </div>
  )
}

interface ConversationStatusBadgeProps {
  status: 'opened' | 'waiting' | 'incomplete'
  size?: 'sm' | 'md'
}

function ConversationStatusBadge({ status, size = 'sm' }: ConversationStatusBadgeProps) {
  const statusConfig = {
    opened: { 
      variant: 'opened' as const, 
      icon: CheckCircle, 
      text: '완료' 
    },
    waiting: { 
      variant: 'waiting' as const, 
      icon: Clock, 
      text: '대기' 
    },
    incomplete: { 
      variant: 'destructive' as const, 
      icon: AlertCircle, 
      text: '미완료' 
    }
  }
  
  const config = statusConfig[status]
  const IconComponent = config.icon
  
  return (
    <Badge variant={config.variant} className={`${size === 'sm' ? 'text-xs px-1.5 py-0.5' : ''}`}>
      <IconComponent className={`${size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} mr-1`} />
      {config.text}
    </Badge>
  )
}

interface IncompleteAnswerActionsProps {
  conversation: {
    id: string
    companionLabel?: string
    question: string
  }
  onWatchAd: (conversationId: string) => void
  onSkipAnswer: (conversationId: string) => void
  onAnswerNow: (conversationId: string) => void
}

function IncompleteAnswerActions({ 
  conversation, 
  onWatchAd, 
  onSkipAnswer, 
  onAnswerNow 
}: IncompleteAnswerActionsProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleAction = async (action: () => void) => {
    setIsProcessing(true)
    try {
      await action()
    } finally {
      setIsProcessing(false)
    }
  }
  
  if (!showOptions) {
    return (
      <button 
        onClick={() => setShowOptions(true)}
        className="w-full p-2 mt-3 text-center text-xs text-slate-600 hover:text-violet-600 transition-colors bg-white/50 rounded-md border border-dashed border-slate-300 hover:border-violet-300"
        aria-label={`${conversation.companionLabel}와의 미완료 대화 옵션 보기`}
      >
        아직 답변하지 않은 질문이에요 • 탭해서 옵션 보기
      </button>
    )
  }
  
  return (
    <div className="mt-3 p-3 bg-white/80 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-slate-600">
          과거 질문에 지금 답변하시겠어요?
        </div>
        <button 
          onClick={() => setShowOptions(false)}
          className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="옵션 닫기"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      
      <div className="space-y-2">
        {/* 지금 답변하기 - 가장 눈에 띄게 */}
        <Button 
          onClick={() => handleAction(() => onAnswerNow(conversation.id))}
          disabled={isProcessing}
          className="w-full h-8 text-xs bg-violet-500 hover:bg-violet-600 text-white font-medium"
        >
          <Edit3 className="w-3 h-3 mr-1.5" />
          지금 답변하기
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          {/* 광고 시청 후 상대방 답변 보기 */}
          <Button 
            onClick={() => handleAction(() => onWatchAd(conversation.id))}
            disabled={isProcessing}
            variant="outline"
            className="h-8 text-xs bg-yellow-50 border-yellow-200 text-yellow-700 font-medium hover:bg-yellow-100"
          >
            <Play className="w-3 h-3 mr-1" />
            광고 보기
          </Button>
          
          {/* 답변 안 하고 넘어가기 */}
          <Button 
            onClick={() => handleAction(() => onSkipAnswer(conversation.id))}
            disabled={isProcessing}
            variant="outline"
            className="h-8 text-xs bg-gray-50 border-gray-200 text-gray-600 font-medium hover:bg-gray-100"
          >
            <X className="w-3 h-3 mr-1" />
            넘어가기
          </Button>
        </div>
      </div>
    </div>
  )
}

export interface CompanionConversationData {
  id: string
  companionId: string
  companionLabel?: string
  companionNickname: string
  companionColor: CompanionColor
  question: string
  answers: Array<{
    userId: string
    nickname: string
    content: string
    isMyAnswer: boolean
  }>
  status: 'opened' | 'waiting' | 'incomplete'
  completedAt?: string
}

interface CompanionConversationBlockProps {
  conversation: CompanionConversationData
  onClick?: () => void
  onWatchAd?: (conversationId: string) => void
  onSkipAnswer?: (conversationId: string) => void
  onAnswerNow?: (conversationId: string) => void
}

export default function CompanionConversationBlock({ 
  conversation, 
  onClick,
  onWatchAd = () => {},
  onSkipAnswer = () => {},
  onAnswerNow = () => {}
}: CompanionConversationBlockProps) {
  const colorConfig = companionColors[conversation.companionColor]
  
  const handleCardClick = (e: React.MouseEvent) => {
    // 미완료 액션 영역 클릭 시에는 상세페이지로 이동하지 않음
    if ((e.target as HTMLElement).closest('.incomplete-actions')) {
      return
    }
    onClick?.()
  }
  
  return (
    <div 
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 
        ${colorConfig.bg} ${colorConfig.border} border-l-4 
        hover:shadow-sm ${colorConfig.hover}
        ${onClick ? 'hover:scale-[1.01]' : ''}`}
      onClick={handleCardClick}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : -1}
      aria-label={onClick ? `${conversation.companionLabel || conversation.companionNickname}와의 대화 상세 보기` : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* 동반자 식별 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <CompanionAvatar 
            label={conversation.companionLabel}
            nickname={conversation.companionNickname}
            size="sm" 
          />
          <span className={`text-xs font-medium ${colorConfig.text}`}>
            {conversation.companionLabel || conversation.companionNickname}와의 대화
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <ConversationStatusBadge status={conversation.status} />
          {onClick && (
            <ChevronRight className="w-3 h-3 text-slate-400" />
          )}
        </div>
      </div>
      
      {/* 질문 */}
      <h4 className="text-sm font-medium text-slate-700 mb-3 leading-relaxed">
        {conversation.question}
      </h4>
      
      {/* 답변 미리보기 */}
      {conversation.answers.length > 0 && (
        <div className="space-y-2 mb-2">
          {conversation.answers.map((answer, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0
                ${answer.isMyAnswer ? 'bg-violet-400' : colorConfig.dot}`} />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-slate-500 block">
                  {answer.isMyAnswer ? '나' : answer.nickname}
                </span>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {answer.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 미완료 상태 처리 */}
      {conversation.status === 'incomplete' && (
        <div className="incomplete-actions">
          <IncompleteAnswerActions 
            conversation={conversation}
            onWatchAd={onWatchAd}
            onSkipAnswer={onSkipAnswer}
            onAnswerNow={onAnswerNow}
          />
        </div>
      )}
    </div>
  )
}