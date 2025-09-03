'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CompanionConversationBlock, { companionColors, type CompanionColor } from './CompanionConversationBlock'
import CompanionFilter, { type CompanionInfo } from './CompanionFilter'
import CompanionSummaryBar from './CompanionSummaryBar'
import DateSection from './DateSection'

// Mock 데이터 for style guide
const mockCompanions: CompanionInfo[] = [
  {
    id: 'comp-mom',
    label: '엄마',
    nickname: '김미영',
    color: 'primary',
    conversationCount: 8,
    stats: { completed: 6, total: 8, waiting: 1, incomplete: 1 }
  },
  {
    id: 'comp-dad', 
    label: '아빠',
    nickname: '김철수',
    color: 'secondary',
    conversationCount: 5,
    stats: { completed: 3, total: 5, waiting: 2, incomplete: 0 }
  },
  {
    id: 'comp-friend',
    label: '친구',
    nickname: '이민지',
    color: 'tertiary', 
    conversationCount: 3,
    stats: { completed: 2, total: 3, waiting: 0, incomplete: 1 }
  }
]

const mockConversations = [
  {
    id: 'conv-1',
    companionId: 'comp-mom',
    companionLabel: '엄마',
    companionNickname: '김미영',
    companionColor: 'primary' as CompanionColor,
    question: '오늘 가장 감사했던 순간은 언제였나요?',
    answers: [
      {
        userId: 'me',
        nickname: '지우',
        content: '엄마가 해주신 미역국이 정말 맛있었어요!',
        isMyAnswer: true
      },
      {
        userId: 'mom',
        nickname: '김미영', 
        content: '딸이 맛있게 먹는 모습을 볼 때가 가장 감사한 순간이었어요.',
        isMyAnswer: false
      }
    ],
    status: 'opened' as const
  },
  {
    id: 'conv-2',
    companionId: 'comp-dad',
    companionLabel: '아빠',
    companionNickname: '김철수',
    companionColor: 'secondary' as CompanionColor,
    question: '오늘 하루 중 가장 기억에 남는 순간은?',
    answers: [
      {
        userId: 'me',
        nickname: '지우',
        content: '아빠와 함께 산책하면서 나눈 대화가 좋았어요.',
        isMyAnswer: true
      }
    ],
    status: 'waiting' as const
  },
  {
    id: 'conv-3',
    companionId: 'comp-friend',
    companionLabel: '친구',
    companionNickname: '이민지',
    companionColor: 'tertiary' as CompanionColor,
    question: '최근에 새로 배운 것이 있다면 무엇인가요?',
    answers: [],
    status: 'incomplete' as const
  }
]

export default function HistoryStyleGuide() {
  return (
    <div className="space-y-8">
      {/* 동반자 색상 시스템 */}
      <Card>
        <CardHeader>
          <CardTitle>동반자 색상 시스템</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(companionColors).map(([key, colors]) => (
            <div key={key} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 w-32">
                <div className={`w-4 h-4 rounded-full ${colors.dot}`} />
                <span className="text-sm font-medium capitalize">{key}</span>
              </div>
              <div className={`px-3 py-1 rounded-md ${colors.bg} ${colors.border} border`}>
                <span className={`text-xs ${colors.text}`}>배경 예시</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 동반자 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>동반자 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <CompanionFilter 
              companions={mockCompanions}
              selectedCompanion={null}
              onFilter={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {/* 동반자별 요약 현황 바 */}
      <Card>
        <CardHeader>
          <CardTitle>동반자별 요약 현황 바</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanionSummaryBar companions={mockCompanions} />
        </CardContent>
      </Card>

      {/* 동반자 대화 블록 - 다양한 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>동반자 대화 블록 상태</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">완료된 대화</h4>
            <CompanionConversationBlock 
              conversation={mockConversations[0]}
              onClick={() => console.log('Clicked completed conversation')}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">답변 대기 중</h4>
            <CompanionConversationBlock 
              conversation={mockConversations[1]}
              onClick={() => console.log('Clicked waiting conversation')}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">미완료 (액션 필요)</h4>
            <CompanionConversationBlock 
              conversation={mockConversations[2]}
              onWatchAd={(id) => console.log('Watch ad:', id)}
              onSkipAnswer={(id) => console.log('Skip answer:', id)}
              onAnswerNow={(id) => console.log('Answer now:', id)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 날짜 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>날짜별 대화 섹션</CardTitle>
        </CardHeader>
        <CardContent>
          <DateSection
            date="2025-01-02"
            conversations={mockConversations}
            onConversationClick={(id) => console.log('Navigate to conversation:', id)}
            onWatchAd={(id) => console.log('Watch ad:', id)}
            onSkipAnswer={(id) => console.log('Skip answer:', id)}
            onAnswerNow={(id) => console.log('Answer now:', id)}
          />
        </CardContent>
      </Card>

      {/* 가족 관계 아이콘 매핑 */}
      <Card>
        <CardHeader>
          <CardTitle>가족 관계 아이콘</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: '엄마', icon: '👩' },
              { label: '아빠', icon: '👨' },
              { label: '형', icon: '👦' },
              { label: '누나', icon: '👧' },
              { label: '동생', icon: '🧒' },
              { label: '친구', icon: '🤝' },
              { label: '연인', icon: '💝' },
              { label: '기타', icon: '👤' }
            ].map(({ label, icon }) => (
              <div key={label} className="flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 사용 가이드라인 */}
      <Card>
        <CardHeader>
          <CardTitle>사용 가이드라인</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h4>색상 체계</h4>
          <ul>
            <li>최대 6명의 동반자까지 고유한 색상으로 구분</li>
            <li>색상은 companion 테이블에서 자동으로 할당됨</li>
            <li>접근성을 위해 충분한 대비비(4.5:1) 유지</li>
          </ul>
          
          <h4>상태별 UI</h4>
          <ul>
            <li><strong>완료(opened):</strong> 녹색 뱃지, 모든 답변 표시</li>
            <li><strong>대기(waiting):</strong> 노란색 뱃지, 내 답변만 표시</li>
            <li><strong>미완료(incomplete):</strong> 빨간색 뱃지, 액션 버튼 제공</li>
          </ul>
          
          <h4>미완료 액션</h4>
          <ul>
            <li><strong>지금 답변하기:</strong> 가장 눈에 띄는 보라색 버튼</li>
            <li><strong>광고 보기:</strong> 노란색 테마로 수익화 강조</li>
            <li><strong>넘어가기:</strong> 회색 테마로 소극적 액션</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}