'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'

interface ConnectWithCodeProps {
  onSubmit: (code: string) => void
  onBack: () => void
}

export default function ConnectWithCode({ onSubmit, onBack }: ConnectWithCodeProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      setError('초대코드를 입력해 주세요')
      return
    }

    if (inviteCode.trim().length !== 6) {
      setError('초대코드는 6자리입니다')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      onSubmit(inviteCode.trim().toUpperCase())
    } catch (error: any) {
      setError(error.message || '초대코드 확인 중 오류가 발생했습니다')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 뒤로 가기 */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
        다른 방법 선택하기
      </Button>

      {/* 안내 메시지 */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 2v2H8V2H2v20h20V2h-6zM8 16H4v-2h4v2zm8 0H10v-2h6v2zm2-4H4v-2h14v2zm0-4H4V6h14v2z"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          초대코드 입력
        </h2>
        <p className="text-sm text-gray-600">
          가족이 공유해준 초대코드를 입력해 주세요
        </p>
      </div>

      {/* 초대코드 입력 폼 */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                초대코드 (7자리)
              </label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="예: FAM2024"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase())
                  setError('')
                }}
                maxLength={7}
                className={`text-center text-lg font-mono tracking-wider h-12 ${
                  error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                disabled={isLoading}
                autoComplete="off"
              />
              {error && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,17H11V15H13M13,13H11V7H13"/>
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 h-12 touch-target"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  확인 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  가족과 연결하기
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 도움말 */}
      <div className="space-y-3">
        <div className="p-4 bg-amber-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,17H11V15H13M13,13H11V7H13"/>
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">
                초대코드를 받지 못하셨나요?
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                가족에게 카카오톡이나 다른 메신저로 초대코드를 요청해 보세요. 
                초대코드는 7자리 영문과 숫자로 구성되어 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 테스트용 코드 안내 (개발 모드에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,17H11V15H13M13,13H11V7H13"/>
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  테스트용 초대코드
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed mb-2">
                  개발 환경에서 테스트할 수 있는 코드들:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['FAM2024', 'TEST123', 'DEMO456'].map(code => (
                    <button
                      key={code}
                      onClick={() => setInviteCode(code)}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono hover:bg-blue-200 transition-colors"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}