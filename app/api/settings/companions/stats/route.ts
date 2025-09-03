import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: 동반자 통계 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 사용자의 모든 동반자 관계 조회
    const companions = await prisma.companion.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ],
        status: { not: 'deleted' }
      },
      include: {
        user1: {
          select: { id: true, nickname: true, label: true }
        },
        user2: {
          select: { id: true, nickname: true, label: true }
        },
        assignments: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            conversation: {
              select: { id: true, createdAt: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    const activeCompanions = companions.filter(c => c.status === 'active')
    const totalCompanions = companions.length

    // 전체 대화 통계
    let totalConversations = 0
    let completedConversations = 0

    // 동반자별 통계
    const companionStats = companions.map(companion => {
      const isUser1 = companion.user1Id === session.user.id
      const partner = isUser1 ? companion.user2 : companion.user1
      
      const assignmentCount = companion.assignments.length
      const completedCount = companion.assignments.filter(a => a.conversation !== null).length
      
      totalConversations += assignmentCount
      completedConversations += completedCount

      return {
        id: companion.id,
        nickname: partner?.nickname || '알 수 없음',
        label: partner?.label,
        completedConversations: completedCount,
        totalConversations: assignmentCount,
        completionRate: assignmentCount > 0 ? Math.round((completedCount / assignmentCount) * 100) : 0
      }
    })

    // 주간 통계 계산 (지난 7일, 그 이전 7일)
    const now = new Date()
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    let thisWeekConversations = 0
    let lastWeekConversations = 0

    companions.forEach(companion => {
      companion.assignments.forEach(assignment => {
        if (assignment.conversation) {
          const conversationDate = new Date(assignment.conversation.createdAt)
          if (conversationDate >= thisWeekStart) {
            thisWeekConversations++
          } else if (conversationDate >= lastWeekStart) {
            lastWeekConversations++
          }
        }
      })
    })

    // 월별 트렌드 (최근 3개월)
    const monthlyTrend = []
    for (let i = 2; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long' 
      })
      
      let monthConversations = 0
      let monthCompletions = 0
      
      companions.forEach(companion => {
        companion.assignments.forEach(assignment => {
          const assignmentDate = new Date(assignment.createdAt)
          if (assignmentDate.getMonth() === date.getMonth() && 
              assignmentDate.getFullYear() === date.getFullYear()) {
            monthConversations++
            if (assignment.conversation) {
              monthCompletions++
            }
          }
        })
      })
      
      monthlyTrend.push({
        month: monthKey,
        conversations: monthConversations,
        completions: monthCompletions
      })
    }

    // 가장 활발한 동반자 순으로 정렬
    const topCompanions = companionStats
      .filter(c => c.totalConversations > 0)
      .sort((a, b) => {
        // 완료율 우선, 그 다음 완료 대화 수
        if (b.completionRate !== a.completionRate) {
          return b.completionRate - a.completionRate
        }
        return b.completedConversations - a.completedConversations
      })

    const stats = {
      totalCompanions,
      activeCompanions: activeCompanions.length,
      totalConversations,
      completedConversations,
      weeklyStats: {
        thisWeek: thisWeekConversations,
        lastWeek: lastWeekConversations
      },
      topCompanions,
      monthlyTrend
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('통계 데이터 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}