import { Card, CardContent } from "@/components/ui/card"
import type { ConversationDetailResponse } from "@/lib/types"

interface QuestionSectionProps {
  question: ConversationDetailResponse['question']
}

export function QuestionSection({ question }: QuestionSectionProps) {
  return (
    <div className="px-4 pb-6">
      <Card className="bg-gradient-to-br from-orange-50 to-violet-50 border-orange-100">
        <CardContent className="p-6">
          <div className="text-center">
            {/* 질문 아이콘 */}
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-violet-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* 질문 텍스트 */}
            <div className="space-y-3">
              {question.category && (
                <span className="inline-block px-3 py-1 text-xs font-medium bg-white bg-opacity-70 text-gray-600 rounded-full">
                  {question.category}
                </span>
              )}
              
              <p className="text-gray-800 text-lg leading-relaxed font-medium px-2">
                "{question.content}"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}