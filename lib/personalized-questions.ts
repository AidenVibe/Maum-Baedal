/**
 * 관심사 기반 질문 개인화 로직
 * 동반자의 관심사 교집합을 기반으로 적절한 질문을 추천
 */

import { prisma } from './prisma'
import { getCommonInterests } from './interests'

export interface PersonalizedQuestionResult {
  question: {
    id: string
    content: string
    category: string
    difficulty: string
  }
  recommendationReason: 'common_interest' | 'user1_interest' | 'user2_interest' | 'random'
  matchedInterests?: string[]
}

/**
 * 동반자에게 개인화된 질문 추천
 */
export async function getPersonalizedQuestion(
  companionId: string,
  excludeQuestionIds: string[] = []
): Promise<PersonalizedQuestionResult | null> {
  try {
    // 1. 동반자 정보 및 관심사 조회
    const companion = await prisma.companion.findUnique({
      where: { id: companionId },
      include: {
        user1: {
          select: { interests: true }
        },
        user2: {
          select: { interests: true }
        }
      }
    })

    if (!companion || !companion.user1 || !companion.user2) {
      console.warn('[PERSONALIZATION] 동반자 또는 사용자 정보를 찾을 수 없음:', companionId)
      return null
    }

    const user1Interests = companion.user1.interests || []
    const user2Interests = companion.user2.interests || []

    // 2. 관심사 교집합 찾기
    const commonInterests = getCommonInterests(user1Interests, user2Interests)

    console.log('[PERSONALIZATION] 관심사 분석:', {
      companionId,
      user1Interests,
      user2Interests,
      commonInterests
    })

    // 3. 우선순위별 질문 추천 시도
    
    // 3-1. 공통 관심사 기반 질문 (최고 우선순위)
    if (commonInterests.length > 0) {
      const commonQuestion = await findQuestionsByCategories(
        commonInterests, 
        excludeQuestionIds
      )
      
      if (commonQuestion) {
        await updateQuestionAnalytics(commonQuestion.id, 'personalized')
        
        return {
          question: commonQuestion,
          recommendationReason: 'common_interest',
          matchedInterests: commonInterests
        }
      }
    }

    // 3-2. 개별 사용자 관심사 기반 질문
    const allUserInterests = Array.from(new Set([...user1Interests, ...user2Interests]))
    
    if (allUserInterests.length > 0) {
      const userQuestion = await findQuestionsByCategories(
        allUserInterests,
        excludeQuestionIds
      )
      
      if (userQuestion) {
        await updateQuestionAnalytics(userQuestion.id, 'personalized')
        
        // 어느 사용자의 관심사인지 판단
        const matchesUser1 = user1Interests.includes(userQuestion.category)
        const matchesUser2 = user2Interests.includes(userQuestion.category)
        
        return {
          question: userQuestion,
          recommendationReason: matchesUser1 && matchesUser2 
            ? 'common_interest' 
            : matchesUser1 
              ? 'user1_interest' 
              : 'user2_interest',
          matchedInterests: [userQuestion.category]
        }
      }
    }

    // 3-3. 랜덤 질문 (폴백)
    const randomQuestion = await findRandomQuestion(excludeQuestionIds)
    
    if (randomQuestion) {
      await updateQuestionAnalytics(randomQuestion.id, 'random')
      
      return {
        question: randomQuestion,
        recommendationReason: 'random'
      }
    }

    return null

  } catch (error) {
    console.error('[PERSONALIZATION] 개인화 질문 추천 실패:', error)
    return null
  }
}

/**
 * 특정 카테고리들에서 질문 검색
 */
async function findQuestionsByCategories(
  categories: string[],
  excludeIds: string[]
): Promise<{id: string, content: string, category: string, difficulty: string} | null> {
  const question = await prisma.question.findFirst({
    where: {
      category: { in: categories },
      isActive: true,
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } })
    },
    orderBy: [
      { totalUsed: 'asc' },      // 사용 빈도 낮은 것 우선
      { totalAnswers: 'desc' }    // 답변률 높은 것 우선 (2차)
    ],
    select: {
      id: true,
      content: true,
      category: true,
      difficulty: true
    }
  })

  return question
}

/**
 * 랜덤 질문 선택 (폴백)
 */
async function findRandomQuestion(
  excludeIds: string[]
): Promise<{id: string, content: string, category: string, difficulty: string} | null> {
  // 전체 활성 질문 수 조회
  const totalCount = await prisma.question.count({
    where: {
      isActive: true,
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } })
    }
  })

  if (totalCount === 0) return null

  // 랜덤 오프셋 계산
  const randomOffset = Math.floor(Math.random() * totalCount)

  const question = await prisma.question.findFirst({
    where: {
      isActive: true,
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } })
    },
    skip: randomOffset,
    select: {
      id: true,
      content: true,
      category: true,
      difficulty: true
    }
  })

  return question
}

/**
 * 질문 분석 데이터 업데이트
 */
async function updateQuestionAnalytics(
  questionId: string, 
  type: 'personalized' | 'random'
): Promise<void> {
  try {
    await prisma.question.update({
      where: { id: questionId },
      data: {
        totalUsed: { increment: 1 }
      }
    })

    // 일일 통계에 반영
    const today = new Date().toISOString().split('T')[0]
    const updateData = type === 'personalized' 
      ? { personalizedQuestions: { increment: 1 } }
      : { randomQuestions: { increment: 1 } }

    await prisma.dailyStat.upsert({
      where: { date: today },
      create: {
        date: today,
        totalCompanions: 0,
        activeAssignments: 0,
        completedGates: 0,
        totalAnswers: 0,
        shareTokensCreated: 0,
        shareTokensUsed: 0,
        newOnboardings: 0,
        personalizedQuestions: type === 'personalized' ? 1 : 0,
        randomQuestions: type === 'random' ? 1 : 0
      },
      update: updateData
    })

  } catch (error) {
    console.error('[PERSONALIZATION] 분석 데이터 업데이트 실패:', error)
  }
}

/**
 * 질문 개인화 통계 조회
 */
export async function getPersonalizationStats(days: number = 7): Promise<{
  totalPersonalized: number
  totalRandom: number
  personalizationRate: number
  topCategories: Array<{ category: string; count: number }>
}> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const stats = await prisma.dailyStat.aggregate({
      where: {
        date: { gte: startDateStr }
      },
      _sum: {
        personalizedQuestions: true,
        randomQuestions: true
      }
    })

    const totalPersonalized = stats._sum.personalizedQuestions || 0
    const totalRandom = stats._sum.randomQuestions || 0
    const total = totalPersonalized + totalRandom
    const personalizationRate = total > 0 ? (totalPersonalized / total) * 100 : 0

    // 카테고리별 사용 통계
    const topCategories = await prisma.question.groupBy({
      by: ['category'],
      _sum: {
        totalUsed: true
      },
      orderBy: {
        _sum: {
          totalUsed: 'desc'
        }
      },
      take: 5
    })

    return {
      totalPersonalized,
      totalRandom,
      personalizationRate: Math.round(personalizationRate * 100) / 100,
      topCategories: topCategories.map(item => ({
        category: item.category,
        count: item._sum.totalUsed || 0
      }))
    }

  } catch (error) {
    console.error('[PERSONALIZATION] 통계 조회 실패:', error)
    return {
      totalPersonalized: 0,
      totalRandom: 0,
      personalizationRate: 0,
      topCategories: []
    }
  }
}