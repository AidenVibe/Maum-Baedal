/**
 * GET /api/dev/status - 개발 환경 전용 시스템 상태 조회 API
 * 
 * 기능:
 * - 개발 환경에서만 동작
 * - 현재 데이터베이스 상태 요약
 * - 테스트 시나리오 상태 확인
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // 프로덕션에서는 차단
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '이 API는 개발 환경에서만 사용할 수 있습니다.' },
      { status: 403 }
    )
  }

  try {
    // 병렬로 각종 통계 수집
    const [
      totalUsers,
      devUsers,
      totalPairs,
      activePairs,
      pendingShares,
      todayAssignments,
      totalAnswers,
      totalConversations,
      totalQuestions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          email: {
            startsWith: 'dev-'
          }
        }
      }),
      prisma.companion.count(),
      prisma.companion.count({
        where: { status: 'active' }
      }),
      prisma.companion.count({
        where: { 
          status: 'pending',
          shareMethod: 'kakao_share'
        }
      }),
      prisma.assignment.count({
        where: {
          serviceDay: getServiceDay()
        }
      }),
      prisma.answer.count(),
      prisma.conversation.count(),
      prisma.question.count({
        where: { isActive: true }
      })
    ])

    // 최근 활동 조회
    const recentPairs = await prisma.companion.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user1: {
          select: {
            nickname: true,
            label: true
          }
        },
        user2: {
          select: {
            nickname: true,
            label: true
          }
        }
      }
    })

    const recentAnswers = await prisma.answer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            nickname: true,
            label: true
          }
        },
        assignment: {
          include: {
            question: {
              select: {
                content: true
              }
            }
          }
        }
      }
    })

    // 개발 시나리오 사용자 상태 확인
    const devScenarioUsers = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'dev-first-time@localhost',
            'dev-paired-waiting@localhost', 
            'dev-answered-waiting@localhost',
            'dev-gate-opened@localhost'
          ]
        }
      },
      select: {
        id: true,
        nickname: true,
        email: true,
        label: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      serviceDay: getServiceDay(),
      environment: process.env.NODE_ENV,
      
      // 전체 통계
      statistics: {
        users: {
          total: totalUsers,
          development: devUsers,
          production: totalUsers - devUsers
        },
        pairs: {
          total: totalPairs,
          active: activePairs,
          pending: totalPairs - activePairs,
          pendingShares: pendingShares
        },
        content: {
          questions: totalQuestions,
          todayAssignments: todayAssignments,
          totalAnswers: totalAnswers,
          conversations: totalConversations
        }
      },

      // 최근 활동
      recentActivity: {
        pairs: recentPairs.map(pair => ({
          id: pair.id,
          status: pair.status,
          method: pair.shareMethod || 'invite_code',
          user1: pair.user1?.nickname || '미연결',
          user2: pair.user2?.nickname || '대기중',
          createdAt: pair.createdAt
        })),
        answers: recentAnswers.map(answer => ({
          user: answer.user.nickname,
          label: answer.user.label,
          questionPreview: answer.assignment.question.content.substring(0, 30) + '...',
          answerPreview: answer.content.substring(0, 50) + '...',
          createdAt: answer.createdAt
        }))
      },

      // 개발 시나리오 상태
      developmentScenarios: devScenarioUsers.map(user => ({
        email: user.email,
        nickname: user.nickname,
        label: user.label,
        status: getScenarioStatus(user.email || ''),
        createdAt: user.createdAt
      })),

      message: '개발 환경 상태가 성공적으로 조회되었습니다.'
    })
    
  } catch (error) {
    console.error('개발 상태 조회 오류:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : '상태 조회 중 오류가 발생했습니다.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// 시나리오 상태 매핑 함수
function getScenarioStatus(email: string): string {
  switch (email) {
    case 'dev-first-time@localhost':
      return '온보딩 필요'
    case 'dev-paired-waiting@localhost':
      return '동반자 연결됨, 질문 대기'
    case 'dev-answered-waiting@localhost':
      return '답변 완료, 파트너 대기'
    case 'dev-gate-opened@localhost':
      return '게이트 공개, 대화 가능'
    default:
      return '커스텀 시나리오'
  }
}

// 서비스 데이 계산 (KST 05:00 기준)
function getServiceDay(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  
  // 05시 이전이면 전날로 처리
  if (kst.getHours() < 5) {
    kst.setDate(kst.getDate() - 1)
  }
  
  return kst.toISOString().split('T')[0] // "YYYY-MM-DD"
}