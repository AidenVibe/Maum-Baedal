import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH: 동반자 별명 수정
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { companionId, label } = await request.json()

    // 유효성 검증
    if (!companionId || typeof label !== 'string') {
      return NextResponse.json({ error: '잘못된 요청 데이터입니다' }, { status: 400 })
    }

    if (label.length > 10) {
      return NextResponse.json({ error: '별명은 10자 이하로 입력해주세요' }, { status: 400 })
    }

    // 동반자 관계 확인
    const companion = await prisma.companion.findFirst({
      where: {
        id: companionId,
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ],
        status: { not: 'deleted' }
      },
      include: {
        user1: true,
        user2: true
      }
    })

    if (!companion) {
      return NextResponse.json({ error: '동반자를 찾을 수 없습니다' }, { status: 404 })
    }

    // 상대방의 사용자 정보에 label 업데이트
    const isUser1 = companion.user1Id === session.user.id
    const partnerUserId = isUser1 ? companion.user2Id : companion.user1Id

    if (!partnerUserId) {
      return NextResponse.json({ error: '연결이 완료되지 않은 동반자입니다' }, { status: 400 })
    }

    // Phase 2에서는 사용자별 동반자 별명을 별도 테이블로 관리 예정
    // 현재는 User 테이블의 label 필드 활용
    await prisma.user.update({
      where: { id: partnerUserId },
      data: { label: label.trim() || null }
    })

    return NextResponse.json({
      success: true,
      label: label.trim() || null
    })

  } catch (error) {
    console.error('별명 수정 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}