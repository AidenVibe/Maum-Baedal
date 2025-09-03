# Phase 2 Enhanced History Page ✅ **구현 완료** + 다중 동반자 지원

**마음배달** - Phase 2 다중 동반자 지원 히스토리 페이지  
**구현 파일**: `app/history/page.tsx` ✅ **Phase 2 다중 동반자 UI 완성**  
**API 연동**: `app/api/history/route.ts` ✅ **다중 동반자 데이터 지원**  
**Phase 2 완료**: 2025년 1월 ✅ (다중 동반자 히스토리 베타 준비)

## Phase 2 업데이트 (2025-08-30)

### 🚀 다중 동반자 히스토리 시스템
**핵심 가치**: "한 화면에서 모든 가족과의 대화 히스토리 확인"

#### 1. 통합 히스토리 뷰 설계
- **날짜별 카드**: 하루에 여러 동반자와의 대화를 한 카드에 표시
- **동반자별 색상 구분**: 6명까지 고유 색상으로 시각적 구분
- **상태 표시 시스템**: 완료/대기/미완료 상태를 아이콘과 색상으로 표시
- **가족 관계 아이콘**: 👩엄마, 👨아빠, 👶자녀, 🧓할머니 등 직관적 표시

#### 2. 과거 미답변 접근 시스템
- **3단계 옵션 모달**: "지금 답변하기" → "광고 시청" → "답변 안 하기"
- **멱등성 보장**: 중복 답변 방지, 안전한 상태 관리
- **수익화 연계**: 광고 시청 후 무료 답변 기회 제공
- **늦은 답변 표시**: isLate 플래그로 시간 초과 답변 구분

#### 3. 다중 동반자 UI 컴포넌트
```typescript
// 날짜별 통합 히스토리 카드
interface MultiCompanionHistoryCard {
  date: string
  question: string
  conversations: {
    companionId: string
    companionName: string        // "엄마", "아빠" 등 별명
    companionColor: string       // 동반자별 테마 색상
    relationshipIcon: string     // 👩, 👨, 👶 등
    myAnswer?: string
    partnerAnswer?: string
    status: 'completed' | 'waiting_me' | 'waiting_partner' | 'incomplete'
    isLate?: boolean            // 늦은 답변 여부
  }[]
}
```

### 🎨 Phase 2 UI/UX 개선사항

#### 1. 색상 체계 확장
- **Primary (빨강)**: 👩 엄마 - `bg-red-50 border-red-200 text-red-800`
- **Secondary (파랑)**: 👨 아빠 - `bg-blue-50 border-blue-200 text-blue-800`
- **Tertiary (초록)**: 👶 자녀 - `bg-green-50 border-green-200 text-green-800`
- **Quaternary (노랑)**: 🧓 할머니 - `bg-yellow-50 border-yellow-200 text-yellow-800`
- **Quinary (보라)**: 👴 할아버지 - `bg-purple-50 border-purple-200 text-purple-800`
- **Senary (분홍)**: 👫 기타 - `bg-pink-50 border-pink-200 text-pink-800`

#### 2. 상태별 시각적 표시
- **완료 상태**: 초록 체크 ✅ + 두 답변 모두 표시
- **내 차례**: 파랑 알림 🔔 + "내 답변 기다리는 중"
- **상대 차례**: 회색 시계 ⏱️ + "상대방 답변 기다리는 중"
- **미완료**: 빨강 느낌표 ❗ + "놓친 대화" (클릭 시 3단계 옵션)
- **늦은 답변**: 노랑 시계 ⏰ + "늦은 답변" 표시

