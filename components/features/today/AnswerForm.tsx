'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Save, X, Check } from "lucide-react"
import React, { useState, useMemo, useEffect } from "react"

interface AnswerFormProps {
  initialAnswer?: string | null
  onSubmitAnswer: (answer: string) => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

const MAX_LENGTH = 500

export function AnswerForm({ 
  initialAnswer = "",
  onSubmitAnswer,
  isSubmitting = false,
  isReadOnly = false
}: AnswerFormProps) {
  const [answer, setAnswer] = useState(initialAnswer || "")
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalAnswer, setOriginalAnswer] = useState(initialAnswer || "")
  
  const hasAnswered = initialAnswer && initialAnswer.trim().length > 0
  const currentLength = useMemo(() => answer?.length || 0, [answer])
  
  // initialAnswer 변경 시 상태 업데이트
  useEffect(() => {
    if (initialAnswer !== originalAnswer) {
      setAnswer(initialAnswer || "")
      setOriginalAnswer(initialAnswer || "")
      setIsEditMode(false)
    }
  }, [initialAnswer, originalAnswer])
  
  const characterInfo = useMemo(() => {
    const ratio = currentLength / MAX_LENGTH
    let colorClass = 'text-slate-600'
    
    if (ratio > 0.9) colorClass = 'text-violet-600'
    else if (ratio > 0.8) colorClass = 'text-yellow-600'
    
    return { colorClass, ratio }
  }, [currentLength])

  const handleSubmit = React.useCallback(() => {
    if (answer?.trim()) {
      onSubmitAnswer(answer.trim())
      setOriginalAnswer(answer.trim())
      setIsEditMode(false)
    }
  }, [answer, onSubmitAnswer])

  const handleSave = React.useCallback(() => {
    if (answer?.trim()) {
      onSubmitAnswer(answer.trim())
      setOriginalAnswer(answer.trim())
      setIsEditMode(false)
    }
  }, [answer, onSubmitAnswer])

  const handleCancel = React.useCallback(() => {
    setAnswer(originalAnswer)
    setIsEditMode(false)
  }, [originalAnswer])

  const handleEdit = React.useCallback(() => {
    setIsEditMode(true)
  }, [])

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_LENGTH) {
      setAnswer(value)
    }
  }, [])

  // 답변이 없는 상태에서는 항상 입력 영역을 표시
  // (isReadOnly는 답변 완료 후 편집 제한에만 사용)

  // 미답변 상태: 일반적인 작성 모드
  if (!hasAnswered) {
    return (
      <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-violet-600">
            <span className="w-2 h-2 rounded-full mr-2 bg-[#A78BFA]"></span>
            내 답변
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder={`이곳에 답변을 작성해주세요.
    
한 줄의 짧은 글이어도 괜찮습니다. 
진솔한 마음을 나눠보세요 💝`}
              rows={4}
              className="resize-none border-violet-200 focus:border-violet-400 focus:ring-violet-200"
              value={answer}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              data-ms-editor="false"
              spellCheck={false}
            />
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span></span>
              <span className={`font-medium ${characterInfo.colorClass}`}>
                {currentLength}/{MAX_LENGTH}자
              </span>
            </div>
          </div>
          <Button 
            className="w-full bg-[#A78BFA] active:bg-[#8B5CF6] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !answer?.trim()}
            aria-label={isSubmitting ? "답변 제출 중" : "답변 제출하기"}
          >
            {isSubmitting ? "제출 중..." : "답변 제출하기"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // 답변 완료 상태: 읽기 모드와 수정 모드
  return (
    <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center text-violet-600">
            <span className="w-2 h-2 rounded-full mr-2 bg-[#10B981]"></span>
            내 답변
          </div>
          {!isEditMode && !isSubmitting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-violet-500 active:text-violet-700 active:bg-violet-100 p-2"
              aria-label="답변 수정하기"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditMode ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Textarea
                placeholder="답변을 수정해주세요..."
                rows={4}
                className="resize-none"
                value={answer}
                onChange={handleChange}
                disabled={isSubmitting}
                autoFocus
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                data-ms-editor="false"
                spellCheck={false}
              />
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span></span>
                <span className={`font-medium ${characterInfo.colorClass}`}>
                  {currentLength}/{MAX_LENGTH}자
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={isSubmitting || !answer?.trim() || answer.trim() === originalAnswer.trim()}
                className="flex-1 bg-[#A78BFA] active:bg-[#8B5CF6] text-white disabled:opacity-50 shadow-sm"
                aria-label={isSubmitting ? "저장 중" : "수정 내용 저장하기"}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "저장 중..." : "저장"}
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 border-violet-300 text-violet-600 active:bg-violet-50"
                aria-label="수정 취소하기"
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-violet-100 rounded-lg p-4 border border-violet-200">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{originalAnswer}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-[#10B981] font-medium">
                <Check className="h-4 w-4 mr-1" />
                답변 완료
              </div>
              <span className="text-violet-500 text-xs">
                수정하려면 편집 버튼을 클릭하세요
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}