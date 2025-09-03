import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ConversationNavigationResponse, NavigationItem } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // params가 Promise인 경우 await
    const { id } = await params

    // 2. 현재 대화 조회 및 권한 확인
    const currentConversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        isPublic: true, // 공개된 대화만 (status 필드 대신)
        assignment: {
          companion: {
            OR: [
              { user1Id: session.user.id },
              { user2Id: session.user.id }
            ]
          }
        }
      },
      include: {
        assignment: {
          include: {
            companion: true,
            question: {
              select: { 
                id: true, 
                content: true 
              }
            }
          }
        }
      }
    })

    if (!currentConversation) {
      return NextResponse.json(
        { error: '대화를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const companionId = currentConversation.assignment.companionId
    const currentServiceDay = currentConversation.assignment.serviceDay

    // 3. 이전/다음 대화 조회 (병렬 처리)
    // isPublic=true와 conversation 존재 자체가 답변 2개 완료를 의미함
    const [previousConversation, nextConversation] = await Promise.all([
      // 이전 대화 (serviceDay < current)
      prisma.conversation.findFirst({
        where: {
          isPublic: true,
          assignment: {
            companionId: companionId,
            serviceDay: { lt: currentServiceDay },
            status: 'completed' // Assignment도 완료된 것만
          }
        },
        orderBy: {
          assignment: {
            serviceDay: 'desc' // 가장 가까운 이전 날짜
          }
        },
        include: {
          assignment: {
            select: {
              serviceDay: true,
              question: {
                select: {
                  content: true
                }
              }
            }
          }
        }
      }),
      
      // 다음 대화 (serviceDay > current)  
      prisma.conversation.findFirst({
        where: {
          isPublic: true,
          assignment: {
            companionId: companionId,
            serviceDay: { gt: currentServiceDay },
            status: 'completed' // Assignment도 완료된 것만
          }
        },
        orderBy: {
          assignment: {
            serviceDay: 'asc' // 가장 가까운 다음 날짜
          }
        },
        include: {
          assignment: {
            select: {
              serviceDay: true,
              question: {
                select: {
                  content: true
                }
              }
            }
          }
        }
      })
    ])

    // 4. 질문 미리보기 생성 helper 함수
    const createQuestionPreview = (content: string): string => {
      return content.length > 50 ? content.slice(0, 50) + '...' : content
    }

    // 5. 응답 구성
    const response: ConversationNavigationResponse = {
      navigation: {
        current: {
          id: currentConversation.id,
          serviceDay: currentConversation.assignment.serviceDay,
          questionPreview: createQuestionPreview(currentConversation.assignment.question.content)
        },
        previous: previousConversation ? {
          id: previousConversation.id,
          serviceDay: previousConversation.assignment.serviceDay,
          questionPreview: createQuestionPreview(previousConversation.assignment.question.content)
        } : null,
        next: nextConversation ? {
          id: nextConversation.id,
          serviceDay: nextConversation.assignment.serviceDay,
          questionPreview: createQuestionPreview(nextConversation.assignment.question.content)
        } : null,
        hasPrevious: !!previousConversation,
        hasNext: !!nextConversation
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Navigation API error:', error)
    return NextResponse.json(
      { error: '네비게이션 정보를 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}