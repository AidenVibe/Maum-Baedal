import { PrismaClient, NotificationType } from '@prisma/client'

const prisma = new PrismaClient()

async function seedNotificationTemplates() {
  console.log('🌱 알림 템플릿 시드 데이터 생성 중...')

  // 기존 템플릿 삭제 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    await prisma.notificationTemplate.deleteMany()
    console.log('기존 알림 템플릿 삭제 완료')
  }

  // 1. 일일 질문 알림 템플릿
  await prisma.notificationTemplate.create({
    data: {
      name: 'DAILY_QUESTION',
      templateId: 'daily_question_001',
      type: NotificationType.DAILY_QUESTION,
      title: '🌅 오늘의 질문이 도착했어요!',
      content: `안녕하세요, {{nickname}}님! 
      
오늘의 질문이 도착했어요 ✨

📝 **오늘의 질문**
"{{question}}"

{{partnerNickname}}님과 함께 따뜻한 대화를 나눠보세요.
{{timeRemaining}}에 마감이에요!

👉 https://dearq.app/today

#마음배달 #가족대화`,
      smsContent: `[마음배달] {{nickname}}님, 오늘의 질문이 도착했어요!

"{{question}}"

{{partnerNickname}}님과 대화해보세요. {{timeRemaining}} 마감
https://dearq.app/today`,
      variables: {
        nickname: '사용자 닉네임',
        question: '오늘의 질문 내용',
        partnerNickname: '동반자 닉네임',
        timeRemaining: '남은 시간'
      },
      isActive: true
    }
  })

  // 2. 답변 리마인드 템플릿
  await prisma.notificationTemplate.create({
    data: {
      name: 'ANSWER_REMINDER',
      templateId: 'answer_reminder_001',
      type: NotificationType.ANSWER_REMINDER,
      title: '⏰ 오늘 질문 마감이 얼마 남지 않았어요',
      content: `{{nickname}}님, 안녕하세요!

아직 오늘 질문에 답변하지 않으셨어요 😊

📝 **오늘의 질문**
"{{question}}"

{{partnerNickname}}님이 기다리고 있어요!
잠깐만 시간을 내어 마음을 나눠주세요 💙

👉 https://dearq.app/today

{{timeRemaining}} 후 마감됩니다.`,
      smsContent: `[마음배달] {{nickname}}님, 오늘 질문 답변을 기다리고 있어요!

"{{question}}"

{{partnerNickname}}님이 기다려요. {{timeRemaining}} 마감
https://dearq.app/today`,
      variables: {
        nickname: '사용자 닉네임',
        question: '오늘의 질문 내용',
        partnerNickname: '동반자 닉네임',
        timeRemaining: '남은 시간'
      },
      isActive: true
    }
  })

  // 3. 게이트 공개 알림 템플릿
  await prisma.notificationTemplate.create({
    data: {
      name: 'GATE_OPENED',
      templateId: 'gate_opened_001',
      type: NotificationType.GATE_OPENED,
      title: '🎉 축하합니다! 대화가 공개되었어요',
      content: `{{nickname}}님, 축하드려요! 🎉

{{partnerNickname}}님과의 오늘 대화가 완성되었습니다 ✨

📝 **완성된 질문**
"{{question}}"

두 분의 진솔한 답변을 지금 확인해보세요!
서로의 마음을 더 깊이 이해할 수 있는 특별한 순간이에요 💝

👉 https://dearq.app/today

#마음배달 #대화완성`,
      smsContent: `[마음배달] 🎉 {{nickname}}님, {{partnerNickname}}님과의 대화가 완성되었어요!

"{{question}}" 답변을 확인해보세요
https://dearq.app/today`,
      variables: {
        nickname: '사용자 닉네임',
        question: '질문 내용',
        partnerNickname: '동반자 닉네임'
      },
      isActive: true
    }
  })

  // 4. 동반자 참여 알림 템플릿
  await prisma.notificationTemplate.create({
    data: {
      name: 'COMPANION_JOINED',
      templateId: 'companion_joined_001',
      type: NotificationType.COMPANION_JOINED,
      title: '👥 새로운 동반자가 참여했어요!',
      content: `{{nickname}}님, 반가운 소식이에요! 🎉

{{partnerNickname}}님이 마음배달에 참여해주셨어요!
이제 함께 따뜻한 가족 대화를 시작할 수 있습니다 ✨

💝 **함께모드 시작**
- 매일 같은 질문으로 대화
- 서로의 답변을 동시에 공개
- 더 깊은 가족의 유대감

첫 번째 질문을 확인해보세요!

👉 https://dearq.app/today

#마음배달 #동반자참여`,
      smsContent: `[마음배달] 🎉 {{partnerNickname}}님이 참여했어요!

이제 {{nickname}}님과 함께 가족 대화를 시작할 수 있어요
https://dearq.app/today`,
      variables: {
        nickname: '사용자 닉네임',
        partnerNickname: '동반자 닉네임'
      },
      isActive: true
    }
  })

  console.log('✅ 알림 템플릿 시드 데이터 생성 완료!')
}

// 메인 시드 함수에서 호출
export { seedNotificationTemplates }

// 직접 실행 시
if (require.main === module) {
  seedNotificationTemplates()
    .then(() => {
      console.log('시드 작업이 완료되었습니다.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('시드 작업 중 오류가 발생했습니다:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}