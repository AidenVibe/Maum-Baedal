/**
 * 공유 토큰 생성 및 검증 유틸리티
 */

import { prisma } from './prisma'
import crypto from 'crypto'

/**
 * 안전한 공유 토큰 생성 (32자, URL-safe)
 */
export function generateShareToken(): string {
  const bytes = crypto.randomBytes(24) // 24 bytes = 32 chars in base64
  return bytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * 공유 토큰 생성 및 저장
 */
export async function createShareToken(creatorId: string, message?: string): Promise<{
  token: string
  shareUrl: string
  expiresAt: Date
}> {
  let token: string
  let attempts = 0
  const maxAttempts = 5

  // 토큰 중복 방지
  do {
    token = generateShareToken()
    attempts++
    
    const existing = await prisma.shareToken.findUnique({
      where: { token }
    })
    
    if (!existing) break
    
    if (attempts >= maxAttempts) {
      throw new Error('토큰 생성에 실패했습니다. 다시 시도해 주세요.')
    }
  } while (true)

  // 24시간 후 만료
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  
  // 토큰 저장
  await prisma.shareToken.create({
    data: {
      token,
      creatorId,
      message: message?.trim() || null,
      expiresAt,
      status: 'pending'
    }
  })

  // 공유 URL 생성
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const shareUrl = `${baseUrl}/join/${token}`

  console.log('[SHARE] 토큰 생성 완료:', {
    creatorId,
    token: token.substring(0, 8) + '...',
    expiresAt
  })

  return {
    token,
    shareUrl,
    expiresAt
  }
}

/**
 * 공유 토큰 검증 및 조회
 */
export async function validateShareToken(token: string): Promise<{
  isValid: boolean
  shareToken?: {
    id: string
    creatorId: string
    message: string | null
    status: string
    expiresAt: Date
    creator: {
      id: string
      nickname: string | null
      bio: string | null
    }
  }
  error?: string
}> {
  try {
    const shareToken = await prisma.shareToken.findUnique({
      where: { token },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            bio: true
          }
        }
      }
    })

    if (!shareToken) {
      return {
        isValid: false,
        error: '유효하지 않은 초대 링크입니다'
      }
    }

    // 만료 확인
    if (new Date() > shareToken.expiresAt) {
      return {
        isValid: false,
        error: '만료된 초대 링크입니다 (24시간 초과)'
      }
    }

    // 이미 사용됨 확인
    if (shareToken.status === 'used') {
      return {
        isValid: false,
        error: '이미 사용된 초대 링크입니다'
      }
    }

    // 만료됨 상태 확인
    if (shareToken.status === 'expired') {
      return {
        isValid: false,
        error: '만료된 초대 링크입니다'
      }
    }

    return {
      isValid: true,
      shareToken
    }

  } catch (error) {
    console.error('[SHARE] 토큰 검증 실패:', error)
    return {
      isValid: false,
      error: '토큰 검증 중 오류가 발생했습니다'
    }
  }
}

/**
 * 공유 토큰 사용 처리 (페어 생성 시)
 */
export async function useShareToken(token: string, companionId: string): Promise<boolean> {
  try {
    const updated = await prisma.shareToken.update({
      where: { token },
      data: {
        status: 'used',
        usedAt: new Date(),
        companionId
      }
    })

    console.log('[SHARE] 토큰 사용 처리 완료:', {
      token: token.substring(0, 8) + '...',
      companionId
    })

    return true
  } catch (error) {
    console.error('[SHARE] 토큰 사용 처리 실패:', error)
    return false
  }
}

/**
 * 만료된 토큰 정리 (배치 작업용)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await prisma.shareToken.updateMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        status: 'pending'
      },
      data: {
        status: 'expired'
      }
    })

    console.log('[SHARE] 만료 토큰 정리 완료:', result.count, '개')
    return result.count
  } catch (error) {
    console.error('[SHARE] 만료 토큰 정리 실패:', error)
    return 0
  }
}