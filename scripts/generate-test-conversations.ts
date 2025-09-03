/**
 * History 페이지 테스트용 완료된 대화 데이터 생성 스크립트
 * 마음배달 v2 - 실제 의미있는 한국어 대화 시뮬레이션
 */

import { PrismaClient } from '@prisma/client'
import { getServiceDayAt } from '../lib/service-day'

const prisma = new PrismaClient()

// 테스트 대화 시나리오 (최근 7일간의 대화)
const conversationScenarios = [
  {
    daysAgo: 1, // 어제
    question: "오늘 하루 중 가장 감사했던 순간은 언제였나요?",
    answers: {
      mom: "아들이 설거지를 도와준 순간이었어요. 작은 도움이지만 정말 고마웠답니다 💕",
      son: "엄마가 좋아하는 과자를 사오신 걸 보고 미안하면서도 고마웠어요. 늘 신경써주셔서 감사해요"
    }
  },
  {
    daysAgo: 2, // 그저께
    question: "어릴 때 가장 기억에 남는 가족 여행지는 어디인가요?",
    answers: {
      mom: "제주도 성산일출봉에서 본 일출이요. 아들 손 잡고 새벽부터 올라갔던 기억이 아직도 생생해요",
      son: "저도 제주도요! 흑돼지 먹으러 갔는데 엄마가 맵다고 우유 달라고 하신 게 아직도 웃겨요 ㅋㅋ"
    }
  },
  {
    daysAgo: 3,
    question: "가족과 함께 해보고 싶은 새로운 활동이 있다면 무엇인가요?",
    answers: {
      mom: "같이 요리 클래스 들어보고 싶어요. 아들이 해주는 음식도 먹어보고 싶고요",
      son: "보드게임 카페 가보고 싶어요. 엄마랑 게임하면 재밌을 것 같아요. 지면 안 삐질 거예요!"
    }
  },
  {
    daysAgo: 4,
    question: "최근에 가장 행복했던 일은 무엇인가요?",
    answers: {
      mom: "아들이 대학에서 상을 받았다고 연락왔을 때요. 정말 자랑스럽고 뿌듯했어요",
      son: "시험 잘 봤다고 했을 때 엄마가 진짜 기뻐하시는 모습 보고 나도 행복했어요. 더 열심히 해야겠어요"
    }
  },
  {
    daysAgo: 5,
    question: "요즘 새로 시작한 취미나 관심사가 있나요?",
    answers: {
      mom: "유튜브 보면서 플랜트테라피 시작했어요. 화분 키우니까 마음이 평온해져요",
      son: "기타 배우고 있어요! 나중에 엄마한테 연주해드리고 싶어서요. 아직 어려워요 ㅠㅠ"
    }
  },
  {
    daysAgo: 6,
    question: "어떤 음식을 먹을 때 가장 행복하신가요?",
    answers: {
      mom: "아들이랑 같이 라면 끓여 먹을 때요. 단순한 음식도 함께 먹으면 맛있어져요",
      son: "엄마가 해주시는 김치찌개요. 세상에서 제일 맛있어요. 밖에서 먹는 건 비교가 안 돼요"
    }
  },
  {
    daysAgo: 7, // 일주일 전
    question: "가장 소중하게 간직하고 있는 추억이 있다면?",
    answers: {
      mom: "아들이 처음 '엄마'라고 불렀을 때요. 지금도 그 목소리가 귀에 생생해요",
      son: "초등학교 때 아파서 학교 못 갔는데 엄마가 하루 종일 옆에서 돌봐주셨던 기억이요. 따뜻했어요"
    }
  }
]

