/**
 * 개발 모드용 Mock 데이터 유틸리티
 * localStorage에서 dev 시나리오와 mock 데이터를 읽어 시뮬레이션 제공
 */

// Mock 데이터 타입 정의
export interface DevMockData {
  // 사용자 상태
  isNewUser?: boolean
  hasCompanion?: boolean
  isInviteReceiver?: boolean
  inviteCode?: string
  inviterName?: string
  
  // 온보딩 관련
  step?: 'profile' | 'interests' | 'share'
  profileData?: { nickname: string }
  interests?: string[]
  
  // 과제 상태
  gateStatus?: 'waiting' | 'waiting_partner' | 'need_my_answer' | 'opened' | 'solo_mode'
  myAnswer?: string | null
  partnerAnswer?: string | null
  hasActiveAssignment?: boolean
  conversationId?: string
  canShare?: boolean // 기본값: true (언제나 공유 가능)
  soloMode?: boolean
  
  // 히스토리 상태
  hasHistory?: boolean
  conversationCount?: number
  
  // 공유된 질문 관련
  sharedQuestion?: any
  inviterAlreadyAnswered?: boolean
  
  // 공유 기능 테스트용
  shareToken?: string
  isShared?: boolean
  shareUrl?: string
  
  // 모드 전환 관련
  modeTransitioned?: boolean
  transitionMessage?: string
}

// Mock Question 데이터
export const MOCK_QUESTIONS = [
  {
    id: 'q1',
    text: '오늘 하루 중 가장 감사했던 순간은 언제였나요?',
    category: 'gratitude'
  },
  {
    id: 'q2', 
    text: '최근에 새로 배운 것이 있다면 무엇인가요?',
    category: 'growth'
  },
  {
    id: 'q3',
    text: '지금 이 순간 가장 기대되는 일은 무엇인가요?',
    category: 'future'
  }
]

// Mock User 데이터
export const MOCK_USERS = {
  me: {
    id: 'user_me',
    nickname: '나',
    label: '본인',
    kakaoSub: 'dev_user_me'
  },
  partner: {
    id: 'user_partner',
    nickname: '김마음',
    label: '가족',
    kakaoSub: 'dev_user_partner'
  },
  inviter: {
    id: 'user_inviter',
    nickname: '김마음님',
    label: '초대한 분',
    kakaoSub: 'dev_user_inviter'
  }
}

/**
 * 테스트 모드 활성화 여부 확인 (URL 기반)
 * /test 또는 /admin/test 경로에서 목업 데이터 활성화
 */
export function isTestMode(): boolean {
  if (typeof window === 'undefined') return false
  
  // /test 또는 /admin/test 경로에서 테스트 모드 활성화
  return window.location.pathname.startsWith('/test') || 
         window.location.pathname.startsWith('/admin/test')
}

/**
 * URL에서 test_mode=true 파라미터 확인
 * 실제 페이지에서 테스트 시나리오 드롭다운 표시 여부 결정
 * 보안상 /admin 경로에서만 test_mode 파라미터 허용
 */
