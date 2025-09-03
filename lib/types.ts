/**
 * 마음배달 v2 공통 타입 정의
 */

import type { Assignment, Question, Answer, Conversation, Companion, User } from '@prisma/client'

// 게이트 상태 타입 (solo mode 추가)
export type GateStatusType = 'waiting' | 'waiting_partner' | 'need_my_answer' | 'opened' | 'solo_mode'

// 확장된 데이터베이스 타입들
export type UserBasic = Pick<User, 'id' | 'nickname' | 'label'>

export type AssignmentWithDetails = Assignment & {
  question: Question
  answers: (Answer & { user: UserBasic })[]
  companion: Companion & { user1: User; user2: User | null }
  conversation?: Conversation | null
}

// API 응답 타입들
export interface TodayResponse {
  // Assignment 기본 정보
  assignmentId: string
  serviceDay: string
  
  // 질문 정보
  question: string
  questionId: string
  questionCategory: string
  
  // 답변 정보
  myAnswer: string
  myAnswerId?: string
  partnerAnswer?: string
  
  // 게이트 상태
  gateStatus: GateStatusType
  conversationId?: string
  
  // Solo mode 관련
  soloMode: boolean
  shareUrl?: string
  canShare: boolean
  
  // 시간 정보
  timeLeft: string
  timeLeftMinutes: number
  isExpired: boolean
  
  // 상대방 정보 (solo mode에서는 선택적)
  partnerName?: string
  partnerLabel?: string | null
  
  // 기능 제한 정보
  canAnswer: boolean
}

export interface AnswerSubmitRequest {
  assignmentId: string
  content: string
}

export interface AnswerSubmitValidationError {
  field: 'assignmentId' | 'content'
  message: string
}

export interface AnswerSubmitResponse {
  success: boolean
  gateStatus: GateStatusType
  conversationId?: string
  companionId?: string // 새로 생성된 Companion ID (모드 전환 시)
  modeTransition?: boolean // 모드 전환 여부
  message: string
  redirectUrl?: string // 모드 전환 후 리다이렉트할 URL
}


// 에러 응답 타입
export interface ApiErrorResponse {
  error: string
  code?: string
}

// Frontend 컴포넌트에서 사용하는 통합 데이터 타입
export interface TodayData {
  question: string
  questionId?: string
  myAnswer: string
  partnerAnswer?: string
  gateStatus: GateStatusType
  timeLeft: string
  serviceDay: string
  partnerName?: string
  assignmentId: string // Required for actions
  canAnswer?: boolean
  // Solo mode 지원
  soloMode?: boolean
  shareUrl?: string
  canShare?: boolean
}

// 서비스 데이 관련 타입
export interface TimeLeft {
  hours: number
  minutes: number
  totalMinutes: number
  isExpired: boolean
}

// 질문 관련 타입
export interface QuestionSummary {
  id: string
  content: string
  category: string
  difficulty: string
  totalUsed: number
  totalSwaps: number
}

// 사용자 동반자 관련 타입
export interface CompanionInfo {
  id: string
  inviteCode: string
  status: string
  user1: UserBasic
  user2: UserBasic
  createdAt: string
}

// 대화 관련 타입
export interface ConversationSummary {
  id: string
  serviceDay: string
  question: string
  answers: {
    user: UserBasic
    content: string
    createdAt: string
  }[]
  createdAt: string
}

// Conversation Detail API 응답 타입
export interface ConversationDetailResponse {
  id: string
  serviceDay: string
  question: {
    id: string
    content: string
    category?: string
  }
  answers: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      nickname: string
    }
  }>
  createdAt: string
  participants: {
    user1: {
      id: string
      nickname: string
    }
    user2: {
      id: string
      nickname: string
    }
  }
}

// Navigation API 응답 타입
export interface NavigationItem {
  id: string
  serviceDay: string
  questionPreview: string
}

export interface ConversationNavigationResponse {
  navigation: {
    current: NavigationItem
    previous: NavigationItem | null
    next: NavigationItem | null
    hasPrevious: boolean
    hasNext: boolean
  }
}

// 공유 Assignment 관련 타입
export interface ShareAssignmentResponse {
  // Assignment 기본 정보
  assignmentId: string
  serviceDay: string
  
  // 질문 정보
  question: string
  questionCategory: string
  
  // 원래 사용자 정보
  originalUser: {
    id: string
    nickname: string
    bio?: string | null
  }
  
  // 답변 정보
  originalUserAnswer: string
  myAnswer: string
  hasAnswered: boolean
  
  // 시간 정보
  timeLeft: string
  timeLeftMinutes: number
  isExpired: boolean
  
  // 기능 제한 정보
  canAnswer: boolean
  
  // 모드 전환 관련
  willBecomeCompanion: boolean
  companionshipMessage: string
}

export interface ShareAnswerSubmitRequest {
  content: string
}

export interface ShareAnswerSubmitResponse {
  success: boolean
  gateStatus: GateStatusType
  conversationId?: string
  companionId?: string
  modeTransition: boolean
  message: string
  redirectUrl?: string
}