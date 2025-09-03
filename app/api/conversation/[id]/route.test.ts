/**
 * Conversation Detail API 테스트
 * 
 * 테스트 시나리오:
 * 1. 인증 확인
 * 2. 권한 검증
 * 3. 완료된 대화 조회
 * 4. 에러 처리
 */

import { NextRequest } from 'next/server'
import { GET } from './route'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      findUnique: jest.fn()
    }
  }
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

describe('GET /api/conversation/[id]', () => {
  // 테스트 데이터
  const mockConversation = {
    id: 'conv_123',
    createdAt: new Date('2025-08-27T10:00:00Z'),
    assignment: {
      serviceDay: '2025-08-27',
      status: 'completed',
      question: {
        id: 'q_123',
        content: '오늘 가장 감사했던 순간은?',
        category: 'gratitude'
      },
      answers: [
        {
          id: 'ans_1',
          content: '아침에 가족과 함께 식사한 시간',
          createdAt: new Date('2025-08-27T08:00:00Z'),
          user: {
            id: 'user_1',
            nickname: '엄마'
          }
        },
        {
          id: 'ans_2',
          content: '퇴근하고 집에 왔을 때',
          createdAt: new Date('2025-08-27T09:00:00Z'),
          user: {
            id: 'user_2',
            nickname: '아들'
          }
        }
      ],
      pair: {
        user1Id: 'user_1',
        user2Id: 'user_2',
        user1: {
          id: 'user_1',
          nickname: '엄마'
        },
        user2: {
          id: 'user_2',
          nickname: '아들'
        }
      }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('성공 케이스', () => {
    it('참여자가 완료된 대화를 조회할 수 있어야 함', async () => {
      // Mock 설정
      const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_1', email: 'test@example.com' }
      } as any)

      const mockFindUnique = prisma.conversation.findUnique as jest.MockedFunction<typeof prisma.conversation.findUnique>
      mockFindUnique.mockResolvedValue(mockConversation as any)

      // 요청 생성
      const request = new NextRequest('http://localhost:3000/api/conversation/conv_123')
      const params = { id: 'conv_123' }

      // API 호출
      const response = await GET(request, { params: Promise.resolve(params) })
      const data = await response.json()

      // 검증
      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 'conv_123',
        serviceDay: '2025-08-27',
        question: {
          content: '오늘 가장 감사했던 순간은?'
        },
        answers: expect.arrayContaining([
          expect.objectContaining({
            content: '아침에 가족과 함께 식사한 시간'
          })
        ])
      })
    })
  })

  describe('에러 케이스', () => {
    it('로그인하지 않은 경우 401을 반환해야 함', async () => {
      // Mock 설정
      const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
      mockGetServerSession.mockResolvedValue(null)

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/conversation/conv_123')
      const params = { id: 'conv_123' }
      const response = await GET(request, { params: Promise.resolve(params) })
      const data = await response.json()

      // 검증
      expect(response.status).toBe(401)
      expect(data.error).toBe('로그인이 필요합니다.')
    })

    it('참여자가 아닌 경우 403을 반환해야 함', async () => {
      // Mock 설정
      const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_3', email: 'other@example.com' }  // 다른 사용자
      } as any)

      const mockFindUnique = prisma.conversation.findUnique as jest.MockedFunction<typeof prisma.conversation.findUnique>
      mockFindUnique.mockResolvedValue(mockConversation as any)

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/conversation/conv_123')
      const params = { id: 'conv_123' }
      const response = await GET(request, { params: Promise.resolve(params) })
      const data = await response.json()

      // 검증
      expect(response.status).toBe(403)
      expect(data.error).toBe('이 대화에 접근할 권한이 없습니다.')
    })

    it('대화가 존재하지 않는 경우 404를 반환해야 함', async () => {
      // Mock 설정
      const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_1', email: 'test@example.com' }
      } as any)

      const mockFindUnique = prisma.conversation.findUnique as jest.MockedFunction<typeof prisma.conversation.findUnique>
      mockFindUnique.mockResolvedValue(null)

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/conversation/not_found')
      const params = { id: 'not_found' }
      const response = await GET(request, { params: Promise.resolve(params) })
      const data = await response.json()

      // 검증
      expect(response.status).toBe(404)
      expect(data.error).toBe('대화를 찾을 수 없습니다.')
    })

    it('아직 완료되지 않은 대화인 경우 400을 반환해야 함', async () => {
      // Mock 설정
      const incompleteMockConversation = {
        ...mockConversation,
        assignment: {
          ...mockConversation.assignment,
          status: 'active'  // 아직 완료되지 않음
        }
      }

      const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_1', email: 'test@example.com' }
      } as any)

      const mockFindUnique = prisma.conversation.findUnique as jest.MockedFunction<typeof prisma.conversation.findUnique>
      mockFindUnique.mockResolvedValue(incompleteMockConversation as any)

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/conversation/conv_123')
      const params = { id: 'conv_123' }
      const response = await GET(request, { params: Promise.resolve(params) })
      const data = await response.json()

      // 검증
      expect(response.status).toBe(400)
      expect(data.error).toBe('아직 완료되지 않은 대화입니다.')
    })

    it('답변이 부족한 경우 400을 반환해야 함', async () => {
      // Mock 설정
      const incompleteMockConversation = {
        ...mockConversation,
        assignment: {
          ...mockConversation.assignment,
          answers: [mockConversation.assignment.answers[0]]  // 1개 답변만
        }
      }

      const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_1', email: 'test@example.com' }
      } as any)

      const mockFindUnique = prisma.conversation.findUnique as jest.MockedFunction<typeof prisma.conversation.findUnique>
      mockFindUnique.mockResolvedValue(incompleteMockConversation as any)

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/conversation/conv_123')
      const params = { id: 'conv_123' }
      const response = await GET(request, { params: Promise.resolve(params) })
      const data = await response.json()

      // 검증
      expect(response.status).toBe(400)
      expect(data.error).toBe('아직 모든 참여자가 답변하지 않았습니다.')
    })
  })

  describe('응답 데이터 구조', () => {
    it('올바른 응답 구조를 반환해야 함', async () => {
      // Mock 설정
      const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_1', email: 'test@example.com' }
      } as any)

      const mockFindUnique = prisma.conversation.findUnique as jest.MockedFunction<typeof prisma.conversation.findUnique>
      mockFindUnique.mockResolvedValue(mockConversation as any)

      // API 호출
      const request = new NextRequest('http://localhost:3000/api/conversation/conv_123')
      const params = { id: 'conv_123' }
      const response = await GET(request, { params: Promise.resolve(params) })
      const data = await response.json()

      // 응답 구조 검증
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('serviceDay')
      expect(data).toHaveProperty('question')
      expect(data.question).toHaveProperty('id')
      expect(data.question).toHaveProperty('content')
      expect(data.question).toHaveProperty('category')
      expect(data).toHaveProperty('answers')
      expect(Array.isArray(data.answers)).toBe(true)
      expect(data.answers.length).toBe(2)
      expect(data.answers[0]).toHaveProperty('id')
      expect(data.answers[0]).toHaveProperty('content')
      expect(data.answers[0]).toHaveProperty('createdAt')
      expect(data.answers[0]).toHaveProperty('user')
      expect(data).toHaveProperty('createdAt')
      expect(data).toHaveProperty('participants')
      expect(data.participants).toHaveProperty('user1')
      expect(data.participants).toHaveProperty('user2')
    })
  })
})