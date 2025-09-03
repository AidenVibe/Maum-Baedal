'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, User, MessageSquare, Heart } from 'lucide-react'
import { toast } from 'sonner'
import type { ShareAssignmentResponse, ShareAnswerSubmitResponse } from '@/lib/types'

export default function ShareAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [assignmentData, setAssignmentData] = useState<ShareAssignmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const assignmentId = params.assignmentId as string

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
  }, [status, router])

  // Assignment 데이터 로드
  useEffect(() => {
    const loadAssignment = async () => {
      if (!session?.user?.id || !assignmentId) return

      try {
        setLoading(true)
        setError('')

        const response = await fetch(`/api/share/${assignmentId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '질문을 불러올 수 없습니다.')
        }

        setAssignmentData(data)
        
        // 이미 답변한 경우 기존 답변으로 설정
        if (data.hasAnswered) {
          setAnswer(data.myAnswer)
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadAssignment()
    }
  }, [session, assignmentId, status])

  // 답변 제출
  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error('답변을 입력해주세요.')
      return
    }

    if (!assignmentData) return

    try {
      setSubmitting(true)

      const response = await fetch(`/api/share/${assignmentId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: answer.trim()
        })
      })

      const data: ShareAnswerSubmitResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '답변 제출에 실패했습니다.')
      }

      // 성공 메시지 표시
      toast.success(data.message)

      // 모드 전환 성공 시 리다이렉트
      if (data.modeTransition && data.redirectUrl) {
        // 잠시 기다린 후 리다이렉트 (사용자가 메시지를 볼 수 있도록)
        setTimeout(() => {
          router.push(data.redirectUrl!)
        }, 2000)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '답변 제출에 실패했습니다.'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // 로딩 상태
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mb-4 text-red-500">
            <MessageSquare className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            질문을 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/today')} variant="outline">
            홈으로 돌아가기
          </Button>
        </Card>
      </div>
    )
  }

  if (!assignmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">마음배달</h1>
          </div>
          <p className="text-gray-600">
            {assignmentData.originalUser.nickname}님이 공유한 질문입니다
          </p>
        </div>

        {/* 동반자 안내 */}
        <Alert>
          <Heart className="w-4 h-4" />
          <AlertDescription>
            {assignmentData.companionshipMessage}
          </AlertDescription>
        </Alert>

        {/* 질문 카드 */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 mb-4">
              <Clock className="w-4 h-4 mr-1" />
              {assignmentData.timeLeft} 남음
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              오늘의 질문
            </h2>
            <p className="text-lg text-gray-800 leading-relaxed">
              {assignmentData.question}
            </p>
          </div>
        </Card>

        {/* 원래 사용자 답변 */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-medium text-gray-900">
              {assignmentData.originalUser.nickname}님의 답변
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed">
              {assignmentData.originalUserAnswer}
            </p>
          </div>
        </Card>

        {/* 내 답변 작성 */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-medium text-gray-900">
              내 답변
            </span>
          </div>
          
          {assignmentData.hasAnswered ? (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✅ 이미 답변을 제출하셨습니다.</p>
              <p className="text-gray-800 mt-2">{assignmentData.myAnswer}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 입력해주세요..."
                className="min-h-[100px] resize-none"
                maxLength={1000}
                disabled={!assignmentData.canAnswer || submitting}
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {answer.length}/1000
                </span>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!assignmentData.canAnswer || !answer.trim() || submitting}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      동반자 되는 중...
                    </>
                  ) : (
                    '답변하고 동반자 되기'
                  )}
                </Button>
              </div>

              {assignmentData.isExpired && (
                <p className="text-sm text-red-600 text-center">
                  ⏰ 답변 시간이 만료되었습니다.
                </p>
              )}
            </div>
          )}
        </Card>

        {/* 하단 안내 */}
        <div className="text-center text-sm text-gray-500">
          <p>답변하시면 {assignmentData.originalUser.nickname}님과 동반자가 되어</p>
          <p>앞으로 함께 매일 대화를 나눌 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}