export function isTestModeParam(): boolean {
  if (typeof window === 'undefined') return false
  
  // 보안: /admin 경로에서만 test_mode 파라미터 허용
  const pathname = window.location.pathname
  const isAdminPath = pathname.startsWith('/admin')
  
  if (!isAdminPath) {
    return false
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('test_mode') === 'true'
}

/**
 * 개발 모드 활성화 여부 확인
 * 실제 사용자와 테스트 환경을 명확히 분리
 */
export function isDevMode(): boolean {
  // 프로덕션에서는 완전히 비활성화
  if (process.env.NODE_ENV === 'production') return false
  
  // 개발 환경에서 /test 경로이거나 test_mode=true 파라미터가 있으면 활성화
  return isTestMode() || isTestModeParam()
}

/**
 * 현재 개발 시나리오 ID 반환
 */
export function getDevScenario(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('dev_scenario')
}

/**
 * 현재 Mock 데이터 반환
 */
export function getDevMockData(): DevMockData {
  if (typeof window === 'undefined') return {}
  
  const mockDataStr = localStorage.getItem('dev_mock_data')
  if (!mockDataStr) return {}
  
  try {
    return JSON.parse(mockDataStr)
  } catch (error) {
    console.error('[DEV MOCK] Mock 데이터 파싱 실패:', error)
    return {}
  }
}

/**
 * Solo 모드 공유 상태로 설정
 */
export function setDevSoloModeWithShare(): void {
  if (typeof window === 'undefined') return
  
  const currentData = getDevMockData()
  const shareToken = 'test-share-' + Date.now().toString().slice(-6)
  const updatedData = {
    ...currentData,
    gateStatus: 'solo_mode' as const,
    hasCompanion: false,
    soloMode: true,
    myAnswer: '오늘은 새로운 책을 읽기 시작한 순간이 가장 기대되었어요. 오랜만에 마음에 드는 이야기를 만날 수 있을 것 같아서 설래네요.',
    canShare: true, // 언제나 공유 가능
    isShared: false,
    shareToken,
    shareUrl: `https://dearq.app/join/${shareToken}`
  }
  
  localStorage.setItem('dev_mock_data', JSON.stringify(updatedData))
  console.log('[DEV MOCK] Solo 모드 + 공유 가능 상태로 설정 완료 (언제나 공유 가능)')
}

/**
 * 솔로모드에서 동반자모드로 전환 시뮬레이션
 */
export function setDevSoloToCompanionTransition(): void {
  if (typeof window === 'undefined') return
  
  const currentData = getDevMockData()
  const updatedData = {
    ...currentData,
    gateStatus: 'opened' as const,
    hasCompanion: true,
    soloMode: false,
    myAnswer: currentData.myAnswer || '오늘은 새로운 책을 읽기 시작한 순간이 가장 기대되었어요.',
    partnerAnswer: '저는 아침에 커피를 마시며 창밖을 바라본 순간이 가장 평온했습니다. 새로운 하루의 시작을 느꼈거든요.',
    conversationId: 'conv_dev_123',
    canShare: true,
    isShared: true,
    modeTransitioned: true, // 모드 전환 완료 플래그
    transitionMessage: '🎉 함께모드로 전환되었습니다! 이제 매일 함께 대화를 나눌 수 있어요.'
  }
  
  localStorage.setItem('dev_mock_data', JSON.stringify(updatedData))
  console.log('[DEV MOCK] 솔로모드 → 동반자모드 전환 시뮬레이션 완료')
}

/**
 * Today API 응답을 Mock으로 생성
 */
/**
 * 개발 환경에서 게이트 열린 상태로 설정
 */
export function setDevGateOpened(): void {
  if (typeof window === 'undefined') return
  
  const currentData = getDevMockData()
  const updatedData = {
    ...currentData,
    gateStatus: 'opened' as const,
    myAnswer: '오늘은 아이가 웃어줄 때 가장 감사했어요. 피곤했던 하루가 한번에 사라지는 느낌이었습니다.',
    partnerAnswer: '점심에 함께 먹은 김치찌개가 생각나네요. 평범한 일상이지만 그 따뜻함이 고마웠습니다.',
    conversationId: 'conv_dev_123'
  }
  
  localStorage.setItem('dev_mock_data', JSON.stringify(updatedData))
  console.log('[DEV MOCK] 게이트 열린 상태로 설정 완료')
}

export function getMockTodayData(): any {
  const mockData = getDevMockData()
  const scenario = getDevScenario()
  
  console.log('[DEV MOCK] Today 데이터 생성:', { scenario, mockData })
  
  // 시나리오별 질문 선택
  let selectedQuestion = MOCK_QUESTIONS[0] // 기본: 첫 번째 질문
  
  if (mockData.isInviteReceiver && mockData.sharedQuestion) {
    // 초대받은 사람: 초대자와 동일한 현재 질문 (예: 목요일 질문)
    // 초대자가 며칠 사용 후 오늘 질문을 보고 마음에 들어서 초대한 상황 시뮬레이션
    selectedQuestion = MOCK_QUESTIONS[1] // 두 번째 질문 = "오늘의 질문"
    console.log('[DEV MOCK] 초대받은 사람: 초대자와 동일한 질문 사용 -', selectedQuestion.text)
  } else if (scenario === 'need_my_answer' && mockData.inviterAlreadyAnswered) {
    // 초대자가 먼저 답변한 시나리오: 동일한 질문 사용
    selectedQuestion = MOCK_QUESTIONS[1] // 동일한 질문
    console.log('[DEV MOCK] 초대자 먼저 답변: 동일한 질문 사용 -', selectedQuestion.text)
  } else if (scenario === 'history_user') {
    // 히스토리 사용자는 다양한 질문을 경험했을 것
    selectedQuestion = MOCK_QUESTIONS[2]
  }

  // 기본 Assignment 데이터
  const baseAssignment = {
    id: 'assign_dev_123',
    companionId: 'companion_dev_123',
    serviceDay: new Date().toISOString().split('T')[0],
    questionId: selectedQuestion.id,
    status: 'active',
    createdAt: new Date().toISOString(),
    question: selectedQuestion,
    answers: []
  }
  
  // 시나리오별 답변 생성
  const answers = []
  
  if (mockData.myAnswer) {
    answers.push({
      id: 'answer_me',
      assignmentId: 'assign_dev_123',
      userId: 'user_me',
      content: mockData.myAnswer,
      createdAt: new Date().toISOString(),
      user: MOCK_USERS.me
    })
  }
  
  if (mockData.partnerAnswer) {
    answers.push({
      id: 'answer_partner',
      assignmentId: 'assign_dev_123', 
      userId: 'user_partner',
      content: mockData.partnerAnswer,
      createdAt: new Date().toISOString(),
      user: MOCK_USERS.partner
    })
  }
  
  const assignment = {
    ...baseAssignment,
    answers
  }
  
  // Conversation 데이터 (게이트 공개시)
  let conversation = null
  if (mockData.gateStatus === 'opened' && mockData.conversationId) {
    conversation = {
      id: mockData.conversationId,
      assignmentId: 'assign_dev_123',
      status: 'opened',
      openedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  }
  
  return {
    assignment,
    gateStatus: mockData.gateStatus || 'waiting',
    timeRemaining: '23:45:30', // Mock countdown
    conversation,
    user: MOCK_USERS.me,
    partner: MOCK_USERS.partner
  }
}

/**
 * 개발 모드 상태 확인 및 로그
 */
export function logDevModeStatus() {
  if (!isDevMode()) {
    console.log('[DEV MOCK] 개발 모드 비활성화')
    return
  }
  
  const scenario = getDevScenario()
  const mockData = getDevMockData()
  
  console.log('[DEV MOCK] 개발 모드 활성화:', {
    scenario,
    mockData,
    location: window.location.pathname
  })
}

/**
 * Mock 히스토리 데이터 생성
 */
export function getMockHistoryData(): any[] {
  const mockData = getDevMockData()
  
  // dev 로그인 사용자는 기본적으로 히스토리 데이터 제공
  // 명시적으로 hasHistory: false인 경우만 빈 배열 반환
  if (mockData.hasHistory === false) {
    return []
  }
  
  // 여러 개의 완료된 대화 목업 데이터
  return [
    {
      id: 'conv_1',
      assignmentId: 'assign_1',
      status: 'completed',
      openedAt: '2025-01-25T10:30:00Z',
      createdAt: '2025-01-25T05:00:00Z',
      assignment: {
        id: 'assign_1',
        serviceDay: '2025-01-25',
        question: {
          id: 'q1',
          text: '오늘 하루 중 가장 감사했던 순간은 언제였나요?',
          category: 'gratitude'
        }
      },
      answers: [
        {
          id: 'answer_1_me',
          userId: 'user_me',
          content: '오늘 아침에 따뜻한 커피를 마시면서 창밖의 햇살을 바라볼 때였어요. 정말 평범한 순간이지만 그 평화로움이 너무 좋았어요.',
          createdAt: '2025-01-25T08:15:00Z',
          user: MOCK_USERS.me
        },
        {
          id: 'answer_1_partner',
          userId: 'user_partner', 
          content: '저는 점심시간에 동료가 제가 힘들어하는 걸 알아차리고 따뜻한 말 한마디 건네준 때가 가장 감사했어요. 작은 관심이지만 큰 힘이 되었어요.',
          createdAt: '2025-01-25T09:20:00Z',
          user: MOCK_USERS.partner
        }
      ]
    },
    {
      id: 'conv_2', 
      assignmentId: 'assign_2',
      status: 'completed',
      openedAt: '2025-01-24T14:15:00Z',
      createdAt: '2025-01-24T05:00:00Z',
      assignment: {
        id: 'assign_2',
        serviceDay: '2025-01-24',
        question: {
          id: 'q2',
          text: '최근에 새로 배운 것이 있다면 무엇인가요?',
          category: 'growth'
        }
      },
      answers: [
        {
          id: 'answer_2_me', 
          userId: 'user_me',
          content: '요리할 때 소금을 넣는 타이밍이 정말 중요하다는 걸 배웠어요! 마지막에 넣는 것보다 중간중간 넣어야 훨씬 깊은 맛이 나더라고요.',
          createdAt: '2025-01-24T11:30:00Z',
          user: MOCK_USERS.me
        },
        {
          id: 'answer_2_partner',
          userId: 'user_partner',
          content: '저는 사람들과 대화할 때 상대방의 말을 끝까지 듣고 반응하는 게 얼마나 중요한지 깨달았어요. 성급하게 대답하지 않으려고 노력하고 있어요.',
          createdAt: '2025-01-24T13:45:00Z',
          user: MOCK_USERS.partner
        }
      ]
    },
    {
      id: 'conv_3',
      assignmentId: 'assign_3', 
      status: 'completed',
      openedAt: '2025-01-23T16:45:00Z',
      createdAt: '2025-01-23T05:00:00Z',
      assignment: {
        id: 'assign_3',
        serviceDay: '2025-01-23',
        question: {
          id: 'q3',
          text: '지금 이 순간 가장 기대되는 일은 무엇인가요?',
          category: 'future'
        }
      },
      answers: [
        {
          id: 'answer_3_me',
          userId: 'user_me', 
          content: '다음 주말에 예정된 등산이 너무 기대돼요! 날씨도 좋을 것 같고, 오랜만에 자연 속에서 맑은 공기를 마실 생각에 벌써 설레네요.',
          createdAt: '2025-01-23T12:20:00Z',
          user: MOCK_USERS.me
        },
        {
          id: 'answer_3_partner',
          userId: 'user_partner',
          content: '곧 출간될 새 책을 읽는 게 가장 기대돼요. 작가의 전작들을 정말 좋아해서 이번 책도 어떤 이야기일지 궁금하거든요.',
          createdAt: '2025-01-23T15:10:00Z',
          user: MOCK_USERS.partner
        }
      ]
    }
  ]
}

/**
 * 실제 사용자 세션에서 개발 데이터 정리
 * 목업 모드 간섭 방지를 위한 자동 정리
 */
export function clearDevDataFromRealUser() {
  if (typeof window === 'undefined') return
  
  // 테스트 컨텍스트가 아닌 경우에만 개발 데이터 자동 정리
  // - /test 경로 또는 ?test_mode=true 파라미터가 있으면 유지
  if (!(isTestMode() || isTestModeParam())) {
    const hasDevData = localStorage.getItem('dev_scenario') || 
                      localStorage.getItem('dev_mock_data') || 
                      sessionStorage.getItem('dev_login_user')
    
    if (hasDevData) {
      localStorage.removeItem('dev_scenario')
      localStorage.removeItem('dev_mock_data')
      sessionStorage.removeItem('dev_login_user')
      console.log('[DEV MOCK] 실제 사용자 세션에서 개발 데이터 자동 정리 완료')
    }
  }
}

/**
 * Mock 데이터 초기화 (테스트용)
 */
export function clearDevMockData() {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('dev_scenario')
  localStorage.removeItem('dev_mock_data')
  sessionStorage.removeItem('dev_login_user')
  console.log('[DEV MOCK] Mock 데이터 초기화 완료')
}

/**
 * Mock 데이터 설정 (테스트용)
 */
export function setDevMockData(scenarioId: string, mockData: DevMockData) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('dev_scenario', scenarioId)
  localStorage.setItem('dev_mock_data', JSON.stringify(mockData))
  console.log('[DEV MOCK] Mock 데이터 설정 완료:', { scenarioId, mockData })
}
