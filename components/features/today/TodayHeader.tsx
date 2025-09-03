'use client'

import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

type GateStatusType = 'waiting' | 'need_my_answer' | 'need_my_answer_solo' | 'waiting_partner' | 'opened' | 'solo_mode'

interface TodayHeaderProps {
  timeLeft: string
  serviceDay?: string
  gateStatus?: GateStatusType
  soloMode?: boolean
}

interface StatusConfig {
  emoji: string
  title: string
  subtitle: string
  bgColor: string
  showTime: boolean
  timeLabel?: string
}

const statusConfigs: Record<GateStatusType, StatusConfig> = {
  opened: {
    emoji: '💝',
    title: '마음이 연결되었어요!',
    subtitle: '서로의 이야기가 공개되었습니다',
    bgColor: 'bg-violet-600',
    showTime: false
  },
  waiting_partner: {
    emoji: '✨',
    title: '당신의 마음을 전달했어요',
    subtitle: '가족이 답변하면 바로 공개됩니다',
    bgColor: 'bg-violet-500',
    showTime: true,
    timeLabel: '가족의 답변을 기다리며'
  },
  need_my_answer: {
    emoji: '💌',
    title: '가족이 기다리고 있어요',
    subtitle: '당신의 한마디로 마음이 연결됩니다',
    bgColor: 'bg-violet-400',
    showTime: true,
    timeLabel: '새로운 질문까지'
  },
  need_my_answer_solo: {
    emoji: '🌟',
    title: '나만의 시간을 가져보세요',
    subtitle: '당신의 생각을 자유롭게 담아주세요',
    bgColor: 'bg-[#A78BFA]',
    showTime: true,
    timeLabel: '새로운 질문까지'
  },
  waiting: {
    emoji: '🌅',
    title: '오늘의 질문이 도착했어요',
    subtitle: '가족과 마음을 나눌 시간입니다',
    bgColor: 'bg-violet-500',
    showTime: true,
    timeLabel: '새로운 질문까지'
  },
  solo_mode: {
    emoji: '🌟',
    title: '혼자서도 시작해보세요!',
    subtitle: '답변 후 가족을 초대해 함께 나눠보세요',
    bgColor: 'bg-[#A78BFA]',
    showTime: true,
    timeLabel: '새로운 질문까지'
  }
}

export function TodayHeader({ timeLeft, serviceDay, gateStatus = 'waiting', soloMode = false }: TodayHeaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // 혼자모드일 때 need_my_answer 상태는 특별한 config 사용
  const actualStatus = soloMode && gateStatus === 'need_my_answer' 
    ? 'need_my_answer_solo' as GateStatusType 
    : gateStatus
  const config = statusConfigs[actualStatus]

  return (
    <Card className={`${config.bgColor} text-white transition-colors duration-300 rounded-xl shadow-lg`}>
      <CardContent className="p-4 text-center">
        <div className="text-3xl mb-2" role="img" aria-label={config.title}>
          {config.emoji}
        </div>
        <div className="text-lg font-semibold mb-1" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
          {config.title}
        </div>
        <div className="text-sm opacity-90 mb-3" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>
          {config.subtitle}
        </div>
        
        {config.showTime && timeLeft !== "마감됨" && (
          <div className="bg-white/10 rounded-lg p-2 mb-2 shadow-sm">
            <div className="text-xs opacity-75 mb-1" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 400 }}>
              {config.timeLabel}
            </div>
            <div className="text-xl font-bold" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 700 }}>
              {timeLeft}
            </div>
          </div>
        )}
        
        <div className="text-xs opacity-60" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 400 }}>
          매일 오전 5시, 새로운 질문이 생성돼요
        </div>
        
        {serviceDay && (
          <div className="text-xs opacity-50 mt-1" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 400 }}>
            {serviceDay}
          </div>
        )}
      </CardContent>
    </Card>
  )
}