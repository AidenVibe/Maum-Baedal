'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'

interface PreviewQuestionProps {
  onComplete: () => void
  onBack: () => void
}

// 샘플 질문 (실제로는 API에서 가져오거나 DB에서 조회)
const sampleQuestions = [
  "오늘 하루 중 가장 기억에 남는 순간이 언제였나요?",
  "최근에 감사함을 느꼈던 일이 있다면 무엇인가요?",
  "요즘 가장 관심을 갖고 있는 것은 무엇인가요?",
  "어릴 때 꿈꾸던 일과 지금 하는 일, 어떤 연관이 있을까요?",
  "가족과 함께 하고 싶은 새로운 활동이 있다면?"
]

export default function PreviewQuestion({ onComplete, onBack }: PreviewQuestionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setCurrentQuestionIndex(0) // 처음부터 다시
    }
  }

  const handleStartSharing = async () => {
    setIsLoading(true)
    // TODO: 실제로는 사용자에게 질문 할당하는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000)) // 임시 지연
    onComplete()
  }

  return (
    <div className="space-y-6">
      {/* 뒤로 가기 */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
        다른 방법 선택하기
      </Button>

      {/* 안내 메시지 */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          이런 질문들을 받게 됩니다
        </h2>
        <p className="text-sm text-gray-600">
          매일 새로운 질문으로 가족과 특별한 대화를 나눠보세요
        </p>
      </div>

      {/* 질문 카드 */}
      <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-200 text-violet-800 text-xs font-semibold mb-4">
              오늘의 질문
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-lg font-medium text-gray-900 leading-relaxed">
              {sampleQuestions[currentQuestionIndex]}
            </p>
            
            <Button
              onClick={handleNextQuestion}
              variant="outline"
              size="sm"
              className="text-violet-600 border-violet-200 hover:bg-violet-50"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="1 4 1 10 7 10"/>
                <polyline points="23 20 23 14 17 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64l-.6.6A9 9 0 1 0 20.49 9z"/>
              </svg>
              다른 질문 보기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 특징 설명 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">매일 05시 새로운 질문</h4>
            <p className="text-xs text-gray-600">새벽 5시마다 자동으로 새 질문이 도착해요</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border">
          <div className="flex-shrink-0 w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">게이트 공개 시스템</h4>
            <p className="text-xs text-gray-600">서로 답변하면 자동으로 대화가 공개돼요</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V1h-2v1H8V1H6v1H3.5C2.67 2 2 2.67 2 3.5v15C2 19.33 2.67 20 3.5 20h17c.83 0 1.5-.67 1.5-1.5v-15C22 2.67 21.33 2 20.5 2z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">소중한 추억 보관</h4>
            <p className="text-xs text-gray-600">모든 대화가 히스토리에 저장돼요</p>
          </div>
        </div>
      </div>

      {/* 시작 버튼 */}
      <div className="pt-4">
        <Button
          onClick={handleStartSharing}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-semibold py-3 h-12 touch-target"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              준비 중...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              가족에게 공유하기
            </>
          )}
        </Button>
      </div>
    </div>
  )
}