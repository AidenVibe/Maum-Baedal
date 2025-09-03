/**
 * POST /api/dev/clear-questions - 개발용 Questions 테이블 초기화 API
 * 
 * 자동 복구 시스템을 테스트하기 위해 Questions 테이블을 비웁니다.
 * 개발 환경에서만 작동합니다.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 개발 환경에서만 작동
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '개발 환경에서만 사용 가능한 API입니다.' },
        { status: 403 }
      )
    }

    // 관리자 인증 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // Questions 테이블 초기화 전 현재 상태 확인
    const beforeCount = await prisma.question.count()
    
    console.log('🧪 개발용: Questions 테이블 초기화 시작...', {
      questionsToDelete: beforeCount
    })

    // 트랜잭션으로 안전하게 초기화
    await prisma.$transaction(async (tx) => {
      // 관련 테이블들 먼저 정리 (Foreign Key 제약 때문)
      await tx.conversation.deleteMany()
      await tx.answer.deleteMany()
      await tx.assignment.deleteMany()
      
      // Questions 테이블 초기화
      await tx.question.deleteMany()
    })

    const afterCount = await prisma.question.count()

    console.log('🧪 Questions 테이블 초기화 완료:', {
      before: beforeCount,
      after: afterCount,
      deleted: beforeCount - afterCount
    })

    return NextResponse.json({
      success: true,
      questionsDeleted: beforeCount - afterCount,
      message: 'Questions 테이블이 초기화되었습니다. 이제 자동 복구 시스템을 테스트할 수 있습니다.',
      nextStep: 'GET /api/today를 호출하여 자동 복구가 작동하는지 확인하세요.',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Clear questions API error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Questions 테이블 초기화 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}