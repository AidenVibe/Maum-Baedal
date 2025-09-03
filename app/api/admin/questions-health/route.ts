/**
 * GET /api/admin/questions-health - Questions 테이블 건강 상태 확인 API
 * 
 * 관리자용 API로 Questions 테이블 상태와 복구 통계를 조회합니다.
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  checkQuestionsHealth, 
  getQuestionsRecoveryStats,
  ensureQuestionsAvailable
} from '@/lib/questions-recovery'

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const adminSecret = request.headers.get('X-Admin-Secret') || 
                       request.nextUrl.searchParams.get('admin_secret')
    
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // Questions 건강 상태 확인
    const healthCheck = await checkQuestionsHealth()
    
    // 복구 통계 조회
    const recoveryStats = getQuestionsRecoveryStats()
    
    // 자동 복구 테스트 (실제로는 실행하지 않고 시뮬레이션)
    const wouldRecover = !healthCheck.isHealthy

    return NextResponse.json({
      health: healthCheck,
      recoveryStats,
      recommendations: {
        shouldRecover: wouldRecover,
        actions: wouldRecover ? [
          'Questions 테이블 자동 복구가 필요합니다',
          'ensureQuestionsAvailable() 함수를 실행하세요'
        ] : [
          'Questions 테이블이 정상 상태입니다'
        ]
      },
      meta: {
        timestamp: new Date().toISOString(),
        apiVersion: '1.0'
      }
    })

  } catch (error) {
    console.error('Questions health check API error:', error)
    
    return NextResponse.json(
      { 
        error: '건강 상태 확인 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          undefined
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/questions-health - Questions 수동 복구 실행
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 수동 복구 실행
    console.log('🔧 관리자 요청으로 Questions 수동 복구 실행')
    const recoveryResult = await ensureQuestionsAvailable()
    
    return NextResponse.json({
      success: recoveryResult.success,
      recovered: recoveryResult.recovered,
      questionsCount: recoveryResult.questionsCount,
      error: recoveryResult.error,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Questions manual recovery API error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: '수동 복구 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          undefined
      },
      { status: 500 }
    )
  }
}