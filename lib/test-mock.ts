/**
 * 테스트용 목업 데이터 시스템
 * 인증 없이 모든 프론트 화면을 테스트하기 위한 목업 데이터
 */

import type { GateStatusType } from '@/lib/types'

// 테스트 사용자 목업
export const TEST_USERS = {
  me: {
    id: 'test-user-me',
    name: '김테스트',
    nickname: '테스트유저',
    email: 'test@example.com',
    profileImage: null
  },
  partner: {
    id: 'test-user-partner', 
    name: '이파트너',
    nickname: '가족',
    email: 'partner@example.com',
    profileImage: null
  },
  solo: {
    id: 'test-user-solo',
    name: '박솔로',
    nickname: '혼자하는중',
    email: 'solo@example.com', 
    profileImage: null
  }
} as const

// 테스트 질문 목업
export const TEST_QUESTIONS = [
  {
    id: 'q1',
    text: '오늘 하루 중 가장 기억에 남는 순간은 언제였나요?',
    category: 'daily',
    difficulty: 1
  },
  {
    id: 'q2', 
    text: '최근에 읽은 책이나 본 영화 중에서 추천하고 싶은 것이 있다면?',
    category: 'culture',
    difficulty: 2
  },
  {
    id: 'q3',
    text: '10년 후의 나는 어떤 모습일까요? 구체적으로 상상해서 말해주세요.',
    category: 'future',
    difficulty: 3
  },
  {
    id: 'q4',
    text: '가장 소중한 추억 하나를 들려주세요.',
    category: 'memory', 
    difficulty: 2
  },
  {
    id: 'q5',
    text: '요즘 가장 관심있는 것은 무엇인가요?',
    category: 'interest',
    difficulty: 1
  }
] as const

// 테스트 답변 목업
export const TEST_ANSWERS = {
  q1: {
    me: '오늘 점심에 동료와 함께 맛있는 파스타를 먹으면서 즐겁게 대화했던 시간이 가장 기억에 남아요. 오랜만에 마음 편히 웃을 수 있었거든요.',
    partner: '아침에 일찍 일어나서 산책하면서 본 일출이 정말 아름다웠어요. 새로운 하루가 시작된다는 기분이 들어서 기분이 좋았습니다.'
  },
  q2: {
    me: '최근에 본 "미나리" 영화를 추천하고 싶어요. 가족의 의미에 대해 다시 한번 생각해보게 되는 영화였어요.',
    partner: '하루키의 "상실의 시대"를 다시 읽었는데, 나이가 들어서 읽으니 또 다른 느낌이었어요. 청춘과 상실에 대한 깊은 통찰이 담겨있더라구요.'
  },
  q3: {
    me: '10년 후에는 제가 좋아하는 일을 하면서 경제적으로도 안정되어 있길 바라요. 작은 카페를 운영하면서 여유로운 삶을 살고 있을 것 같아요.',
    partner: '건강하고 활기찬 모습으로 가족들과 함께 시간을 보내고 있을 거예요. 손자들과 공원에서 뛰어놀면서 행복한 할머니가 되어있지 않을까요?'
  }
} as const

// 게이트 상태별 시나리오
export const GATE_SCENARIOS = {
  waiting: {
    status: 'waiting' as GateStatusType,
    description: '아직 아무도 답하지 않음',
    myAnswer: '',
    partnerAnswer: '',
    conversationId: null
  },
  need_my_answer: {
    status: 'need_my_answer' as GateStatusType,
    description: '상대방이 답했음, 내가 답해야 함',
    myAnswer: '',
    partnerAnswer: TEST_ANSWERS.q1.partner,
    conversationId: null
  },
  waiting_partner: {
    status: 'waiting_partner' as GateStatusType,
    description: '내가 답했음, 상대방 답변 기다리는 중',
    myAnswer: TEST_ANSWERS.q1.me,
    partnerAnswer: '',
    conversationId: null
  },
  opened: {
    status: 'opened' as GateStatusType,
    description: '둘 다 답했음, 게이트 공개됨',
    myAnswer: TEST_ANSWERS.q1.me,
    partnerAnswer: TEST_ANSWERS.q1.partner,
    conversationId: 'conv_test_123'
  }
} as const

