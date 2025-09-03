'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileSetupProps {
  onComplete: (profile: { nickname: string }) => void
  initialData?: { nickname?: string }
}

export function ProfileSetup({ onComplete, initialData }: ProfileSetupProps) {
  const [nickname, setNickname] = useState(initialData?.nickname || '')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요')
      return
    }

    if (nickname.length < 2) {
      setError('닉네임은 2글자 이상 입력해 주세요')
      return
    }

    if (nickname.length > 10) {
      setError('닉네임은 10글자 이하로 입력해 주세요')
      return
    }

    setError('')
    onComplete({
      nickname: nickname.trim()
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          프로필 설정
        </CardTitle>
        <CardDescription className="text-gray-600">
          가족과 나눌 따뜻한 대화를 위해<br/>
          간단한 프로필을 설정해 주세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            닉네임 <span className="text-red-500">*</span>
          </label>
          <Input
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="가족이 부를 이름을 입력해 주세요"
            maxLength={10}
            className="text-base"
          />
          <div className="text-xs text-gray-500">
            2-10글자 사이로 입력해 주세요
          </div>
        </div>


        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={!nickname.trim() || nickname.length < 2}
          className="w-full bg-violet-500 hover:bg-violet-600 h-12 text-base"
          size="lg"
        >
          다음 단계로 →
        </Button>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-8 h-1 bg-violet-500 rounded-full"></div>
            <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
          </div>
          <div className="text-xs mt-2">1/2 프로필 설정</div>
        </div>
      </CardContent>
    </Card>
  )
}