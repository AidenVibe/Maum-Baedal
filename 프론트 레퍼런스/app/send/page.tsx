"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DUMMY_QUESTIONS, DUMMY_LABELS } from "@/lib/dummy-data"

interface Label {
  id: string
  name: string
  isBlocked: boolean
  lastUsed: string | null
  useCount: number
  status?: "confirmed" | "pending" | "blocked"
}

export default function SendPage() {
  const router = useRouter()
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [showAddFamily, setShowAddFamily] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState("")
  const currentQuestion = DUMMY_QUESTIONS[0]

  // Enhanced dummy labels with status
  const enhancedLabels: Label[] = DUMMY_LABELS.map((label, index) => ({
    ...label,
    status: index === 0 ? "confirmed" : index === 3 ? "blocked" : "pending",
  }))

  // Sort labels: confirmed first, then by recent usage
  const sortedLabels = [...enhancedLabels].sort((a, b) => {
    if (a.status === "confirmed" && b.status !== "confirmed") return -1
    if (b.status === "confirmed" && a.status !== "confirmed") return 1
    if (a.isBlocked && !b.isBlocked) return 1
    if (!a.isBlocked && b.isBlocked) return -1
    if (a.lastUsed && b.lastUsed) {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    }
    return b.useCount - a.useCount
  })

  const handleShare = async () => {
    if (!selectedLabel) return

    if (selectedLabel.isBlocked) {
      alert("이 가족은 수신을 거부한 상태입니다.")
      return
    }

    setIsSharing(true)

    // Generate mock token and sharing URL
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const shareUrl = `${window.location.origin}/r/${token}`

    // Simulate sharing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Save send event for demo
    const sendEvent = {
      id: `send_${Date.now()}`,
      questionId: currentQuestion.id,
      labelId: selectedLabel.id,
      labelName: selectedLabel.name,
      token,
      shareUrl,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
    }
    localStorage.setItem("lastSendEvent", JSON.stringify(sendEvent))

    setIsSharing(false)

    // Show success message and redirect
    alert(`${selectedLabel.name}님에게 마음이 전달되었습니다!\n\n링크: ${shareUrl}`)
    router.push("/home")
  }

  const handleAddFamily = () => {
    if (newFamilyName.trim().length < 1) return

    const newLabel: Label = {
      id: `label_${Date.now()}`,
      name: newFamilyName.trim(),
      isBlocked: false,
      lastUsed: null,
      useCount: 0,
      status: "pending",
    }

    // In real app, this would be saved to backend
    console.log("Adding new family:", newLabel)

    setSelectedLabel(newLabel)
    setNewFamilyName("")
    setShowAddFamily(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600">
            ← 뒤로
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">가족에게 보내기</h1>
          <div className="w-8" />
        </div>

        {/* Question Preview */}
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

        {/* Family Selection */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900">누구에게 마음을 전할까요?</CardTitle>
            <p className="text-sm text-gray-600">가족을 선택해주세요</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedLabels.map((label) => (
              <div
                key={label.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedLabel?.id === label.id
                    ? "border-orange-500 bg-orange-50"
                    : label.isBlocked
                      ? "border-red-200 bg-red-50 opacity-60"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                }`}
                onClick={() => !label.isBlocked && setSelectedLabel(label)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{label.name === "엄마" ? "👩" : label.name === "아빠" ? "👨" : "👤"}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{label.name}</span>
                        {label.status === "confirmed" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            자동 연결
                          </Badge>
                        )}
                        {label.isBlocked && (
                          <Badge variant="destructive" className="text-xs">
                            수신 거부
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {label.lastUsed
                          ? `최근: ${new Date(label.lastUsed).toLocaleDateString("ko-KR")} (${label.useCount}회)`
                          : "아직 대화하지 않음"}
                      </div>
                      {label.status === "confirmed" && <div className="text-xs text-green-600 mt-1">최근: 김○○님</div>}
                    </div>
                  </div>
                  {selectedLabel?.id === label.id && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Family */}
            <div
              className="p-4 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all"
              onClick={() => setShowAddFamily(true)}
            >
              <div className="flex items-center gap-3 text-gray-600">
                <div className="text-2xl">➕</div>
                <span>새 가족 추가</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Button */}
        <Button
          className={`w-full h-14 text-lg ${
            selectedLabel && !selectedLabel.isBlocked && !isSharing
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={handleShare}
          disabled={!selectedLabel || selectedLabel.isBlocked || isSharing}
        >
          {isSharing ? "전송 중..." : "카카오톡으로 보내기"}
        </Button>

        {/* Info */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">💡</span>
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">전송 안내</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• 카카오톡으로 질문 링크가 전송됩니다</li>
                  <li>• 링크는 48시간 후 자동으로 만료됩니다</li>
                  <li>• 답변 완료 시 자동으로 연결됩니다</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Family Modal */}
      <Dialog open={showAddFamily} onOpenChange={setShowAddFamily}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>새 가족 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">가족 이름</label>
              <Input
                placeholder="예: 할머니, 형, 언니..."
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">최대 10자까지 입력 가능합니다</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddFamily(false)}>
                취소
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleAddFamily}
                disabled={newFamilyName.trim().length < 1}
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
