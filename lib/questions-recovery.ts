/**
 * Questions 테이블 자동 복구 시스템
 * 
 * 마음배달 서비스의 핵심인 질문이 부족하거나 없을 때
 * 자동으로 기본 질문을 생성하여 서비스 중단을 방지합니다.
 */

import { prisma } from './prisma'
import { PrismaClient, Question } from '@prisma/client'

// 기본 질문 데이터 - 마음배달 서비스 철학에 맞는 따뜻한 질문들
const DEFAULT_QUESTIONS: Array<{
  content: string
  category: string
  difficulty: string
}> = [
  // 일상·하루 (daily)
  {
    content: "오늘 하루 중 가장 감사했던 순간은 언제였나요?",
    category: "daily",
    difficulty: "easy"
  },
  {
    content: "오늘 하루를 한 단어로 표현한다면 무엇인가요?",
    category: "daily", 
    difficulty: "easy"
  },
  {
    content: "오늘 만난 사람 중에 기억에 남는 사람이 있나요?",
    category: "daily",
    difficulty: "easy"
  },

  // 가족·관계 (family)
  {
    content: "가족과 함께 해보고 싶은 새로운 활동이 있다면 무엇인가요?",
    category: "family",
    difficulty: "easy"
  },
  {
    content: "가족 중에서 가장 닮고 싶은 사람의 장점은 무엇인가요?",
    category: "family",
    difficulty: "easy"
  },
  {
    content: "우리 가족만의 특별한 전통이나 규칙이 있나요?",
    category: "family",
    difficulty: "easy"
  },

  // 추억·과거 (memories)
  {
    content: "어릴 때 가장 기억에 남는 가족 여행지는 어디인가요?",
    category: "memories",
    difficulty: "easy"
  },
  {
    content: "가장 행복했던 어린 시절 기억을 하나 들려주세요.",
    category: "memories",
    difficulty: "easy"
  },

  // 감사·행복 (gratitude)
  {
    content: "최근에 가장 행복했던 일은 무엇인가요?",
    category: "gratitude",
    difficulty: "easy"
  },
  {
    content: "내 곁에 있어서 고마운 사람은 누구인가요?",
    category: "gratitude", 
    difficulty: "easy"
  },

  // 취향·취미 (hobbies)
  {
    content: "요즘 새로 시작한 취미나 관심사가 있나요?",
    category: "hobbies",
    difficulty: "easy"
  },
  {
    content: "스트레스를 풀 때 가장 좋아하는 방법은 무엇인가요?",
    category: "hobbies",
    difficulty: "easy"
  },

  // 음식·요리 (food)
  {
    content: "최근에 먹어본 음식 중 가장 맛있었던 것은 무엇인가요?",
    category: "food",
    difficulty: "easy"
  },
  {
    content: "어릴 때부터 지금까지 변하지 않는 좋아하는 음식이 있나요?",
    category: "food",
    difficulty: "easy"
  },

  // 배움·호기심 (learning)
  {
    content: "요즘 가장 궁금한 것이나 배워보고 싶은 것이 있나요?",
    category: "learning",
    difficulty: "easy"
  },

  // 미래·꿈·계획 (future)
  {
    content: "올해 안에 꼭 이루고 싶은 작은 목표가 있나요?",
    category: "future",
    difficulty: "easy"
  },

  // 위로·응원·자기돌봄 (comfort)
  {
    content: "힘들 때 나를 위로해주는 것은 무엇인가요?",
    category: "comfort",
    difficulty: "easy"
  },

  // 계절·날씨·장소 (seasons)
  {
    content: "지금 계절에 가장 좋아하는 것은 무엇인가요?",
    category: "seasons",
    difficulty: "easy"
  }
]

// Questions 테이블 상태 검증
export interface QuestionsHealthCheck {
  isHealthy: boolean
  totalQuestions: number
  activeQuestions: number
  categoryDistribution: Record<string, number>
  issues: string[]
  lastCheckedAt: Date
}

// Questions 복구 결과
export interface QuestionsRecoveryResult {
  wasEmpty: boolean
  questionsCreated: number
  categoriesAdded: string[]
  recoveredAt: Date
  success: boolean
  error?: string
}

/**
 * Questions 테이블 상태 검증
 * 질문 수, 활성 질문 수, 카테고리 분포 등을 확인하여 건강 상태를 평가합니다.
 */
