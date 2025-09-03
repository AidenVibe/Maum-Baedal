/**
 * 마음배달 v2 시드 데이터  
 * Questions.txt 기반 실제 질문 데이터 + 새로운 온보딩 시스템 테스트 데이터
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { seedNotificationTemplates } from './seed-notifications'

const prisma = new PrismaClient()

// Questions.txt에서 실제 질문 데이터 로드
function loadQuestionsFromFile(): Array<{content: string, category: string, difficulty: string}> {
  try {
    const questionsPath = join(process.cwd(), 'Questions.txt')
    const questionsData = JSON.parse(readFileSync(questionsPath, 'utf-8'))
    
    const questions: Array<{content: string, category: string, difficulty: string}> = []
    
    // 카테고리명 매핑 (Questions.txt → DB category)
    const categoryMapping: Record<string, string> = {
      '일상·하루': 'daily',
      '추억·과거': 'memories', 
      '가족·관계': 'family',
      '감사·행복': 'gratitude',
      '취향·취미': 'hobbies',
      '음식·요리': 'food',
      '배움·호기심': 'learning',
      '계절·날씨·장소': 'seasons',
      '미래·꿈·계획': 'future',
      '위로·응원·자기돌봄': 'comfort'
    }
    
    for (const categoryData of questionsData.categories) {
      const dbCategory = categoryMapping[categoryData.category] || 'general'
      
      for (const questionText of categoryData.questions) {
        questions.push({
          content: questionText,
          category: dbCategory,
          difficulty: 'easy' // 기본값, 추후 분석으로 조정 가능
        })
      }
    }
    
    console.log(`📋 Questions.txt에서 ${questions.length}개 질문 로드 완료`)
    return questions
    
  } catch (error) {
    console.warn('⚠️  Questions.txt 로드 실패, 샘플 질문 사용:', error)
    
    // 백업용 샘플 질문들
    return [
      {
        content: "오늘 하루 중 가장 감사했던 순간은 언제였나요?",
        category: "daily",
        difficulty: "easy"
      },
      {
        content: "어릴 때 가장 기억에 남는 가족 여행지는 어디인가요?",
        category: "memories",
        difficulty: "easy"
      },
      {
        content: "가족과 함께 해보고 싶은 새로운 활동이 있다면 무엇인가요?",
        category: "family",
        difficulty: "easy"
      },
      {
        content: "최근에 가장 행복했던 일은 무엇인가요?",
        category: "gratitude",
        difficulty: "easy"
      },
      {
        content: "요즘 새로 시작한 취미나 관심사가 있나요?",
        category: "hobbies",
        difficulty: "easy"
      }
    ]
  }
}

// 테스트 사용자 데이터 (새로운 온보딩 시스템 기반)
const testUsers = [
  {
    id: 'test-user-1',
    name: '김엄마',
    nickname: '엄마',
    bio: '육아맘이자 직장인, 가족과의 소소한 일상을 소중히 여깁니다',
    interests: ['family', 'daily', 'gratitude'], // 가족·관계, 일상·하루, 감사·행복
    onboardedAt: new Date(),
    email: 'mom@example.com',
    kakaoSub: 'kakao_test_1'
  },
  {
    id: 'test-user-2',
    name: '김아들', 
    nickname: '아들',
    bio: '대학생, 새로운 것을 배우는 걸 좋아해요',
    interests: ['family', 'learning', 'hobbies'], // 가족·관계, 배움·호기심, 취향·취미
    onboardedAt: new Date(),
    email: 'son@example.com',
    kakaoSub: 'kakao_test_2'
  },
  {
    id: 'test-user-3',
    name: '김딸',
    nickname: '딸',
    bio: '고등학생, 요리와 음악을 좋아합니다',
    interests: ['food', 'hobbies', 'future'], // 음식·요리, 취향·취미, 미래·꿈·계획  
    onboardedAt: new Date(),
    email: 'daughter@example.com',
    kakaoSub: 'kakao_test_3'
  }
]

async function main() {
  console.log('🌱 마음배달 v2 시드 데이터 생성을 시작합니다...')

  // 기존 데이터 정리 (개발용)
  console.log('📝 기존 데이터 정리 중...')
  await prisma.conversation.deleteMany()
  await prisma.answer.deleteMany() 
  await prisma.assignment.deleteMany()
  await prisma.shareToken.deleteMany()  // 새로 추가
  await prisma.companion.deleteMany()
  await prisma.question.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Questions.txt에서 실제 질문 데이터 로드 및 생성
  console.log('❓ Questions.txt에서 질문 데이터 로드 중...')
  const questions = loadQuestionsFromFile()
  
  console.log('📊 질문 데이터 일괄 생성 중...')
  await prisma.question.createMany({
    data: questions
  })

  // 테스트 사용자 생성
  console.log('👥 온보딩 완료된 테스트 사용자 생성 중...')
  const users = []
  for (const userData of testUsers) {
    const user = await prisma.user.create({
      data: userData
    })
    users.push(user)
  }

  // 테스트 페어 생성 (user1-user2)
  console.log('💏 테스트 동반자 생성 중...')
  const testCompanion = await prisma.companion.create({
    data: {
      user1Id: users[0].id, // 엄마
      user2Id: users[1].id, // 아들  
      status: 'active',
      connectedAt: new Date()
    }
  })

  // 테스트 공유 토큰 생성 (user3용 - 연결 안됨)
  console.log('🔗 테스트 공유 토큰 생성 중...')
  await prisma.shareToken.create({
    data: {
      token: 'test-token-123456789abcdef',
      creatorId: users[2].id, // 딸
      message: '안녕하세요! 딸이에요. 마음배달 함께 해요 💕',
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후
    }
  })

  // 테스트 대화 생성 (History 페이지 테스트용)
  console.log('💬 테스트 대화 데이터 생성 중...')
  const testQuestions = await prisma.question.findMany({
    take: 7  // 7개 대화 생성
  })

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i]
    const daysAgo = i + 1  // 1일전부터 7일전까지
    const serviceDay = new Date()
    serviceDay.setDate(serviceDay.getDate() - daysAgo)
    const serviceDayStr = serviceDay.toISOString().split('T')[0]

    // Assignment 생성
    const assignment = await prisma.assignment.create({
      data: {
        companionId: testCompanion.id,
        serviceDay: serviceDayStr,
        questionId: question.id,
        status: 'completed'
      }
    })

    // 엄마 답변
    await prisma.answer.create({
      data: {
        assignmentId: assignment.id,
        userId: users[0].id,  // 엄마
        content: `${daysAgo}일 전 엄마의 답변입니다. ${question.content}에 대한 진솔한 이야기를 나눠보았어요.`
      }
    })

    // 아들 답변
    await prisma.answer.create({
      data: {
        assignmentId: assignment.id,
        userId: users[1].id,  // 아들
        content: `${daysAgo}일 전 아들의 답변입니다. 엄마와 이런 대화를 나눌 수 있어서 정말 좋았어요.`
      }
    })

    // Conversation 생성 (게이트 공개)
    await prisma.conversation.create({
      data: {
        assignmentId: assignment.id,
        isPublic: true
      }
    })
  }

  // 통계 초기화 (새로운 필드 포함)
  console.log('📊 일일 통계 초기화...')
  const today = new Date().toISOString().split('T')[0]
  await prisma.dailyStat.upsert({
    where: { date: today },
    create: {
      date: today,
      totalCompanions: 1,
      activeAssignments: 0,
      completedGates: testQuestions.length,  // 완료된 게이트 수 업데이트
      totalAnswers: testQuestions.length * 2,  // 총 답변 수
      shareTokensCreated: 1,
      shareTokensUsed: 0,
      newOnboardings: 3,
      personalizedQuestions: 0,
      randomQuestions: testQuestions.length
    },
    update: {
      totalCompanions: 1,
      shareTokensCreated: 1,
      newOnboardings: 3,
      completedGates: testQuestions.length,
      totalAnswers: testQuestions.length * 2,
      randomQuestions: testQuestions.length
    }
  })

  // 알림 템플릿 생성
  console.log('📱 알림 템플릿 생성 중...')
  await seedNotificationTemplates()

  console.log('✅ 시드 데이터 생성 완료!')
  console.log(`   - 질문: ${questions.length}개 (Categories: daily, memories, family, gratitude, hobbies, food, learning, seasons, future, comfort)`)
  console.log(`   - 사용자: ${testUsers.length}명 (모두 온보딩 완료)`)
  console.log(`   - 동반자: 1개 (엄마 ↔ 아들)`)
  console.log(`   - 완료된 대화: ${testQuestions.length}개 (History 페이지 테스트용)`)
  console.log(`   - 공유토큰: 1개 (딸이 생성, 미사용)`)
  console.log(`   - 알림 템플릿: 4개 (일일질문, 리마인드, 게이트공개, 동반자참여)`)
  console.log('')
  console.log('🧪 테스트 시나리오:')
  console.log('   1. 연결된 동반자: 엄마(family,daily,gratitude) ↔ 아들(family,learning,hobbies)')
  console.log('   2. 완료된 대화 7개로 History 페이지 테스트 가능')
  console.log('   3. 공통 관심사: family → 가족 관련 질문 우선 출제')
  console.log('   4. 미연결 사용자: 딸(food,hobbies,future) → 초대링크: /join/test-token-123456789abcdef')
  console.log('')
  console.log('🔍 테스트 URL:')
  console.log('   - 개발자 로그인: http://localhost:3000/dev/login (⭐ 추천)')
  console.log('   - 초대링크 테스트: http://localhost:3000/join/test-token-123456789abcdef')
  console.log('   - 온보딩 테스트: http://localhost:3000/onboarding')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })