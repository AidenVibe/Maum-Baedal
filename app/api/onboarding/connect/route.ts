/**
 * POST /api/onboarding/connect - 초대코드로 동반자 연결 API
 * 
 * 기능:
 * - 초대코드 유효성 검증
 * - 사용자간 Companion 연결 완성
 * - 가족 라벨 설정
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectWithInviteCode } from '@/lib/invite-code'
import { z } from 'zod'

// 요청 바디 검증 스키마
const ConnectCodeSchema = z.object({
  inviteCode: z.string()
    .min(6, '초대코드는 6자리여야 합니다.')
    .max(6, '초대코드는 6자리여야 합니다.')
    .toUpperCase(),
  userLabel: z.string()
    .min(1, '가족 관계를 선택해 주세요.')
    .max(10, '가족 관계는 10자를 넘을 수 없습니다.')
})

export async function POST(request: NextRequest) {
  try {
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
    const parseResult = ConnectCodeSchema.safeParse(body)
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || '잘못된 요청입니다.'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    const { inviteCode, userLabel } = parseResult.data
    
    // 3. 초대코드로 연결
    const companion = await connectWithInviteCode(inviteCode, userId, userLabel)
    
    console.log(`✅ 동반자 연결 완료: ${companion.id} (코드: ${inviteCode})`)
    
    return NextResponse.json({
      success: true,
      companion: {
        id: companion.id,
        user1: {
          nickname: companion.user1?.nickname,
          label: companion.user1?.label
        },
        user2: {
          nickname: companion.user2?.nickname,
          label: companion.user2?.label
        }
      },
      message: `${companion.user1?.nickname || '가족'}과 성공적으로 연결되었습니다! 이제 매일 대화를 나눌 수 있어요.`
    })
    
  } catch (error) {
    console.error('동반자 연결 오류:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : '연결 중 오류가 발생했습니다.'
    
    // 사용자 친화적 에러 메시지 매핑
    const userFriendlyErrors: { [key: string]: string } = {
      '존재하지 않는 초대코드입니다.': '초대코드를 확인해 주세요. 정확히 6자리를 입력했는지 확인해 보세요.',
      '만료된 초대코드입니다.': '초대코드가 만료되었습니다. 가족에게 새 초대코드를 요청해 주세요.',
      '이미 사용된 초대코드입니다.': '이미 사용된 초대코드입니다. 가족에게 새 초대코드를 요청해 주세요.',
      '본인이 생성한 초대코드는 사용할 수 없습니다.': '본인이 생성한 초대코드는 사용할 수 없습니다.',
      '이미 다른 가족과 연결되어 있습니다.': '이미 다른 가족과 연결되어 있습니다. 현재는 한 가족과만 연결할 수 있어요.'
    }
    
    const friendlyMessage = userFriendlyErrors[errorMessage] || errorMessage
    
    return NextResponse.json(
      { error: friendlyMessage },
      { status: 400 }
    )
  }
}