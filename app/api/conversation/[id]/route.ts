import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ConversationDetail {
  id: string
  assignmentId: string
  createdAt: string
  isPublic: boolean
  assignment: {
    serviceDay: string
    question: {
      content: string
      category: string
    }
  }
  answers: {
    id: string
    userId: string
    content: string
    createdAt: string
    user: {
      nickname: string
      label?: string
    }
  }[]
}

interface ConversationResponse {
  conversation: ConversationDetail
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const userId = session.user.id
    const { id: conversationId } = await params

    console.log('[CONVERSATION API] 요청 받음:', { userId, conversationId })

    // 대화 조회 (권한 확인 포함)
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        assignment: {
          include: {
            question: true,
            companion: {
              select: {
                user1Id: true,
                user2Id: true,
                status: true
              }
            },
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
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    })

    if (!conversation) {
      console.log('[CONVERSATION API] 대화를 찾을 수 없음:', conversationId)
      return NextResponse.json(
        { error: '대화를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 권한 확인: 해당 동반자에 속한 사용자만 볼 수 있음
    const isAuthorized = conversation.assignment.companion.user1Id === userId || 
                        conversation.assignment.companion.user2Id === userId

    if (!isAuthorized) {
      console.log('[CONVERSATION API] 권한 없음:', { userId, companionUsers: [
        conversation.assignment.companion.user1Id,
        conversation.assignment.companion.user2Id
      ]})
      return NextResponse.json(
        { error: '이 대화를 볼 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 비공개 대화 확인 (현재는 모든 완료된 대화가 공개)
    if (!conversation.isPublic) {
      console.log('[CONVERSATION API] 비공개 대화:', conversationId)
      return NextResponse.json(
        { error: '비공개 대화입니다' },
        { status: 403 }
      )
    }

    // 응답 데이터 변환
    const formattedConversation: ConversationDetail = {
      id: conversation.id,
      assignmentId: conversation.assignmentId,
      createdAt: conversation.createdAt.toISOString(),
      isPublic: conversation.isPublic,
      assignment: {
        serviceDay: conversation.assignment.serviceDay,
        question: {
          content: conversation.assignment.question.content,
          category: conversation.assignment.question.category
        }
      },
      answers: conversation.assignment.answers.map(answer => ({
        id: answer.id,
        userId: answer.userId,
        content: answer.content,
        createdAt: answer.createdAt.toISOString(),
        user: {
          nickname: answer.user.nickname || '익명',
          label: answer.user.label || undefined
        }
      }))
    }

    const response: ConversationResponse = {
      conversation: formattedConversation
    }

    console.log('[CONVERSATION API] 응답 데이터:', {
      conversationId: formattedConversation.id,
      serviceDay: formattedConversation.assignment.serviceDay,
      answerCount: formattedConversation.answers.length,
      isPublic: formattedConversation.isPublic
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('[CONVERSATION API] 서버 오류:', error)
    return NextResponse.json(
      { error: '대화를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}