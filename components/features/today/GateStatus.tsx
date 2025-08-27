'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type GateStatusType = 'waiting' | 'waiting_partner' | 'need_my_answer' | 'opened'

interface GateStatusProps {
  status: GateStatusType
  partnerAnswer?: string
  onViewConversation?: () => void
  partnerName?: string
}

const statusConfig = {
  waiting: {
    title: "상대방 답변",
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m11-4V9a7 7 0 00-14 0v6m14 0H5" />
      </svg>
    ),
    message: "상대방 답변 기다리는 중...",
    subtitle: "서로 답변하면 바로 공개됩니다",
    color: "bg-gray-400"
  },
  waiting_partner: {
    title: "상대방 답변",
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    message: "상대방이 답변 중...",
    subtitle: "곧 도착할 예정입니다",
    color: "bg-orange-500"
  },
  need_my_answer: {
    title: "내 답변 필요",
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    message: "상대방이 답변을 완료했어요!",
    subtitle: "내 답변을 작성하면 대화가 공개됩니다",
    color: "bg-blue-500"
  },
  opened: {
    title: "대화 공개됨",
    icon: (
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    message: "🎉 대화가 공개되었습니다!",
    subtitle: "서로의 답변을 확인해보세요",
    color: "bg-green-500"
  }
}

export function GateStatus({ 
  status, 
  partnerAnswer, 
  onViewConversation,
  partnerName = "상대방"
}: GateStatusProps) {
  const config = statusConfig[status]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${config.color}`}></span>
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'opened' && partnerAnswer ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">{partnerName}의 답변</div>
              <p className="text-gray-800 leading-relaxed">{partnerAnswer}</p>
            </div>
            {onViewConversation && (
              <Button 
                onClick={onViewConversation}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                전체 대화 보기
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              {config.icon}
            </div>
            <p className="font-medium text-gray-600">{config.message}</p>
            <p className="text-sm text-gray-500 mt-1">
              {config.subtitle}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}