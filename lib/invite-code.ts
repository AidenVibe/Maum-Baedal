/**
 * 초대코드 생성 및 관리 로직
 * 마음배달 v2 온보딩 시스템
 */

import { prisma } from './prisma'

/**
 * 6자리 초대코드 생성
 * 0, O, I, 1 제외로 가독성 향상
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * 중복 확인 후 고유한 초대코드로 Companion 생성
 */
export async function createInviteCode(userId: string, userLabel: string) {
  let code: string
  let attempts = 0
  
  // 최대 10회 시도로 중복 방지
  do {
    code = generateInviteCode()
    attempts++
    
    if (attempts > 10) {
      throw new Error('초대코드 생성에 실패했습니다. 다시 시도해 주세요.')
    }
    
    const existing = await prisma.companion.findUnique({
      where: { inviteCode: code }
    })
    
    if (!existing) break
  } while (true)
  
  // 24시간 후 만료 설정
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)
  
  // Companion 생성
  const companion = await prisma.companion.create({
    data: {
      user1Id: userId,
      inviteCode: code,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: expiresAt
    }
  })
  
  // 사용자 라벨 업데이트
  await prisma.user.update({
    where: { id: userId },
    data: { label: userLabel }
  })
  
  return {
    companionId: companion.id,
    inviteCode: code,
    expiresAt: expiresAt
  }
}

/**
 * 초대코드로 동반자 연결
 */
export async function connectWithInviteCode(
  inviteCode: string, 
  userId: string, 
  userLabel: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. 초대코드로 Companion 찾기
    const companion = await tx.companion.findUnique({
      where: { inviteCode },
      include: { 
        user1: { select: { id: true, nickname: true, label: true } }
      }
    })
    
    if (!companion) {
      throw new Error('존재하지 않는 초대코드입니다.')
    }
    
    // 2. 만료 체크
    if (companion.expiresAt && companion.expiresAt < new Date()) {
      throw new Error('만료된 초대코드입니다.')
    }
    
    // 3. 이미 사용된 코드 체크
    if (companion.status !== 'pending') {
      throw new Error('이미 사용된 초대코드입니다.')
    }
    
    // 4. 본인 코드 체크
    if (companion.user1Id === userId) {
      throw new Error('본인이 생성한 초대코드는 사용할 수 없습니다.')
    }
    
    // 5. 중복 연결 체크
    const existingConnection = await tx.companion.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: companion.user1Id },
          { user1Id: companion.user1Id, user2Id: userId },
          { user1Id: userId, status: 'active' },
          { user2Id: userId, status: 'active' }
        ]
      }
    })
    
    if (existingConnection && existingConnection.id !== companion.id) {
      throw new Error('이미 다른 가족과 연결되어 있습니다.')
    }
    
    // 6. Companion 완성
    const completedCompanion = await tx.companion.update({
      where: { id: companion.id },
      data: {
        user2Id: userId,
        status: 'active',
        connectedAt: new Date()
      },
      include: {
        user1: { select: { id: true, nickname: true, label: true } },
        user2: { select: { id: true, nickname: true, label: true } }
      }
    })
    
    // 7. 사용자 라벨 업데이트
    await tx.user.update({
      where: { id: userId },
      data: { label: userLabel }
    })
    
    return completedCompanion
  })
}

/**
 * 만료된 초대코드 정리 (크론잡용)
 */
export async function cleanupExpiredCodes() {
  const result = await prisma.companion.deleteMany({
    where: {
      status: 'pending',
      expiresAt: {
        lt: new Date()
      }
    }
  })
  
  console.log(`정리된 만료 코드: ${result.count}개`)
  return result.count
}