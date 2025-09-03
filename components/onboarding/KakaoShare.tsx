'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { shareToKakao, generateShareLink, isKakaoTalkAvailable } from "@/lib/kakao-sdk"
import { useRouter } from 'next/navigation'

interface KakaoShareProps {
  profile: { nickname: string; bio?: string }
  interests: string[]
  onBack: () => void
}

export function KakaoShare({ profile, interests, onBack }: KakaoShareProps) {
  const [message, setMessage] = useState(`안녕하세요! ${profile.nickname}입니다.\n가족과 따뜻한 대화를 나누는 마음배달에 함께 해요 💕`)
  const [loading, setLoading] = useState(false)
  const [shareCompleted, setShareCompleted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleKakaoShare = async () => {
    setLoading(true)
    setError('')

    try {
      // 1. 백엔드에 프로필과 관심사 저장
      const profileResponse = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: profile.nickname,
          bio: profile.bio,
          interests: interests
        })
      })

      if (!profileResponse.ok) {
        const error = await profileResponse.json()
        throw new Error(error.error || '프로필 저장에 실패했습니다')
      }

      // 2. 공유 링크 생성
      const shareLink = await generateShareLink(message)
      if (!shareLink) {
        throw new Error('공유 링크 생성에 실패했습니다')
      }

      // 3. 카카오톡 공유 실행
      const shareSuccess = await shareToKakao({
        title: '마음배달 초대장이 도착했어요! 💌',
        description: message,
        linkUrl: shareLink.url,
        buttonTitle: '마음배달 시작하기'
      })

      if (shareSuccess) {
        setShareCompleted(true)
        console.log('[ONBOARDING] 카카오 공유 완료:', shareLink.token)
      } else {
        // 카카오톡 공유 실패 시 대안 제공
        setError('카카오톡 공유에 실패했습니다. 링크를 직접 복사해서 전달해 보세요.')
        await handleCopyLink(shareLink.url)
      }

    } catch (error) {
      console.error('[ONBOARDING] 공유 실패:', error)
      setError(error instanceof Error ? error.message : '공유 과정에서 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async (url?: string) => {
    try {
      if (!url) {
        // 링크가 없으면 다시 생성
        const shareLink = await generateShareLink(message)
        if (!shareLink) throw new Error('링크 생성 실패')
        url = shareLink.url
      }

      await navigator.clipboard.writeText(url)
      alert('초대 링크가 복사되었습니다!\n가족에게 카카오톡이나 문자로 전달해 주세요.')
    } catch (error) {
      console.error('[ONBOARDING] 링크 복사 실패:', error)
      setError('링크 복사에 실패했습니다')
    }
  }

  const handleStartWaiting = () => {
    // 온보딩 완료 처리 후 today 페이지로 이동
    router.push('/today?onboarding=completed')
  }

  if (shareCompleted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            초대장 발송 완료!
          </CardTitle>
          <CardDescription className="text-gray-600">
            가족이 초대를 받으면<br/>
            바로 따뜻한 대화를 시작할 수 있어요
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-violet-50 p-4 rounded-lg text-center">
            <div className="text-sm text-violet-700 font-medium mb-2">
              💡 이제 어떻게 해야 하나요?
            </div>
            <div className="text-sm text-violet-600 leading-relaxed">
              가족이 초대 링크를 클릭하고 가입하면<br/>
              자동으로 연결되어 첫 번째 질문이 나타나요!
            </div>
          </div>

          <Button 
            onClick={handleStartWaiting}
            className="w-full bg-violet-500 hover:bg-violet-600 h-12 text-base"
            size="lg"
          >
            가족 연결 기다리기 ⏳
          </Button>

          <Button 
            onClick={() => handleCopyLink()}
            variant="outline"
            className="w-full border-violet-200 hover:bg-violet-50"
          >
            📋 초대 링크 다시 복사하기
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
              <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
              <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
            </div>
            <div className="text-xs mt-2">3/3 초대 완료!</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          가족과 시작하기
        </CardTitle>
        <CardDescription className="text-gray-600">
          카카오톡으로 가족을 초대하고<br/>
          따뜻한 대화를 시작해 보세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            초대 메시지 (개인화 가능)
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={200}
            className="text-sm resize-none"
            placeholder="가족에게 보낼 따뜻한 메시지를 작성해 주세요"
          />
          <div className="text-xs text-gray-500">
            {message.length}/200자
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 text-xl">💬</div>
            <div>
              <div className="text-sm font-medium text-blue-700 mb-1">
                카카오톡으로 초대하기
              </div>
              <div className="text-xs text-blue-600 leading-relaxed">
                가족이 링크를 클릭하면 자동으로 연결되고<br/>
                바로 첫 번째 질문을 받을 수 있어요
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleKakaoShare}
            disabled={loading || !message.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 h-12 text-base font-medium"
            size="lg"
          >
            {loading ? '초대장 준비 중...' : '📱 카카오톡으로 초대하기'}
          </Button>

          <Button 
            onClick={() => handleCopyLink()}
            variant="outline"
            disabled={loading}
            className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            🔗 링크 복사해서 직접 전달하기
          </Button>

          <Button 
            onClick={onBack}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            ← 관심사 다시 선택하기
          </Button>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
            <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
            <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
          </div>
          <div className="text-xs mt-2">3/3 가족 초대</div>
        </div>
      </CardContent>
    </Card>
  )
}