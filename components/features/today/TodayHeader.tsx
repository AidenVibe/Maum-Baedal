'use client'

import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface TodayHeaderProps {
  timeLeft: string
  serviceDay?: string
}

export function TodayHeader({ timeLeft, serviceDay }: TodayHeaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
      <CardContent className="p-4 text-center">
        <div className="text-sm opacity-90">오늘 질문 마감까지</div>
        <div className="text-2xl font-bold">{timeLeft}</div>
        <div className="text-xs opacity-75">
          내일 오전 5시에 새로운 질문이 도착해요
        </div>
        {serviceDay && (
          <div className="text-xs opacity-60 mt-1">
            서비스 데이: {serviceDay}
          </div>
        )}
      </CardContent>
    </Card>
  )
}