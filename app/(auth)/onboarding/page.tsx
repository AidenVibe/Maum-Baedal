'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ProfileSetup } from '@/components/onboarding/ProfileSetup'
import { InterestSelector } from '@/components/onboarding/InterestSelector'
import { KakaoShare } from '@/components/onboarding/KakaoShare'
import TestScenarioDropdown from '@/components/dev/TestScenarioDropdown'
import CurrentScenarioStatus from '@/components/dev/CurrentScenarioStatus'
import { isDevMode, getDevMockData, logDevModeStatus, isTestModeParam } from '@/lib/dev-mock'

type OnboardingStep = 'profile' | 'interests' | 'share'

interface OnboardingData {
  profile?: { nickname: string }
  interests?: string[]
}

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('profile')
  const [data, setData] = useState<OnboardingData>({})
  const [isDevModeActive, setIsDevModeActive] = useState(false)
  const [showTestDropdown, setShowTestDropdown] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // 개발 모드 감지 및 초기화
  useEffect(() => {
    logDevModeStatus()
    
    // 테스트 모드 감지 (test_mode=true 파라미터)
    setShowTestDropdown(isTestModeParam())
    
    const devScenario = searchParams.get('dev_scenario')
    const isDevActive = (isDevMode() && !!devScenario) || isTestModeParam()
    
    setIsDevModeActive(isDevActive)
    
    if (isDevActive) {
      console.log('[ONBOARDING] 🚀 개발 모드 활성화:', devScenario)
      
      const mockData = getDevMockData()
      
      // 시나리오별 초기 상태 설정
      if (devScenario === 'invite_receiver') {
        console.log('[ONBOARDING] 📨 초대받은 사람 시나리오')
        // 초대받은 사람은 프로필부터 시작
        setStep('profile')
        setData({
          profile: { 
            nickname: `받은이${Math.floor(Math.random() * 100)}`
          }
        })
      } else if (devScenario === 'new_user') {
        console.log('[ONBOARDING] 👤 신규 사용자 시나리오')
        setStep('profile')
      }
      
      return // 개발 모드에서는 세션 체크 우회
    }
    
    // 프로덕션 모드 - 정상적인 세션 체크
    if (status === 'unauthenticated') {
      console.log('[ONBOARDING] 인증되지 않은 사용자, 로그인으로 리다이렉트')
      router.push('/login')
    }
  }, [searchParams, status, router])

  // 개발 모드일 때는 로딩/세션 체크 우회
  if (isDevModeActive) {
    console.log('[ONBOARDING] 개발 모드로 실행 중')
    // 개발 모드에서는 바로 컴포넌트 렌더링
  } else {
    // 프로덕션 모드의 기존 로직
    if (status === 'loading') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )
    }

    if (!session?.user) {
      return null // 리다이렉트 중
    }
  }

  // 프로필 설정 완료 핸들러
  const handleProfileComplete = (profile: { nickname: string }) => {
    setData(prev => ({ ...prev, profile }))
    setStep('interests')
  }

  // 관심사 선택 완료 핸들러 (폴백용 - InterestSelector에서 직접 처리하지만 에러시 사용)
  const handleInterestsComplete = (interests: string[]) => {
    setData(prev => ({ ...prev, interests }))
    console.log('[ONBOARDING] 관심사 선택 완료, 폴백 핸들러 호출됨:', interests)
    
    // 만약 이 핸들러가 호출되면 /today로 이동 (에러 시 폴백)
    const isTestMode = isTestModeParam()
    const todayUrl = isTestMode ? '/today?test_mode=true' : '/today'
    console.log(`[ONBOARDING] 폴백으로 Today 페이지로 이동: ${todayUrl}`)
    router.push(todayUrl)
  }

  // 이전 단계로 돌아가기
  const handleBackToProfile = () => {
    setStep('profile')
  }

  const handleBackToInterests = () => {
    setStep('interests')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4">
      {/* 테스트 시나리오 상태 표시 (우상단 고정) */}
      {showTestDropdown && <CurrentScenarioStatus />}
      
      {/* 개발 모드 표시 */}
      {isDevModeActive && !showTestDropdown && (
        <div className="fixed top-0 left-0 right-0 bg-violet-100 text-violet-900 text-center py-2 text-sm font-medium z-50">
          🧪 개발 모드: {searchParams.get('dev_scenario')} 시나리오 테스트 중
        </div>
      )}
      
      {/* 테스트 시나리오 드롭다운 (상단) */}
      {showTestDropdown && (
        <div className="fixed top-0 left-0 right-0 bg-violet-50 border-b border-violet-200 p-3 z-50">
          <div className="max-w-md mx-auto flex items-center justify-center">
            <TestScenarioDropdown currentPage="onboarding" />
          </div>
        </div>
      )}
      
      <div className={`flex items-center justify-center min-h-screen ${isDevModeActive || showTestDropdown ? 'pt-16' : ''}`}>
        {step === 'profile' && (
          <ProfileSetup 
            onComplete={handleProfileComplete}
            initialData={data.profile}
          />
        )}
        
        {step === 'interests' && data.profile && (
          <InterestSelector 
            onComplete={handleInterestsComplete}
            onBack={handleBackToProfile}
            initialInterests={data.interests}
            profile={data.profile}
          />
        )}
        
        {step === 'share' && data.profile && data.interests && (
          <KakaoShare 
            profile={data.profile}
            interests={data.interests}
            onBack={handleBackToInterests}
          />
        )}
      </div>
    </div>
  )
}