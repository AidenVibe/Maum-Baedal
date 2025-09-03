/**
 * POST /api/dev/questions-reset - Questions 테이블 초기화 API (개발/테스트용)
 * 
 * 주의: 이 API는 모든 질문 데이터를 삭제합니다!
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

    console.log('🚨 Questions 테이블 초기화 API 호출됨 - 위험한 작업!')
    
    // 현재 상태 기록
    const beforeCount = await prisma.question.count()
    console.log(`📊 초기화 전 Questions 수: ${beforeCount}`)
    
    // Assignment 테이블 참조 상태 확인 (삭제 전)
    const assignmentsWithQuestions = await prisma.assignment.count()
    console.log(`📊 Questions를 참조하는 Assignments: ${assignmentsWithQuestions}`)
    
    // 모든 Questions 삭제 (외래키 제약으로 인한 오류 발생 가능성 있음)
    const result = await prisma.question.deleteMany({})
    
    console.log('✅ Questions 테이블 초기화 완료:', {
      beforeCount,
      deletedCount: result.count,
      assignmentsAffected: assignmentsWithQuestions
    })
    
    return NextResponse.json({
      success: true,
      message: 'Questions 테이블이 성공적으로 초기화되었습니다.',
      data: {
        questionsDeleted: result.count,
        previousCount: beforeCount,
        assignmentsWithQuestions: assignmentsWithQuestions
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Questions Reset API 오류:', error)
    
    // 외래키 제약 오류인 경우 특별 처리
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Questions 테이블을 삭제할 수 없습니다. Assignment 테이블에서 참조하고 있는 질문이 있습니다.',
          hint: '먼저 Assignment 테이블을 정리하거나 cascade 삭제를 사용하세요.',
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      )
    }
    
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