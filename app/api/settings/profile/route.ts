import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isTestMode, getMockProfile } from '@/lib/test-mode'

interface UpdateProfileRequest {
  nickname?: string
  label?: string
}

interface ProfileResponse {
  user: {
    id: string
    nickname: string | null
    label?: string | null
    kakaoSub?: string | null
  }
}

export async function GET(request: NextRequest) {
  try {
    // 테스트 모드 지원
    if (isTestMode(request)) {
      console.log('✅ Test mode: returning mock profile data')
      const mockProfile = getMockProfile()
      return NextResponse.json(mockProfile)
    }

    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const userId = session.user.id

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        label: true,
        kakaoSub: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    const response: ProfileResponse = { user }
    return NextResponse.json(response)

  } catch (error) {
    console.error('[SETTINGS/PROFILE GET] 서버 오류:', error)
    return NextResponse.json(
      { error: '프로필을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 테스트 모드 지원
    if (isTestMode(request)) {
      console.log('✅ Test mode: returning mock profile update success')
      const mockProfile = getMockProfile()
      const body: UpdateProfileRequest = await request.json()
      
      // Mock 데이터에 업데이트 내용 반영
      if (body.nickname) mockProfile.user.nickname = body.nickname.trim()
      if (body.label !== undefined) mockProfile.user.label = body.label?.trim() || ""
      
      return NextResponse.json(mockProfile)
    }

    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const userId = session.user.id
    const body: UpdateProfileRequest = await request.json()

    // 입력 검증
    if (body.nickname && body.nickname.trim().length === 0) {
      return NextResponse.json({ error: '닉네임을 입력해 주세요' }, { status: 400 })
    }

    if (body.nickname && body.nickname.length > 20) {
      return NextResponse.json({ error: '닉네임은 20자 이하로 입력해 주세요' }, { status: 400 })
    }

    // 프로필 업데이트 데이터 준비
    const updateData: Partial<UpdateProfileRequest> = {}
    if (body.nickname !== undefined) updateData.nickname = body.nickname.trim()
    if (body.label !== undefined) updateData.label = body.label?.trim() || undefined

    // 업데이트할 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '업데이트할 정보가 없습니다' }, { status: 400 })
    }

    console.log('[SETTINGS/PROFILE PUT] 업데이트 요청:', { userId, updateData })

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nickname: true,
        label: true,
        kakaoSub: true
      }
    })

    console.log('[SETTINGS/PROFILE PUT] 업데이트 완료:', updatedUser)

    const response: ProfileResponse = { user: updatedUser }
    return NextResponse.json(response)

  } catch (error) {
    console.error('[SETTINGS/PROFILE PUT] 서버 오류:', error)
    return NextResponse.json(
      { error: '프로필을 업데이트하는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}