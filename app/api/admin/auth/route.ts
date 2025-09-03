/**
 * POST /api/admin/auth - 관리자 인증 API
 * 
 * ADMIN_SECRET 환경변수와 비교하여 인증하고 쿠키 설정
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // ADMIN_SECRET 환경변수와 비교
    const adminSecret = process.env.ADMIN_SECRET
    if (!adminSecret) {
      console.error('ADMIN_SECRET 환경변수가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: '서버 설정 오류입니다.' },
        { status: 500 }
      )
    }

    if (password !== adminSecret) {
      console.log('관리자 인증 실패: 잘못된 비밀번호')
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // 인증 성공 - 24시간 유지 쿠키 설정
    const response = NextResponse.json({ success: true })
    
    response.cookies.set('admin-auth', adminSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24시간
      path: '/'
    })

    console.log('✅ 관리자 인증 성공')
    return response

  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 로그아웃 처리
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    
    // 쿠키 삭제
    response.cookies.delete('admin-auth')
    
    console.log('✅ 관리자 로그아웃 완료')
    return response

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}