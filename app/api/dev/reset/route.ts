/**
 * POST /api/dev/reset - 개발 환경 전용 데이터 초기화 API
 * 
 * 기능:
 * - 개발 환경에서만 동작
 * - 테스트 데이터 완전 초기화
 * - 기본 질문 데이터 시딩
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // 프로덕션에서는 차단
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '이 API는 개발 환경에서만 사용할 수 있습니다.' },
      { status: 403 }
    )
  }

  try {
    // 트랜잭션으로 전체 데이터 초기화
    await prisma.$transaction(async (tx) => {
      console.log('🔄 개발 데이터 초기화 시작...')
      
      // 1. 관련 테이블 순서대로 삭제
      await tx.conversation.deleteMany()
      await tx.answer.deleteMany()
      await tx.assignment.deleteMany()
      await tx.companion.deleteMany()
      
      // 2. dev- 사용자만 삭제 (실제 OAuth 사용자는 보존)
      await tx.account.deleteMany({
        where: {
          user: {
            email: {
              startsWith: 'dev-'
            }
          }
        }
      })
      
      await tx.session.deleteMany({
        where: {
          user: {
            email: {
              startsWith: 'dev-'
            }
          }
        }
      })
      
      await tx.user.deleteMany({
        where: {
          email: {
            startsWith: 'dev-'
          }
        }
      })
      
      // 3. 질문 데이터 초기화 및 시딩
      await tx.question.deleteMany()
      
      const questions = [
        {
          content: '오늘 가장 기억에 남는 순간은 무엇인가요?',
          category: 'daily',
          difficulty: 'easy'
        },
        {
          content: '어린 시절 가장 소중했던 추억 하나를 들려주세요.',
          category: 'memory',
          difficulty: 'medium'
        },
        {
          content: '만약 하루 동안 시간을 멈출 수 있다면 무엇을 하고 싶나요?',
          category: 'imagination',
          difficulty: 'easy'
        },
        {
          content: '가족 중에서 가장 닮고 싶은 사람과 그 이유는?',
          category: 'family',
          difficulty: 'medium'
        },
        {
          content: '최근에 새롭게 도전해보고 싶은 것이 있나요?',
          category: 'growth',
          difficulty: 'easy'
        },
        {
          content: '스트레스를 받을 때 나만의 해소법은?',
          category: 'emotion',
          difficulty: 'easy'
        },
        {
          content: '10년 후의 나에게 편지를 쓴다면 어떤 내용일까요?',
          category: 'future',
          difficulty: 'hard'
        },
        {
          content: '요즘 자주 듣는 음악이나 즐겨 보는 콘텐츠가 있나요?',
          category: 'hobby',
          difficulty: 'easy'
        },
        {
          content: '감사한 마음이 든 최근의 경험을 나눠주세요.',
          category: 'gratitude',
          difficulty: 'medium'
        },
        {
          content: '혹시 요즘 고민이 있다면 어떤 것인지 들려주세요.',
          category: 'concern',
          difficulty: 'medium'
        }
      ]
      
      for (const question of questions) {
        await tx.question.create({
          data: question
        })
      }
      
      console.log(`✅ ${questions.length}개 기본 질문 생성 완료`)
      
      // 4. 통계 테이블 초기화
      await tx.dailyStat.deleteMany()
      
      console.log('✅ 개발 데이터 초기화 완료')
    })
    
    return NextResponse.json({
      success: true,
      message: '개발 데이터가 성공적으로 초기화되었습니다.',
      resetItems: [
        '개발 사용자 데이터',
        '동반자 연결 데이터',
        '질문/답변 데이터',
        '대화 기록',
        '기본 질문 10개 재생성'
      ]
    })
    
  } catch (error) {
    console.error('개발 데이터 초기화 오류:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : '데이터 초기화 중 오류가 발생했습니다.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}