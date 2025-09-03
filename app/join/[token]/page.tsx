'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Users, Clock } from 'lucide-react'

interface ShareLinkInfo {
  valid: boolean
  creator: {
    nickname: string
    bio?: string
  }
  message?: string
  question?: {
    content: string
    category: string
  }
  expiresAt: string
}

export default function JoinSharePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [shareInfo, setShareInfo] = useState<ShareLinkInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  
  const token = params.token as string

  // 공유 링크 정보 로드
  useEffect(() => {
    const fetchShareInfo = async () => {
      try {
        const response = await fetch(`/api/share/join/${token}`)
        const data = await response.json()
        
        if (!response.ok) {
          setError(data.error || '링크 정보를 불러올 수 없습니다')
          return
        }
        
        setShareInfo(data)
      } catch (err) {
        setError('네트워크 오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }
    
    if (token) {
      fetchShareInfo()
    }
  }, [token])

  // 로그인 후 자동 참여 처리
  useEffect(() => {
    if (session && shareInfo?.valid && !joining) {
      handleJoin()
    }
  }, [session, shareInfo])

  const handleJoin = async () => {
    if (!session) {
      // 로그인하지 않은 경우 카카오 로그인 유도
      signIn('kakao', { 
        callbackUrl: `/join/${token}`
      })
      return
    }

    setJoining(true)
    try {
      const response = await fetch(`/api/share/join/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '참여 처리 중 오류가 발생했습니다')
        return
      }

      // 성공 시 today 페이지로 이동
      router.push('/today')
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !shareInfo?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            링크에 문제가 있어요
          </h1>
          <p className="text-gray-600 mb-6">
            {error || '유효하지 않거나 만료된 링크입니다'}
          </p>
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            홈으로 가기
          </Button>
        </div>
      </div>
    )
  }

  const expiresAt = new Date(shareInfo.expiresAt)
  const timeLeft = Math.max(0, expiresAt.getTime() - Date.now())
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            마음배달 초대
          </h1>
          <p className="text-gray-600">
            따뜻한 가족 대화가 기다리고 있어요
          </p>
        </div>

        {/* 초대자 정보 */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {shareInfo.creator.nickname?.[0] || '?'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {shareInfo.creator.nickname || '누군가'}님
              </h3>
              {shareInfo.creator.bio && (
                <p className="text-sm text-gray-600">
                  {shareInfo.creator.bio}
                </p>
              )}
            </div>
          </div>
          
          {shareInfo.message && (
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-gray-800 text-sm">
                "{shareInfo.message}"
              </p>
            </div>
          )}
        </div>

        {/* 오늘의 질문 */}
        {shareInfo.question && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">
                오늘의 질문
              </span>
            </div>
            <p className="font-medium leading-relaxed">
              {shareInfo.question.content}
            </p>
          </div>
        )}

        {/* 만료 시간 */}
        {hoursLeft > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6 bg-amber-50 rounded-lg p-3">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              이 초대는 <span className="font-semibold text-amber-700">{hoursLeft}시간</span> 후 만료돼요
            </span>
          </div>
        )}

        {/* 참여 버튼 */}
        <div className="space-y-4">
          <Button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
          >
            {joining ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>참여 처리 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>
                  {session ? '함께 시작하기' : '카카오로 시작하기'}
                </span>
              </div>
            )}
          </Button>

          {!session && (
            <p className="text-xs text-gray-500 text-center">
              카카오 로그인으로 간편하게 참여하세요
            </p>
          )}
        </div>

        {/* 서비스 소개 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-center">
            마음배달이란?
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>매일 새로운 질문으로 가족과 대화</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>서로 답하면 바로 공개되는 공정한 시스템</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>소중한 추억을 차곡차곡 기록</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}