#### 3. 모바일 최적화 레이아웃
```typescript
// 모바일 퍼스트 히스토리 카드
<Card className="w-full max-w-md mx-auto mb-4">
  <CardHeader className="pb-2">
    <div className="flex justify-between items-center">
      <h3 className="font-semibold">{formatServiceDay(date)}</h3>
      <Badge variant="outline">{conversations.length}명</Badge>
    </div>
    <p className="text-sm text-muted-foreground truncate">{question}</p>
  </CardHeader>
  
  <CardContent className="space-y-3">
    {conversations.map(conv => (
      <div key={conv.companionId} className={`p-3 rounded-lg ${conv.companionColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center space-x-2">
            <span className="text-lg">{conv.relationshipIcon}</span>
            <span className="font-medium">{conv.companionName}</span>
          </span>
          <ConversationStatusBadge status={conv.status} isLate={conv.isLate} />
        </div>
        
        {conv.status === 'completed' ? (
          <div className="space-y-2 text-sm">
            <div className="bg-white/50 p-2 rounded">
              <span className="text-xs text-muted-foreground">내 답변</span>
              <p className="truncate">{conv.myAnswer}</p>
            </div>
            <div className="bg-white/50 p-2 rounded">
              <span className="text-xs text-muted-foreground">{conv.companionName}의 답변</span>
              <p className="truncate">{conv.partnerAnswer}</p>
            </div>
          </div>
        ) : conv.status === 'incomplete' ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => openRetroactiveModal(conv)}
            className="w-full"
          >
            놓친 대화에 참여하기
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            {getStatusMessage(conv.status, conv.companionName)}
          </p>
        )}
      </div>
    ))}
  </CardContent>
