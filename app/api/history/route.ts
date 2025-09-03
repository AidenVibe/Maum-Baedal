import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ConversationWithDetails {
  id: string
  assignmentId: string
  createdAt: string
  assignment: {
    serviceDay: string
    question: {
      content: string
      category: string
    }
  }
  answers: {
    userId: string
    content: string
    user: {
      nickname: string
      label?: string
    }
  }[]
}

interface HistoryResponse {
  conversations: ConversationWithDetails[]
  pagination: {
    hasMore: boolean
    nextCursor?: string
    totalCount: number
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[HISTORY API] 요청 시작')
    
    // 인증 확인
    const session = await getServerSession(authOptions)
    console.log('[HISTORY API] 세션 상태:', session ? ' 있음' : '없음')
    
    if (!session?.user) {
      console.log('[HISTORY API] 인증 실패 - 세션 없음')
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('[HISTORY API] 사용자 ID:', userId)
    
    // 쿼리 파라미터 파싱
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    console.log('[HISTORY API] 요청 받음:', { userId, cursor, limit })
    
    // 사용자 정보 디버깅
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, kakaoSub: true }
    })
    console.log('[HISTORY API] 사용자 정보:', user)

    // 사용자가 속한 동반자 찾기
    const userPairs = await prisma.companion.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        status: 'active'
      },
      select: { id: true }
    })

    console.log('[HISTORY API] 조회된 동반자:', userPairs)

    if (userPairs.length === 0) {
      console.log('[HISTORY API] 사용자가 속한 동반자이 없음 - 동반자 전체 조회로 디버깅')
      
      // 디버깅: 전체 동반자 조회
      const allPairs = await prisma.companion.findMany({
        select: { id: true, user1Id: true, user2Id: true, status: true }
      })
      console.log('[HISTORY API DEBUG] 전체 동반자 목록:', allPairs)
      
      return NextResponse.json({
        conversations: [],
        pagination: {
          hasMore: false,
          totalCount: 0
        }
      } satisfies HistoryResponse)
    }

    const companionIds = userPairs.map(pair => pair.id)
    console.log('[HISTORY API] 사용자 동반자 IDs:', companionIds)

    // 완료된 대화 조회 (커서 기반 페이지네이션)
    const whereClause = {
      assignment: {
        companionId: { in: companionIds },
        status: 'completed' // 완료된 Assignment만
      },
      ...(cursor && { id: { lt: cursor } }) // 커서보다 작은 ID (최신 순)
    }

    // 전체 개수 조회
    const totalCount = await prisma.conversation.count({
      where: {
        assignment: {
          companionId: { in: companionIds },
          status: 'completed'
        }
      }
    })

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // 최신 순 정렬
      take: limit + 1, // 다음 페이지 존재 확인을 위해 +1
      include: {
        assignment: {
          include: {
            question: true,
            answers: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    label: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' } // 답변은 작성 순으로
            }
          }
        }
      }
    })

    // 페이지네이션 처리
    const hasMore = conversations.length > limit
    const items = hasMore ? conversations.slice(0, -1) : conversations
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    // 응답 데이터 변환
    const formattedConversations: ConversationWithDetails[] = items.map(conversation => ({
      id: conversation.id,
      assignmentId: conversation.assignmentId,
      createdAt: conversation.createdAt.toISOString(),
      assignment: {
        serviceDay: conversation.assignment.serviceDay,
        question: {
          content: conversation.assignment.question.content,
          category: conversation.assignment.question.category
        }
      },
      answers: conversation.assignment.answers.map(answer => ({
        userId: answer.userId,
        content: answer.content,
        user: {
          nickname: answer.user.nickname || '익명',
          label: answer.user.label || undefined
        }
      }))
    }))

    const response: HistoryResponse = {
      conversations: formattedConversations,
      pagination: {
        hasMore,
        nextCursor,
        totalCount
      }
    }

    console.log('[HISTORY API] 응답 데이터:', {
      conversationCount: formattedConversations.length,
      hasMore,
      totalCount,
      nextCursor
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('[HISTORY API] 서버 오류:', error)
    return NextResponse.json(
      { error: '히스토리를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}