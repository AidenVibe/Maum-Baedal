import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateInterests } from '@/lib/interests'
import { isTestMode, getMockOnboardingProfile } from '@/lib/test-mode'

/**
 * 온보딩 프로필 저장 API
 * POST /api/onboarding/profile
 * 
 * Body:
 * - nickname: string (필수, 2-10자)
 * - bio?: string (선택, 최대 50자)
 * - interests: string[] (필수, 2-3개)
 */
export async function POST(request: NextRequest) {
  try {
    // 테스트 모드 지원
    if (isTestMode(request)) {
      console.log('✅ Test mode: returning mock onboarding profile save success')
      const body = await request.json()
      const mockProfile = getMockOnboardingProfile()
      
      // Mock 데이터에 입력 내용 반영
      if (body.nickname) mockProfile.user.nickname = body.nickname
      if (body.bio) mockProfile.user.bio = body.bio
      if (body.interests) mockProfile.user.interests = body.interests
      
      return NextResponse.json({
        success: true,
        user: mockProfile.user
      })
    }

    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: '로그인이 필요합니다' 
      }, { status: 401 })
    }

    // 2. 요청 데이터 파싱
    const body = await request.json()
    const { nickname, bio, interests } = body

    // 3. 입력 검증
    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json({ 
        error: '닉네임을 입력해 주세요' 
      }, { status: 400 })
    }

    if (nickname.length < 2 || nickname.length > 10) {
      return NextResponse.json({ 
        error: '닉네임은 2-10글자 사이로 입력해 주세요' 
      }, { status: 400 })
    }

    if (bio && (typeof bio !== 'string' || bio.length > 50)) {
      return NextResponse.json({ 
        error: '한줄소개는 50글자 이하로 입력해 주세요' 
      }, { status: 400 })
    }

    if (!Array.isArray(interests) || !validateInterests(interests)) {
      return NextResponse.json({ 
        error: '관심사를 2-3개 선택해 주세요' 
      }, { status: 400 })
    }

    // 4. 사용자 프로필 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nickname: nickname.trim(),
        bio: bio?.trim() || null,
        interests: interests,
        onboardedAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        nickname: true,
        bio: true,
        interests: true,
        onboardedAt: true
      }
    })

    console.log('[ONBOARDING] 프로필 저장 완료:', {
      userId: session.user.id,
      nickname: updatedUser.nickname,
      interests: updatedUser.interests
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('[ONBOARDING] 프로필 저장 실패:', error)
    return NextResponse.json({ 
      error: '프로필 저장 중 오류가 발생했습니다' 
    }, { status: 500 })
  }
}

/**
 * 현재 사용자 프로필 조회 API
 * GET /api/onboarding/profile
 */
export async function GET(request: NextRequest) {
  try {
    // 테스트 모드 지원
    if (isTestMode(request)) {
      console.log('✅ Test mode: returning mock onboarding profile data')
      const mockProfile = getMockOnboardingProfile()
      return NextResponse.json(mockProfile)
    }

    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: '로그인이 필요합니다' 
      }, { status: 401 })
    }

    // 2. 사용자 프로필 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nickname: true,
        bio: true,
        interests: true,
        onboardedAt: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: '사용자를 찾을 수 없습니다' 
      }, { status: 404 })
    }

    return NextResponse.json({
      user: user,
      isOnboarded: !!user.onboardedAt
    })

  } catch (error) {
    console.error('[ONBOARDING] 프로필 조회 실패:', error)
    return NextResponse.json({ 
      error: '프로필 조회 중 오류가 발생했습니다' 
    }, { status: 500 })
  }
}