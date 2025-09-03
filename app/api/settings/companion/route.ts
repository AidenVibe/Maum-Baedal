import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CompanionInfo {
  id: string
  status: string
  connectedAt: string | null
  partner: {
    id: string
    nickname: string
    label?: string
  } | null
  stats: {
    totalConversations: number
    completedConversations: number
  }
}

interface CompanionResponse {
  companion: CompanionInfo | null
  canInvite: boolean // 새로운 가족을 초대할 수 있는지
}

export async function GET(request: NextRequest) {
  try {
    console.log('[SETTINGS/COMPANION] 요청 시작')
    
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('[SETTINGS/COMPANION] 사용자 ID:', userId)

    // 사용자가 속한 활성 동반자 조회
    const userCompanion = await prisma.companion.findFirst({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        status: 'active'
      },
      include: {
        user1: {
          select: { id: true, nickname: true, label: true }
        },
        user2: {
          select: { id: true, nickname: true, label: true }
        },
        assignments: {
          where: { status: 'completed' },
          select: { id: true }
        },
        _count: {
          select: {
            assignments: true // 전체 Assignment 수
          }
        }
      }
    })

    console.log('[SETTINGS/COMPANION] 조회된 동반자:', userCompanion ? {
      id: userCompanion.id,
      status: userCompanion.status,
      user1Id: userCompanion.user1Id,
      user2Id: userCompanion.user2Id,
      totalAssignments: userCompanion._count.assignments,
      completedAssignments: userCompanion.assignments.length
    } : null)

    let companionInfo: CompanionInfo | null = null
    let canInvite = true // 동반자가 없으면 초대 가능

    if (userCompanion) {
      // 파트너 정보 결정
      const isUser1 = userCompanion.user1Id === userId
      const partner = isUser1 ? userCompanion.user2 : userCompanion.user1
      canInvite = false // 이미 동반자가 있으면 초대 불가

      companionInfo = {
        id: userCompanion.id,
        status: userCompanion.status,
        connectedAt: userCompanion.connectedAt?.toISOString() || null,
        partner: partner ? {
          id: partner.id,
          nickname: partner.nickname || '익명',
          label: partner.label || undefined
        } : null,
        stats: {
          totalConversations: userCompanion._count.assignments,
          completedConversations: userCompanion.assignments.length
        }
      }
    }

    const response: CompanionResponse = {
      companion: companionInfo,
      canInvite
    }

    console.log('[SETTINGS/COMPANION] 응답 데이터:', {
      hasCompanion: !!companionInfo,
      canInvite,
      partnerExists: !!companionInfo?.partner,
      totalConversations: companionInfo?.stats.totalConversations || 0,
      completedConversations: companionInfo?.stats.completedConversations || 0
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('[SETTINGS/COMPANION] 서버 오류:', error)
    return NextResponse.json(
      { error: '동반자 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}