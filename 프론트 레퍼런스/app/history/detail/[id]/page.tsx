"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DUMMY_CONVERSATIONS } from "@/lib/dummy-data"
import { getCurrentUser } from "@/lib/auth"

const REACTIONS = [
  { emoji: "❤️", label: "좋아요" },
  { emoji: "👍", label: "공감해요" },
  { emoji: "😊", label: "기뻐요" },
  { emoji: "👏", label: "박수" },
  { emoji: "🥰", label: "사랑해요" },
]

export default function HistoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [user] = useState(getCurrentUser())
  const [conversation, setConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReactions, setSelectedReactions] = useState<string[]>([])

  useEffect(() => {
    const loadConversation = () => {
      // Extended conversations from history page
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

      const foundConversation = extendedConversations.find((conv) => conv.id === conversationId)

      if (foundConversation) {
        setConversation(foundConversation)
      }
      setLoading(false)
    }

    loadConversation()
  }, [conversationId])

  const handleReaction = (emoji: string) => {
    if (selectedReactions.includes(emoji)) {
      setSelectedReactions(selectedReactions.filter((r) => r !== emoji))
    } else {
      setSelectedReactions([...selectedReactions, emoji])
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">대화를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="text-4xl mb-4">😔</div>
              <p className="text-gray-600 mb-4">대화를 찾을 수 없습니다</p>
              <Button onClick={() => router.push("/history")} className="bg-orange-600 hover:bg-orange-700">
                지난 대화로 돌아가기
              </Button>
            </div>
          </div>
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
          <h1 className="text-lg font-semibold text-gray-900">대화 상세보기</h1>
          <div className="w-8" />
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${getFamilyColor(conversation.labelName)}`}>{conversation.labelName}</Badge>
              <span className="text-xs text-orange-600">
                {new Date(conversation.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-800 leading-relaxed">"{conversation.questionText}"</p>
          </CardContent>
        </Card>

        {/* Conversation */}
        <div className="space-y-4 mb-6">
          {/* My Answer */}
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">나</span>
                <span className="text-xs text-gray-400">
                  {new Date(conversation.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <p className="text-gray-800 leading-relaxed">{conversation.senderAnswer}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Partner Answer */}
          <div className="flex justify-end">
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-2 justify-end">
                <span className="text-xs text-gray-400">
                  {new Date(conversation.completedAt!).toLocaleDateString("ko-KR")}
                </span>
                <span className="text-sm text-gray-600">{conversation.labelName}</span>
              </div>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <p className="text-gray-800 leading-relaxed">{conversation.receiverAnswer}</p>
                  {/* Reactions */}
                  <div className="flex gap-2 mt-3 justify-center flex-wrap">
                    {REACTIONS.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        className={`p-2 rounded-full transition-all ${
                          selectedReactions.includes(reaction.emoji)
                            ? "bg-orange-200 scale-110"
                            : "bg-orange-100 hover:bg-orange-200"
                        }`}
                        onClick={() => handleReaction(reaction.emoji)}
                        title={reaction.label}
                      >
                        <span className="text-lg">{reaction.emoji}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => {
              const shareText = `"${conversation.questionText}"\n\n마음배달에서 더 많은 대화를 나눠보세요!`
              if (navigator.share) {
                navigator.share({
                  title: "마음배달 - 지난 대화",
                  text: shareText,
                  url: window.location.href,
                })
              } else {
                navigator.clipboard.writeText(shareText)
                alert("대화 내용이 복사되었습니다!")
              }
            }}
          >
            대화 공유하기
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-600 bg-transparent"
            onClick={() => router.push("/history")}
          >
            지난 대화로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  )
}
