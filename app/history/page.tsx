'use client'

import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function HistoryPage() {
  return (
    <div className="min-h-full bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* 페이지 헤더 */}
        <div className="text-center py-4">
          <h1 className="text-xl font-bold text-gray-900">지난 대화</h1>
          <p className="text-sm text-gray-600 mt-1">완료된 대화 기록을 확인해보세요</p>
        </div>

        {/* 빈 상태 - 추후 실제 데이터로 대체 */}
        <Card className="p-6 text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 완료된 대화가 없어요
          </h3>
          <p className="text-sm text-gray-600">
            첫 번째 대화를 완료하면<br />
            여기에 기록이 남게 됩니다
          </p>
        </Card>
      </div>
    </div>
  )
}