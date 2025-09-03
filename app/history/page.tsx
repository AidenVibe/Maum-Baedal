'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Clock, AlertCircle, Loader } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import TestScenarioDropdown from '@/components/dev/TestScenarioDropdown'
import CurrentScenarioStatus from '@/components/dev/CurrentScenarioStatus'
import { isTestModeParam, getMockHistoryData } from '@/lib/dev-mock'
import CompanionFilter, { type CompanionInfo } from '@/components/features/history/CompanionFilter'
import CompanionSummaryBar from '@/components/features/history/CompanionSummaryBar'
import DateSection from '@/components/features/history/DateSection'
import { type CompanionConversationData, type CompanionColor, companionColors } from '@/components/features/history/CompanionConversationBlock'

interface ConversationWithDetails {
  id: string
  assignmentId: string
  createdAt: string
  companionId: string
  assignment: {
    serviceDay: string
    question: {
      content: string
      category: string
    }
    companion: {
      id: string
      user1: { id: string; nickname: string; label?: string }
      user2: { id: string; nickname: string; label?: string }
    }
  }
  answers: {
    userId: string
    content: string
    user: {
      id: string
      nickname: string
      label?: string
    }
  }[]
}

interface HistoryResponse {
  conversations: ConversationWithDetails[]
  pagination: { hasMore: boolean; nextCursor?: string; totalCount: number }
}

// Mock data for Phase 2 multi-companion testing
const getMockMultiCompanionData = (): ConversationWithDetails[] => {
  const currentUserId = "current-user"
  
  return [
    {
      id: "conv-1",
      assignmentId: "assign-1", 
      createdAt: "2025-01-02T10:00:00Z",
      companionId: "comp-mom",
      assignment: {
        serviceDay: "2025-01-02",
        question: { content: "오늘 가장 감사했던 순간은 언제였나요?", category: "gratitude" },
        companion: {
          id: "comp-mom",
          user1: { id: currentUserId, nickname: "지우", label: "딸" },
          user2: { id: "mom-id", nickname: "엄마", label: "엄마" }
        }
      },
      answers: [
        {
          userId: currentUserId,
          content: "오늘 엄마가 해주신 미역국이 정말 맛있었어요!",
          user: { id: currentUserId, nickname: "지우", label: "딸" }
        },
        {
          userId: "mom-id", 
          content: "딸이 맛있게 먹는 모습을 볼 때가 가장 감사한 순간이었어요.",
          user: { id: "mom-id", nickname: "엄마", label: "엄마" }
        }
      ]
    },
    {
      id: "conv-2",
      assignmentId: "assign-2",
      createdAt: "2025-01-02T11:00:00Z", 
      companionId: "comp-dad",
      assignment: {
        serviceDay: "2025-01-02",
        question: { content: "오늘 가장 감사했던 순간은 언제였나요?", category: "gratitude" },
        companion: {
          id: "comp-dad",
          user1: { id: currentUserId, nickname: "지우", label: "딸" },
          user2: { id: "dad-id", nickname: "아빠", label: "아빠" }
        }
      },
      answers: [
        {
          userId: currentUserId,
          content: "아빠와 함께 산책하면서 나눈 대화가 좋았어요.",
          user: { id: currentUserId, nickname: "지우", label: "딸" }
        },
        {
          userId: "dad-id",
          content: "딸과 천천히 걸으며 하루 이야기를 나눌 수 있어서 감사했어요.",
          user: { id: "dad-id", nickname: "아빠", label: "아빠" }
        }
      ]
    },
    {
      id: "conv-3",
      assignmentId: "assign-3",
      createdAt: "2025-01-01T15:00:00Z",
      companionId: "comp-mom", 
      assignment: {
        serviceDay: "2025-01-01",
        question: { content: "새해 첫날, 어떤 마음으로 하루를 시작했나요?", category: "reflection" },
        companion: {
          id: "comp-mom",
          user1: { id: currentUserId, nickname: "지우", label: "딸" },
          user2: { id: "mom-id", nickname: "엄마", label: "엄마" }
        }
      },
      answers: [
        {
          userId: currentUserId,
          content: "올해는 엄마와 더 많은 대화를 나누고 싶다는 마음으로 시작했어요.",
          user: { id: currentUserId, nickname: "지우", label: "딸" }
        }
      ]
    },
    {
      id: "conv-4", 
      assignmentId: "assign-4",
      createdAt: "2024-12-31T20:00:00Z",
      companionId: "comp-friend",
      assignment: {
        serviceDay: "2024-12-31",
        question: { content: "올해를 마무리하는 지금, 가장 기억에 남는 순간은?", category: "reflection" },
        companion: {
          id: "comp-friend",
          user1: { id: currentUserId, nickname: "지우", label: "친구" },
          user2: { id: "friend-id", nickname: "민지", label: "친구" }
        }
      },
      answers: []
    }
  ]
}

