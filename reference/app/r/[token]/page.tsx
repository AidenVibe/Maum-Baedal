"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DUMMY_QUESTIONS } from "@/lib/dummy-data"
import { getCurrentUser, mockLogin } from "@/lib/auth"

type TokenStatus = "valid" | "expired" | "used" | "invalid"

export default function ReceiverPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [user, setUser] = useState(getCurrentUser())
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("valid")
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMatchingModal, setShowMatchingModal] = useState(false)
  const [senderInfo] = useState({ name: "김민지", relation: "딸" })
  const [isLoading, setIsLoading] = useState(true)
  const currentQuestion = DUMMY_QUESTIONS[0]

  useEffect(() => {
    // Simulate token validation
    const validateToken = () => {
      console.log("[v0] Validating token:", token)

      if (!token || token.length < 10) {
        console.log("[v0] Invalid token - too short")
        setTokenStatus("invalid")
        setIsLoading(false)
        return
      }

      // Check if token was already used
      const usedTokens = JSON.parse(localStorage.getItem("usedTokens") || "[]")
      if (usedTokens.includes(token)) {
        console.log("[v0] Token already used")
        setTokenStatus("used")
        setIsLoading(false)
        return
      }

      // Simulate random token expiration for demo
      if (token.includes("expired")) {
        console.log("[v0] Token expired")
        setTokenStatus("expired")
        setIsLoading(false)
        return
      }

      console.log("[v0] Token is valid")
      setTokenStatus("valid")
      setIsLoading(false)
    }

    setTimeout(validateToken, 500)
  }, [token])

  const handleLogin = async () => {
    try {
      const loggedInUser = await mockLogin()
      setUser(loggedInUser)
    } catch (error) {
      alert("로그인에 실패했습니다. 다시 시도해주세요.")
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }

    if (answer.trim().length < 2) {
      alert("최소 2자 이상 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Save answer and mark token as used
    const answerData = {
      token,
      questionId: currentQuestion.id,
      content: answer.trim(),
      answeredAt: new Date().toISOString(),
      userId: user.id,
    }

    localStorage.setItem(`answer_${token}`, JSON.stringify(answerData))

    // Mark token as used
    const usedTokens = JSON.parse(localStorage.getItem("usedTokens") || "[]")
    usedTokens.push(token)
    localStorage.setItem("usedTokens", JSON.stringify(usedTokens))

    setIsSubmitting(false)

    // Show family matching modal for first-time connections
    setShowMatchingModal(true)
  }

  const handleMatchingConfirm = (confirmed: boolean) => {
    const matchingResult = {
      token,
      confirmed,
      senderInfo,
      confirmedAt: new Date().toISOString(),
    }

    localStorage.setItem(`matching_${token}`, JSON.stringify(matchingResult))

    if (confirmed) {
      // Create conversation and redirect
      const conversationId = `conv_${Date.now()}`
      router.push(`/conversation/${conversationId}`)
    } else {
      // Just show completion message
      alert("답변이 전달되었습니다.")
      router.push("/home")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">💝</div>
              <h2 className="text-lg font-semibold text-orange-700 mb-2">마음배달</h2>
              <p className="text-orange-600 mb-4">질문을 불러오는 중...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">❌</div>
              <h2 className="text-lg font-semibold text-red-700 mb-2">잘못된 링크입니다</h2>
              <p className="text-red-600 mb-4">링크가 올바르지 않습니다. 다시 확인해주세요.</p>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push("/")}>
                홈으로 이동
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (tokenStatus === "expired") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h2 className="text-lg font-semibold text-orange-700 mb-2">링크 유효시간이 지났어요</h2>
              <p className="text-orange-600 mb-4">새 링크를 요청해주세요.</p>
              <div className="space-y-2">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">새 링크 요청</Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/")}>
                  닫기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (tokenStatus === "used") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-lg font-semibold text-green-700 mb-2">이미 답변을 제출했어요</h2>
              <p className="text-green-600 mb-4">대화 화면에서 확인해주세요.</p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/home")}>
                대화로 이동
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Login required
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="text-4xl">💝</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">마음배달</h1>
            <p className="text-gray-600">
              {senderInfo.name}님이 보낸 질문입니다
              <br />
              답변하려면 로그인이 필요해요
            </p>
          </div>

          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                  {currentQuestion.category}
                </Badge>
                <span className="text-sm text-orange-600">받은 질문</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-800 leading-relaxed">"{currentQuestion.text}"</p>
            </CardContent>
          </Card>

          <Button className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700" onClick={handleLogin}>
            카카오 로그인하고 답변하기
          </Button>
        </div>
      </div>
    )
  }

  // Main answer form
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <span className="text-4xl">💝</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{senderInfo.name}님이 보낸 질문입니다</h1>
          <p className="text-gray-600">마음을 담아 답변해주세요</p>
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                {currentQuestion.category}
              </Badge>
              <span className="text-sm text-orange-600">받은 질문</span>
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
                  answer.length > 750 ? "text-orange-600" : answer.length < 2 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {answer.length}/800자
              </span>
              {answer.length < 2 && <span className="text-xs text-red-500">최소 2자 이상 입력해주세요</span>}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          className={`w-full h-14 text-lg ${
            answer.length >= 2 && !isSubmitting ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          disabled={answer.length < 2 || isSubmitting}
        >
          {isSubmitting ? "전송 중..." : "답변 전송"}
        </Button>
      </div>

      {/* Family Matching Modal */}
      <Dialog open={showMatchingModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md mx-4 bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl font-bold text-gray-900">가족 연결 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-2">
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                <strong className="text-orange-600">{senderInfo.name}</strong>님과 연결하시겠어요?
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">연결하시면 앞으로 더 쉽게 대화를 나눌 수 있어요</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12 text-base border-2 border-gray-300 hover:bg-gray-50 font-medium bg-transparent"
                onClick={() => handleMatchingConfirm(false)}
              >
                나중에
              </Button>
              <Button
                className="flex-1 h-12 text-base bg-orange-600 hover:bg-orange-700 font-medium shadow-lg"
                onClick={() => handleMatchingConfirm(true)}
              >
                연결하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
