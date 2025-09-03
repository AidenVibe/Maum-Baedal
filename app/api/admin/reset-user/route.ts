import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    console.log('[ADMIN RESET] 관리자 인증 성공')

    const { resetType, confirmCode, userId: targetUserId } = await request.json()
    
    let userId: string
    
    // 관리자가 특정 사용자 ID를 지정한 경우 그것을 사용
    if (targetUserId) {
      console.log('[ADMIN RESET] 관리자가 지정한 대상 사용자 ID:', targetUserId)
      
      // 해당 사용자가 존재하는지 확인
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      })
      
      if (!targetUser) {
        return NextResponse.json({ 
          error: '지정한 사용자를 찾을 수 없습니다.' 
        }, { status: 404 })
      }
      
      userId = targetUserId
      console.log('[ADMIN RESET] 대상 사용자 확인됨:', userId)
      
    } else {
      console.log('[ADMIN RESET] 세션 토큰으로 사용자 ID 확인 시작')
      
      // 기존 로직: 세션 토큰으로 직접 사용자 ID 확인
      const possibleTokenNames = [
        '__Secure-next-auth.session-token',
        'next-auth.session-token', 
        'next-auth-session-token'
      ]
      
      let authToken = null
      
      for (const tokenName of possibleTokenNames) {
        const token = request.cookies.get(tokenName)
        if (token?.value) {
          authToken = token
          console.log('[ADMIN RESET] 세션 토큰 발견:', tokenName)
          break
        }
      }
      
      if (!authToken?.value) {
        console.log('[ADMIN RESET] 세션 토큰이 없습니다')
        return NextResponse.json({ 
          error: '로그인이 필요하거나 관리자는 사용자 ID를 지정해야 합니다.' 
        }, { status: 401 })
      }
      
      // Prisma로 직접 세션 확인하여 사용자 ID 획득
      const sessionRecord = await prisma.session.findUnique({
        where: { sessionToken: authToken.value },
        include: { user: true }
      })
      
      console.log('[ADMIN RESET] DB 세션 조회 결과:', {
        found: !!sessionRecord,
        expired: sessionRecord ? sessionRecord.expires < new Date() : null,
        userId: sessionRecord?.userId
      })
      
      if (!sessionRecord || sessionRecord.expires < new Date()) {
        return NextResponse.json({ 
          error: '세션이 만료되었습니다. 다시 로그인해주세요.' 
        }, { status: 401 })
      }
      
      userId = sessionRecord.userId
      console.log('[ADMIN RESET] 세션에서 사용자 ID 확보:', userId)
    }

    // 안전 확인 코드 검증
    if (confirmCode !== 'RESET_MY_DATA_2025') {
      return NextResponse.json({ 
        error: '잘못된 확인 코드입니다' 
      }, { status: 400 })
    }

    // userId는 위에서 이미 설정됨
    
    console.log(`[ADMIN RESET] 사용자 데이터 리셋 시작: ${userId}, 타입: ${resetType}`)

    const result = await prisma.$transaction(async (tx) => {
      // 1. 사용자의 모든 답변 삭제
      const deletedAnswers = await tx.answer.deleteMany({
        where: { userId }
      })

      // 2. 사용자의 Assignment 삭제 (사용자가 속한 Companion의 Assignment들)
      const deletedAssignments = await tx.assignment.deleteMany({
        where: {
          companion: {
            OR: [
              { user1Id: userId },
              { user2Id: userId }
            ]
          }
        }
      })

      // 3. 사용자의 Conversation 삭제 (사용자가 속한 Companion의 Assignment에 연결된 Conversation들)
      const deletedConversations = await tx.conversation.deleteMany({
        where: {
          assignment: {
            companion: {
              OR: [
                { user1Id: userId },
                { user2Id: userId }
              ]
            }
          }
        }
      })

      let deletedPairs = { count: 0 }
      let deletedShareTokens = { count: 0 }
      let deletedAccounts = { count: 0 }
      let deletedSessions = { count: 0 }

      if (resetType === 'full') {
        // 4. 사용자의 Companion 연결 삭제 (전체 리셋만)
        deletedPairs = await tx.companion.deleteMany({
          where: {
            OR: [
              { user1Id: userId },
              { user2Id: userId }
            ]
          }
        })

        // 5. 사용자가 생성한 ShareToken 삭제
        deletedShareTokens = await tx.shareToken.deleteMany({
          where: { creatorId: userId }
        })

        // 6. NextAuth - 사용자의 모든 Account 삭제 (카카오 OAuth 연결 등)
        deletedAccounts = await tx.account.deleteMany({
          where: { userId }
        })

        // 7. NextAuth - 사용자의 모든 Session 삭제
        deletedSessions = await tx.session.deleteMany({
          where: { userId }
        })

        // 8. 사용자 온보딩 상태 리셋
        await tx.user.update({
          where: { id: userId },
          data: {
            onboardedAt: null,
            interests: [],
            label: null,
            bio: null
          }
        })
      }

      return {
        deletedAnswers: deletedAnswers.count,
        deletedAssignments: deletedAssignments.count,
        deletedConversations: deletedConversations.count,
        deletedPairs: deletedPairs.count,
        deletedShareTokens: deletedShareTokens.count,
        deletedAccounts: deletedAccounts.count,
        deletedSessions: deletedSessions.count
      }
    })

    console.log(`[ADMIN RESET] 리셋 완료:`, result)

    return NextResponse.json({
      success: true,
      message: resetType === 'full' 
        ? '사용자 데이터가 완전히 리셋되었습니다. 온보딩부터 다시 시작할 수 있습니다.' 
        : '사용자의 질문/답변 데이터가 리셋되었습니다.',
      result
    })

  } catch (error) {
    console.error('[ADMIN RESET] 에러:', error)
    return NextResponse.json({ 
      error: '사용자 데이터 리셋 중 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}