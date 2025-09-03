/**
 * GET /api/dev/questions-health - Questions 테이블 건강 상태 확인 API (개발용)
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkQuestionsHealth } from '@/lib/questions-recovery'

export async function GET(request: NextRequest) {
  try {
    // 개발 환경에서만 접근 허용
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '이 API는 개발 환경에서만 사용할 수 있습니다.' },
        { status: 403 }
      )
    }

    console.log('🔍 Questions Health Check API 호출됨')
    
    const healthCheck = await checkQuestionsHealth()
    
    console.log('📊 Questions 건강 상태:', healthCheck)
    
    return NextResponse.json({
      success: true,
      data: healthCheck,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Questions Health Check API 오류:', error)
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