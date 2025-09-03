'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TodayHeader } from '@/components/features/today/TodayHeader'
import { QuestionCard } from '@/components/features/today/QuestionCard'
import { AnswerForm } from '@/components/features/today/AnswerForm'
import { GateStatus } from '@/components/features/today/GateStatus'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TestScenarioDropdown from '@/components/dev/TestScenarioDropdown'
import CurrentScenarioStatus from '@/components/dev/CurrentScenarioStatus'
import type { TodayData, TodayResponse, AnswerSubmitRequest, GateStatusType } from '@/lib/types'
import { isDevMode, getDevMockData, getMockTodayData, logDevModeStatus, clearDevDataFromRealUser, isTestModeParam } from '@/lib/dev-mock'
import { useToast } from '@/components/ui/toast'
import { useQuestionShare } from '@/lib/hooks/useQuestionShare'
import { SoloModeConfirmModal } from '@/components/shared/SoloModeConfirmModal'

interface TodayPageState {
  todayData: TodayData | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

type TodayPageAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TODAY_DATA'; payload: TodayData }
  | { type: 'SET_SUBMITTING'; payload: boolean }

function todayPageReducer(state: TodayPageState, action: TodayPageAction): TodayPageState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_TODAY_DATA':
      return { ...state, todayData: action.payload, error: null }
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload }
    default:
      return state
  }
}

const initialState: TodayPageState = {
  todayData: null,
  isLoading: true,
  isSubmitting: false,
  error: null,
}