export async function checkQuestionsHealth(): Promise<QuestionsHealthCheck> {
  try {
    // 전체 질문 수와 활성 질문 수 조회
    const [totalCount, activeCount] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { isActive: true } })
    ])

    // 카테고리별 활성 질문 분포
    const categoryStats = await prisma.question.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true }
    })

    const categoryDistribution: Record<string, number> = {}
    categoryStats.forEach(stat => {
      categoryDistribution[stat.category] = stat._count.category
    })

    // 문제점 검출
    const issues: string[] = []
    
    if (totalCount === 0) {
      issues.push('Questions 테이블이 완전히 비어있습니다')
    }
    
    if (activeCount === 0) {
      issues.push('활성 질문이 없습니다')
    } else if (activeCount < 10) {
      issues.push(`활성 질문이 너무 적습니다 (${activeCount}개)`)
    }

    const categoriesWithQuestions = Object.keys(categoryDistribution).length
    if (categoriesWithQuestions < 5) {
      issues.push(`질문 카테고리가 부족합니다 (${categoriesWithQuestions}개)`)
    }

    // 건강 상태 판정
    const isHealthy = issues.length === 0 && activeCount >= 10

    console.log('📊 Questions 건강 상태 체크:', {
      totalCount,
      activeCount,
      categoriesWithQuestions,
      isHealthy,
      issuesCount: issues.length
    })

    return {
      isHealthy,
      totalQuestions: totalCount,
      activeQuestions: activeCount,
      categoryDistribution,
      issues,
      lastCheckedAt: new Date()
    }

  } catch (error) {
    console.error('❌ Questions 건강 체크 실패:', error)
    return {
      isHealthy: false,
      totalQuestions: 0,
      activeQuestions: 0,
      categoryDistribution: {},
      issues: ['건강 체크 실행 중 오류 발생'],
      lastCheckedAt: new Date()
    }
  }
}

/**
 * 기본 질문 생성을 통한 자동 복구
 * Questions 테이블이 비어있거나 부족할 때 기본 질문들을 생성합니다.
 */