export default function HistoryPage() {
  const router = useRouter()
  const [historyData, setHistoryData] = useState<ConversationWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [showTestDropdown, setShowTestDropdown] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null)
  
  // 현재 사용자 ID (실제로는 세션에서 가져와야 함)
  const currentUserId = "current-user"
  
  const fetchHistoryData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 테스트 모드인 경우 mock 데이터 사용 (Phase 2 다중 동반자 데이터)
      if (isTestModeParam()) {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const mockData = getMockMultiCompanionData()
        setHistoryData(mockData)
        setHasMore(false)
        setTotalCount(mockData.length)
        return
      }
      
      // 실제 API 호출
      const response = await fetch(`/api/history${selectedCompanion ? `?companion=${selectedCompanion}` : ''}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '요청 실패' }))
        throw new Error(errorData.error || `서버 오류: ${response.status}`)
      }
      
      const data: HistoryResponse = await response.json()
      setHistoryData(data.conversations)
      setHasMore(data.pagination.hasMore)
      setTotalCount(data.pagination.totalCount)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '대화 기록을 불러오지 못했어요'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    setShowTestDropdown(isTestModeParam())
    fetchHistoryData()
  }, [selectedCompanion]) // 선택된 동반자가 변경될 때마다 다시 로드

  // 동반자 목록 및 통계 계산
  const companions: CompanionInfo[] = (() => {
    if (!historyData.length) return []
    
    const companionMap = new Map<string, CompanionInfo>()
    const colorKeys = Object.keys(companionColors) as CompanionColor[]
    let colorIndex = 0
    
    historyData.forEach(conv => {
      const companion = conv.assignment.companion
      const companionId = companion.id
      
      // 상대방 정보 찾기
      const partner = companion.user1.id === currentUserId ? companion.user2 : companion.user1
      
      if (!companionMap.has(companionId)) {
        companionMap.set(companionId, {
          id: companionId,
          label: partner.label,
          nickname: partner.nickname,
          color: colorKeys[colorIndex % colorKeys.length],
          conversationCount: 0,
          stats: { completed: 0, total: 0, waiting: 0, incomplete: 0 }
        })
        colorIndex++
      }
      
      const companionInfo = companionMap.get(companionId)!
      companionInfo.conversationCount++
      companionInfo.stats.total++
      
      const answerCount = conv.answers.length
      if (answerCount === 2) {
        companionInfo.stats.completed++
      } else if (answerCount === 1) {
        companionInfo.stats.waiting++
      } else {
        companionInfo.stats.incomplete++
      }
    })
    
    return Array.from(companionMap.values())
  })()

  // 날짜별로 그룹화된 대화 데이터 생성
  const conversationsByDate = (() => {
    const filtered = selectedCompanion 
      ? historyData.filter(conv => conv.companionId === selectedCompanion)
      : historyData
    
    const grouped = new Map<string, CompanionConversationData[]>()
    
    filtered.forEach(conv => {
      const serviceDay = conv.assignment.serviceDay
      const companion = conv.assignment.companion
      const partner = companion.user1.id === currentUserId ? companion.user2 : companion.user1
      
      // 동반자 색상 찾기
      const companionInfo = companions.find(c => c.id === conv.companionId)
      const companionColor: CompanionColor = companionInfo?.color || 'primary'
      
      // 답변 상태 결정
      let status: 'opened' | 'waiting' | 'incomplete' = 'incomplete'
      if (conv.answers.length === 2) {
        status = 'opened'
      } else if (conv.answers.length === 1) {
        status = 'waiting'
      }
      
      const conversationData: CompanionConversationData = {
        id: conv.id,
        companionId: conv.companionId,
        companionLabel: partner.label,
        companionNickname: partner.nickname,
        companionColor,
        question: conv.assignment.question.content,
        answers: conv.answers.map(answer => ({
          userId: answer.userId,
          nickname: answer.user.nickname,
          content: answer.content,
          isMyAnswer: answer.userId === currentUserId
        })),
        status,
        completedAt: conv.createdAt
      }
      
      if (!grouped.has(serviceDay)) {
        grouped.set(serviceDay, [])
      }
      grouped.get(serviceDay)!.push(conversationData)
    })
    
    // 날짜 순으로 정렬 (최신 순)
    return Array.from(grouped.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, conversations]) => ({ date, conversations }))
  })()

  const handleConversationClick = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`)
  }
  
  const handleWatchAd = async (conversationId: string) => {
    // 광고 시청 후 상대방 답변 보기 로직
    console.log('Watch ad for conversation:', conversationId)
    // 실제 구현 시 광고 SDK 연동 필요
  }
  
  const handleSkipAnswer = async (conversationId: string) => {
    // 답변 건너뛰기 로직
    console.log('Skip answer for conversation:', conversationId)
    // 실제 구현 시 API 호출하여 상태 업데이트
  }
  
  const handleAnswerNow = (conversationId: string) => {
    // 지금 답변하기 - 해당 conversation으로 이동하여 답변 작성
    router.push(`/conversation/${conversationId}?action=answer`)
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* 테스트 시나리오 상태 표시 (우상단 고정) */}
      {isMounted && showTestDropdown && <CurrentScenarioStatus />}
      
      {/* Sticky 헤더 */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-violet-100 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          {/* 테스트 시나리오 드롭다운 (상단) */}
          {isMounted && showTestDropdown && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center">
                <TestScenarioDropdown currentPage="history" />
              </div>
            </div>
          )}

          {/* 제목과 필터 */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-violet-600" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 700 }}>
                지난 대화
              </h1>
              {!isLoading && !error && totalCount > 0 && (
                <p className="text-xs text-slate-600 mt-1" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>
                  총 {totalCount}개의 대화
                </p>
              )}
            </div>
            
            {companions.length > 1 && (
              <CompanionFilter 
                companions={companions}
                selectedCompanion={selectedCompanion}
                onFilter={setSelectedCompanion}
              />
            )}
          </div>
          
          {/* 동반자별 요약 현황 */}
          {companions.length > 0 && (
            <CompanionSummaryBar 
              companions={companions}
              selectedCompanion={selectedCompanion}
            />
          )}
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {isMounted && isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 rounded-xl shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded-full" variant="lavender" />
                      <Skeleton className="h-4 w-24" variant="lavender" />
                    </div>
                    <Skeleton className="h-6 w-16" variant="lavender" />
                  </div>
                  <Skeleton className="h-6 w-full" variant="lavender" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" variant="lavender" />
                    <Skeleton className="h-10 w-full" variant="lavender" />
                  </div>
                </div>
              </Card>
            ))}
            <div className="text-center mt-4">
              <Loader className="h-8 w-8 mx-auto text-violet-500 animate-spin mb-4" />
              <p className="text-sm text-slate-600" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>
                대화 기록을 불러오는 중이에요...
              </p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <Card className="p-8 text-center bg-red-50 border-red-200 rounded-xl shadow-sm">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-6" />
            <h3 className="text-lg font-semibold text-red-600 mb-3" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
              데이터를 불러오지 못했어요
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 400 }}>
              {error}
            </p>
            <button 
              onClick={fetchHistoryData} 
              className="px-4 py-2 bg-violet-500 text-white text-sm rounded-md hover:bg-violet-600 transition-colors font-semibold shadow-sm" 
              style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}
            >
              다시 시도
            </button>
          </Card>
        )}

        {!isLoading && !error && conversationsByDate.length === 0 && (
          <Card className="p-8 text-center bg-violet-50 border-violet-200 rounded-xl shadow-sm">
            <Clock className="h-16 w-16 mx-auto text-violet-400 mb-6" />
            <h3 className="text-lg font-semibold text-violet-600 mb-3" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>
              {selectedCompanion ? '선택한 동반자와의 대화가 없어요' : '아직 완료한 대화가 없어요'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>
              {selectedCompanion ? '다른 동반자를 선택하거나 새로운 대화를 시작해보세요' : '첫 번째 질문을 완료하면\n여기에 소중한 기록이 쌓여요'}
            </p>
          </Card>
        )}

        {!isLoading && !error && conversationsByDate.length > 0 && (
          <>
            {conversationsByDate.map(({ date, conversations }) => (
              <DateSection
                key={date}
                date={date}
                conversations={conversations}
                onConversationClick={handleConversationClick}
                onWatchAd={handleWatchAd}
                onSkipAnswer={handleSkipAnswer}
                onAnswerNow={handleAnswerNow}
              />
            ))}
          </>
        )}

        {!isLoading && !error && conversationsByDate.length > 0 && (
          <div className="text-center text-sm text-gray-500 py-6">
            <p style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>
              소중한 대화들이 차곡차곡 쌓여가요
            </p>
            {hasMore && (
              <div className="mt-2 text-xs text-violet-500" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 400 }}>
                더 많은 대화가 있어요 (추후 무한 스크롤 예정)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}