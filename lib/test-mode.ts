/**
 * 테스트 모드 감지 및 Mock 데이터 제공 유틸리티
 * 
 * 개발 모드에서만 활성화되며, 프로덕션에서는 항상 false 반환
 */

import { NextRequest } from 'next/server'

/**
 * 테스트 모드 감지
 * - dev_scenario 또는 test_mode=true 쿼리 파라미터
 * - Referer 헤더에서 테스트 모드 감지
 * - x-dev-scenario 헤더
 */
export function isTestMode(request: NextRequest): boolean {
  // 프로덕션에서는 항상 false
  if (process.env.NODE_ENV !== 'development') {
    return false
  }

  // 1. 직접 쿼리 파라미터 확인
  const testModeQuery = request.nextUrl.searchParams.get('test_mode')
  const devScenarioQuery = request.nextUrl.searchParams.get('dev_scenario')
  
  if (testModeQuery === 'true' || devScenarioQuery) {
    return true
  }

  // 2. Referer 헤더에서 테스트 모드 감지
  const referer = request.headers.get('referer')
  if (referer) {
    const refererUrl = new URL(referer)
    const refererTestMode = refererUrl.searchParams.get('test_mode')
    const refererDevScenario = refererUrl.searchParams.get('dev_scenario')
    
    if (refererTestMode === 'true' || refererDevScenario) {
      return true
    }
  }

  // 3. 헤더에서 테스트 모드 감지
  const devScenarioHeader = request.headers.get('x-dev-scenario')
  if (devScenarioHeader) {
    return true
  }

  return false
}

/**
 * 테스트 모드용 Mock 사용자 정보
 */
export function getMockUser() {
  return {
    id: 'test-user-123',
    nickname: '테스트 사용자',
    label: '엄마',
    kakaoSub: 'test-kakao-sub-123'
  }
}

/**
 * 테스트 모드용 Mock 오늘 과제 데이터
 */
export function getMockTodayData() {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  let serviceDay = kst.toISOString().split('T')[0]
  
  // 05시 이전이면 전날로 처리
  if (kst.getHours() < 5) {
    const yesterday = new Date(kst)
    yesterday.setDate(yesterday.getDate() - 1)
    serviceDay = yesterday.toISOString().split('T')[0]
  }

  return {
    assignmentId: 'test-assignment-123',
    serviceDay,
    question: '오늘 하루 중 가장 기억에 남는 순간은 언제였나요?',
    questionId: 'test-question-123',
    questionCategory: 'daily',
    myAnswer: '',
    myAnswerId: null,
    partnerAnswer: undefined,
    gateStatus: 'need_my_answer' as const,
    conversationId: null,
    soloMode: false,
    shareUrl: undefined,
    canShare: true,
    timeLeft: '12시간 30분',
    timeLeftMinutes: 750,
    isExpired: false,
    partnerName: '가족',
    partnerLabel: '아빠',
    canAnswer: true
  }
}

/**
 * 테스트 모드용 Mock 프로필 데이터
 */
export function getMockProfile() {
  return {
    user: getMockUser()
  }
}

/**
 * 테스트 모드용 Mock 온보딩 프로필 데이터
 */
export function getMockOnboardingProfile() {
  return {
    user: {
      id: 'test-user-123',
      nickname: '테스트 사용자',
      bio: '테스트용 한줄소개입니다',
      interests: ['가족시간', '독서'],
      onboardedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    isOnboarded: true
  }
}

/**
 * 테스트 모드용 Mock 동반자 데이터
 */
export function getMockCompanions() {
  return [
    {
      id: 'test-companion-1',
      nickname: '엄마',
      label: '엄마',
      connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
      isActive: true,
      isBlocked: false,
      notificationsEnabled: true,
      stats: {
        totalConversations: 28,
        completedConversations: 25,
        lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1일 전
      }
    },
    {
      id: 'test-companion-2',
      nickname: '아빠',
      label: '아빠',
      connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15일 전
      isActive: true,
      isBlocked: false,
      notificationsEnabled: true,
      stats: {
        totalConversations: 12,
        completedConversations: 9,
        lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2일 전
      }
    }
  ]
}

/**
 * 테스트 모드용 Mock 초대코드 생성 데이터
 */
export function getMockInviteCode() {
  const mockCode = `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  return {
    inviteCode: mockCode,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후
    success: true,
    message: '테스트 모드: 초대코드가 생성되었습니다.'
  }
}