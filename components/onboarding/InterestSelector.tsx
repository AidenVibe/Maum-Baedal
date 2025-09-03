'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { INTEREST_CATEGORIES, validateInterests } from "@/lib/interests"
import { isTestModeParam } from "@/lib/dev-mock"
import { toast } from "sonner"

interface InterestSelectorProps {
  onComplete: (interests: string[]) => void
  onBack: () => void
  initialInterests?: string[]
  profile?: { nickname: string }
}

export function InterestSelector({ onComplete, onBack, initialInterests = [], profile }: InterestSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => {
      const isSelected = prev.includes(interestId)
      let newSelection: string[]

      if (isSelected) {
        // 선택 해제
        newSelection = prev.filter(id => id !== interestId)
        const category = INTEREST_CATEGORIES.find(c => c.id === interestId)
        if (category) {
          toast.success(`${category.emoji} ${category.name} 선택 해제됨`)
        }
      } else {
        // 새로 선택
        if (prev.length >= 3) {
          // 최대 3개 제한
          setError('최대 3개까지만 선택할 수 있어요')
          toast.error('최대 3개까지만 선택할 수 있어요')
          return prev
        }
        newSelection = [...prev, interestId]
        const category = INTEREST_CATEGORIES.find(c => c.id === interestId)
        if (category) {
          toast.success(`${category.emoji} ${category.name} 선택됨!`)
        }
      }

      setError('') // 에러 초기화
      return newSelection
    })
  }

  const handleSubmit = async () => {
    if (!validateInterests(selectedInterests)) {
      if (selectedInterests.length < 2) {
        setError('최소 2개의 관심사를 선택해 주세요')
      } else if (selectedInterests.length > 3) {
        setError('최대 3개까지만 선택할 수 있어요')
      }
      return
    }

    if (!profile) {
      setError('프로필 정보가 없습니다. 이전 단계로 돌아가 주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // 온보딩 완료 처리 - 백엔드에 프로필과 관심사 저장
      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: profile.nickname,
          interests: selectedInterests
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '온보딩 완료 처리에 실패했습니다')
      }

      console.log('✅ 온보딩 완료 처리 성공')
      
      // 성공 메시지 표시
      toast.success('마음배달 시작 준비 완료! 🎉')
      
      // 테스트 모드 파라미터를 유지하면서 Today 페이지로 이동
      const isTestMode = isTestModeParam()
      const todayUrl = isTestMode ? '/today?test_mode=true' : '/today'
      console.log(`[ONBOARDING] ${isTestMode ? '테스트 모드로' : ''} Today 페이지로 이동: ${todayUrl}`)
      
      router.push(todayUrl)
      
    } catch (error) {
      console.error('[ONBOARDING] 온보딩 완료 처리 실패:', error)
      setError(error instanceof Error ? error.message : '온보딩 처리 중 오류가 발생했습니다')
      
      // 실패한 경우에만 기존 onComplete 호출 (폴백)
      onComplete(selectedInterests)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = validateInterests(selectedInterests)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          관심사 선택
        </CardTitle>
        <CardDescription className="text-gray-600">
          어떤 이야기를 나누고 싶으신가요?<br/>
          <strong>2-3개</strong>를 선택해 주세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {INTEREST_CATEGORIES.map((category) => {
            const isSelected = selectedInterests.includes(category.id)
            
            return (
              <button
                key={category.id}
                onClick={() => handleInterestToggle(category.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-300 text-left relative transform
                  ${isSelected 
                    ? 'border-violet-500 bg-violet-50 shadow-lg scale-105 ring-2 ring-violet-200' 
                    : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50 hover:scale-102 hover:shadow-md'
                  }
                  ${selectedInterests.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-98'}
                `}
                disabled={selectedInterests.length >= 3 && !isSelected}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl flex-shrink-0">
                    {category.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-semibold text-sm mb-1 ${isSelected ? 'text-violet-700' : 'text-gray-800'}`}>
                      {category.name}
                    </div>
                    <div className={`text-xs leading-relaxed ${isSelected ? 'text-violet-600' : 'text-gray-500'}`}>
                      {category.description}
                    </div>
                  </div>
                </div>
                
                <div className={`
                  absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center
                  transition-all duration-300 transform
                  ${isSelected 
                    ? 'scale-100 opacity-100 rotate-0' 
                    : 'scale-0 opacity-0 rotate-180'
                  }
                `}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-center text-sm text-gray-600">
          <span className={selectedInterests.length >= 2 ? 'text-violet-600 font-medium' : ''}>
            {selectedInterests.length}개 선택됨
          </span>
          {' '}(2-3개 필수)
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full bg-violet-500 hover:bg-violet-600 h-12 text-base disabled:bg-gray-300"
            size="lg"
          >
            {isSubmitting ? '시작 준비 중...' : '🚀 마음배달 시작하기'}
          </Button>

          <Button 
            onClick={onBack}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            ← 이전으로
          </Button>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
            <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
          </div>
          <div className="text-xs mt-2">2/2 관심사 선택 완료</div>
        </div>
      </CardContent>
    </Card>
  )
}