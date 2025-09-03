import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, NotificationType } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/notifications/templates - 템플릿 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    const templates = await prisma.notificationTemplate.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      templates: templates.map(template => ({
        ...template,
        variables: template.variables || {},
        usageCount: 0, // TODO: 실제 사용 횟수 계산
      }))
    })

  } catch (error: any) {
    console.error('템플릿 조회 오류:', error)
    return NextResponse.json({ 
      error: '템플릿 조회에 실패했습니다' 
    }, { status: 500 })
  }
}

// POST /api/admin/notifications/templates - 새 템플릿 생성
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, templateId, type, title, content, smsContent, variables, isActive } = body

    // 입력값 검증
    if (!name || !templateId || !type || !title || !content) {
      return NextResponse.json({ 
        error: '필수 필드가 누락되었습니다: name, templateId, type, title, content' 
      }, { status: 400 })
    }

    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json({ 
        error: '유효하지 않은 알림 타입입니다' 
      }, { status: 400 })
    }

    // 중복 체크
    const existingTemplate = await prisma.notificationTemplate.findFirst({
      where: {
        OR: [
          { name },
          { templateId }
        ]
      }
    })

    if (existingTemplate) {
      return NextResponse.json({ 
        error: '이미 존재하는 템플릿 이름 또는 ID입니다' 
      }, { status: 400 })
    }

    // 템플릿 생성
    const template = await prisma.notificationTemplate.create({
      data: {
        name,
        templateId,
        type,
        title,
        content,
        smsContent: smsContent || content,
        variables: variables || {},
        isActive: isActive !== false, // 기본값 true
      }
    })

    return NextResponse.json({
      success: true,
      template,
      message: '템플릿이 성공적으로 생성되었습니다'
    })

  } catch (error: any) {
    console.error('템플릿 생성 오류:', error)
    return NextResponse.json({ 
      error: '템플릿 생성에 실패했습니다',
      details: error.message 
    }, { status: 500 })
  }
}

// PATCH /api/admin/notifications/templates - 템플릿 업데이트
export async function PATCH(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, templateId, type, title, content, smsContent, variables, isActive } = body

    if (!id) {
      return NextResponse.json({ 
        error: '템플릿 ID가 필요합니다' 
      }, { status: 400 })
    }

    // 기존 템플릿 확인
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ 
        error: '존재하지 않는 템플릿입니다' 
      }, { status: 404 })
    }

    // 템플릿 업데이트
    const updatedTemplate = await prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(templateId !== undefined && { templateId }),
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(smsContent !== undefined && { smsContent }),
        ...(variables !== undefined && { variables }),
        ...(isActive !== undefined && { isActive }),
      }
    })

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: '템플릿이 성공적으로 업데이트되었습니다'
    })

  } catch (error: any) {
    console.error('템플릿 업데이트 오류:', error)
    return NextResponse.json({ 
      error: '템플릿 업데이트에 실패했습니다',
      details: error.message 
    }, { status: 500 })
  }
}