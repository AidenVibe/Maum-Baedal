"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DUMMY_QUESTIONS } from "@/lib/dummy-data"
import { getCurrentUser, isOnboardingComplete } from "@/lib/auth"

type QuestionState = "initial" | "sent" | "answered" | "completed"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [currentQuestion] = useState(DUMMY_QUESTIONS[0])
  const [questionState, setQuestionState] = useState<QuestionState>("initial")
  const [timeRemaining, setTimeRemaining] = useState("23:45:30")

  useEffect(() => {
    // Check authentication and onboarding
    if (!user) {
      router.push("/login")
      return
    }

    if (!isOnboardingComplete()) {
      router.push("/onboarding")
      return
    }

    // Update time remaining every second
    const timer = setInterval(() => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [user, router])

  const getStepperProgress = () => {
    switch (questionState) {
      case "initial":
        return 33
      case "sent":
      case "answered":
        return 66
      case "completed":
        return 100
      default:
        return 33
    }
  }

  const getStepStatus = (step: number) => {
    switch (questionState) {
      case "initial":
        return step === 1 ? "current" : "pending"
      case "sent":
        return step <= 2 ? (step === 2 ? "current" : "completed") : "pending"
      case "answered":
        return step <= 2 ? "completed" : step === 3 ? "current" : "pending"
      case "completed":
        return "completed"
      default:
        return "pending"
    }
  }

  const handleSendToFamily = () => {
    // This will open the send modal in the next task
    router.push("/send")
  }

  const handleWriteAnswer = () => {
    router.push("/answer")
  }

  const handleViewConversation = () => {
    router.push("/conversation/conv_1")
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">안녕하세요, {user.nickname}님</h1>
            <p className="text-sm text-gray-600">오늘도 마음을 전해보세요</p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => router.push("/settings")}>
            ⚙️
          </Button>
        </div>

        {/* Today's Question Card */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                  {currentQuestion.category}
                </Badge>
                <span className="text-sm text-orange-600 font-medium">오늘의 질문</span>
              </div>
              <div className="text-xs text-orange-600">남은 시간: {timeRemaining}</div>
            </div>
            <CardTitle className="text-lg text-orange-700 mt-2">
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
            <p className="text-lg text-gray-800 mb-4 leading-relaxed">"{currentQuestion.text}"</p>

            {/* Progress Stepper */}
            <div className="mb-6">
              <Progress value={getStepperProgress()} className="h-2 mb-4" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(1) === "completed"
                        ? "bg-green-500 text-white"
                        : getStepStatus(1) === "current"
                          ? "bg-orange-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {getStepStatus(1) === "completed" ? "✓" : "1"}
                  </div>
                  <span
                    className={`text-sm ${
                      getStepStatus(1) === "current" ? "text-orange-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    확인
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(2) === "completed"
                        ? "bg-green-500 text-white"
                        : getStepStatus(2) === "current"
                          ? "bg-orange-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {getStepStatus(2) === "completed" ? "✓" : "2"}
                  </div>
                  <span
                    className={`text-sm ${
                      getStepStatus(2) === "current" ? "text-orange-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    내 답변
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(3) === "completed"
                        ? "bg-green-500 text-white"
                        : getStepStatus(3) === "current"
                          ? "bg-orange-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {getStepStatus(3) === "completed" ? "✓" : "3"}
                  </div>
                  <span
                    className={`text-sm ${
                      getStepStatus(3) === "current" ? "text-orange-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    가족 답변
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic CTA Buttons */}
            <div className="space-y-3">
              {questionState === "initial" && (
                <>
                  <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white" onClick={handleSendToFamily}>
                    가족에게 마음 전하기
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
                    onClick={handleWriteAnswer}
                  >
                    내 마음 적기
                  </Button>
                </>
              )}

              {questionState === "sent" && (
                <>
                  <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-slate-50" onClick={handleWriteAnswer}>
                    내 마음 적기
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-300 text-gray-600 bg-transparent"
                    disabled
                  >
                    가족 답변 대기 중...
                  </Button>
                </>
              )}

              {questionState === "answered" && (
                <>
                  <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-slate-50" onClick={handleViewConversation}>
                    대화 보기
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-300 text-gray-600 bg-transparent"
                    disabled
                  >
                    가족 답변 대기 중...
                  </Button>
                </>
              )}

              {questionState === "completed" && (
                <>
                  <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-slate-50" onClick={handleViewConversation}>
                    대화 보기
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
                    onClick={handleSendToFamily}
                  >
                    다른 가족에게 보내기
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="outline"
            className="h-16 flex-col gap-1 border-purple-200 hover:bg-purple-50 bg-transparent"
            onClick={() => router.push("/history")}
          >
            <span className="text-lg">📚</span>
            <span className="text-sm">지난 대화</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col gap-1 border-green-200 hover:bg-green-50 bg-transparent"
            onClick={() => router.push("/weekly")}
          >
            <span className="text-lg">✨</span>
            <span className="text-sm">주간 하이라이트</span>
          </Button>
        </div>

        {/* State Toggle for Testing */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">개발자 도구 (테스트용)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={questionState === "initial" ? "default" : "outline"}
                onClick={() => setQuestionState("initial")}
              >
                초기
              </Button>
              <Button
                size="sm"
                variant={questionState === "sent" ? "default" : "outline"}
                onClick={() => setQuestionState("sent")}
              >
                전송됨
              </Button>
              <Button
                size="sm"
                variant={questionState === "answered" ? "default" : "outline"}
                onClick={() => setQuestionState("answered")}
              >
                답변함
              </Button>
              <Button
                size="sm"
                variant={questionState === "completed" ? "default" : "outline"}
                onClick={() => setQuestionState("completed")}
              >
                완료
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
