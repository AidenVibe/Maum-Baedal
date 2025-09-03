/**
 * 관심사 카테고리 정의 (Questions.txt 기반)
 * 온보딩 및 개인화에 사용
 */

export interface InterestCategory {
  id: string
  name: string
  emoji: string
  description: string
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: 'daily',
    name: '일상·하루',
    emoji: '☀️',
    description: '오늘의 기분, 루틴, 하루 이야기'
  },
  {
    id: 'memories',
    name: '추억·과거',
    emoji: '📸',
    description: '어린 시절, 소중한 기억들'
  },
  {
    id: 'family',
    name: '가족·관계',
    emoji: '👨‍👩‍👧‍👦',
    description: '가족과의 대화, 서로에 대한 이해'
  },
  {
    id: 'gratitude',
    name: '감사·행복',
    emoji: '😊',
    description: '고마운 일, 행복한 순간들'
  },
  {
    id: 'hobbies',
    name: '취향·취미',
    emoji: '🎨',
    description: '좋아하는 것들, 취미 활동'
  },
  {
    id: 'food',
    name: '음식·요리',
    emoji: '🍽️',
    description: '맛있는 음식, 요리 이야기'
  },
  {
    id: 'learning',
    name: '배움·호기심',
    emoji: '📚',
    description: '새로 배운 것, 궁금한 것들'
  },
  {
    id: 'seasons',
    name: '계절·날씨·장소',
    emoji: '🌸',
    description: '날씨, 계절감, 좋아하는 장소'
  },
  {
    id: 'future',
    name: '미래·꿈·계획',
    emoji: '🌟',
    description: '꿈, 목표, 앞으로의 계획'
  },
  {
    id: 'comfort',
    name: '위로·응원·자기돌봄',
    emoji: '🤗',
    description: '힘든 날의 위로, 스스로 돌보기'
  }
]

/**
 * 카테고리 ID로 카테고리 정보 찾기
 */
export function getInterestCategory(id: string): InterestCategory | undefined {
  return INTEREST_CATEGORIES.find(category => category.id === id)
}

/**
 * 관심사 선택 유효성 검사
 */
export function validateInterests(interests: string[]): boolean {
  // 2-3개 선택 검증
  if (interests.length < 2 || interests.length > 3) {
    return false
  }
  
  // 모든 선택이 유효한 카테고리인지 검증
  const validIds = INTEREST_CATEGORIES.map(cat => cat.id)
  return interests.every(id => validIds.includes(id))
}

/**
 * 관심사 교집합 찾기 (질문 개인화용)
 */
export function getCommonInterests(interests1: string[], interests2: string[]): string[] {
  return interests1.filter(interest => interests2.includes(interest))
}