</Card>
```

## 변경 로그 (2025-08-30)
- **Phase 2 다중 동반자 히스토리 시스템 설계**
  - **통합 뷰**: 날짜별 카드에 여러 동반자 대화 통합 표시
  - **색상 체계**: 6명 동반자별 고유 색상 및 관계 아이콘 매핑
  - **과거 미답변**: 3단계 옵션으로 놓친 대화 참여 시스템
  - **상태 관리**: 완료/대기/미완료 상태별 시각적 구분
- **테스트 시스템 통합 및 개발도구 개선 (v0.8.3)**
  - **테스트 페이지 통합**: TestScenarioDropdown 컴포넌트로 History 페이지도 통합 테스트 시스템 적용
  - **개발자 경험 개선**: 기존 URL 파라미터 방식에서 드롭다운 선택으로 UX 혁신
  - **테스트 시나리오 구성**: History 페이지 전용 테스트 시나리오 준비 (API 연동 완료 후 활성화)
- **사용자 인터페이스 용어 통일**: solo/companion → 혼자모드/함께모드
  - History 페이지의 모든 사용자 메시지와 라벨을 한국어 용어로 통일
  - "Solo", "Companion" → "혼자모드", "함께모드"로 표기 통일
  - 개발 코드는 영어 유지, 사용자 노출 텍스트만 한국어 적용

## 1. 목표/배경 (Why)

### 사용자 가치
- **추억 탐색**: 지난 대화들을 시간순으로 쉽게 찾아볼 수 있음
- **성취감 제공**: 쌓인 대화의 양을 시각적으로 확인하여 대화 지속 동기 부여
- **맥락 파악**: 동반자 관계의 발전 과정과 대화 패턴을 파악할 수 있음
- **재발견의 즐거움**: 오래된 대화를 다시 읽으며 당시 감정과 상황을 회상
- **Solo 기록 포함**: 혼자 답변한 내용도 함께 보관되어 개인 성장 추적 가능

### 비즈니스 가치
- **사용자 유지**: 과거 대화 열람으로 앱 재방문 빈도 증가
- **데이터 활용**: 축적된 대화 데이터의 가치를 사용자에게 되돌려줌
- **질문 품질 개선**: 답변률이 높았던 질문 패턴 분석 가능
- **사용자 만족도**: 완성도 있는 경험 제공으로 브랜드 신뢰도 향상

### 현재 문제점
- ✅ Today 페이지에서는 당일 대화만 확인 가능
- ❌ 완료된 대화들에 접근할 방법이 없음
- ❌ 대화 지속 성취감을 느낄 수 없음
- ❌ 특정 대화를 다시 찾기 어려움

## 2. 성공 기준 (Acceptance Criteria)

### 2.1 핵심 기능 요구사항

**대화 목록 표시**
- [ ] 완료된 대화(Conversation)들을 시간 역순으로 표시
- [ ] 각 대화 카드에는 다음 정보 포함:
  - 대화 날짜 (서비스 데이)
  - 질문 제목 (첫 20자까지 + ...)
  - 두 답변의 미리보기 (각각 첫 30자까지)
  - 답변자 구분 (사용자/파트너 레이블)
- [ ] 카드 클릭 시 대화 상세 페이지(`/conversation/[id]`)로 이동
- [ ] 모바일 최적화된 카드 레이아웃 (터치 친화적)

**페이지네이션**
- [ ] 초기 로드 시 20개 대화 표시
- [ ] "더 보기" 버튼 클릭으로 추가 20개씩 로드
- [ ] 스크롤 기반 무한 로딩 옵션 고려
- [ ] 로딩 상태 표시 (스켈레톤 UI)

**기본 검색/필터**
- [ ] 상단 검색바에서 질문/답변 내용 텍스트 검색
- [ ] 날짜 범위 필터 (지난 7일, 1개월, 3개월, 전체)
- [ ] 검색 결과 하이라이팅
- [ ] 검색어/필터 상태 표시 및 초기화

**빈 상태 처리**
- [ ] 대화 없음: "아직 완료된 대화가 없어요" + Today 페이지 이동 버튼
- [ ] 검색 결과 없음: "검색 결과가 없어요" + 검색어 수정 안내
- [ ] 첫 대화 완료 축하: "첫 번째 대화 완료!" 축하 메시지

### 2.2 UI/UX 요구사항

**네비게이션**
- [ ] 상단 헤더: "대화 히스토리" 제목 + 검색 아이콘
- [ ] 하단 네비게이션에서 History 탭 활성화 표시
- [ ] 뒤로가기 버튼으로 Today 페이지 이동

**시각적 표현**
- [ ] 대화 완료 날짜별 그룹핑 (예: "8월 27일", "8월 26일")
- [ ] 최근 완료된 대화는 "NEW" 뱃지 표시 (24시간 이내)
- [ ] 읽지 않은 대화 표시 (아직 상세 페이지 미방문)
- [ ] 스크롤 위치 기억 (페이지 재방문 시)

**성능 요구사항**
- [ ] 초기 로드 시간 2초 이하
- [ ] 추가 로드 시간 1초 이하
- [ ] 검색 응답 시간 500ms 이하
- [ ] 모바일에서 스크롤 성능 60fps 유지

### 2.3 접근성 요구사항

**키보드 네비게이션**
- [ ] Tab키로 모든 대화 카드 순회 가능
- [ ] Enter키로 대화 상세 페이지 진입
- [ ] 검색바 포커스 및 Enter키 검색
- [ ] Escape키로 검색 초기화

**스크린 리더 지원**
- [ ] 각 대화 카드에 적절한 aria-label
- [ ] 검색 결과 수 및 필터 상태 음성 안내
- [ ] 로딩 상태 및 완료 상태 안내
- [ ] 빈 상태 메시지 명확한 안내

## 3. 에러/엣지 케이스

### 3.1 데이터 관련 케이스

**대화 없음**
- 신규 가입자: 친근한 안내 + Today 페이지 이동 유도
- 쌍 연결 후 대화 미완료: 진행 중인 대화 안내

**대화 데이터 불완전**
- 질문 삭제됨: "질문을 불러올 수 없어요" + 날짜/ID로 구분
- 답변 누락: "대화 내용이 불완전해요" + 관리자 문의 안내
- 사용자 정보 없음: 익명화된 레이블 표시 ("참여자 A", "참여자 B")

**권한 관련**
- 로그인 만료: 자동 로그인 페이지 리다이렉트
- 동반자 연결 해제됨: Solo Mode 답변은 유지, 동반자 답변은 익명 처리
- 삭제된 계정: 해당 동반자 정보 익명화 처리

### 3.2 네트워크/성능 케이스

**로딩 실패**
- 초기 로드 실패: 재시도 버튼 + 오프라인 안내
- 추가 로드 실패: 토스트 알림 + 재시도 옵션
- 검색 실패: 검색창 에러 상태 + 재시도

**느린 네트워크**
- 초기 로드 지연: 스켈레톤 UI 3초 이상 표시
- 이미지 로드 실패: 기본 아바타 대체
- 타임아웃: 15초 후 에러 메시지 표시

**메모리 제한**
- 무한 스크롤 최대 제한: 500개 대화 로드 후 페이지네이션 전환
- 검색 결과 제한: 최대 100개 결과 + "더 구체적인 검색어" 안내

### 3.3 사용자 행동 케이스

**검색 관련**
- 빈 검색어: 검색 실행 방지 + 안내 메시지
- 특수문자 검색: 이스케이프 처리 + SQL 인젝션 방지
- 너무 일반적 검색어 ("나", "좋아"): 결과 수 제한 + 구체화 권장

**필터 조합**
- 날짜 범위 + 검색어 조합: 두 조건 모두 만족하는 결과만 표시
- 결과 없는 필터: "이 조건에 맞는 대화가 없어요" + 필터 수정 제안

## 4. 설계 (How)

### 4.1 페이지 구조

```
/history
├── HistoryHeader           # 제목 + 검색 토글
├── HistorySearch           # 검색바 + 필터 (접힘/펼침)
├── HistoryStats            # 총 대화 수, 완료 기간 등 (선택적)
├── ConversationList        # 대화 목록 컨테이너
│   ├── ConversationGroup   # 날짜별 그룹 (예: "8월 27일")
│   │   └── ConversationCard[]  # 대화 카드들
│   └── LoadMoreButton      # 추가 로드 버튼
├── EmptyState             # 빈 상태 UI
└── MobileBottomNavigation  # 하단 네비게이션
```

### 4.2 주요 컴포넌트 설계

**ConversationCard.tsx**
```typescript
interface ConversationCardProps {
  conversation: {
    id: string
    openedAt: Date
    assignment: {
      serviceDay: string
      question: { content: string }
    }
    answers: {
      userId: string
      content: string
      user: { nickname: string, label?: string }
    }[]
  }
  isNew?: boolean
  isUnread?: boolean
  onCardClick: (conversationId: string) => void
}

// 표시 요소:
// - 날짜 뱃지 (서비스데이)
// - 질문 제목 (말줄임)
// - 두 답변 미리보기 (발화자 + 내용 일부)
// - NEW/읽지않음 뱃지
// - 터치 피드백
```

**HistorySearch.tsx**
```typescript
interface HistorySearchProps {
  searchTerm: string
  dateFilter: 'all' | 'week' | 'month' | '3months'
  onSearchChange: (term: string) => void
  onDateFilterChange: (filter: DateFilter) => void
  onSearchSubmit: () => void
  resultCount?: number
}

// 기능:
// - 텍스트 검색 (debounced)
// - 날짜 범위 필터
// - 검색 결과 수 표시
// - 필터 초기화
```

**ConversationGroup.tsx**
```typescript
interface ConversationGroupProps {
  date: string  // "2025-08-27"
  conversations: ConversationType[]
  searchTerm?: string  // 하이라이팅용
}

// 표시:
// - 한국어 날짜 레이블 ("8월 27일 화요일")
// - 해당 날짜의 대화 카드들
// - 검색어 하이라이팅
```

### 4.3 데이터 흐름

**API 엔드포인트**
```typescript
// GET /api/history
interface HistoryParams {
  cursor?: string      // 페이지네이션용 커서
  limit?: number       // 기본 20개
  search?: string      // 검색어
  dateFilter?: string  // 날짜 필터
}

interface HistoryResponse {
  conversations: ConversationWithDetails[]
  pagination: {
    hasMore: boolean
    nextCursor?: string
    totalCount: number
  }
  stats?: {
    totalConversations: number
    oldestDate: string
    streak?: number  // 연속 대화 일수
  }
}
```

**상태 관리**
```typescript
// app/history/page.tsx
const [conversations, setConversations] = useState<ConversationType[]>([])
const [loading, setLoading] = useState(true)
const [searchTerm, setSearchTerm] = useState('')
const [dateFilter, setDateFilter] = useState<DateFilter>('all')
const [hasMore, setHasMore] = useState(true)
const [cursor, setCursor] = useState<string | null>(null)

