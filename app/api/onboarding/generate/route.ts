/**
 * POST /api/onboarding/generate - 초대코드 생성 API
 * 
 * 기능:
 * - 6자리 고유 초대코드 생성
 * - Pair 테이블에 pending 상태로 저장
 * - 24시간 만료 시간 설정
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createInviteCode } from '@/lib/invite-code'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { isTestMode, getMockInviteCode } from '@/lib/test-mode'

// 요청 바디 검증 스키마
const GenerateCodeSchema = z.object({
  userLabel: z.string()
    .min(1, '가족 관계를 선택해 주세요.')
    .max(10, '가족 관계는 10자를 넘을 수 없습니다.')
})

export async function POST(request: NextRequest) {
  try {
    // 테스트 모드 확인
    if (isTestMode(request)) {
      console.log('[TEST MODE] 초대코드 Mock 데이터 반환')
      const mockInviteData = getMockInviteCode()
      return NextResponse.json(mockInviteData)
    }

    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // 2. 요청 바디 파싱 및 검증
    const body = await request.json()
    const parseResult = GenerateCodeSchema.safeParse(body)
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || '잘못된 요청입니다.'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    const { userLabel } = parseResult.data
    
    // 3. 기존 연결 확인
    const existingPair = await prisma.companion.findFirst({
      where: {
        OR: [
          { user1Id: userId, status: 'active' },
          { user2Id: userId, status: 'active' }
        ]
      }
    })
    
    if (existingPair) {
      return NextResponse.json(
        { error: '이미 가족과 연결되어 있습니다.' },
        { status: 400 }
      )
    }
    
    // 4. 기존 pending 코드 정리
    await prisma.companion.deleteMany({
      where: {
        user1Id: userId,
        status: 'pending'
      }
    })
    
    // 5. 새 초대코드 생성
    const result = await createInviteCode(userId, userLabel)
    
    console.log(`✅ 초대코드 생성됨: ${result.inviteCode} (사용자: ${userId})`)
    
    return NextResponse.json({
      success: true,
      inviteCode: result.inviteCode,
      expiresAt: result.expiresAt.toISOString(),
      message: '초대코드가 생성되었습니다. 가족에게 공유해 주세요.'
    })
    
  } catch (error) {
    console.error('초대코드 생성 오류:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : '초대코드 생성 중 오류가 발생했습니다.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}