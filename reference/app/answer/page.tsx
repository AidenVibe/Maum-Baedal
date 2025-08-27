"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DUMMY_QUESTIONS } from "@/lib/dummy-data"

export default function AnswerPage() {
  const router = useRouter()
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentQuestion = DUMMY_QUESTIONS[0]

  const handleSubmit = async () => {
    if (answer.trim().length < 2) {
      alert("최소 2자 이상 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Save answer to localStorage for demo
    const answerData = {
      questionId: currentQuestion.id,
      content: answer.trim(),
      answeredAt: new Date().toISOString(),
    }
    localStorage.setItem("myAnswer", JSON.stringify(answerData))

    setIsSubmitting(false)
    router.push("/home")
  }

  const wordCount = answer.length
  const isValid = wordCount >= 2 && wordCount <= 800

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600">
            ← 뒤로
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">내 마음 적기</h1>
          <div className="w-8" />
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                {currentQuestion.category}
              </Badge>
              <span className="text-sm text-orange-600">오늘의 질문</span>
            </div>
            <CardTitle className="text-lg text-orange-700">
              {new Date()
                .toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replace(/\./g, ".")
                .slice(0, -1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-800 leading-relaxed">"{currentQuestion.text}"</p>
          </CardContent>
        </Card>

        {/* Answer Input */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">내 답변</CardTitle>
            <p className="text-sm text-gray-600">솔직하고 진솔한 마음을 전해주세요</p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="내 마음을 전해주세요... (최소 2자, 최대 800자)"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-32 resize-none border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              maxLength={800}
            />
            <div className="flex justify-between items-center mt-3">
              <span
                className={`text-sm ${
                  wordCount > 750 ? "text-orange-600" : wordCount < 2 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {wordCount}/800자
              </span>
              {wordCount < 2 && <span className="text-xs text-red-500">최소 2자 이상 입력해주세요</span>}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          className={`w-full h-14 text-lg ${
            isValid && !isSubmitting ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "전송 중..." : "마음 전달하기"}
        </Button>

        {/* Tips */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">💡</span>
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">작성 팁</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• 구체적인 경험이나 감정을 담아보세요</li>
                  <li>• 가족이 이해하기 쉬운 표현을 사용해보세요</li>
                  <li>• 진솔한 마음이 가장 소중합니다</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
