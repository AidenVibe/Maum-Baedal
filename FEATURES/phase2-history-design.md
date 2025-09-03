# Phase 2 다중 동반자 히스토리 화면 설계

## 1. 전체 화면 구조

### 헤더 영역
```tsx
// 필터/정렬 컨트롤과 통계 정보
<div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-violet-100 z-10">
  <div className="max-w-md mx-auto px-4 py-3">
    {/* 제목과 통계 */}
    <div className="flex items-center justify-between mb-3">
      <div>
        <h1 className="text-xl font-bold text-violet-600">지난 대화</h1>
        <p className="text-xs text-slate-600">총 {totalCount}개의 대화</p>
      </div>
      <CompanionFilter companions={companions} selectedCompanion={filter} />
    </div>
    
    {/* 동반자별 요약 현황 */}
    <CompanionSummaryBar companions={companionStats} />
  </div>
</div>
```

### 메인 콘텐츠 영역
```tsx
// 날짜별 대화 카드 리스트 (통합뷰)
<div className="space-y-4 px-4 pb-20">
  {conversationsByDate.map(({ date, conversations }) => (
    <DateSection key={date} date={date} conversations={conversations} />
  ))}
</div>
```

## 2. 동반자별 구분 시스템

### 색상 체계 (최대 5-6명 지원)
```tsx
const companionColors = {
  primary: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500' },
  secondary: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', dot: 'bg-pink-500' },
  tertiary: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', dot: 'bg-green-500' },
  quaternary: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500' },
  quinary: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', dot: 'bg-purple-500' },
  senary: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', dot: 'bg-teal-500' }
}
```

### 아이콘/레이블 체계
- **가족 관계 아이콘**: 엄마(👩), 아빠(👨), 형/누나/언니/오빠(👦👧), 동생(🧒)
- **친구/연인 아이콘**: 친구(🤝), 연인(💝), 기타(👤)
- **자동 감지**: 사용자가 설정한 label 기반으로 아이콘 자동 할당

## 3. 날짜별 카드 설계

### 다중 동반자 카드 구조
```tsx
interface MultiCompanionHistoryCard {
  date: string
  conversations: Array<{
    id: string
    companionId: string
    companionLabel: string
    companionColor: CompanionColor
    question: string
    answers: Array<{
      userId: string
      nickname: string
      content: string
      isMyAnswer: boolean
    }>
    status: 'opened' | 'waiting' | 'incomplete'
    completedAt?: string
  }>
}
```

### 카드 레이아웃 패턴

#### Pattern A: 세로 분할 (권장)
```tsx
<Card className="rounded-xl shadow-sm border-violet-100">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-600">{formatDate(date)}</span>
      <div className="flex items-center space-x-1">
        {conversations.map(conv => (
          <div key={conv.companionId} 
               className={`w-3 h-3 rounded-full ${conv.companionColor.dot}`} />
        ))}
      </div>
    </div>
  </CardHeader>
  
  <CardContent className="space-y-4">
    {conversations.map(conversation => (
      <CompanionConversationBlock 
        key={conversation.id}
        conversation={conversation}
        onClick={() => navigateToDetail(conversation.id)}
      />
    ))}
  </CardContent>
</Card>
```

#### Pattern B: 가로 탭 (모바일에는 비권장)
```tsx
// 작은 화면에서는 스크롤 탭으로 동반자별 구분
<div className="flex space-x-2 overflow-x-auto pb-2">
  {conversations.map(conv => (
    <CompanionTab key={conv.companionId} conversation={conv} />
  ))}
</div>
```

## 4. 동반자별 대화 블록 컴포넌트

