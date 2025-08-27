"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DUMMY_WEEKLY_HIGHLIGHT } from "@/lib/dummy-data"
import { getCurrentUser } from "@/lib/auth"
import html2canvas from "html2canvas"

export default function WeeklyPage() {
  const router = useRouter()
  const [user] = useState(getCurrentUser())
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const weeklyData = DUMMY_WEEKLY_HIGHLIGHT

  const getWeekDateRange = () => {
    const startDate = new Date(weeklyData.weekStart)
    const endDate = new Date(weeklyData.weekEnd)

    return `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 - ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`
  }

  const handleShareAsImage = async () => {
    if (!cardRef.current) return

    setIsGeneratingImage(true)

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      })

      const imageUrl = canvas.toDataURL("image/png")

      // Create download link
      const link = document.createElement("a")
      link.download = `마음배달_주간하이라이트_${weeklyData.weekStart}.png`
      link.href = imageUrl
      link.click()

      // Also copy to clipboard if supported
      if (navigator.clipboard && canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard
              .write([new ClipboardItem({ "image/png": blob })])
              .then(() => {
                alert("이미지가 클립보드에 복사되었습니다!")
              })
              .catch(() => {
                alert("이미지가 다운로드되었습니다!")
              })
          }
        })
      } else {
        alert("이미지가 다운로드되었습니다!")
      }
    } catch (error) {
      console.error("Image generation failed:", error)
      alert("이미지 생성에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleShareText = () => {
    const shareText = `이번 주 우리 가족 대화 💝

${getWeekDateRange()}

${weeklyData.highlights
  .map(
    (highlight) =>
      `${highlight.labelName}님과의 Best 3 대화:
${highlight.bestConversations.map((conv) => `• ${conv.day}: ${conv.topic}`).join("\n")}`,
  )
  .join("\n\n")}

이번 주 대화 ${weeklyData.conversationCount}회 | 응답률 ${weeklyData.responseRate}%

마음배달에서 더 많은 대화를 나눠보세요!`

    if (navigator.share) {
      navigator.share({
        title: "마음배달 - 이번 주 우리 가족 이야기",
        text: shareText,
        url: window.location.origin,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert("내용이 복사되었습니다!")
    }
  }

  if (!user) {
    router.push("/login")
    return null
  }

  // Check if there are enough conversations
  if (weeklyData.conversationCount < 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-6 max-w-md">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-lg font-semibold text-gray-900">주간 하이라이트</h1>
          </div>

          {/* Empty State */}
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">조금 더 대화해보세요</h3>
              <p className="text-gray-500 mb-4">
                주간 하이라이트는 3회 이상 대화를 나눈 후에 생성됩니다.
                <br />
                현재 이번 주 대화: {weeklyData.conversationCount}회
              </p>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => router.push("/home")}>
                오늘의 질문 보기
              </Button>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">💡</span>
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">주간 하이라이트 안내</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• 매주 일요일 저녁 6시에 자동으로 생성됩니다</li>
                    <li>• 가족별 Best 3 대화를 선별해드려요</li>
                    <li>• 카카오톡이나 SNS로 공유할 수 있어요</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-lg font-semibold text-gray-900">주간 하이라이트</h1>
        </div>

        {/* Shareable Card */}
        <div ref={cardRef} className="mb-6">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
            <CardHeader className="pb-4 text-center">
              <div className="text-3xl mb-2">💝</div>
              <CardTitle className="text-xl text-orange-700 mb-1">이번 주 우리 가족 대화</CardTitle>
              <p className="text-orange-600 text-sm">{getWeekDateRange()}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Family Highlights */}
              {weeklyData.highlights.map((highlight, index) => (
                <Card key={index} className="border-white bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                      <span className="text-2xl">
                        {highlight.labelName === "엄마" ? "👩" : highlight.labelName === "아빠" ? "👨" : "👤"}
                      </span>
                      {highlight.labelName}님과의 Best 3 대화
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {highlight.bestConversations.map((conversation, convIndex) => (
                        <div key={convIndex} className="flex items-start gap-3">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs shrink-0">
                            {conversation.day}
                          </Badge>
                          <p className="text-sm text-gray-700 leading-relaxed">{conversation.topic}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Statistics */}
              <Card className="border-white bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="flex justify-center items-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{weeklyData.conversationCount}</div>
                      <div className="text-xs text-gray-600">이번 주 대화</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{weeklyData.responseRate}%</div>
                      <div className="text-xs text-gray-600">응답률</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center pt-2">
                <p className="text-xs text-orange-600 font-medium">마음배달</p>
                <p className="text-xs text-orange-500">매일 하나의 질문으로 가족의 마음을 배달합니다</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-slate-50"
            onClick={handleShareAsImage}
            disabled={isGeneratingImage}
          >
            {isGeneratingImage ? "이미지 생성 중..." : "이미지로 저장하기"}
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
            onClick={handleShareText}
          >
            카카오톡 공유하기
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="outline"
            className="h-12 border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
            onClick={() => router.push("/history")}
          >
            지난 대화 보기
          </Button>
          <Button
            variant="outline"
            className="h-12 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
            onClick={() => router.push("/home")}
          >
            오늘의 질문
          </Button>
        </div>

        {/* Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">ℹ️</span>
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">주간 하이라이트 안내</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• 매주 일요일 저녁 6시에 자동으로 생성됩니다</li>
                  <li>• 가족과의 소중한 대화를 기록으로 남겨보세요</li>
                  <li>• 이미지나 텍스트로 SNS에 공유할 수 있어요</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Weeks */}
        <Card className="mt-6 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">지난 주 하이라이트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push("/weekly/detail/2025-08-12")}
              >
                <div>
                  <p className="font-medium text-gray-800">8월 12일 - 8월 18일</p>
                  <p className="text-sm text-gray-600">5회 대화 • 응답률 80%</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push("/weekly/detail/2025-08-05")}
              >
                <div>
                  <p className="font-medium text-gray-800">8월 5일 - 8월 11일</p>
                  <p className="text-sm text-gray-600">3회 대화 • 응답률 100%</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
