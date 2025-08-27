'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QuestionCardProps {
  question: string
  swapCount: number
  onSwapQuestion?: () => void
  isSwapDisabled?: boolean
}

export function QuestionCard({ 
  question, 
  swapCount, 
  onSwapQuestion,
  isSwapDisabled = false 
}: QuestionCardProps) {
  const canSwap = swapCount === 0 && !isSwapDisabled

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">오늘의 질문</CardTitle>
          {canSwap && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={onSwapQuestion}
            >
              질문 바꾸기
            </Button>
          )}
        </div>
        {swapCount > 0 && (
          <div className="text-xs text-gray-500">
            질문을 {swapCount}회 교체했습니다
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed">
          {question}
        </p>
      </CardContent>
    </Card>
  )
}