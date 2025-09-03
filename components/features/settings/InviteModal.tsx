'use client'

import { useState, useEffect } from 'react'
import { Copy, MessageCircle, Link as LinkIcon, Share2, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [inviteCode, setInviteCode] = useState<string>('')
  const [inviteUrl, setInviteUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isKakaoAvailable, setIsKakaoAvailable] = useState(false)

  // 초대 코드 생성
  const generateInviteCode = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/onboarding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInviteCode(data.inviteCode)
        setInviteUrl(`${window.location.origin}/join?code=${data.inviteCode}`)
      } else {
        console.error('초대 코드 생성 실패')
        alert('초대 코드 생성에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('초대 코드 생성 오류:', error)
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsGenerating(false)
    }
  }

  // 카카오톡 SDK 확인
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao) {
      setIsKakaoAvailable(true)
    }
  }, [])

  // 모달이 열렸을 때 초대 코드 생성
  useEffect(() => {
    if (isOpen && !inviteCode && !isGenerating) {
      generateInviteCode()
    }
  }, [isOpen, inviteCode, isGenerating])

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('복사 실패:', error)
      alert('링크 복사에 실패했습니다.')
    }
  }

  // 카카오톡 공유
  const handleKakaoShare = () => {
    if (!window.Kakao || !inviteUrl) {
      alert('카카오톡 공유가 지원되지 않습니다.')
      return
    }

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '🌱 마음배달에 함께 해요!',
        description: '매일 한 질문으로 가족과 따뜻하게 연결되는 시간을 만들어보세요.',
        imageUrl: 'https://dearq.app/images/share-thumbnail.png',
        link: {
          mobileWebUrl: inviteUrl,
          webUrl: inviteUrl,
        },
      },
      buttons: [
        {
          title: '마음배달 시작하기',
          link: {
            mobileWebUrl: inviteUrl,
            webUrl: inviteUrl,
          },
        },
      ],
    })
  }

  // 브라우저 공유 API
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '마음배달 초대',
          text: '매일 한 질문으로 가족과 따뜻하게 연결되는 시간을 만들어보세요.',
          url: inviteUrl,
        })
      } catch (error) {
        console.error('공유 실패:', error)
      }
    } else {
      // 대체: 링크 복사
      handleCopyLink()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            동반자 초대하기
          </DialogTitle>
          <DialogDescription className="text-center">
            가족이나 친구를 초대해서 함께 마음배달을 시작해보세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 초대 링크 */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              초대 링크
            </label>
            
            {isGenerating ? (
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <Loader className="w-5 h-5 animate-spin mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">초대 링크 생성 중...</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input 
                  value={inviteUrl} 
                  readOnly 
                  className="text-sm" 
                  placeholder="초대 링크를 생성하고 있습니다..."
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={!inviteUrl}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  {isCopied ? '복사됨!' : '복사'}
                </Button>
              </div>
            )}

            {inviteCode && (
              <div className="text-center">
                <span className="text-xs text-gray-500">초대 코드: </span>
                <span className="text-sm font-mono font-medium text-orange-600">{inviteCode}</span>
              </div>
            )}
          </div>

          {/* 공유 버튼들 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              공유하기
            </label>
            
            <div className="grid gap-2">
              {/* 카카오톡 공유 */}
              {isKakaoAvailable && (
                <Button
                  onClick={handleKakaoShare}
                  disabled={!inviteUrl}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  카카오톡으로 공유하기
                </Button>
              )}

              {/* 브라우저 공유 또는 링크 복사 */}
              <Button
                variant="outline"
                onClick={handleNativeShare}
                disabled={!inviteUrl}
                className="w-full"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {typeof window !== 'undefined' && typeof navigator?.share === 'function' ? '다른 앱으로 공유하기' : '링크 복사하기'}
              </Button>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>초대 안내:</strong> 링크를 받은 분이 가입하면 자동으로 함께모드로 전환됩니다.
            </p>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onClose} className="w-full">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}