// 검색 상태 관리 (debounced)
const debouncedSearch = useDebounce(searchTerm, 300)
```

**데이터 로딩 플로우**
```typescript
1. 페이지 진입 → 초기 20개 대화 로드
2. 검색어 입력 → 300ms 딜레이 후 새로운 검색 실행
3. 날짜 필터 변경 → 즉시 새로운 필터링 실행
4. "더 보기" 클릭 → 다음 20개 추가 로드 (cursor 기반)
5. 대화 카드 클릭 → /conversation/[id] 페이지 이동
```

### 4.4 UI/UX 플로우

**진입 경로**
```
Today 페이지 → 하단 네비게이션 "히스토리" 탭 클릭
설정 페이지 → "대화 기록 보기" 메뉴 선택 (향후)
알림/딥링크 → 특정 대화로 바로 이동 후 히스토리 진입
```

**사용자 여정**
```
1. 히스토리 페이지 진입
   ↓
2. 최신 대화들 훑어보기 (스크롤)
   ↓
3-a. 특정 대화 클릭 → 상세 보기
3-b. 검색으로 특정 대화 찾기
3-c. 더 오래된 대화 탐색 (무한 스크롤)
   ↓
4. 대화 상세 페이지에서 다시 히스토리로 복귀
```

**인터랙션 패턴**
- **Pull-to-refresh**: 상단에서 당겨서 최신 대화 새로고침
- **스와이프 백**: iOS에서 뒤로가기 제스처 지원
- **키보드 단축키**: 검색 포커스 (/, Ctrl+F), 뒤로가기 (Esc)
- **롱 프레스**: 대화 카드 롱 프레스로 컨텍스트 메뉴 (향후)

## 5. 현실적 구현 계획 - MVP 우선 접근

### 현재 완료된 사항 ✅
- [x] **기본 페이지 구조**: `app/history/page.tsx` 기본 레이아웃 완성
- [x] **하단 네비게이션**: History 탭 연결 및 활성화 상태 완료
- [x] **모바일 반응형**: 모바일 퍼스트 레이아웃 완성

### Phase 1: MVP 필수 기능 (2-3일) 🎯 최우선
- [ ] **API 엔드포인트**: `app/api/history/route.ts` - 완료된 대화 목록 조회
- [ ] **핵심 의존성**: `/conversation/[id]` 페이지 구현 (대화 클릭 시 이동)
- [ ] **ConversationCard**: 대화 카드 기본 표시 (날짜, 질문, 미리보기)
- [ ] **빈 상태 처리**: "아직 완료된 대화가 없어요" 메시지
- [ ] **기본 에러 처리**: API 오류 시 재시도 버튼

### Phase 2: 사용성 개선 (1-2일) - 베타 테스트 후
- [ ] **페이지네이션**: 20개씩 "더 보기" 버튼으로 간단 구현
- [ ] **로딩 상태**: 기본 스피너 UI
- [ ] **대화 카드 개선**: 파트너 구분, 미리보기 텍스트
- [ ] **접근성 기본**: 터치 타겟, 키보드 네비게이션

### Phase 3: 고도화 기능 (베타 피드백 후 구현)
- [ ] **검색 기능**: 사용자 요청 시 구현
- [ ] **날짜 필터**: 사용 패턴 확인 후 추가
- [ ] **날짜별 그룹핑**: 대화량 증가 시 적용
- [ ] **성능 최적화**: 실사용 데이터로 병목점 파악 후

### ~~제외된 기능들~~ (초기 버전 불필요)
- ~~복잡한 검색 시스템~~ → 기본 브라우저 검색 활용
- ~~무한 스크롤~~ → 간단한 "더 보기" 버튼
- ~~읽음 표시/NEW 뱃지~~ → 실제 사용 패턴 확인 후
- ~~고급 필터링~~ → 사용자 요청 시

## 6. 테스트 계획

### 6.1 단위 테스트
```typescript
// ConversationCard.test.tsx
- 대화 데이터가 올바르게 표시되는지
- 클릭 이벤트가 올바른 ID로 발생하는지
- NEW/읽지않음 뱃지가 적절히 표시되는지
- 텍스트 말줄임이 정상 동작하는지

