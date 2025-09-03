/**
 * GET/POST /api/share/join/[token] - 공유 링크를 통한 동반자 연결 API
 * 
 * 기능:
 * - GET: 공유 링크 정보 조회 (참여 전 미리보기)
 * - POST: 실제 동반자 연결 실행
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateShareToken, useShareToken } from '@/lib/share-token'
import { getServiceDay } from '@/lib/service-day'

// GET - 공유 링크 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    if (!token) {
      return NextResponse.json(
        { error: '토큰이 필요합니다' },
        { status: 400 }
      )
    }
    
    // 토큰 검증 (로그인 전 사용자가 볼 수 있도록)
    const validation = await validateShareToken(token)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || '유효하지 않은 링크입니다' },
        { status: 400 }
      )
    }
    
    // Companion 정보 조회
    const companion = await prisma.companion.findFirst({
      where: {
        shareToken: token,
        status: 'pending'
      },
      include: {
        user1: {
          select: {
            nickname: true,
            bio: true,
            image: true
          }
        },
        assignments: {
          where: {
            serviceDay: getServiceDay(),
            status: 'active'
          },
          include: {
            question: true
          },
          take: 1
        }
      }
    })
    
    if (!companion) {
      return NextResponse.json(
        { error: '유효하지 않은 초대 링크입니다' },
        { status: 404 }
      )
    }
    
    const currentAssignment = companion.assignments[0]
    
    return NextResponse.json({
      valid: true,
      creator: {
        nickname: validation.shareToken?.creator.nickname || '누군가',
        bio: validation.shareToken?.creator.bio
      },
      message: validation.shareToken?.message,
      question: currentAssignment ? {
        content: currentAssignment.question.content,
        category: currentAssignment.question.category
      } : null,
      expiresAt: validation.shareToken?.expiresAt
    })
    
  } catch (error) {
    console.error('[SHARE JOIN] 토큰 검증 실패:', error)
    return NextResponse.json(
      { error: '토큰 검증 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 동반자 연결 실행
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const serviceDay = getServiceDay()
    
    // 2. 토큰 검증
    const validation = await validateShareToken(token)
    
    if (!validation.isValid || !validation.shareToken) {
      return NextResponse.json(
        { error: validation.error || '유효하지 않은 초대 링크입니다' },
        { status: 400 }
      )
    }
    
    // 3. 자기 자신 초대 방지
    if (validation.shareToken.creatorId === userId) {
      return NextResponse.json(
        { error: '본인이 생성한 링크로는 참여할 수 없습니다' },
        { status: 400 }
      )
    }
    
    // 4. 기존 동반자 관계 확인
    const existingCompanion = await prisma.companion.findFirst({
      where: {
        OR: [
          { user1Id: userId, status: 'active' },
          { user2Id: userId, status: 'active' },
          { 
            user1Id: validation.shareToken.creatorId,
            user2Id: userId,
            status: 'active'
          },
          {
            user1Id: userId,
            user2Id: validation.shareToken.creatorId,
            status: 'active'
          }
        ]
      }
    })
    
    if (existingCompanion) {
      return NextResponse.json(
        { error: '이미 동반자 관계가 존재합니다' },
        { status: 400 }
      )
    }
    
    // 5. 트랜잭션으로 동반자 연결 및 Assignment 생성
    const result = await prisma.$transaction(async (tx) => {
      // 5.1 Creator의 Solo mode Companion 찾기
      const soloCompanion = await tx.companion.findFirst({
        where: {
          user1Id: validation.shareToken!.creatorId,
          user2Id: null,
          status: 'pending'
        },
        include: {
          assignments: {
            where: {
              serviceDay,
              status: 'active'
            },
            include: {
              question: true
            }
          }
        }
      })
      
      if (!soloCompanion) {
        throw new Error('유효하지 않은 초대 링크입니다')
      }
      
      // 5.2 Companion 업데이트 (user2 연결)
      const updatedCompanion = await tx.companion.update({
        where: { id: soloCompanion.id },
        data: {
          user2Id: userId,
          status: 'active',
          connectedAt: new Date()
        }
      })
      
      // 5.3 ShareToken 사용 처리
      await useShareToken(token, updatedCompanion.id)
      
      // 5.4 현재 Assignment 가져오기 (이미 생성되어 있어야 함)
      const currentAssignment = soloCompanion.assignments[0]
      
      if (!currentAssignment) {
        // Assignment가 없다면 새로 생성
        const randomQuestion = await tx.question.findFirst({
          where: { isActive: true },
          orderBy: { totalUsed: 'asc' }
        })
        
        if (!randomQuestion) {
          throw new Error('사용 가능한 질문이 없습니다')
        }
        
        const newAssignment = await tx.assignment.create({
          data: {
            companionId: updatedCompanion.id,
            serviceDay,
            questionId: randomQuestion.id,
            status: 'active'
          },
          include: {
            question: true
          }
        })
        
        return {
          companion: updatedCompanion,
          assignment: newAssignment,
          isNew: true
        }
      }
      
      return {
        companion: updatedCompanion,
        assignment: currentAssignment,
        isNew: false
      }
    })
    
    console.log('[SHARE JOIN] 동반자 연결 완료:', {
      userId,
      creatorId: validation.shareToken.creatorId,
      companionId: result.companion.id,
      assignmentId: result.assignment.id
    })
    
    return NextResponse.json({
      success: true,
      message: '동반자 연결이 완료되었습니다',
      redirectTo: '/today',
      assignment: {
        id: result.assignment.id,
        question: result.assignment.question.content,
        serviceDay: result.assignment.serviceDay
      }
    })
    
  } catch (error) {
    console.error('[SHARE JOIN] 참여 실패:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '참여 중 오류가 발생했습니다' 
      },
      { status: 500 }
    )
  }
}