"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DUMMY_LABELS } from "@/lib/dummy-data"

export default function LabelsPage() {
  const router = useRouter()
  const [labels, setLabels] = useState(DUMMY_LABELS)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<any>(null)
  const [newName, setNewName] = useState("")

  const handleRename = (label: any) => {
    setSelectedLabel(label)
    setNewName(label.name)
    setShowRenameModal(true)
  }

  const handleDelete = (label: any) => {
    if (confirm(`${label.name}님을 삭제하시겠어요? 모든 대화 기록이 함께 삭제됩니다.`)) {
      setLabels(labels.filter((l) => l.id !== label.id))
      alert(`${label.name}님이 삭제되었습니다.`)
    }
  }

  const confirmRename = () => {
    if (newName.trim() && selectedLabel) {
      setLabels(labels.map((l) => (l.id === selectedLabel.id ? { ...l, name: newName.trim() } : l)))
      setShowRenameModal(false)
      alert(`${selectedLabel.name}님이 ${newName.trim()}님으로 변경되었습니다.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600">
            ← 뒤로
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">가족 정보 관리</h1>
          <div className="w-8" />
        </div>

        {/* Labels List */}
        <div className="space-y-4">
          {labels.map((label) => (
            <Card key={label.id} className="border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{label.name === "엄마" ? "👩" : label.name === "아빠" ? "👨" : "👤"}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{label.name}</span>
                        {label.isBlocked && (
                          <Badge variant="destructive" className="text-xs">
                            차단됨
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {label.useCount}회 대화 •{" "}
                        {label.lastUsed ? `최근: ${new Date(label.lastUsed).toLocaleDateString("ko-KR")}` : "대화 없음"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleRename(label)}>
                      이름 변경
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => handleDelete(label)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">💡</span>
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">가족 관리 안내</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• 이름 변경 시 모든 대화 기록에 반영됩니다</li>
                  <li>• 삭제 시 해당 가족과의 모든 대화가 사라집니다</li>
                  <li>• 차단된 가족은 설정에서 해제할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rename Modal */}
      <Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
        <DialogContent className="max-w-sm mx-4 bg-white border-2 border-gray-300 shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900">이름 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-800 mb-3 block">새 이름</label>
              <Input
                placeholder="새로운 이름을 입력하세요"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={10}
                className="h-12 text-base border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
              <p className="text-sm text-gray-600 mt-2">최대 10자까지 입력 가능합니다</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12 text-base font-semibold border-2 border-gray-400 text-gray-700 hover:bg-gray-100 bg-white"
                onClick={() => setShowRenameModal(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1 h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
                onClick={confirmRename}
                disabled={!newName.trim() || newName.trim() === selectedLabel?.name}
              >
                변경
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