export async function recoverQuestionsTable(): Promise<QuestionsRecoveryResult> {
  const startTime = Date.now()
  console.log('🚨 Questions 자동 복구 시작...')

  try {
    const healthCheck = await checkQuestionsHealth()
    const wasEmpty = healthCheck.totalQuestions === 0
    
    // 이미 충분한 질문이 있으면 복구하지 않음
    if (healthCheck.isHealthy) {
      console.log('✅ Questions 테이블이 건강한 상태입니다. 복구 불필요')
      return {
        wasEmpty: false,
        questionsCreated: 0,
        categoriesAdded: [],
        recoveredAt: new Date(),
        success: true
      }
    }

    // 트랜잭션으로 안전하게 기본 질문 생성
    const result = await prisma.$transaction(async (tx) => {
      // 기본 질문 일괄 생성
      const createdQuestions = await tx.question.createMany({
        data: DEFAULT_QUESTIONS.map(q => ({
          content: q.content,
          category: q.category,
          difficulty: q.difficulty,
          isActive: true,
          totalUsed: 0,
          totalAnswers: 0
        })),
        skipDuplicates: true // 중복 질문이 있어도 오류 발생하지 않음
      })

      return {
        questionsCreated: createdQuestions.count,
        categoriesAdded: [...new Set(DEFAULT_QUESTIONS.map(q => q.category))]
      }
    })

    const duration = Date.now() - startTime
    
    console.log('✅ Questions 자동 복구 완료:', {
      questionsCreated: result.questionsCreated,
      categoriesAdded: result.categoriesAdded,
      duration: `${duration}ms`,
      wasEmpty
    })

    // 복구 후 건강 상태 재확인
    const postRecoveryHealth = await checkQuestionsHealth()
    console.log('📊 복구 후 상태:', {
      totalQuestions: postRecoveryHealth.totalQuestions,
      activeQuestions: postRecoveryHealth.activeQuestions,
      isHealthy: postRecoveryHealth.isHealthy
    })

    return {
      wasEmpty,
      questionsCreated: result.questionsCreated,
      categoriesAdded: result.categoriesAdded,
      recoveredAt: new Date(),
      success: true
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ Questions 자동 복구 실패:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    })

    return {
      wasEmpty: false,
      questionsCreated: 0,
      categoriesAdded: [],
      recoveredAt: new Date(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Questions 상태 확인 및 필요시 자동 복구
 * API에서 호출하여 질문 테이블 상태를 보장합니다.
 */
export async function ensureQuestionsAvailable(): Promise<{
  success: boolean
  recovered: boolean
  questionsCount: number
  error?: string
}> {
  try {
    // 1. 건강 상태 확인
    const healthCheck = await checkQuestionsHealth()
    
    // 2. 건강하면 그대로 진행
    if (healthCheck.isHealthy) {
      return {
        success: true,
        recovered: false,
        questionsCount: healthCheck.activeQuestions
      }
    }

    // 3. 건강하지 않으면 자동 복구 시도
    console.warn('⚠️ Questions 테이블 문제 감지, 자동 복구 시도:', {
      issues: healthCheck.issues,
      activeQuestions: healthCheck.activeQuestions
    })

    const recoveryResult = await recoverQuestionsTable()
    
    if (!recoveryResult.success) {
      return {
        success: false,
        recovered: false,
        questionsCount: 0,
        error: recoveryResult.error || '복구 실패'
      }
    }

    // 4. 복구 성공 후 최종 상태 확인
    const finalHealthCheck = await checkQuestionsHealth()
    
    return {
      success: finalHealthCheck.isHealthy,
      recovered: true,
      questionsCount: finalHealthCheck.activeQuestions,
      error: finalHealthCheck.isHealthy ? undefined : '복구 후에도 문제 지속'
    }

  } catch (error) {
    console.error('❌ ensureQuestionsAvailable 실행 중 오류:', error)
    return {
      success: false,
      recovered: false,
      questionsCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 캐시를 활용한 빠른 질문 가용성 체크
 * 성능 영향을 최소화하면서 질문 테이블 상태를 확인합니다.
 */
let questionsHealthCache: {
  lastChecked: number
  isHealthy: boolean
  questionsCount: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시

export async function quickCheckQuestionsAvailable(): Promise<boolean> {
  const now = Date.now()
  
  // 캐시가 유효하면 캐시된 결과 반환
  if (questionsHealthCache && (now - questionsHealthCache.lastChecked) < CACHE_DURATION) {
    return questionsHealthCache.isHealthy && questionsHealthCache.questionsCount > 0
  }

  try {
    // 빠른 체크: 활성 질문 수만 확인
    const activeCount = await prisma.question.count({ 
      where: { isActive: true } 
    })

    const isHealthy = activeCount >= 10
    
    // 캐시 업데이트
    questionsHealthCache = {
      lastChecked: now,
      isHealthy,
      questionsCount: activeCount
    }

    console.log('⚡ Quick Questions 체크:', {
      activeCount,
      isHealthy,
      cached: false
    })

    return isHealthy

  } catch (error) {
    console.error('❌ Quick Questions 체크 실패:', error)
    return false
  }
}

/**
 * Questions 복구 통계 및 모니터링
 */
export interface QuestionsRecoveryStats {
  totalRecoveries: number
  lastRecoveryAt: Date | null
  averageQuestionsCreatedPerRecovery: number
  mostFrequentCategories: string[]
  success_rate: number
}

// 복구 통계를 위한 간단한 메모리 저장소 (운영 환경에서는 DB나 Redis 사용 권장)
let recoveryStats: {
  recoveries: QuestionsRecoveryResult[]
} = {
  recoveries: []
}

export function addRecoveryToStats(result: QuestionsRecoveryResult): void {
  recoveryStats.recoveries.push(result)
  
  // 최근 100개만 유지 (메모리 절약)
  if (recoveryStats.recoveries.length > 100) {
    recoveryStats.recoveries = recoveryStats.recoveries.slice(-100)
  }
}

export function getQuestionsRecoveryStats(): QuestionsRecoveryStats {
  const recoveries = recoveryStats.recoveries
  const successfulRecoveries = recoveries.filter(r => r.success)
  
  if (recoveries.length === 0) {
    return {
      totalRecoveries: 0,
      lastRecoveryAt: null,
      averageQuestionsCreatedPerRecovery: 0,
      mostFrequentCategories: [],
      success_rate: 0
    }
  }

  // 가장 최근 복구 시간
  const lastRecoveryAt = recoveries.length > 0 
    ? new Date(Math.max(...recoveries.map(r => r.recoveredAt.getTime())))
    : null

  // 평균 생성된 질문 수
  const totalQuestionsCreated = successfulRecoveries.reduce((sum, r) => sum + r.questionsCreated, 0)
  const averageQuestionsCreatedPerRecovery = successfulRecoveries.length > 0
    ? totalQuestionsCreated / successfulRecoveries.length
    : 0

  // 가장 자주 추가된 카테고리
  const categoryFrequency: Record<string, number> = {}
  successfulRecoveries.forEach(recovery => {
    recovery.categoriesAdded.forEach(category => {
      categoryFrequency[category] = (categoryFrequency[category] || 0) + 1
    })
  })

  const mostFrequentCategories = Object.entries(categoryFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category)

  return {
    totalRecoveries: recoveries.length,
    lastRecoveryAt,
    averageQuestionsCreatedPerRecovery,
    mostFrequentCategories,
    success_rate: recoveries.length > 0 ? successfulRecoveries.length / recoveries.length : 0
  }
}