/**
 * POST /api/dev/questions-force-reset - Questions 테이블 강제 초기화 API (개발/테스트용)
 * 
 * 주의: 관련된 Assignment, Answer, Conversation도 함께 삭제됩니다!
 * 자동 복구 테스트를 위한 용도로만 사용하세요.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 개발 환경에서만 접근 허용
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '이 API는 개발 환경에서만 사용할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 추가 보안: 관리자 시크릿 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    console.log('🚨 Questions 강제 초기화 API 호출됨 - 매우 위험한 작업!')
    
    // 현재 상태 기록
    const [questionsBefore, assignmentsBefore, answersBefore, conversationsBefore] = await Promise.all([
      prisma.question.count(),
      prisma.assignment.count(),
      prisma.answer.count(),
      prisma.conversation.count()
    ])
    
    console.log('📊 초기화 전 상태:', {
      questions: questionsBefore,
      assignments: assignmentsBefore,
      answers: answersBefore,
      conversations: conversationsBefore
    })
    
    // 트랜잭션으로 안전하게 cascade 삭제
    const result = await prisma.$transaction(async (tx) => {
      // 1. Conversations 삭제 (Assignment 참조)
      const deletedConversations = await tx.conversation.deleteMany({})
      console.log(`✅ Conversations 삭제: ${deletedConversations.count}`)
      
      // 2. Answers 삭제 (Assignment 참조)
      const deletedAnswers = await tx.answer.deleteMany({})
      console.log(`✅ Answers 삭제: ${deletedAnswers.count}`)
      
      // 3. AssignmentShares 삭제 (Assignment 참조)
      const deletedShares = await tx.assignmentShare.deleteMany({})
      console.log(`✅ AssignmentShares 삭제: ${deletedShares.count}`)
      
      // 4. Assignments 삭제 (Question 참조)
      const deletedAssignments = await tx.assignment.deleteMany({})
      console.log(`✅ Assignments 삭제: ${deletedAssignments.count}`)
      
      // 5. 마지막으로 Questions 삭제
      const deletedQuestions = await tx.question.deleteMany({})
      console.log(`✅ Questions 삭제: ${deletedQuestions.count}`)
      
      return {
        questions: deletedQuestions.count,
        assignments: deletedAssignments.count,
        answers: deletedAnswers.count,
        conversations: deletedConversations.count,
        shares: deletedShares.count
      }
    })
    
    console.log('✅ Questions 강제 초기화 완료:', {
      deletedCounts: result,
      beforeCounts: {
        questions: questionsBefore,
        assignments: assignmentsBefore,
        answers: answersBefore,
        conversations: conversationsBefore
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Questions 테이블과 관련 데이터가 성공적으로 초기화되었습니다.',
      data: {
        deleted: result,
        before: {
          questions: questionsBefore,
          assignments: assignmentsBefore,
          answers: answersBefore,
          conversations: conversationsBefore
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Questions Force Reset API 오류:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}