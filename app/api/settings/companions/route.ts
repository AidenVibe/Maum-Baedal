import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isTestMode, getMockCompanions } from '@/lib/test-mode'

// GET: 동반자 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 테스트 모드 확인
    if (isTestMode(request)) {
      console.log('[TEST MODE] 동반자 목록 Mock 데이터 반환')
      const mockCompanions = getMockCompanions()
      return NextResponse.json({
        companions: mockCompanions,
        maxCompanions: 3 // 본인 제외 최대 3명까지 초대 가능
      })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // Phase 2에서 사용자의 모든 동반자 관계 조회
    // 현재는 단일 동반자만 지원하므로 기존 로직 활용
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
            conversation: {
              select: { id: true }
            }
          }
        }
      },
      orderBy: { connectedAt: 'desc' }
    })

    // 동반자 데이터 변환
    const transformedCompanions = companions.map(companion => {
      const isUser1 = companion.user1Id === session.user.id
      const partner = isUser1 ? companion.user2 : companion.user1
      
      const totalConversations = companion.assignments.length
      const completedConversations = companion.assignments.filter(
        a => a.conversation !== null
      ).length

      return {
        id: companion.id,
        nickname: partner?.nickname || '알 수 없음',
        label: partner?.label,
        connectedAt: companion.connectedAt || companion.createdAt,
        isActive: companion.status === 'active',
        isBlocked: companion.status === 'blocked',
        notificationsEnabled: true, // Phase 2에서 구현할 개별 알림 설정
        stats: {
          totalConversations,
          completedConversations,
          lastActivityAt: companion.assignments[0]?.id ? new Date() : null
        }
      }
    })

    return NextResponse.json({
      companions: transformedCompanions,
      maxCompanions: 3 // 본인 제외 최대 3명까지 초대 가능 (총 4명)
    })

  } catch (error) {
    console.error('동반자 목록 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}