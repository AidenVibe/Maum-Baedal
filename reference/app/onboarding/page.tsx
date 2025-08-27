"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const INTEREST_TOPICS = [
  "일상·하루",
  "추억·과거",
  "가족·관계",
  "감사·행복",
  "취향·취미",
  "음식·요리",
  "배움·호기심",
  "계절·날씨·장소",
  "미래·꿈·계획",
  "위로·응원·자기돌봄",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [nickname, setNickname] = useState("")
  const [startMode, setStartMode] = useState<"alone" | "family" | null>(null)
  const [notificationTime, setNotificationTime] = useState<"09:00" | "19:00" | "none" | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  const progress = (currentStep / 4) * 100

  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic))
    } else if (selectedTopics.length < 5) {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      const onboardingData = {
        nickname,
        startMode,
        notificationTime,
        selectedTopics,
        completedAt: new Date().toISOString(),
      }
      localStorage.setItem("onboarding", JSON.stringify(onboardingData))
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "demo-user",
          name: nickname || "사용자",
          nickname: nickname,
          isAuthenticated: true,
          onboardingCompleted: true,
        }),
      )
      router.push("/home")
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return nickname.trim().length >= 2
      case 2:
        return startMode !== null
      case 3:
        return notificationTime !== null
      case 4:
        return selectedTopics.length >= 2
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-4xl">💝</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">마음배달</h1>
          <p className="text-gray-600">간단한 설정으로 시작해보세요</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>단계 {currentStep}/4</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Nickname Input */}
        {currentStep === 1 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-900">닉네임을 입력해주세요</CardTitle>
              <p className="text-sm text-gray-600 text-center">가족들이 부를 이름을 알려주세요</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="예: 엄마, 아빠, 민수, 지영..."
                  className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg bg-white/80 backdrop-blur-sm"
                  maxLength={10}
                />
                <p className="text-sm text-gray-500 text-right">{nickname.length}/10</p>
              </div>
              {nickname.trim().length > 0 && nickname.trim().length < 2 && (
                <p className="text-sm text-red-500 text-center">닉네임은 2글자 이상 입력해주세요</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Start Mode */}
        {currentStep === 2 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-900">어떻게 시작해볼까요?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant={startMode === "alone" ? "default" : "outline"}
                className={`w-full h-16 text-left justify-start ${
                  startMode === "alone"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-white/50 border-gray-200 hover:bg-white/80 text-gray-900"
                }`}
                onClick={() => setStartMode("alone")}
              >
                <div>
                  <div className="font-semibold">혼자 시작하기</div>
                  <div className="text-sm opacity-80">먼저 질문에 답해보고 나중에 가족과 공유</div>
                </div>
              </Button>

              <Button
                variant={startMode === "family" ? "default" : "outline"}
                className={`w-full h-16 text-left justify-start ${
                  startMode === "family"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-white/50 border-gray-200 hover:bg-white/80 text-gray-900"
                }`}
                onClick={() => setStartMode("family")}
              >
                <div>
                  <div className="font-semibold">가족과 함께 하기</div>
                  <div className="text-sm opacity-80">바로 가족과 함께 질문을 주고받기</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Notification Time */}
        {currentStep === 3 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-900">알림 시간을 선택해주세요</CardTitle>
              <p className="text-sm text-gray-600 text-center">매일 새로운 질문을 받을 시간이에요</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant={notificationTime === "09:00" ? "default" : "outline"}
                className={`w-full h-14 ${
                  notificationTime === "09:00"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-white/50 border-gray-200 hover:bg-white/80 text-gray-900"
                }`}
                onClick={() => setNotificationTime("09:00")}
              >
                <span className="mr-2">🌅</span>
                오전 9시
              </Button>

              <Button
                variant={notificationTime === "19:00" ? "default" : "outline"}
                className={`w-full h-14 ${
                  notificationTime === "19:00"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-white/50 border-gray-200 hover:bg-white/80 text-gray-900"
                }`}
                onClick={() => setNotificationTime("19:00")}
              >
                <span className="mr-2">🌆</span>
                저녁 7시
              </Button>

              <Button
                variant={notificationTime === "none" ? "default" : "outline"}
                className={`w-full h-14 ${
                  notificationTime === "none"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-white/50 border-gray-200 hover:bg-white/80 text-gray-900"
                }`}
                onClick={() => setNotificationTime("none")}
              >
                <span className="mr-2">🔕</span>
                알림 받지 않기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Interest Topics */}
        {currentStep === 4 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-900">관심 주제를 선택해주세요</CardTitle>
              <p className="text-sm text-gray-600 text-center">어떤 주제로 대화를 나누고 싶으신가요? (2개~5개)</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {INTEREST_TOPICS.map((topic) => (
                  <Badge
                    key={topic}
                    variant={selectedTopics.includes(topic) ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                      selectedTopics.includes(topic)
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-white/50 border-gray-200 hover:bg-white/80 text-gray-900"
                    }`}
                    onClick={() => handleTopicToggle(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">선택됨: {selectedTopics.length}/5</p>{" "}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <Button
              variant="outline"
              className="flex-1 h-14 bg-white/50 border-gray-200 hover:bg-white/80 text-gray-900"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              이전
            </Button>
          )}
          <Button
            className={`flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white ${
              !canProceed() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === 4 ? "시작하기" : "다음"}
          </Button>
        </div>
      </div>
    </div>
  )
}