async function main() {
  console.log('🎭 History 테스트용 완료된 대화 데이터 생성 시작...')

  // 기존 테스트 사용자 및 쌍 조회
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { nickname: '엄마' },
        { nickname: '아들' }
      ]
    }
  })

  if (testUsers.length < 2) {
    console.log('❌ 테스트 사용자가 없습니다. 먼저 `npm run db:seed`를 실행해주세요.')
    return
  }

  const momUser = testUsers.find(u => u.nickname === '엄마')
  const sonUser = testUsers.find(u => u.nickname === '아들')

  if (!momUser || !sonUser) {
    console.log('❌ 엄마 또는 아들 사용자를 찾을 수 없습니다.')
    return
  }

  const testCompanion = await prisma.companion.findFirst({
    where: {
      OR: [
        { user1Id: momUser.id, user2Id: sonUser.id },
        { user1Id: sonUser.id, user2Id: momUser.id }
      ]
    }
  })

  if (!testCompanion) {
    console.log('❌ 테스트 동반자를 찾을 수 없습니다.')
    return
  }

  // 기존 테스트 대화 데이터 정리
  console.log('🧹 기존 테스트 대화 데이터 정리 중...')
  const existingAssignments = await prisma.assignment.findMany({
    where: { companionId: testCompanion.id }
  })

  for (const assignment of existingAssignments) {
    await prisma.conversation.deleteMany({
      where: { assignmentId: assignment.id }
    })
    await prisma.answer.deleteMany({
      where: { assignmentId: assignment.id }
    })
    await prisma.assignment.delete({
      where: { id: assignment.id }
    })
  }

  // 대화 시나리오별로 완료된 대화 생성
  let createdConversations = 0

  for (const scenario of conversationScenarios) {
    try {
      // 해당 날짜의 serviceDay 계산
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - scenario.daysAgo)
      const serviceDay = getServiceDayAt(targetDate)

      // 랜덤 질문 선택 (시나리오 질문이나 DB에서 유사한 질문)
      const questions = await prisma.question.findMany({
        where: {
          OR: [
            { content: { contains: '감사' } },
            { content: { contains: '기억' } },
            { content: { contains: '가족' } },
            { content: { contains: '행복' } },
            { content: { contains: '취미' } },
            { content: { contains: '음식' } },
            { content: { contains: '추억' } }
          ]
        },
        take: 10
      })

      const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
      if (!randomQuestion) {
        console.log(`⚠️ 적절한 질문을 찾을 수 없어서 ${scenario.daysAgo}일 전 대화를 건너뛰었습니다.`)
        continue
      }

      // 트랜잭션으로 완료된 대화 생성
      await prisma.$transaction(async (tx) => {
        // 1. Assignment 생성
        const assignment = await tx.assignment.create({
          data: {
            companionId: testCompanion.id,
            serviceDay: serviceDay,
            questionId: randomQuestion.id,
            status: 'completed',
          }
        })

        // 2. 엄마 답변 생성 (과거 날짜로 생성)
        const momAnswer = await tx.answer.create({
          data: {
            assignmentId: assignment.id,
            userId: momUser.id,
            content: scenario.answers.mom,
            createdAt: new Date(targetDate.getTime() + 10 * 60 * 60 * 1000), // 오전 10시
            updatedAt: new Date(targetDate.getTime() + 10 * 60 * 60 * 1000)
          }
        })

        // 3. 아들 답변 생성 (엄마보다 조금 늦게)
        const sonAnswer = await tx.answer.create({
          data: {
            assignmentId: assignment.id,
            userId: sonUser.id,
            content: scenario.answers.son,
            createdAt: new Date(targetDate.getTime() + 20 * 60 * 60 * 1000), // 오후 8시
            updatedAt: new Date(targetDate.getTime() + 20 * 60 * 60 * 1000)
          }
        })

        // 4. Conversation 생성 (게이트 공개)
        const conversation = await tx.conversation.create({
          data: {
            assignmentId: assignment.id,
            isPublic: true,
            createdAt: new Date(targetDate.getTime() + 20 * 60 * 60 * 1000 + 1000) // 아들 답변 직후
          }
        })

        createdConversations++
        console.log(`✅ ${serviceDay} 대화 생성 완료: "${randomQuestion.content.substring(0, 30)}..."`)
      })

    } catch (error) {
      console.error(`❌ ${scenario.daysAgo}일 전 대화 생성 실패:`, error)
    }
  }

  // 통계 업데이트
  console.log('📊 통계 업데이트 중...')
  const today = new Date().toISOString().split('T')[0]
  await prisma.dailyStat.upsert({
    where: { date: today },
    create: {
      date: today,
      totalCompanions: 1,
      activeAssignments: 0,
      completedGates: createdConversations,
      totalAnswers: createdConversations * 2,
      shareTokensCreated: 0,
      shareTokensUsed: 0,
      newOnboardings: 0,
      personalizedQuestions: 0,
      randomQuestions: createdConversations
    },
    update: {
      completedGates: { increment: createdConversations },
      totalAnswers: { increment: createdConversations * 2 },
      randomQuestions: { increment: createdConversations }
    }
  })

  console.log(`\n🎉 History 테스트 대화 생성 완료!`)
  console.log(`   - 생성된 완료 대화: ${createdConversations}개`)
  console.log(`   - 기간: 최근 ${conversationScenarios.length}일`)
  console.log(`   - 총 답변: ${createdConversations * 2}개`)
  console.log(`\n🔍 테스트 방법:`)
  console.log(`   1. 로그인: http://localhost:3000/login`)
  console.log(`   2. History 페이지: http://localhost:3000/history`)
  console.log(`   3. 개별 대화 확인: 각 카드 클릭`)
  console.log(`\n💡 참고:`)
  console.log(`   - 엄마와 아들의 따뜻한 일상 대화`)
  console.log(`   - 실제 사용 패턴을 반영한 답변 시간`)
  console.log(`   - 다양한 카테고리의 질문과 답변`)
}

main()
  .catch((e) => {
    console.error('❌ 테스트 대화 생성 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })