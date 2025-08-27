"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth"

export default function WeeklyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const weekDate = params.date as string
  const [user] = useState(getCurrentUser())

  // Mock data for past weekly highlights
  const pastWeeklyData = {
    "2025-08-12": {
      weekStart: "2025-08-12",
      weekEnd: "2025-08-18",
      conversationCount: 5,
      responseRate: 80,
      highlights: [
        {
          labelName: "엄마",
          bestConversations: [
            { day: "월요일", topic: "어린 시절 가장 기억에 남는 선생님은?" },
            { day: "수요일", topic: "요즘 가장 관심 있는 뉴스나 이슈는?" },
            { day: "금요일", topic: "스트레스를 받을 때 어떻게 해소하나요?" },
          ],
        },
        {
          labelName: "아빠",
          bestConversations: [
            { day: "화요일", topic: "가장 좋아하는 계절과 그 이유는?" },
            { day: "목요일", topic: "인생에서 가장 뿌듯했던 순간은?" },
            { day: "토요일", topic: "건강을 위해 하고 있는 일이 있나요?" },
          ],
        },
      ],
    },
    "2025-08-05": {
      weekStart: "2025-08-05",
      weekEnd: "2025-08-11",
      conversationCount: 3,
      responseRate: 100,
      highlights: [
        {
          labelName: "할머니",
          bestConversations: [
            { day: "화요일", topic: "젊었을 때 가장 인기 있던 음식은?" },
            { day: "목요일", topic: "손자손녀에게 전하고 싶은 말은?" },
            { day: "일요일", topic: "요즘 가장 즐거운 일상은?" },
          ],
        },
      ],
    },
  }

  const weeklyData = pastWeeklyData[weekDate as keyof typeof pastWeeklyData]

  const getWeekDateRange = () => {
    if (!weeklyData) return ""
    const startDate = new Date(weeklyData.weekStart)
    const endDate = new Date(weeklyData.weekEnd)
    return `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 - ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`
  }

  if (!user) {
    router.push("/login")
    return null
  }

  if (!weeklyData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600">
              ← 뒤로
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">주간 하이라이트</h1>
            <div className="w-8" />
          </div>

          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">하이라이트를 찾을 수 없어요</h3>
              <p className="text-gray-500 mb-4">요청하신 주간 하이라이트가 존재하지 않습니다.</p>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => router.push("/weekly")}>
                주간 하이라이트로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600">
            ← 뒤로
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">주간 하이라이트</h1>
          <div className="w-8" />
        </div>

        {/* Weekly Highlight Card */}
        <Card className="mb-6 border-orange-200 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
          <CardHeader className="pb-4 text-center">
            <div className="text-3xl mb-2">💝</div>
            <CardTitle className="text-xl text-orange-700 mb-1">우리 가족 대화</CardTitle>
            <p className="text-orange-600 text-sm">{getWeekDateRange()}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Family Highlights */}
            {weeklyData.highlights.map((highlight, index) => (
              <Card key={index} className="border-white bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">
                      {highlight.labelName === "엄마"
                        ? "👩"
                        : highlight.labelName === "아빠"
                          ? "👨"
                          : highlight.labelName === "할머니"
                            ? "👵"
                            : "👤"}
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

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => {
              const shareText = `${getWeekDateRange()} 우리 가족 대화 💝

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
                  title: "마음배달 - 주간 하이라이트",
                  text: shareText,
                  url: window.location.origin,
                })
              } else {
                navigator.clipboard.writeText(shareText)
                alert("내용이 복사되었습니다!")
              }
            }}
          >
            공유하기
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-600 bg-transparent"
            onClick={() => router.push("/weekly")}
          >
            주간 하이라이트로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  )
}