```tsx
function CompanionConversationBlock({ conversation, onClick }) {
  const { companionColor, status, answers } = conversation
  
  return (
    <div 
      className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-sm
        ${companionColor.bg} ${companionColor.border} border-l-4`}
      onClick={onClick}
    >
      {/* 동반자 식별 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <CompanionAvatar label={conversation.companionLabel} size="sm" />
          <span className={`text-xs font-medium ${companionColor.text}`}>
            {conversation.companionLabel || '동반자'}와의 대화
          </span>
        </div>
        <ConversationStatusBadge status={status} />
      </div>
      
      {/* 질문 */}
      <h4 className="text-sm font-medium text-slate-700 mb-2 line-clamp-2">
        {conversation.question}
      </h4>
      
      {/* 답변 미리보기 */}
      <div className="space-y-1.5">
        {answers.map((answer, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
              ${answer.isMyAnswer ? 'bg-violet-400' : companionColor.dot}`} />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-slate-500">
                {answer.isMyAnswer ? '나' : answer.nickname}
              </span>
              <p className="text-xs text-slate-600 truncate">
                {answer.content}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* 미완료 상태 처리 */}
      {status === 'incomplete' && (
        <IncompleteAnswerActions conversation={conversation} />
      )}
    </div>
  )
}
```

## 5. 미답변 처리 UI/UX 플로우

### 상태별 표시 방식
```tsx
const conversationStatuses = {
  opened: {
    badge: { variant: 'opened', icon: CheckCircle, text: '공개 완료' },
    description: '모든 답변이 공개되었습니다'
  },
  waiting: {
    badge: { variant: 'waiting', icon: Clock, text: '답변 대기' },
    description: '동반자의 답변을 기다리는 중입니다'
  },
  incomplete: {
    badge: { variant: 'destructive', icon: AlertCircle, text: '미완료' },
    description: '아직 답변하지 않은 질문입니다'
  }
}
```

### 미완료 답변 액션 컴포넌트
```tsx
function IncompleteAnswerActions({ conversation }) {
  const [showOptions, setShowOptions] = useState(false)
  
  return (
    <div className="mt-3 p-2 bg-white/50 rounded border border-dashed border-slate-300">
      {!showOptions ? (
        <button 
          onClick={() => setShowOptions(true)}
          className="w-full text-center text-xs text-slate-600 hover:text-violet-600 transition-colors"
        >
          아직 답변하지 않은 질문이에요 • 탭해서 옵션 보기
        </button>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-slate-600 mb-3">
            과거 질문에 지금 답변하시겠어요?
          </div>
          
          <div className="flex space-x-2">
            {/* 광고 시청 후 상대방 답변 보기 */}
            <button 
              onClick={() => handleWatchAdToSeePartnerAnswer(conversation.id)}
              className="flex-1 py-2 px-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700 font-medium hover:bg-yellow-100 transition-colors"
            >
              📺 광고 보고 상대 답변 확인
            </button>
            
            {/* 답변 안 하고 넘어가기 */}
            <button 
              onClick={() => handleSkipAnswer(conversation.id)}
              className="flex-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              답변 안 하기
            </button>
          </div>
          
          {/* 지금 답변하기 */}
          <button 
            onClick={() => handleAnswerNow(conversation.id)}
            className="w-full py-2 px-3 bg-violet-50 border border-violet-200 rounded-md text-xs text-violet-600 font-medium hover:bg-violet-100 transition-colors"
          >
            ✏️ 지금 답변하기
          </button>
        </div>
      )}
    </div>
  )
}
```

## 6. 동반자 필터링 시스템

### 헤더의 필터 컴포넌트
```tsx
function CompanionFilter({ companions, selectedCompanion, onFilter }) {
  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-violet-50 text-violet-600 rounded-md border border-violet-200 hover:bg-violet-100 transition-colors">
            <Filter className="w-3 h-3" />
            <span>{selectedCompanion ? getCompanionLabel(selectedCompanion) : '전체'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            <button 
              onClick={() => onFilter(null)}
              className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-100 ${!selectedCompanion ? 'bg-violet-50 text-violet-600' : ''}`}
            >
              전체 대화
            </button>
            {companions.map(companion => (
              <button 
                key={companion.id}
                onClick={() => onFilter(companion.id)}
                className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-100 flex items-center space-x-2 ${selectedCompanion === companion.id ? 'bg-violet-50 text-violet-600' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full ${companion.color.dot}`} />
                <span>{companion.label || `동반자 ${companion.nickname}`}</span>
                <span className="text-gray-400">({companion.conversationCount})</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

### 동반자별 요약 현황 바
```tsx
function CompanionSummaryBar({ companions }) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-1">
      {companions.map(companion => (
        <div key={companion.id} className="flex-shrink-0 flex items-center space-x-1 px-2 py-1 bg-white rounded-full border border-slate-200">
          <div className={`w-2 h-2 rounded-full ${companion.color.dot}`} />
          <span className="text-xs text-slate-600">{companion.label}</span>
          <span className="text-xs text-slate-400">({companion.stats.completed}/{companion.stats.total})</span>
        </div>
      ))}
    </div>
  )
}
```

## 7. 상세 화면 연결

### 대화 상세 페이지로 이동
```tsx
function handleConversationClick(conversationId: string, companionId: string) {
  // 기존과 동일하지만 동반자 컨텍스트 유지
  router.push(`/conversation/${conversationId}?companion=${companionId}`)
}
```

### 브레드크럼 네비게이션 (상세 페이지)
```tsx
// /conversation/[id] 페이지에서
<div className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
  <button onClick={() => router.back()}>지난 대화</button>
  <ChevronRight className="w-4 h-4" />
  <span>{companionLabel}와의 대화</span>
  <ChevronRight className="w-4 h-4" />
  <span className="text-violet-600">{formatDate(serviceDay)}</span>
</div>
```

## 8. 성능 최적화

### 무한 스크롤 최적화
```tsx
// 동반자별로 독립적인 페이지네이션 커서 관리
interface CompanionPagination {
  [companionId: string]: {
    cursor: string | null
    hasMore: boolean
    loading: boolean
  }
}

// 가상화된 리스트 (대화가 매우 많을 경우)
import { FixedSizeList as List } from 'react-window'
```

### 데이터 캐싱 전략
```tsx
// React Query를 통한 동반자별 캐싱
const useCompanionHistory = (companionId: string | null) => {
  return useInfiniteQuery({
    queryKey: ['history', companionId],
    queryFn: ({ pageParam }) => fetchHistory(companionId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5분 캐싱
  })
}
```

## 9. 접근성 고려사항

### 키보드 네비게이션
```tsx
// Tab 순서: 필터 버튼 → 각 대화 카드 → 액션 버튼들
// Enter/Space: 카드 클릭, 버튼 활성화
// Arrow keys: 필터 옵션 간 이동
```

### 스크린 리더 지원
```tsx
<div 
  role="button"
  aria-label={`${companionLabel}와의 대화, ${question}, ${answers.length}개의 답변`}
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  {/* 카드 내용 */}
</div>
```

## 10. 구현 우선순위

### Phase 2A (필수)
1. ✅ 통합뷰 레이아웃 구현
2. ✅ 동반자별 색상/아이콘 시스템
3. ✅ 다중 동반자 카드 구조
4. ✅ 기본 필터링 기능

### Phase 2B (중요)
1. 🔄 미답변 처리 UI/UX
2. 🔄 광고 시청 플로우
3. 🔄 동반자별 통계 표시
4. 🔄 무한 스크롤 구현

### Phase 2C (향후)
1. ⏳ 고급 필터링 (날짜, 카테고리 등)
2. ⏳ 검색 기능
3. ⏳ 대화 내보내기
4. ⏳ 성과 분석 대시보드