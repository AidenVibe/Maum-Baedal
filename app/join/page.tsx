'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Users, Heart, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface ShareTokenData {
  shareToken: { id: string; token: string; message: string; expiresAt: string; creator: { nickname: string; label?: string } }
  questionData: { questionId: string; questionContent: string; questionCategory: string; serviceDay: string }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">공유 링크를 확인하는 중...</p>
      </div>
    </div>
  )
}

function JoinPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [shareData, setShareData] = useState<ShareTokenData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 공유 링크입니다')
      setIsLoading(false)
      return
    }
    fetchShareData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchShareData = async () => {
    try {
      const response = await fetch(`/api/share?token=${token}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error((data as any).error || '공유 정보를 불러오지 못했습니다.')
      setShareData(data)
    } catch (err) {
      console.error('Failed to fetch share data:', err)
      setError(err instanceof Error ? err.message : '공유 정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!shareData || !session?.user) return
    setIsJoining(true)
    try {
      // 실제 참여 로직은 API 연동 시 구현
      toast.success('질문에 참여했어요')
      router.push('/today')
    } catch (error) {
      console.error('Join error:', error)
      toast.error('참여 중 오류가 발생했습니다.')
    } finally {
      setIsJoining(false)
    }
  }

  const formatDate = (serviceDay: string) => new Date(serviceDay).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">링크 오류</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                처음으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status !== 'loading' && !session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">마음배달 초대를 받았어요!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shareData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>{shareData.shareToken.creator.nickname}</strong>님의 질문 초대입니다
                  </p>
                  <p className="text-gray-800 font-medium">"{shareData.questionData.questionContent}"</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(shareData.questionData.serviceDay)}의 질문</p>
                </div>
              )}

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">함께 대화하기</p>
                    <p>가족과 함께 질문에 답하고 생각을 나눠보세요</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">동시 공개</p>
                    <p>둘 다 작성하면 동시에 공개돼요</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">매일 새로운 질문</p>
                    <p>매일 쌓이는 따뜻한 기록을 함께 만들어요</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => signIn('kakao')} className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium">
                카카오로 시작하기
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 로그인된 경우 참여 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">질문에 참여하세요</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {shareData && (
              <>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-700">{shareData.shareToken.creator.nickname.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{shareData.shareToken.creator.nickname}님의 초대</p>
                      <p className="text-xs text-gray-600">{formatDate(shareData.questionData.serviceDay)}의 질문</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-gray-800 font-medium leading-relaxed">{shareData.questionData.questionContent}</p>
                  </div>
                  {shareData.shareToken.message && (
                    <p className="text-sm text-gray-700 italic">"{shareData.shareToken.message}"</p>
                  )}
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">참여는 이렇게 진행돼요</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li>오늘의 질문에 답하면 동시에 공개돼요</li>
                    <li>둘 다 작성되면 대화에서 함께 볼 수 있어요</li>
                    <li>이후에도 매일 새로운 질문이 제공돼요</li>
                  </ul>
                </div>

                <Button onClick={handleJoin} disabled={isJoining} className="w-full" size="lg">
                  {isJoining ? '참여 중...' : '질문에 참여하러 가기'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <JoinPageContent />
    </Suspense>
  )
}

