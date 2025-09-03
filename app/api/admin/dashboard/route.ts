/**
 * GET /api/admin/dashboard - 관리자 대시보드 통계 API
 * 
 * 일일 운영에 필요한 핵심 지표 제공:
 * - 오늘 활동 현황
 * - 이번 주 트렌드  
 * - 운영 알림
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServiceDay } from '@/lib/service-day'

interface DashboardData {
  today: {
    totalPairs: number
    activeAssignments: number
    answeredCount: number
    completedGates: number
    completionRate: number
  }
  thisWeek: {
    averageCompletionRate: number
    totalQuestionSwaps: number
    newPairsJoined: number
  }
  alerts: Array<{
    type: 'info' | 'warning' | 'error'
    message: string
    action?: string
  }>
}

export async function GET(request: NextRequest) {
  try {
    // 🛡️ CRITICAL: 관리자 인증 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      console.log('🚨 Unauthorized admin dashboard access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const serviceDay = getServiceDay()
    console.log('📊 Dashboard data request for service day:', serviceDay)

    // 1. 오늘 현황 조회
    const todayStats = await getTodayStats(serviceDay)
    
    // 2. 이번 주 트렌드 조회
    const weekStats = await getWeekStats()
    
    // 3. 운영 알림 생성
    const alerts = generateAlerts(todayStats)

    const dashboardData: DashboardData = {
      today: todayStats,
      thisWeek: weekStats,
      alerts
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: '대시보드 데이터를 가져올 수 없습니다.' },
      { status: 500 }
    )
  }
}

// 오늘 통계 조회
async function getTodayStats(serviceDay: string) {
  // 전체 활성 동반자 수
  const totalPairs = await prisma.companion.count({
    where: { status: 'active' }
  })

  // 오늘의 활성 Assignment 수
  const activeAssignments = await prisma.assignment.count({
    where: {
      serviceDay,
      status: 'active'
    }
  })

  // 답변이 시작된 Assignment 수 (1개 이상 답변)
  const assignmentsWithAnswers = await prisma.assignment.findMany({
    where: {
      serviceDay,
      status: 'active',
      answers: {
        some: {}
      }
    },
    include: {
      answers: true
    }
  })

  const answeredCount = assignmentsWithAnswers.length

  // 완료된 게이트 수 (2개 답변 완료)
  const completedGates = assignmentsWithAnswers.filter(
    assignment => assignment.answers.length === 2
  ).length

  // 완료율 계산
  const completionRate = activeAssignments > 0 
    ? Math.round((completedGates / activeAssignments) * 100)
    : 0

  return {
    totalPairs,
    activeAssignments,
    answeredCount,
    completedGates,
    completionRate
  }
}

// 이번 주 트렌드 조회
async function getWeekStats() {
  // 지난 7일간의 데이터
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  // 지난 7일간 신규 가입한 Pair 수
  const newPairsJoined = await prisma.companion.count({
    where: {
      status: 'active',
      createdAt: {
        gte: weekAgo
      }
    }
  })

  // 지난 7일간 질문 교체 수 (현재는 제거된 기능이므로 0)
  const totalQuestionSwaps = 0

  // 지난 7일간 평균 완료율 계산
  // 간단히 현재 완료율로 대체 (추후 일별 통계 테이블 추가 시 개선)
  const averageCompletionRate = 0 // TODO: 일별 통계 구현 후 계산

  return {
    averageCompletionRate,
    totalQuestionSwaps,
    newPairsJoined
  }
}

// 운영 알림 생성
function generateAlerts(todayStats: {
  activeAssignments: number
  answeredCount: number
  completionRate: number
}) {
  const alerts: Array<{
    type: 'info' | 'warning' | 'error'
    message: string
    action?: string
  }> = []

  // 1. 활성 Assignment가 없는 경우
  if (todayStats.activeAssignments === 0) {
    alerts.push({
      type: 'warning',
      message: '오늘 활성 과제가 없습니다. 사용자가 접속하면 자동으로 생성됩니다.',
      action: 'monitor'
    })
  }

  // 2. 답변률이 낮은 경우 (50% 미만)
  if (todayStats.activeAssignments > 0) {
    const answerRate = (todayStats.answeredCount / todayStats.activeAssignments) * 100
    if (answerRate < 50) {
      alerts.push({
        type: 'info',
        message: `답변 시작률이 ${Math.round(answerRate)}%입니다. 리마인드 발송을 고려해보세요.`,
        action: 'remind'
      })
    }
  }

  // 3. 완료율이 낮은 경우 (30% 미만)
  if (todayStats.completionRate < 30 && todayStats.activeAssignments > 3) {
    alerts.push({
      type: 'warning',
      message: `게이트 완료율이 ${todayStats.completionRate}%로 낮습니다. 사용자 참여를 독려해보세요.`,
      action: 'engage'
    })
  }

  // 4. 일반 정보
  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      message: '모든 지표가 정상 범위입니다. 좋은 하루 되세요! 🎉',
      action: 'none'
    })
  }

  return alerts
}

// OPTIONS 요청 처리
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}