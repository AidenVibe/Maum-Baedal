'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Clock, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface ConversationDetail {
  id: string
  assignmentId: string
  createdAt: string
  isPublic: boolean
  assignment: {
    serviceDay: string
    question: { content: string; category: string }
  }
  answers: {
    id: string
    userId: string
    content: string
    createdAt: string
    user: { nickname: string; label?: string }
  }[]
}

interface ConversationPageProps { params: { id: string } }

export default function ConversationPage({ params }: ConversationPageProps) {
  const router = useRouter()
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/conversation/${params.id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        if (!response.ok) {
          if (response.status === 404) throw new Error('대화를 찾을 수 없습니다')
          if (response.status === 403) throw new Error('접근 권한이 없습니다')
          const errorData = await response.json().catch(() => ({ error: '요청 실패' }))
          throw new Error(errorData.error || '대화를 불러오지 못했습니다')
        }
        const data = await response.json()
        setConversation(data.conversation)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '대화를 불러오지 못했습니다'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConversation()
  }, [params.id])

  const formatAnswerDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'M월 d일 a h:mm', { locale: ko })
    } catch {
      return '날짜 정보 없음'
    }
  }

  const formatServiceDay = (serviceDay: string) => {
    try {
      const date = new Date(`${serviceDay}T00:00:00`)
      return format(date, 'yyyy년 M월 d일 (EEEE)', { locale: ko })
    } catch {
      return serviceDay
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full bg-white p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full bg-white p-4">
        <div className="max-w-md mx-auto space-y-4">
          <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </button>
          <Card className="p-8 text-center bg-red-50 border-red-200">
            <MessageCircle className="h-16 w-16 mx-auto text-red-400 mb-6" />
            <h3 className="text-lg font-semibold text-red-600 mb-3">오류가 발생했습니다</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{error}</p>
            <button onClick={() => router.back()} className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors">
              뒤로가기
            </button>
          </Card>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-full bg-white p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Card className="p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h3 className="text-lg font-semibold text-gray-600 mb-3">대화를 찾을 수 없습니다</h3>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">공개 완료</div>
          </div>
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">{formatServiceDay(conversation.assignment.serviceDay)}</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{conversation.assignment.question.category}</span>
            </div>
            <CardTitle className="text-lg text-gray-800 leading-relaxed">{conversation.assignment.question.content}</CardTitle>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {conversation.answers.map((answer, index) => (
            <Card key={answer.id} className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                    <span className="font-medium text-gray-800">
                      {answer.user.nickname || '익명'}
                      {answer.user.label && ` (${answer.user.label})`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatAnswerDate(answer.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{answer.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center py-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500 mb-2">
            <Heart className="w-4 h-4" />
            <span className="text-sm">소중한 대화가 완성되었어요</span>
          </div>
          <p className="text-xs text-gray-400">게이트 공개: {format(new Date(conversation.createdAt), 'M월 d일 a h:mm', { locale: ko })}</p>
        </div>

        <div className="pb-20"></div>
      </div>
    </div>
  )
}

