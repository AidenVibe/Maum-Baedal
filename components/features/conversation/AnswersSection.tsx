import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import type { ConversationDetailResponse } from "@/lib/types"

interface AnswersSectionProps {
  answers: ConversationDetailResponse['answers']
  participants: ConversationDetailResponse['participants']
}

export function AnswersSection({ answers, participants }: AnswersSectionProps) {
  // 답변을 작성 시간 순으로 정렬 (이미 API에서 정렬되어 있지만 안전하게)
  const sortedAnswers = [...answers].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // 각 답변에 사용할 색상 테마
  const getAnswerTheme = (index: number) => {
    // 첫 번째 답변자는 오렌지, 두 번째는 바이올렛
    return index === 0 
      ? {
          bgGradient: 'from-orange-50 to-orange-100',
          border: 'border-orange-200',
          avatar: 'from-orange-400 to-orange-500',
          badge: 'bg-orange-100 text-orange-700'
        }
      : {
          bgGradient: 'from-violet-50 to-violet-100', 
          border: 'border-violet-200',
          avatar: 'from-violet-400 to-violet-500',
          badge: 'bg-violet-100 text-violet-700'
        }
  }

  return (
    <div className="px-4 space-y-4">
      {/* 섹션 제목 */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">함께한 답변</h2>
        <p className="text-sm text-gray-500">두 사람의 진솔한 이야기</p>
      </div>

      {/* 답변 카드들 */}
      <div className="space-y-4">
        {sortedAnswers.map((answer, index) => {
          const theme = getAnswerTheme(index)
          const createdDate = new Date(answer.createdAt)
          const formattedTime = format(createdDate, 'a h:mm', { locale: ko })
          
          return (
            <Card 
              key={answer.id}
              className={`bg-gradient-to-br ${theme.bgGradient} ${theme.border} shadow-sm`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* 사용자 아바타 */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.avatar} flex-shrink-0 flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-medium text-sm">
                      {answer.user.nickname.charAt(0)}
                    </span>
                  </div>

                  {/* 답변 내용 */}
                  <div className="flex-1 min-w-0">
                    {/* 사용자 정보 헤더 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {answer.user.nickname}
                        </span>
                        {index === 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme.badge}`}>
                            먼저 답변
                          </span>
                        )}
                      </div>
                      <time 
                        dateTime={answer.createdAt}
                        className="text-xs text-gray-500"
                      >
                        {formattedTime}
                      </time>
                    </div>

                    {/* 답변 텍스트 */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-3">
                      <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                        {answer.content}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 대화 완성 메시지 */}
      <div className="text-center mt-6 py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-700 text-sm font-medium">
            대화가 완성되었습니다
          </span>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}