// HistorySearch.test.tsx  
- 검색어 입력 시 debounce가 동작하는지
- 날짜 필터 변경 시 콜백이 호출되는지
- 검색어 하이라이팅이 정상 동작하는지

// api/history 테스트
- 커서 기반 페이지네이션이 정상 동작하는지
- 검색어 필터링이 올바른 결과를 반환하는지
- 날짜 범위 필터가 정상 동작하는지
```

### 6.2 통합 테스트
```typescript
// 전체 플로우 테스트
1. 히스토리 페이지 로드 → 대화 목록 표시 확인
2. 검색 기능 → 입력/결과/초기화 플로우 확인
3. 무한 스크롤 → 추가 로드 동작 확인
4. 대화 클릭 → 상세 페이지 이동 확인
5. 빈 상태 → 적절한 안내 메시지 확인
```

### 6.3 E2E 테스트 (Playwright)
```typescript
// 핵심 사용자 시나리오
test('완료된 대화 히스토리 탐색', async ({ page }) => {
  // 1. 로그인 후 히스토리 페이지 이동
  // 2. 대화 목록이 표시되는지 확인
  // 3. 첫 번째 대화 클릭 후 상세 페이지 이동 확인
  // 4. 뒤로가기로 히스토리 복귀 확인
})

test('검색 기능 동작', async ({ page }) => {
  // 1. 검색바에 키워드 입력
  // 2. 검색 결과가 필터링되어 표시되는지 확인
  // 3. 하이라이팅이 적용되는지 확인
  // 4. 검색 초기화 후 전체 목록 복원 확인
})
```

### 6.4 성능 테스트
```typescript
// 성능 기준점 검증
- 초기 로드: 2초 이내 (20개 대화)
- 추가 로드: 1초 이내 (추가 20개)
- 검색 응답: 500ms 이내
- 메모리 사용량: 50MB 이하 (500개 대화 로드 시)
- 스크롤 성능: 60fps 유지
```

## 7. 롤아웃/모니터링

### 7.1 점진적 배포
```yaml
Week 1: 베타 테스터 5명
  - 기본 기능 동작 확인
  - 심각한 버그 수정
  - 사용성 피드백 수집

Week 2: 활성 사용자 20% (랜덤)
  - 성능 모니터링
  - 에러율 추적
  - 사용 패턴 분석

Week 3: 전체 사용자 배포
  - 안정성 확인 후 점진적 확산
  - 지원 요청 모니터링
  - 기능 완성도 검증
```

### 7.2 핵심 지표 모니터링
```typescript
// 사용률 지표
- 히스토리 페이지 방문율 (DAU 대비)
- 평균 세션 시간 (목표: 2분 이상)
- 대화 상세 진입률 (클릭률)
- 검색 기능 사용률

// 성능 지표  
- 페이지 로드 시간 (P95 < 3초)
- API 응답 시간 (P95 < 1초)
- 에러율 (<1%)
- 이탈률 (<30%)

// 만족도 지표
- 재방문율 (7일 내)
- 체류 시간 증가율
- 사용자 피드백 점수
```

### 7.3 알림 설정
```yaml
Critical Alerts (즉시 대응):
  - API 에러율 >5%
  - 페이지 로드 실패율 >10%
  - 데이터베이스 쿼리 타임아웃

Warning Alerts (24시간 내 대응):
  - 평균 로드 시간 >5초
  - 검색 성공률 <90%
  - 사용자 피드백 부정 >20%

Info Alerts (주간 리뷰):
  - 사용률 추이 변화
  - 인기 검색어 Top 10
  - 성능 개선 기회 식별
