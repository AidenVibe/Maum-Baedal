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

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [user] = useState(getCurrentUser())
  const [conversation, setConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [myAnswer, setMyAnswer] = useState("")
  const [hasMyAnswer, setHasMyAnswer] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedReactions, setSelectedReactions] = useState<string[]>([])
  const [participants, setParticipants] = useState<any[]>([])

  useEffect(() => {
    const loadConversation = () => {
      console.log("[v0] Loading conversation with ID:", conversationId)
      console.log(
        "[v0] Available conversations:",
        DUMMY_CONVERSATIONS.map((c) => c.id),
      )

      const numericId = Number.parseInt(conversationId, 10)
      let foundConversation = DUMMY_CONVERSATIONS.find((conv) => conv.id === numericId)

      if (!foundConversation) {
        console.log("[v0] No exact match found, using first conversation as fallback")
        foundConversation = DUMMY_CONVERSATIONS[0]
      }

      if (foundConversation) {
        console.log("[v0] Using conversation:", foundConversation)
        setConversation(foundConversation)

        const conversationParticipants = [
          {
            id: "me",
            name: "나",
            answer: hasMyAnswer ? myAnswer : null,
            isMe: true,
          },
          {
            id: foundConversation.senderId || "sender",
            name: foundConversation.labelName,
            answer: foundConversation.receiverAnswer,
            isMe: false,
          },
        ]
        setParticipants(conversationParticipants)
        setLoading(false)
      } else {
        console.log("[v0] No conversations available at all")
        setLoading(false)
      }
    }

    setTimeout(() => {
      loadConversation()
    }, 100)
  }, [conversationId, router])

  useEffect(() => {
    if (!conversation) return

    const savedAnswer = localStorage.getItem(`myAnswer_${conversation.id}`)
    if (savedAnswer) {
      const answerData = JSON.parse(savedAnswer)
      setMyAnswer(answerData.content)
      setHasMyAnswer(true)

      setParticipants((prev) => prev.map((p) => (p.isMe ? { ...p, answer: answerData.content } : p)))
    }

    if (conversation.senderAnswer && conversation.receiverAnswer && hasMyAnswer) {
      setTimeout(() => {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 2000)
      }, 500)
    }
  }, [conversation, hasMyAnswer])

  const handleReaction = (emoji: string) => {
    if (selectedReactions.includes(emoji)) {
      setSelectedReactions(selectedReactions.filter((r) => r !== emoji))
    } else {
      setSelectedReactions([...selectedReactions, emoji])
    }
  }

  const handleWriteAnswer = () => {
    router.push(`/answer?conversationId=${conversation.id}`)
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
              <Button onClick={() => router.push("/home")} className="bg-orange-600 hover:bg-orange-700">
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isComplete = hasMyAnswer && conversation.receiverAnswer
  const answeredCount = participants.filter((p) => p.answer).length
  const totalCount = participants.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-lg font-semibold text-gray-900">오늘의 대화</h1>
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                  일상·하루
                </Badge>
                <span className="text-sm text-orange-600">
                  {totalCount}명 참여 · {answeredCount}/{totalCount} 답변 완료
                </span>
              </div>
              <span className="text-xs text-orange-600">
                {new Date(conversation.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-800 leading-relaxed">"{conversation.questionText}"</p>
          </CardContent>
        </Card>

        <Card className="mb-6 border-gray-200 bg-gray-50">
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">참여자 현황</h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${participant.answer ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-700">{participant.name}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      participant.answer ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {participant.answer ? "답변 완료" : "답변 대기"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversation */}
        <div className="space-y-4 mb-6">
          {/* My Answer */}
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">나</span>
                <span className="text-xs text-gray-400">{hasMyAnswer ? "답변 완료" : "답변 대기"}</span>
              </div>
              {hasMyAnswer ? (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <p className="text-gray-800 leading-relaxed">{myAnswer}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-3">먼저 내 마음을 전해보세요</p>
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-slate-50"
                        onClick={handleWriteAnswer}
                      >
                        답변 작성하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Partner Answer */}
          <div className="flex justify-end">
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-2 justify-end">
                <span className="text-xs text-gray-400">{conversation.receiverAnswer ? "답변 완료" : "답변 대기"}</span>
                <span className="text-sm text-gray-600">{conversation.labelName}</span>
              </div>
              {conversation.receiverAnswer ? (
                <Card
                  className={`border-green-200 bg-green-50 ${
                    !hasMyAnswer ? "blur-sm opacity-70" : ""
                  } transition-all duration-500`}
                >
                  <CardContent className="pt-4">
                    {!hasMyAnswer ? (
                      <div className="text-center py-4">
                        <div className="text-2xl mb-2">🔒</div>
                        <p className="text-gray-600 text-sm">먼저 내 마음을 전해주세요</p>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="text-center py-4">
                      <div className="text-2xl mb-2">⏳</div>
                      <p className="text-gray-500">{conversation.labelName}님의 답변을 기다리고 있어요</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg animate-bounce">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-lg font-semibold text-orange-600">서로의 마음이 연결되었어요!</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isComplete && (
            <Button
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => {
                const shareText = `"${conversation.questionText}"\n\n마음배달에서 더 많은 대화를 나눠보세요!`
                if (navigator.share) {
                  navigator.share({
                    title: "마음배달 - 오늘의 대화",
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
          )}

          <Button
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-600 bg-transparent"
            onClick={() => router.push("/home")}
          >
            홈으로 돌아가기
          </Button>
        </div>

        {/* Tips */}
        {!hasMyAnswer && (
          <Card className="mt-6 border-purple-200 bg-purple-50">
            <CardContent className="pt-4">
              <div className="flex gap-3 items-center">
                <span className="text-purple-500 text-xl">💡</span>
                <div>
                  <p className="text-purple-600 text-sm">내 답변을 먼저 작성하면 상대방의 답변을 볼 수 있어요.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
