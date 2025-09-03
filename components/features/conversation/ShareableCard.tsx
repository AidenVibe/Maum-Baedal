'use client'

import { ConversationShareData } from '@/lib/share'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface ShareableCardProps {
  conversation: ConversationShareData
  className?: string
}

/**
 * 공유용 이미지 생성을 위한 카드 컴포넌트
 * html2canvas 라이브러리와 함께 사용됩니다.
 */
export function ShareableCard({ conversation, className = '' }: ShareableCardProps) {
  const formattedDate = format(new Date(conversation.serviceDay), 'M월 d일', { locale: ko })
  
  return (
    <div
      id="shareable-card"
      className={`
        w-[1200px] h-[630px] 
        bg-gradient-to-br from-orange-50 via-white to-violet-50
        relative overflow-hidden
        ${className}
      `}
      style={{
        fontFamily: "'Pretendard Variable', 'Pretendard', system-ui, sans-serif"
      }}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-violet-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-300 rounded-full blur-3xl" />
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col justify-between p-16">
        {/* 헤더 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-violet-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">💌</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-violet-600 bg-clip-text text-transparent">
              마음배달
            </h1>
          </div>
          <p className="text-2xl text-gray-600 font-medium">
            {formattedDate}의 대화
          </p>
        </div>
        
        {/* 질문 */}
        <div className="text-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl px-12 py-8 shadow-lg border border-white/20 max-w-4xl mx-auto">
            <p className="text-gray-500 text-xl mb-4 font-medium">오늘의 질문</p>
            <h2 className="text-3xl font-bold text-gray-800 leading-relaxed">
              {conversation.question}
            </h2>
          </div>
        </div>
        
        {/* 답변들 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
            {conversation.answers.map((answer, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg
                    ${index === 0 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400' 
                      : 'bg-gradient-to-r from-violet-500 to-violet-400'
                    }
                  `}>
                    {answer.user.nickname.charAt(0)}
                  </div>
                  <span className="text-xl font-semibold text-gray-700">
                    {answer.user.nickname}
                  </span>
                </div>
                <p className="text-xl text-gray-800 leading-relaxed font-medium">
                  {answer.content}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* 브랜드 정보 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-6 text-lg text-gray-500">
            <span>#마음배달</span>
            <span>#가족대화</span>
            <span>dearq.app</span>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            매일 한 질문으로 가족과 따뜻하게 연결되는 시간
          </div>
        </div>
      </div>
    </div>
  )
}