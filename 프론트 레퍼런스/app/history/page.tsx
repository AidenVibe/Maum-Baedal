"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DUMMY_CONVERSATIONS } from "@/lib/dummy-data"
import { getCurrentUser } from "@/lib/auth"

const CATEGORIES = ["전체", "일상·하루", "추억·과거", "가족·관계", "감사·행복", "취향·취미"]
const FAMILY_FILTERS = ["전체", "엄마", "아빠", "할머니"]
const TIME_FILTERS = ["전체", "이번 주", "이번 달", "3개월"]

export default function HistoryPage() {
  const router = useRouter()
  const [user] = useState(getCurrentUser())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedFamily, setSelectedFamily] = useState("전체")
  const [selectedTime, setSelectedTime] = useState("전체")

  const extendedConversations = [
    ...DUMMY_CONVERSATIONS,
    {
      id: "conv_3",
      questionId: "q_20250822_1",
      questionText: "요즘 가장 기대되는 일은 무엇인가요?",
      senderAnswer: "다음 주에 있을 가족 여행이 정말 기대돼요!",
      receiverAnswer: "새로 시작하는 취미 활동이 기대됩니다.",
      labelName: "할머니",
      createdAt: "2025-08-22T18:00:00Z",
      completedAt: "2025-08-22T20:30:00Z",
    },
    {
      id: "conv_4",
      questionId: "q_20250821_1",
      questionText: "어린 시절 가장 좋아했던 놀이는 무엇인가요?",
      senderAnswer: "친구들과 함께 했던 숨바꼭질이 제일 재미있었어요.",
      receiverAnswer: "딱지치기와 구슬치기를 정말 좋아했어요.",
      labelName: "엄마",
      createdAt: "2025-08-21T19:15:00Z",
      completedAt: "2025-08-21T21:45:00Z",
    },
  ]

  const filteredConversations = useMemo(() => {
    return extendedConversations.filter((conv) => {
      // Search query filter
      if (
        searchQuery &&
        !conv.questionText.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !conv.senderAnswer.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !conv.receiverAnswer.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Category filter
      if (selectedCategory !== "전체") {
        // In real app, this would check conv.category
        // For demo, we'll use a simple mapping
        const categoryMap: { [key: string]: string } = {
          conv_1: "감사·행복",
          conv_2: "배움·호기심",
          conv_3: "미래·꿈·계획",
          conv_4: "추억·과거",
        }
        if (categoryMap[conv.id] !== selectedCategory) {
          return false
        }
      }

      // Family filter
      if (selectedFamily !== "전체" && conv.labelName !== selectedFamily) {
        return false
      }

      // Time filter
      if (selectedTime !== "전체") {
        const convDate = new Date(conv.createdAt)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (selectedTime) {
          case "이번 주":
            if (diffDays > 7) return false
            break
          case "이번 달":
            if (diffDays > 30) return false
            break
          case "3개월":
            if (diffDays > 90) return false
            break
        }
      }

      return true
    })
  }, [searchQuery, selectedCategory, selectedFamily, selectedTime])

  const getFamilyColor = (familyName: string) => {
    const colors: { [key: string]: string } = {
      엄마: "bg-pink-100 text-pink-700 border-pink-200",
      아빠: "bg-blue-100 text-blue-700 border-blue-200",
      할머니: "bg-purple-100 text-purple-700 border-purple-200",
      할아버지: "bg-green-100 text-green-700 border-green-200",
    }
    return colors[familyName] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-lg font-semibold text-gray-900">지난 대화</h1>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="대화 내용을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          {/* Category Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">카테고리</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "border-orange-200 text-orange-600 hover:bg-orange-50"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Family Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">가족</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {FAMILY_FILTERS.map((family) => (
                <Badge
                  key={family}
                  variant={selectedFamily === family ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap ${
                    selectedFamily === family
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "border-purple-200 text-purple-600 hover:bg-purple-50"
                  }`}
                  onClick={() => setSelectedFamily(family)}
                >
                  {family}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">기간</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {TIME_FILTERS.map((time) => (
                <Badge
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap ${
                    selectedTime === time
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">총 {filteredConversations.length}개의 대화</p>
          {(searchQuery || selectedCategory !== "전체" || selectedFamily !== "전체" || selectedTime !== "전체") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:bg-orange-50"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("전체")
                setSelectedFamily("전체")
                setSelectedTime("전체")
              }}
            >
              필터 초기화
            </Button>
          )}
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {filteredConversations.length === 0 ? (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">대화가 없어요</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedCategory !== "전체" || selectedFamily !== "전체" || selectedTime !== "전체"
                    ? "검색 조건에 맞는 대화를 찾을 수 없어요"
                    : "첫 대화를 시작해보세요"}
                </p>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => router.push("/home")}>
                  오늘의 질문 보기
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                onClick={() => router.push(`/history/detail/${conversation.id}`)}
              >
                <CardHeader className="pb-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${getFamilyColor(conversation.labelName)}`}>
                      {conversation.labelName}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-relaxed">{conversation.questionText}</CardTitle>
                </CardHeader>
                <CardContent className="bg-slate-50">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">나:</span> {conversation.senderAnswer.slice(0, 50)}
                      {conversation.senderAnswer.length > 50 && "..."}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{conversation.labelName}:</span>{" "}
                      {conversation.receiverAnswer.slice(0, 50)}
                      {conversation.receiverAnswer.length > 50 && "..."}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        완료
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.completedAt!).toLocaleDateString("ko-KR")} 완료
                      </span>
                    </div>
                    <span className="text-orange-600 text-sm">→</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 border-orange-600 text-orange-600 hover:bg-orange-50 bg-transparent"
              onClick={() => router.push("/home")}
            >
              오늘의 질문
            </Button>
            <Button
              variant="outline"
              className="h-12 border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
              onClick={() => router.push("/weekly")}
            >
              주간 하이라이트
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
