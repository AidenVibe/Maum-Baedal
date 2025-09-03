'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useShare, ShareOptions } from '@/lib/use-share'
import { ConversationShareData } from '@/lib/share'
import { ShareableCard } from './ShareableCard'
import { 
  Share2, 
  Link, 
  MessageSquare, 
  Image as ImageIcon, 
  Copy, 
  Download,
  Loader2
} from 'lucide-react'

interface ShareDialogProps {
  conversation: ConversationShareData
  trigger?: React.ReactNode
}

export function ShareDialog({ conversation, trigger }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { share, isGeneratingImage } = useShare(conversation, process.env.NEXT_PUBLIC_BASE_URL)
  
  const handleShare = async (options: ShareOptions) => {
    await share(options, 'shareable-card')
    
    // 이미지 공유가 아닌 경우 다이얼로그 닫기
    if (options.type !== 'image' || options.action !== 'share') {
      setIsOpen(false)
    }
  }
  
  const shareOptions = [
    {
      id: 'web-share',
      title: '직접 공유',
      description: '앱으로 바로 공유하기',
      icon: Share2,
      action: () => handleShare({ type: 'text', action: 'share' }),
      primary: true
    },
    {
      id: 'copy-link',
      title: '링크 복사',
      description: '링크를 복사해서 공유',
      icon: Link,
      action: () => handleShare({ type: 'text', action: 'copy' })
    },
    {
      id: 'copy-text',
      title: '텍스트 복사',
      description: '대화 내용을 텍스트로 복사',
      icon: MessageSquare,
      action: () => handleShare({ type: 'text', action: 'copy' })
    },
    {
      id: 'image-share',
      title: '이미지 공유',
      description: '예쁘게 만든 이미지로 공유',
      icon: ImageIcon,
      action: () => handleShare({ type: 'image', action: 'share' }),
      highlight: true
    },
    {
      id: 'image-copy',
      title: '이미지 복사',
      description: '이미지를 클립보드에 복사',
      icon: Copy,
      action: () => handleShare({ type: 'image', action: 'copy' })
    },
    {
      id: 'image-download',
      title: '이미지 저장',
      description: '이미지를 다운로드',
      icon: Download,
      action: () => handleShare({ type: 'image', action: 'download' })
    }
  ]

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Share2 className="w-4 h-4 mr-2" />
      공유
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            대화 공유하기
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            이 소중한 대화를 어떻게 공유할까요?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {shareOptions.map((option) => (
            <Button
              key={option.id}
              variant={option.primary ? "default" : option.highlight ? "secondary" : "outline"}
              className={`h-auto p-4 justify-start text-left ${
                option.highlight ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' : ''
              }`}
              onClick={option.action}
              disabled={isGeneratingImage && option.id.includes('image')}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${
                  option.primary 
                    ? 'bg-white/20' 
                    : option.highlight 
                      ? 'bg-orange-100' 
                      : 'bg-gray-100'
                }`}>
                  {isGeneratingImage && option.id.includes('image') ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <option.icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {option.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {option.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        {/* 숨겨진 공유 카드 */}
        <div className="sr-only">
          <ShareableCard conversation={conversation} />
        </div>
        
        <div className="text-xs text-gray-400 text-center pt-2 border-t">
          공유할 때 개인정보를 확인해주세요
        </div>
      </DialogContent>
    </Dialog>
  )
}