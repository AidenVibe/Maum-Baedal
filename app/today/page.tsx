'use client'

import { useState } from "react"
import { TodayHeader } from "@/components/features/today/TodayHeader"
import { QuestionCard } from "@/components/features/today/QuestionCard"
import { AnswerForm } from "@/components/features/today/AnswerForm"
import { GateStatus } from "@/components/features/today/GateStatus"

type GateStatusType = 'waiting' | 'waiting_partner' | 'need_my_answer' | 'opened'

interface TodayData {
  question: string
  myAnswer: string
  partnerAnswer?: string
  gateStatus: GateStatusType
  timeLeft: string
  swapCount: number
  serviceDay: string
  partnerName?: string
}

export default function TodayPage() {
  // TODO: 실제 데이터는 API에서 가져와야 함 (GET /api/today)
  const [todayData, setTodayData] = useState<TodayData>({
    question: "어릴 때 가장 좋아했던 놀이나 게임은 무엇이었나요? 왜 그것을 좋아했는지도 함께 이야기해주세요.",
    myAnswer: "",
    partnerAnswer: undefined,
    gateStatus: "waiting",
    timeLeft: "8시간 30분",
    swapCount: 0,
    serviceDay: "2025-08-27",
    partnerName: "가족"
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 답변 제출 핸들러
  const handleSubmitAnswer = async (answer: string) => {
    setIsSubmitting(true)
    try {
      // TODO: POST /api/answer API 호출
      console.log('Submitting answer:', answer)
      
      // 모크: 답변 제출 후 상태 업데이트
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTodayData(prev => ({
        ...prev,
        myAnswer: answer,
        gateStatus: "waiting_partner"
      }))
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 질문 교체 핸들러
  const handleSwapQuestion = async () => {
    if (todayData.swapCount >= 1) return
    
    try {
      // TODO: POST /api/today/swap API 호출
      console.log('Swapping question')
      
      // 모크: 새로운 질문으로 교체
      const newQuestions = [
        "오늘 하루 중 가장 감사했던 순간은 언제였나요?",
        "최근에 새로 배우고 싶다고 생각한 것이 있나요?",
        "가족과 함께 해보고 싶은 새로운 활동이 있다면 무엇인가요?"
      ]
      const randomQuestion = newQuestions[Math.floor(Math.random() * newQuestions.length)]
      
      setTodayData(prev => ({
        ...prev,
        question: randomQuestion,
        swapCount: prev.swapCount + 1
      }))
    } catch (error) {
      console.error('Failed to swap question:', error)
    }
  }

  // 대화 보기 핸들러
  const handleViewConversation = () => {
    // TODO: 대화 상세 페이지로 이동
    console.log('Navigate to conversation')
  }

  const hasAnswered = todayData.myAnswer.trim().length > 0

  return (
    <div className="min-h-full bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        <TodayHeader 
          timeLeft={todayData.timeLeft}
          serviceDay={todayData.serviceDay}
        />

        <QuestionCard
          question={todayData.question}
          swapCount={todayData.swapCount}
          onSwapQuestion={handleSwapQuestion}
          isSwapDisabled={hasAnswered}
        />

        <AnswerForm
          initialAnswer={todayData.myAnswer}
          onSubmitAnswer={handleSubmitAnswer}
          isSubmitting={isSubmitting}
          isReadOnly={hasAnswered}
        />

        <GateStatus
          status={todayData.gateStatus}
          partnerAnswer={todayData.partnerAnswer}
          partnerName={todayData.partnerName}
          onViewConversation={handleViewConversation}
        />

        {/* 하단 여백 - 네비게이션으로 인한 내용 가려짐 방지 */}
        <div className="text-center text-sm text-gray-500 py-4">
          오늘의 대화가 완료되면 기록에서 다시 볼 수 있어요
        </div>
      </div>
    </div>
  )
}