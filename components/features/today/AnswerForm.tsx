'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface AnswerFormProps {
  initialAnswer?: string
  onSubmitAnswer: (answer: string) => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function AnswerForm({ 
  initialAnswer = "",
  onSubmitAnswer,
  isSubmitting = false,
  isReadOnly = false
}: AnswerFormProps) {
  const [answer, setAnswer] = useState(initialAnswer)

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmitAnswer(answer.trim())
    }
  }

  const placeholder = isReadOnly 
    ? "이미 답변을 제출했습니다."
    : `이곳에 답변을 작성해주세요... 
    
한 줄이어도 좋고, 길어도 좋아요. 
진솔한 마음을 나눠보세요 💝`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${
            isReadOnly ? 'bg-green-500' : 'bg-blue-500'
          }`}></span>
          내 답변
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={placeholder}
          rows={4}
          className="resize-none"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isReadOnly || isSubmitting}
        />
        {!isReadOnly && (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={isSubmitting || !answer.trim()}
          >
            {isSubmitting ? "제출 중..." : "답변 제출하기"}
          </Button>
        )}
        {isReadOnly && (
          <div className="text-sm text-green-600 font-medium">
            ✅ 답변이 제출되었습니다
          </div>
        )}
      </CardContent>
    </Card>
  )
}