export default function TodayPage() {
  const router = useRouter()
  const [state, dispatch] = React.useReducer(todayPageReducer, initialState)
  const [showTestDropdown, setShowTestDropdown] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { showGateOpened, addToast } = useToast()

  const fetchTodayData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // 실제 사용자 세션에서 개발 데이터 자동 정리
      clearDevDataFromRealUser()
      
      logDevModeStatus()

      if (isDevMode()) {
        console.log('[DEV MODE] Mock 데이터를 사용합니다')
        await new Promise((resolve) => setTimeout(resolve, 800))

        // 선택된 시나리오 데이터 확인
        const selectedScenarioData = getDevMockData()
        
        let mockData
        if (Object.keys(selectedScenarioData).length > 0) {
          // 시나리오 데이터가 있으면 Today 페이지 형식으로 변환
          console.log('[DEV MODE] 시나리오 데이터 사용:', selectedScenarioData)
          mockData = {
            assignment: {
              id: 'assignment_dev_scenario',
              question: {
                id: 'q_scenario',
                text: '오늘 하루 중 가장 감사했던 순간은 언제였나요?'
              },
              answers: [
                ...(selectedScenarioData.myAnswer ? [{
                  userId: 'user_me',
                  content: selectedScenarioData.myAnswer
                }] : []),
                ...(selectedScenarioData.partnerAnswer ? [{
                  userId: 'user_partner', 
                  content: selectedScenarioData.partnerAnswer
                }] : [])
              ],
              serviceDay: '2025-01-01'
            },
            gateStatus: selectedScenarioData.gateStatus || 'waiting',
            timeRemaining: '12시간 30분',
            partner: selectedScenarioData.hasCompanion ? {
              nickname: '가족'
            } : null,
            soloMode: selectedScenarioData.soloMode || false,
            shareUrl: selectedScenarioData.shareUrl,
            canShare: selectedScenarioData.canShare !== false
          }
        } else {
          // 기본 mock 데이터 사용
          mockData = getMockTodayData()
        }
        
        const mockResponse = mockData.assignment

        dispatch({
          type: 'SET_TODAY_DATA',
          payload: {
            question: mockResponse.question.text,
            myAnswer: mockResponse.answers.find((a: any) => a.userId === 'user_me')?.content || '',
            partnerAnswer:
              mockResponse.answers.find((a: any) => a.userId === 'user_partner')?.content || '',
            gateStatus: mockData.gateStatus,
            timeLeft: mockData.timeRemaining,
            serviceDay: mockResponse.serviceDay,
            partnerName: mockData.partner?.nickname || '가족',
            assignmentId: mockResponse.id,
            canAnswer: true,
            questionId: mockResponse.question.id || undefined,
            // Pass through dev-mode flags so UI behaves correctly in solo mode
            soloMode: mockData.soloMode || false,
            shareUrl: mockData.shareUrl,
            canShare: mockData.canShare !== false,
          } as TodayData
        })

        console.log('[DEV MODE] Mock 데이터 로드 완료:', mockData.gateStatus)
        return
      }

      const response = await fetch('/api/today', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '요청 실패' }))
        throw new Error(errorData.error || '데이터를 불러오는 중 오류가 발생했습니다.')
      }

      const data: TodayResponse = await response.json()

      if ('needOnboarding' in data && (data as any).needOnboarding) {
        router.push('/onboarding')
        return
      }

      dispatch({
        type: 'SET_TODAY_DATA',
        payload: {
          question: data.question,
          questionId: data.questionId,
          myAnswer: data.myAnswer,
          partnerAnswer: data.partnerAnswer,
          gateStatus: data.gateStatus,
          timeLeft: data.timeLeft,
          serviceDay: data.serviceDay,
          partnerName: data.partnerName,
          assignmentId: data.assignmentId,
          canAnswer: data.canAnswer,
          soloMode: data.soloMode,
          shareUrl: data.shareUrl,
          canShare: data.canShare,
        }
      })
    } catch (err) {
      console.error('Failed to fetch today data:', err)
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    fetchTodayData()
    // 테스트 모드 감지
    setShowTestDropdown(isTestModeParam())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmitAnswer = useCallback(async (answer: string) => {
    if (!state.todayData?.assignmentId) return

    dispatch({ type: 'SET_SUBMITTING', payload: true })
    try {
      if (isDevMode()) {
        console.log('[DEV MODE] Mock 답변 제출:', answer)
        await new Promise((resolve) => setTimeout(resolve, 1200))

        const currentMockData = getDevMockData()
        const updatedMockData: any = {
          ...currentMockData,
          myAnswer: answer.trim(),
        }

        // 개발 모드에서의 모의 응답 생성
        let mockResponse: any = {
          success: true,
          gateStatus: currentMockData.gateStatus,
          isLastAnswerer: false,
          message: '답변이 저장되었습니다.'
        }

        if (currentMockData.partnerAnswer && currentMockData.gateStatus !== 'opened') {
          updatedMockData.gateStatus = 'opened'
          updatedMockData.conversationId = 'conv_dev_123'
          mockResponse.gateStatus = 'opened'
          mockResponse.conversationId = 'conv_dev_123'
          mockResponse.isLastAnswerer = true
          mockResponse.message = '축하합니다! 두 분의 답변이 모두 완료되어 대화가 공개되었습니다.'
        } else if (!currentMockData.partnerAnswer) {
          updatedMockData.gateStatus = 'waiting_partner'
          mockResponse.gateStatus = 'waiting_partner'
          mockResponse.message = '답변이 저장되었습니다. 상대방의 답변을 기다리고 있어요.'
        }

        localStorage.setItem('dev_mock_data', JSON.stringify(updatedMockData))

        // 토스트 표시 로직
        if (mockResponse.isLastAnswerer && mockResponse.gateStatus === 'opened' && mockResponse.conversationId) {
          showGateOpened(mockResponse.conversationId)
        } else {
          addToast({
            type: 'success',
            message: mockResponse.message,
            duration: 3000
          })
        }

        await fetchTodayData()
        return
      }

      const requestBody: AnswerSubmitRequest = {
        assignmentId: state.todayData.assignmentId,
        content: answer.trim(),
      }

      const response = await fetch('/api/answer', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '요청 실패' }))
        throw new Error(errorData.error || '답변 제출 중 오류가 발생했습니다.')
      }

      const responseData = await response.json()
      console.log('Answer submission response:', responseData)

      // 마지막 답변자이고 게이트가 열린 경우 토스트 표시
      if (responseData.isLastAnswerer && responseData.gateStatus === 'opened' && responseData.conversationId) {
        showGateOpened(responseData.conversationId)
      } else {
        // 일반적인 성공 토스트
        addToast({
          type: 'success',
          message: responseData.message || '답변이 성공적으로 저장되었습니다.',
          duration: 3000
        })
      }

      await fetchTodayData()
    } catch (error) {
      console.error('Failed to submit answer:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '답변 제출에 실패했습니다.'
      })
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false })
    }
  }, [state.todayData?.assignmentId, fetchTodayData])

  const handleViewConversation = useCallback(() => {
    if (state.todayData?.gateStatus === 'opened') {
      const conversationId = 'conv_dev_123'
      router.push(`/conversation/${conversationId}`)
    }
  }, [state.todayData?.gateStatus, router])

  // 중앙화된 공유 로직 사용
  const {
    isSharing,
    showSoloModeConfirm,
    handleShare,
    confirmSoloShare,
    cancelSoloShare
  } = useQuestionShare({
    soloMode: state.todayData?.soloMode || false,
    questionContent: state.todayData?.question || '',
    assignmentId: state.todayData?.assignmentId,
    serviceDay: state.todayData?.serviceDay || new Date().toISOString().split('T')[0],
    onShareComplete: (shareUrl) => {
      console.log('Share completed with URL:', shareUrl)
      // 공유 완료 후 추가 액션이 필요하다면 여기에 구현
    }
  })

  if (state.isLoading) {
    return (
      <div className="min-h-full bg-white p-4">
        <div className="max-w-md mx-auto space-y-4 animate-pulse">
          <div className="h-20 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl shadow-sm"></div>
          <div className="h-32 bg-gray-100 rounded-xl shadow-sm"></div>
          <div className="h-40 bg-gray-100 rounded-xl shadow-sm"></div>
          <div className="h-20 bg-gray-100 rounded-xl shadow-sm"></div>
        </div>
      </div>
    )
  }

  if (state.error || !state.todayData) {
    return (
      <div className="min-h-full bg-white p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center shadow-sm">
            <h3 className="text-lg font-medium text-red-800 mb-2" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}>오류가 발생했습니다</h3>
            <p className="text-red-600 text-sm mb-4" style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 400 }}>{state.error || '데이터를 불러오지 못했습니다.'}</p>
            <button
              onClick={fetchTodayData}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors font-semibold shadow-sm"
              style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 600 }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { todayData } = state
  const hasAnswered = todayData?.myAnswer?.trim().length > 0

  return (
    <div className="min-h-full bg-white p-4">
      {/* 테스트 시나리오 상태 표시 (우상단 고정) */}
      {isMounted && showTestDropdown && <CurrentScenarioStatus />}
      
      <div className="max-w-md mx-auto space-y-4">
        {/* 테스트 시나리오 드롭다운 (상단) */}
        {showTestDropdown && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <TestScenarioDropdown currentPage="today" />
            </div>
          </div>
        )}

        <TodayHeader 
          timeLeft={todayData.timeLeft} 
          serviceDay={todayData.serviceDay} 
          gateStatus={todayData.gateStatus}
          soloMode={todayData.soloMode}
        />

        <QuestionCard
          question={todayData.question}
          questionId={todayData.questionId || ''}
          assignmentId={todayData.assignmentId}
          soloMode={todayData.soloMode}
          canShare={todayData.canShare}
        />

        <AnswerForm
          initialAnswer={todayData.myAnswer}
          onSubmitAnswer={handleSubmitAnswer}
          isSubmitting={state.isSubmitting}
          isReadOnly={!todayData.canAnswer}
        />

        <GateStatus
          status={todayData.gateStatus}
          partnerAnswer={todayData.partnerAnswer}
          partnerName={todayData.partnerName}
          onViewConversation={handleViewConversation}
          soloMode={todayData.soloMode}
          myAnswer={todayData.myAnswer}
        />

        {/* Solo 모드 상태일 때 추가 UI */}
        {todayData.soloMode && todayData.gateStatus === 'solo_mode' && (
          <Card className="bg-violet-50 border-violet-200">
            <CardContent className="p-4 text-center">
              <div className="text-lg mb-2">🌟</div>
              <div className="text-sm font-semibold text-violet-800 mb-2">
                Solo 모드 완료! 가족과 함께 나누어보세요
              </div>
              <div className="text-xs text-violet-600 mb-3">
                이제 가족에게 질문을 공유하여<br />
                함께모드로 전환할 수 있습니다
              </div>
              {todayData.canShare !== false && (
                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="text-xs text-green-600 font-semibold mb-1">
                    ✓ 공유 기능 준비완료
                  </div>
                  <div className="text-xs text-gray-600">
                    아래 공유 버튼으로 가족을 초대해보세요
                  </div>
                </div>
              )}
              <Button 
                size="sm" 
                className="bg-yellow-400 active:bg-yellow-500 text-gray-900 border border-yellow-500 shadow-lg active:shadow-md transform active:translate-y-0.5 transition-all duration-300 font-bold"
                style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 700 }}
                onClick={handleShare}
                disabled={todayData.canShare === false || isSharing}
              >
                {isSharing ? '공유 중...' : '가족에게 공유하기'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 솔로모드 공유 확인 모달 */}
        <SoloModeConfirmModal
          isOpen={showSoloModeConfirm}
          onConfirm={confirmSoloShare}
          onCancel={cancelSoloShare}
          isLoading={isSharing}
        />

        <div className="text-center text-sm text-gray-500 py-4">
          <p style={{ fontFamily: 'Pretendard Variable, Pretendard, -apple-system, sans-serif', fontWeight: 500 }}>오늘의 질문이 끝나면 기록에서 다시 볼 수 있어요</p>
        </div>

        {/* 테스트 시나리오 드롭다운 (하단) */}
        {showTestDropdown && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <TestScenarioDropdown currentPage="today" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