// 오늘의 질문 데이터 생성
export function createTodayMockData(scenario: keyof typeof GATE_SCENARIOS = 'waiting') {
  const gateData = GATE_SCENARIOS[scenario]
  const question = TEST_QUESTIONS[0]
  
  return {
    question: question.text,
    questionId: question.id,
    myAnswer: gateData.myAnswer,
    partnerAnswer: gateData.partnerAnswer,
    gateStatus: gateData.status,
    timeLeft: '오늘 05시까지',
    serviceDay: '2025-08-29',
    partnerName: TEST_USERS.partner.nickname,
    assignmentId: 'assignment_test_123',
    canAnswer: true,
    soloMode: false,
    shareUrl: 'https://dearq.app/join/test_token_123',
    canShare: true
  }
}

// 대화 히스토리 목업
export const TEST_CONVERSATIONS = [
  {
    id: 'conv_test_123',
    serviceDay: '2025-08-29',
    question: TEST_QUESTIONS[0],
    answers: [
      {
        userId: TEST_USERS.me.id,
        content: TEST_ANSWERS.q1.me,
        user: TEST_USERS.me
      },
      {
        userId: TEST_USERS.partner.id, 
        content: TEST_ANSWERS.q1.partner,
        user: TEST_USERS.partner
      }
    ],
    createdAt: '2025-08-29T10:00:00Z',
    status: 'opened'
  },
  {
    id: 'conv_test_124',
    serviceDay: '2025-08-28', 
    question: TEST_QUESTIONS[1],
    answers: [
      {
        userId: TEST_USERS.me.id,
        content: TEST_ANSWERS.q2.me,
        user: TEST_USERS.me
      },
      {
        userId: TEST_USERS.partner.id,
        content: TEST_ANSWERS.q2.partner,
        user: TEST_USERS.partner
      }
    ],
    createdAt: '2025-08-28T10:00:00Z',
    status: 'opened'
  },
  {
    id: 'conv_test_125',
    serviceDay: '2025-08-27',
    question: TEST_QUESTIONS[2], 
    answers: [
      {
        userId: TEST_USERS.me.id,
        content: TEST_ANSWERS.q3.me,
        user: TEST_USERS.me
      },
      {
        userId: TEST_USERS.partner.id,
        content: TEST_ANSWERS.q3.partner,
        user: TEST_USERS.partner
      }
    ],
    createdAt: '2025-08-27T10:00:00Z',
    status: 'opened'
  }
] as const

// 온보딩 목업 데이터
export const ONBOARDING_MOCK = {
  inviteCode: 'FAMILY2025',
  inviterName: '엄마',
  interests: [
    '요리', '독서', '영화', '여행', '운동', 
    '음악', '게임', '사진', '반려동물', '원예'
  ],
  selectedInterests: ['독서', '영화', '여행']
} as const

// 설정 페이지 목업
export const SETTINGS_MOCK = {
  profile: {
    nickname: TEST_USERS.me.nickname,
    profileImage: null
  },
  pair: {
    partnerName: TEST_USERS.partner.nickname,
    connectedSince: '2025-08-01',
    totalConversations: 15,
    status: 'active'
  },
  notifications: {
    dailyReminder: true,
    partnerAnswer: true,
    gateOpened: true
  }
} as const

// 관리자 페이지 목업
export const ADMIN_MOCK = {
  stats: {
    totalUsers: 1234,
    activeUsers: 567, 
    todayConversations: 89,
    completionRate: 78.5
  },
  recentActivity: [
    { type: 'user_joined', message: '새 사용자 가입', time: '5분 전' },
    { type: 'conversation_completed', message: '대화 완료', time: '12분 전' },
    { type: 'question_added', message: '새 질문 추가', time: '1시간 전' }
  ]
} as const

// 테스트 시나리오별 상태 관리
export class TestMockManager {
  private currentScenario: keyof typeof GATE_SCENARIOS = 'waiting'
  
  setScenario(scenario: keyof typeof GATE_SCENARIOS) {
    this.currentScenario = scenario
  }
  
  getCurrentTodayData() {
    return createTodayMockData(this.currentScenario)
  }
  
  getScenarios() {
    return Object.keys(GATE_SCENARIOS) as Array<keyof typeof GATE_SCENARIOS>
  }
  
  getScenarioDescription(scenario: keyof typeof GATE_SCENARIOS) {
    return GATE_SCENARIOS[scenario].description
  }
}

// 전역 테스트 매니저 인스턴스
export const testMockManager = new TestMockManager()