'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { MessageCircle, Clock, CheckCircle, AlertCircle, Users, Star } from "lucide-react"

type GateStatusType = 'waiting' | 'waiting_partner' | 'need_my_answer' | 'opened' | 'solo_mode'

interface GateStatusProps {
  gateStatus?: GateStatusType
  status?: GateStatusType // legacy prop for backward compatibility
  myAnswer?: string
  partnerAnswer?: string
  onViewConversation?: () => void
  partnerName?: string
  partner?: any
  conversationId?: string
  isTestMode?: boolean
  soloMode?: boolean
}

interface StatusConfigItem {
  title: string
  icon: React.ReactElement
  message: string
  subtitle: string
  color: string
}

const statusConfig: Record<GateStatusType, StatusConfigItem> = {
  waiting: {
    title: "상대방 답변",
    icon: (
      <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m11-4V9a7 7 0 00-14 0v6m14 0H5" />
      </svg>
    ),
    message: "상대방의 답변을 기다리고 있어요",
    subtitle: "서로 답변하면 바로 공개됩니다",
    color: "bg-violet-400"
  },
  waiting_partner: {
    title: "상대방 답변",
    icon: (
      <svg className="w-8 h-8 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    message: "상대방이 답변 중이에요",
    subtitle: "곧 도착할 예정입니다",
    color: "bg-[#FBBF24]"
  },
  need_my_answer: {
    title: "내 답변 필요",
    icon: (
      <svg className="w-8 h-8 text-[#A78BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    message: "상대방이 답변을 완료했어요!",
    subtitle: "내 답변을 작성하면 대화가 공개됩니다",
    color: "bg-[#A78BFA]"
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
  },
  solo_mode: {
    title: "혼자모드 완료!",
    icon: (
      <svg className="w-8 h-8 text-[#A78BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m11 4a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9z" />
      </svg>
    ),
    message: "🎉 답변 완료! 이제 가족에게 공유해보세요",
    subtitle: "가족이 답변하면 함께모드로 서로의 생각을 나눌 수 있어요",
    color: "bg-[#A78BFA]"
  }
}

export function GateStatus({ 
  gateStatus,
  status, // legacy prop
  myAnswer,
  partnerAnswer, 
  onViewConversation,
  partnerName,
  partner,
  conversationId,
  isTestMode = false,
  soloMode = false
}: GateStatusProps) {
  // gateStatus가 우선, 없으면 status 사용 (legacy 지원)
  let currentStatus = gateStatus || status || 'waiting'
  
  // 솔로모드에서는 모든 상태를 적절히 처리
  if (soloMode) {
    // 답변이 완료된 경우
    if (myAnswer && myAnswer.trim()) {
      currentStatus = 'solo_mode'
    } else {
      // 아직 답변하지 않은 경우는 waiting 상태 유지하되 메시지만 변경
      currentStatus = 'waiting'
    }
  }
  
  const displayPartnerName = partnerName || partner?.nickname || partner?.label || '상대방'
  // 기본 설정값 정의 (fallback)
  const defaultConfig = {
    title: "상태 확인 중",
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 0v4m0 0h-4m4 0h4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    message: "상태를 확인하고 있어요",
    subtitle: "잠시만 기다려주세요",
    color: "bg-gray-400"
  }

  // statusConfig에서 설정을 가져오되, 없으면 기본값 사용
  const config = statusConfig[currentStatus] || defaultConfig

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center text-violet-600">
            <span className={`w-2 h-2 rounded-full mr-2 ${config.color}`}></span>
            {currentStatus === 'waiting' && soloMode ? '혼자모드' : config.title}
          </div>
          <Badge 
            variant={
              currentStatus === 'opened' ? 'opened' :
              currentStatus === 'solo_mode' ? 'solo' :
              (currentStatus === 'waiting' && soloMode) ? 'solo' :
              currentStatus === 'need_my_answer' ? 'companion' :
              currentStatus === 'waiting_partner' ? 'peach' :
              'waiting'
            }
            className="text-xs"
          >
            {
              currentStatus === 'opened' ? '완료' :
              currentStatus === 'solo_mode' ? '완료' :
              (currentStatus === 'waiting' && soloMode) ? '준비중' :
              currentStatus === 'need_my_answer' ? '답변필요' :
              currentStatus === 'waiting_partner' ? '진행중' :
              '대기중'
            }
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 상태별 Progress 표시 */}
        <div className="mb-4">
          {currentStatus === 'waiting' && !soloMode && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>답변 진행률</span>
                <span>1/2 완료</span>
              </div>
              <Progress value={50} variant="gray" className="h-2" />
            </div>
          )}
          {currentStatus === 'waiting' && soloMode && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-violet-700">
                <span>혼자모드</span>
                <span>준비 완료</span>
              </div>
              <Progress value={30} variant="solo" className="h-2" />
            </div>
          )}
          {currentStatus === 'waiting_partner' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-yellow-700">
                <span>답변 진행률</span>
                <span>1/2 완료</span>
              </div>
              <Progress value={50} variant="peach" className="h-2" />
            </div>
          )}
          {currentStatus === 'need_my_answer' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-violet-700">
                <span>답변 진행률</span>
                <span>1/2 완료</span>
              </div>
              <Progress value={75} variant="companion" className="h-2" />
            </div>
          )}
          {currentStatus === 'opened' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-green-700">
                <span>대화 완료</span>
                <span>2/2 완료</span>
              </div>
              <Progress value={100} variant="green" className="h-2" />
            </div>
          )}
          {currentStatus === 'solo_mode' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-violet-700">
                <span>혼자모드 완료</span>
                <span>1/1 완료</span>
              </div>
              <Progress value={100} variant="solo" className="h-2" />
            </div>
          )}
        </div>

        {/* 상태별 Alert */}
        <div className="mb-4">
          {currentStatus === 'waiting' && !soloMode && (
            <Alert variant="default">
              <Clock className="h-4 w-4" />
              <div>
                <h5 className="font-medium">상대방 답변 대기 중</h5>
                <p className="text-sm text-gray-600 mt-1">
                  상대방이 답변을 작성하면 알림을 보내드릴게요.
                </p>
              </div>
            </Alert>
          )}
          {currentStatus === 'waiting' && soloMode && (
            <Alert variant="solo">
              <Star className="h-4 w-4" />
              <div>
                <h5 className="font-medium">혼자만의 시간</h5>
                <p className="text-sm text-gray-600 mt-1">
                  천천히 생각해보고 답변을 작성해보세요.
                </p>
              </div>
            </Alert>
          )}
          {currentStatus === 'waiting_partner' && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <div>
                <h5 className="font-medium">상대방이 답변 작성 중</h5>
                <p className="text-sm text-gray-600 mt-1">
                  곧 답변이 도착할 예정이에요. 조금만 기다려주세요!
                </p>
              </div>
            </Alert>
          )}
          {currentStatus === 'need_my_answer' && (
            <Alert variant="lavender">
              <Users className="h-4 w-4" />
              <div>
                <h5 className="font-medium">내 답변을 작성해주세요</h5>
                <p className="text-sm text-gray-600 mt-1">
                  상대방의 답변이 준비되었어요. 내 답변을 작성하면 대화가 공개됩니다.
                </p>
              </div>
            </Alert>
          )}
          {currentStatus === 'opened' && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <div>
                <h5 className="font-medium">대화가 공개되었어요!</h5>
                <p className="text-sm text-gray-600 mt-1">
                  서로의 답변을 확인하고 따뜻한 대화를 나눠보세요.
                </p>
              </div>
            </Alert>
          )}
          {currentStatus === 'solo_mode' && (
            <Alert variant="solo">
              <Star className="h-4 w-4" />
              <div>
                <h5 className="font-medium">혼자모드 완료!</h5>
                <p className="text-sm text-gray-600 mt-1">
                  답변이 완료되었어요. 이제 가족에게 공유해보세요!
                </p>
              </div>
            </Alert>
          )}
        </div>

        {currentStatus === 'opened' && partnerAnswer ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">{displayPartnerName}의 답변</div>
              <p className="text-gray-800 leading-relaxed">{partnerAnswer}</p>
            </div>
            {(onViewConversation || conversationId) && (
              <Button 
                onClick={onViewConversation || (() => {
                  if (isTestMode) {
                    alert('테스트 모드: 대화 상세 보기 시뮬레이션')
                  }
                })}
                className="w-full bg-[#10B981] active:bg-[#059669] shadow-sm"
              >
                전체 대화 보기
              </Button>
            )}
          </div>
        ) : currentStatus === 'solo_mode' ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                {config.icon}
              </div>
              <p className="font-medium text-violet-800">{config.message}</p>
              <p className="text-sm text-violet-600 mt-1">
                {config.subtitle}
              </p>
            </div>
          </div>
        ) : soloMode ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#A78BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="font-medium text-violet-600">혼자만의 시간을 가져보세요</p>
            <p className="text-sm text-violet-500 mt-1">
              답변 완료 후 가족과 함께 나눠보세요
            </p>
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