'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface StartingOptionsProps {
  onSelect: (method: 'alone' | 'with_code') => void
  userName: string
}

export default function StartingOptions({ onSelect, userName }: StartingOptionsProps) {
  return (
    <div className="space-y-4">
      {/* 환영 메시지 */}
      <Card className="border-0 bg-gradient-to-r from-violet-500 to-violet-600 text-white">
        <CardContent className="p-6 text-center">
          <div className="mb-3">
            <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-1">
            반가워요, {userName}님!
          </h2>
          <p className="text-sm opacity-90">
            어떻게 마음배달을 시작하시겠어요?
          </p>
        </CardContent>
      </Card>

      {/* 시작 옵션들 */}
      <div className="space-y-3">
        {/* 혼자 시작하기 */}
        <Card className="border-2 border-transparent active:border-violet-200 transition-colors">
          <CardContent className="p-0">
            <Button
              onClick={() => onSelect('alone')}
              variant="ghost"
              className="w-full h-auto p-6 text-left justify-start active:bg-violet-50 touch-target"
            >
              <div className="flex items-center space-x-4 w-full">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    혼자 시작하기
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    먼저 질문을 확인하고 가족을 초대해보세요
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* 초대코드로 시작하기 */}
        <Card className="border-2 border-transparent active:border-violet-200 transition-colors">
          <CardContent className="p-0">
            <Button
              onClick={() => onSelect('with_code')}
              variant="ghost"
              className="w-full h-auto p-6 text-left justify-start active:bg-violet-50 touch-target"
            >
              <div className="flex items-center space-x-4 w-full">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 2v2H8V2H2v20h20V2h-6zM8 16H4v-2h4v2zm8 0H10v-2h6v2zm2-4H4v-2h14v2zm0-4H4V6h14v2z"/>
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    초대코드로 시작하기
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    가족이 보내준 초대코드가 있나요?
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 도움말 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,17H11V15H13M13,13H11V7H13"/>
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              어떤 차이가 있나요?
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              두 방법 모두 같은 마음배달을 사용합니다. 
              혼자 시작하면 먼저 서비스를 체험하고 가족을 초대할 수 있어요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}