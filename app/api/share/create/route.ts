import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { isTestMode } from '@/lib/test-mode'

export async function POST(request: NextRequest) {
  try {
    // 테스트 모드 확인
    if (isTestMode(request)) {
      console.log('[TEST MODE] 질문 공유 Mock 데이터 반환')
      const mockShareToken = `TEST${nanoid(20)}`
      const mockShareUrl = `http://localhost:3000/join/${mockShareToken}`
      
      return NextResponse.json({
        success: true,
        shareUrl: mockShareUrl,
        shareToken: mockShareToken,
        message: '테스트 모드: 함께 오늘의 질문에 답해볼까요?',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
      })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { assignmentId, message } = await request.json()

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'assignmentId가 필요합니다' },
        { status: 400 }
      )
    }

    // Assignment 존재 여부 및 권한 확인
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        companion: {
          OR: [
            { user1Id: session.user.id },
            { user2Id: session.user.id }
          ]
        }
      },
      include: {
        question: true,
        answers: {
          include: {
            user: true
          }
        },
        companion: {
          include: {
            user1: true,
            user2: true
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 사용자의 답변이 있는지 확인
    const userAnswer = assignment.answers.find(answer => answer.userId === session.user.id)
    if (!userAnswer) {
      return NextResponse.json(
        { error: '답변을 먼저 작성해주세요' },
        { status: 400 }
      )
    }

    // 공유 토큰 생성 (24자리, URL-safe)
    const shareToken = nanoid(24)
    const shareUrl = `${process.env.NEXTAUTH_URL || 'https://dearq.app'}/join/${shareToken}`
    
    // 공유 레코드 생성/업데이트
    const shareRecord = await prisma.assignmentShare.upsert({
      where: {
        assignmentId_sharerId: {
          assignmentId,
          sharerId: session.user.id
        }
      },
      update: {
        token: shareToken,
        message: message || '함께 오늘의 질문에 답해볼까요?',
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
      },
      create: {
        assignmentId,
        sharerId: session.user.id,
        token: shareToken,
        message: message || '함께 오늘의 질문에 답해볼까요?',
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
      }
    })

    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken,
      message: shareRecord.message,
      expiresAt: shareRecord.expiresAt
    })

  } catch (error) {
    console.error('Share create API error:', error)
    return NextResponse.json(
      { error: '공유 링크 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}