```

## 8. 오픈 퀘스천

### 8.1 기술적 결정사항
- **페이지네이션 vs 무한스크롤**: 초기에는 "더보기" 버튼, 사용자 피드백에 따라 무한스크롤 전환 고려
- **검색 인덱싱**: 현재는 PostgreSQL 기본 검색, 사용자 증가 시 Elasticsearch 고려
- **캐싱 전략**: Redis 캐싱 도입 시점과 캐시 무효화 정책
- **실시간 업데이트**: WebSocket으로 실시간 히스토리 업데이트 필요성

### 8.2 UX/기획 결정사항
- **대화 통계**: 총 대화 수, 연속 대화 일수 등 통계 표시 여부
- **대화 즐겨찾기**: 특별한 대화를 즐겨찾기로 표시하는 기능 필요성
- **대화 공유**: 특정 대화를 외부로 공유하는 기능 (프라이버시 고려)
- **대화 삭제**: 사용자가 특정 대화를 히스토리에서 숨기는 기능

### 8.3 비즈니스 결정사항
- **데이터 보존**: 대화 데이터 영구 보관 vs 일정 기간 후 아카이빙
- **분석 활용**: 히스토리 사용 패턴을 질문 선별/추천에 활용하는 방안
- **프리미엄 기능**: 고급 검색, 대화 백업 등을 프리미엄 기능으로 제공할지
- **AI 인사이트**: 대화 패턴 분석을 통한 가족 관계 인사이트 제공 가능성

## 9. 변경 로그

### v1.0.0-plan (2025-08-28)
- [기획] 히스토리 페이지 초기 계획 수립
- [설계] 컴포넌트 구조 및 API 엔드포인트 설계
- [계획] 5단계 구현 계획 및 테스트 전략 수립

### v1.1.0-plan (예정)
- [기능] 고급 검색 필터 (카테고리별, 기간별 상세)
- [기능] 대화 통계 및 인사이트 표시
- [개선] 성능 최적화 및 캐싱 전략

### v1.2.0-plan (예정)
- [기능] 대화 즐겨찾기 및 태그 시스템
- [기능] 대화 내보내기 (PDF, 텍스트)
- [분석] 사용자 행동 패턴 분석 및 개인화

## 10. 의존성 체크

### 10.1 기술적 의존성
- ✅ **Prisma Schema**: Conversation, Assignment, Answer, Question 테이블 구조
- ✅ **NextAuth**: 사용자 인증 및 세션 관리
- ✅ **기존 UI 컴포넌트**: shadcn/ui, 기존 카드 스타일, 네비게이션
- ⏸️ **대화 상세 페이지**: `/conversation/[id]` 구현 (병렬 개발 가능)

### 10.2 데이터 의존성
- ✅ **Conversation 데이터**: 완료된 대화 데이터 존재 (게이트 공개 시 생성)
- ✅ **사용자 Pair**: 현재 로그인 사용자의 쌍 정보 조회
- ✅ **서비스데이**: 한국시간 05시 기준 날짜 계산 로직

### 10.3 운영 의존성
- ✅ **환경 설정**: 동일한 환경변수 및 배포 파이프라인
- ✅ **성능 모니터링**: 기존 모니터링 인프라 활용
- ⚠️ **에러 추적**: 히스토리 페이지 전용 에러 추적 설정 필요

### 10.4 블로커 없음 확인
- [x] 기존 Today 페이지 코드에 영향 없음
- [x] 데이터베이스 스키마 변경 불필요
- [x] 새로운 외부 의존성 없음
- [x] 독립적 개발 및 테스트 가능

---

**히스토리 페이지는 마음배달의 핵심 가치인 '가족 대화의 지속성'을 시각화하는 중요한 기능입니다.** 축적된 대화들을 통해 사용자들이 자신들의 소통 여정을 되돌아보고, 더 깊은 관계로 발전해나가는 경험을 제공할 것입니다.

**개발 우선순위**: Today 페이지 안정화 완료 후 착수하되, 사용자 요청이 많을 경우 우선순위 상향 조정 가능합니다.