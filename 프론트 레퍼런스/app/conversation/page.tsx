"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DUMMY_CONVERSATIONS } from "@/lib/dummy-data"

export default function ConversationPage() {
  const router = useRouter()

  useEffect(() => {
    if (DUMMY_CONVERSATIONS.length > 0) {
      const firstConversation = DUMMY_CONVERSATIONS[0]
      router.replace(`/conversation/${firstConversation.id}`)
    } else {
      // If no conversations available, redirect to home
      router.replace("/home")
    }
  }, [router])

  // Show loading while redirecting
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
