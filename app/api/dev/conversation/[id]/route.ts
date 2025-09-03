/**
 * DEV ONLY: Mock Conversation Detail API
 * 개발 환경에서 conversation 페이지 테스트용
 */

import { NextRequest, NextResponse } from 'next/server'
import type { ConversationDetailResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params

    // Mock 대화 데이터
    const mockConversation: ConversationDetailResponse = {
      id: conversationId,
      serviceDay: '2025-08-28',
      question: {
        id: 'q1',
        content: '오늘 가장 고마웠던 순간은 언제였나요?',
        category: '감사'
      },
      answers: [
        {
          id: 'a1',
          content: '오늘 아침에 아이가 "엄마, 사랑해"라고 말해줄 때 정말 고마웠어요. 바쁜 일상 속에서 잊고 지냈던 소중한 감정을 다시 느낄 수 있었습니다.',
          createdAt: '2025-08-28T08:30:15.000Z',
          user: {
            id: 'user_mom',
            nickname: '엄마'
          }
        },
        {
          id: 'a2',
          content: '점심에 엄마가 만들어준 김치찌개가 정말 맛있었어요. 특별할 것 없는 일상의 밥이었지만 그 따뜻함이 하루 종일 마음에 남았습니다.',
          createdAt: '2025-08-28T14:22:45.000Z',
          user: {
            id: 'user_dad',
            nickname: '아빠'
          }
        }
      ],
      createdAt: '2025-08-28T14:22:50.000Z',
      participants: {
        user1: {
          id: 'user_mom',
          nickname: '엄마'
        },
        user2: {
          id: 'user_dad',
          nickname: '아빠'
        }
      }
    }

    // 간단한 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json(mockConversation)

  } catch (error) {
    console.error('[Dev Conversation API] 오류:', error)
    return NextResponse.json(
      { error: '테스트 대화를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}