/**
 * POST /api/dev/questions-recover - Questions 자동 복구 테스트 API (개발용)
 */

import { NextRequest, NextResponse } from 'next/server'
import { ensureQuestionsAvailable, recoverQuestionsTable } from '@/lib/questions-recovery'

export async function POST(request: NextRequest) {
  try {
    // 개발 환경에서만 접근 허용
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '이 API는 개발 환경에서만 사용할 수 있습니다.' },
        { status: 403 }
      )
    }

    console.log('🔧 Questions 자동 복구 테스트 API 호출됨')
    
    const startTime = Date.now()
    
    // ensureQuestionsAvailable() 함수 직접 테스트
    const result = await ensureQuestionsAvailable()
    
    const duration = Date.now() - startTime
    
    console.log('📊 자동 복구 테스트 결과:', {
      ...result,
      duration: `${duration}ms`
    })
    
    return NextResponse.json({
      success: true,
      message: '자동 복구 테스트 완료',
      data: {
        ...result,
        performanceMs: duration
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Questions Recover API 오류:', error)
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

/**
 * GET /api/dev/questions-recover - Questions 복구 통계 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 개발 환경에서만 접근 허용
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '이 API는 개발 환경에서만 사용할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 단순히 복구 함수만 직접 호출해서 테스트
    const result = await recoverQuestionsTable()
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Questions Recover Stats API 오류:', error)
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