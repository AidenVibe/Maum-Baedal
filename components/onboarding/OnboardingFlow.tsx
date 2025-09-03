'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import StartingOptions from './StartingOptions'
import PreviewQuestion from './PreviewQuestion'  
import ShareInvitation from './ShareInvitation'
import ConnectWithCode from './ConnectWithCode'

type OnboardingStep = 'starting_options' | 'preview_question' | 'share_invitation' | 'connect_with_code' | 'connecting'

interface OnboardingFlowProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function OnboardingFlow({ user }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('starting_options')
  const [startingMethod, setStartingMethod] = useState<'alone' | 'with_code' | null>(null)
  const [inviteCode, setInviteCode] = useState('')

  const handleStartingMethod = (method: 'alone' | 'with_code') => {
    setStartingMethod(method)
    if (method === 'alone') {
      setCurrentStep('preview_question')
    } else {
      setCurrentStep('connect_with_code')
    }
  }

  const handlePreviewComplete = () => {
    setCurrentStep('share_invitation')
  }

  const handleInviteCodeSubmit = async (code: string) => {
    setInviteCode(code)
    setCurrentStep('connecting')
    
    try {
      // 실제 초대코드 연결 API 호출
      const response = await fetch('/api/onboarding/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inviteCode: code,
          userLabel: '가족' // TODO: 사용자가 선택한 라벨로 변경
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '연결에 실패했습니다')
      }
      
      const result = await response.json()
      // 연결 성공 - Today 페이지로 리다이렉트
      window.location.href = '/today'
      
    } catch (error) {
      console.error('초대코드 연결 오류:', error)
      // 에러 발생 시 다시 입력 단계로
      setCurrentStep('connect_with_code')
      // TODO: 에러 메시지 표시
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'starting_options':
        return (
          <StartingOptions 
            onSelect={handleStartingMethod}
            userName={user.name || '사용자'}
          />
        )
      
      case 'preview_question':
        return (
          <PreviewQuestion
            onComplete={handlePreviewComplete}
            onBack={() => setCurrentStep('starting_options')}
          />
        )
      
      case 'share_invitation':
        return (
          <ShareInvitation
            userName={user.name || '사용자'}
            onBack={() => setCurrentStep('preview_question')}
          />
        )
      
      case 'connect_with_code':
        return (
          <ConnectWithCode
            onSubmit={handleInviteCodeSubmit}
            onBack={() => setCurrentStep('starting_options')}
          />
        )
      
      case 'connecting':
        return (
          <div className="max-w-md mx-auto p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">연결 중...</h2>
            <p className="text-gray-600">가족과 연결하고 있습니다</p>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
            <div className={`w-2 h-2 rounded-full ${
              ['preview_question', 'share_invitation', 'connecting'].includes(currentStep) 
                ? 'bg-violet-500' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`w-2 h-2 rounded-full ${
              ['share_invitation', 'connecting'].includes(currentStep) 
                ? 'bg-violet-500' 
                : 'bg-gray-300'
            }`}></div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              마음배달 시작하기
            </h1>
            <p className="text-sm text-gray-600">
              가족과 따뜻한 대화를 시작해보세요
            </p>
          </div>
        </div>

        {/* 현재 단계 렌더링 */}
        {renderStep()}
      </div>
    </div>
  )
}