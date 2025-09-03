import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface ConversationDateProps {
  serviceDay: string
}

export function ConversationDate({ serviceDay }: ConversationDateProps) {
  // 서비스 데이를 날짜 객체로 변환
  const serviceDate = new Date(serviceDay + 'T00:00:00.000Z')
  const formattedDate = format(serviceDate, 'yyyy년 M월 d일 EEEE', { locale: ko })
  
  // 오늘인지 확인
  const today = new Date()
  const isToday = serviceDay === today.toISOString().split('T')[0]
  
  // 어제인지 확인
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = serviceDay === yesterday.toISOString().split('T')[0]

  let displayText = formattedDate
  if (isToday) {
    displayText = `오늘 (${format(serviceDate, 'M월 d일', { locale: ko })})`
  } else if (isYesterday) {
    displayText = `어제 (${format(serviceDate, 'M월 d일', { locale: ko })})`
  }

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="text-center">
        <time 
          dateTime={serviceDay}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {displayText}
        </time>
      </div>
    </div>
  )
}