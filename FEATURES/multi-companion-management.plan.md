# Phase 2: 다중 동반자 관리 시스템

## 📋 개요
마음배달의 핵심 확장 기능인 다중 동반자 관리 시스템입니다. 기존 1:1 동반자 구조에서 최대 4명까지 확장하며, 각 동반자와의 개별 관계를 독립적으로 관리할 수 있습니다.

## 🎯 Phase 2 핵심 가치
**"가족 전체와 연결되는 따뜻한 대화"** - 부부간 대화에서 3세대 가족 전체로 확장

### 핵심 차별화 요소
1. **동반자별 색상 체계**: 4명까지 개별 색상으로 구분 (👩빨강, 👨파랑, 👶초록, 🧓노랑)
2. **가족 관계 자동 매핑**: "엄마👩", "아빠👨", "할머니🧓" 등 직관적 표시
3. **통합 히스토리 뷰**: 하루에 여러 동반자와의 대화를 한 화면에서 관리
4. **과거 미답변 접근**: 3단계 옵션 시스템으로 놓친 대화에 참여

## 🏗️ 아키텍처 설계

### 1. 6-Table 미니멀 확장
기존 테이블 구조를 최소한으로 확장하여 다중 동반자 지원

```typescript
// Companion 테이블 확장
model Companion {
  id          String   @id @default(cuid())
  user1Id     String
  user2Id     String
  inviteCode  String   @unique
  status      String   @default("active")
  
  // Phase 2 확장 필드
  nickname1   String?  // user1이 user2에게 부여한 별명
  nickname2   String?  // user2가 user1에게 부여한 별명
  relationship String? // "parent", "child", "sibling", "spouse" 등
  isBlocked1  Boolean @default(false)  // user1의 차단 상태
  isBlocked2  Boolean @default(false)  // user2의 차단 상태
  
  // 통계 필드
  completedCount    Int @default(0)
  totalAssignments  Int @default(0)
  lastActivityAt    DateTime?
  
  @@unique([user1Id, user2Id])  // 중복 연결 방지
}

// Answer 테이블 확장 (과거 미답변 지원)
model Answer {
  id           String   @id @default(cuid())
  assignmentId String
  userId       String
  content      String?
  status       String   @default("submitted")  // "submitted" | "skipped" | "late"
  
  // Phase 2 확장 필드
  isLate       Boolean  @default(false)      // 기한 후 답변
  answeredAt   DateTime @default(now())
  skippedAt    DateTime?                     // 스킵한 시간
  adViewedAt   DateTime?                     // 광고 시청 시간 (수익화)
  
  @@unique([assignmentId, userId])
}
```

### 2. API 확장 설계 (하위 호환성 100%)
기존 API를 확장하되 기존 클라이언트는 전혀 영향받지 않음

```typescript
// 기존 API는 그대로 유지
GET  /api/today           // 기존 1:1 동작 완전 호환
POST /api/answer          // 기존 답변 제출 완전 호환

// Phase 2 확장 API
GET  /api/companions                    // 모든 동반자 목록
POST /api/companions/invite             // 새 동반자 초대
PATCH /api/companions/:id/nickname      // 별명 수정
PATCH /api/companions/:id/block         // 차단/해제
DELETE /api/companions/:id              // 연결 해제

GET  /api/history                       // 다중 동반자 히스토리
GET  /api/history/:date                 // 특정 날짜 모든 대화
POST /api/history/retroactive          // 과거 미답변 답변하기
```

## 🎨 UI/UX 핵심 설계

### 1. 동반자별 색상 체계 (최대 4명)
```typescript
const COMPANION_COLORS = {
  primary: 'bg-red-50 border-red-200 text-red-800',      // 👩 엄마
  secondary: 'bg-blue-50 border-blue-200 text-blue-800', // 👨 아빠  
  tertiary: 'bg-green-50 border-green-200 text-green-800', // 👶 자녀
  quaternary: 'bg-yellow-50 border-yellow-200 text-yellow-800' // 🧓 할머니
}
```

### 2. 가족 관계 자동 매핑
```typescript
const RELATIONSHIP_MAPPING = {
  spouse: { icon: '💑', defaultNickname: '배우자' },
  parent: { icon: '👩‍👧‍👦', defaultNickname: '부모님' },
  child: { icon: '👶', defaultNickname: '자녀' },
  sibling: { icon: '👫', defaultNickname: '형제자매' },
  grandparent: { icon: '🧓', defaultNickname: '조부모님' },
  other: { icon: '👤', defaultNickname: '동반자' }
}
```

### 3. 히스토리 통합 뷰 설계
```typescript
// 날짜별 카드에 다중 동반자 답변 표시
interface DailyHistoryCard {
  date: string
  question: string
  conversations: {
    companionId: string
    companionName: string
    companionColor: string
    myAnswer?: string
    partnerAnswer?: string
    status: 'completed' | 'waiting' | 'incomplete'
    isLate?: boolean
  }[]
}
```

## 📱 컴포넌트 구조

### 1. 메인 관리 화면
**`MultiCompanionSettings.tsx`**
```typescript
// 동반자 관리 메인 화면
export default function MultiCompanionSettings() {
  return (
    <div className="space-y-6">
      {/* Phase 2 안내 배너 */}
      <PhaseAnnouncementBanner />
      
      {/* 탭 네비게이션 */}
      <TabNavigation tabs={['동반자 관리', '통계', '고급 설정']} />
      
      {/* 동반자 목록 (최대 4개) */}
      <CompanionGrid companions={companions} />
      
      {/* 초대 및 고급 기능 */}
      <AdvancedFeatures />
    </div>
  )
}
```

### 2. 동반자 카드 컴포넌트
**`CompanionCard.tsx`**
```typescript
interface CompanionCardProps {
  companion: {
    id: string
    nickname: string
    userNickname?: string  // 사용자 정의 별명
    relationship?: string
    colorTheme: string
    stats: CompanionStats
    isBlocked: boolean
  }
}

export function CompanionCard({ companion }: CompanionCardProps) {
  return (
    <Card className={`${companion.colorTheme} transition-all hover:shadow-md`}>
      {/* 관계 아이콘 + 별명 (인라인 편집) */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getRelationshipIcon(companion.relationship)}</span>
            <InlineNicknameEditor 
              value={companion.userNickname || companion.nickname}
              onSave={handleNicknameSave}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleEditNickname}>
                <Edit3 className="mr-2 h-4 w-4" />별명 수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleNotifications}>
                <Bell className="mr-2 h-4 w-4" />알림 설정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBlock} className="text-red-600">
                <Shield className="mr-2 h-4 w-4" />차단하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {/* 통계 정보 */}
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-lg">{companion.stats.completedCount}</div>
            <div className="text-muted-foreground">완료 대화</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">{Math.round(companion.stats.completionRate * 100)}%</div>
            <div className="text-muted-foreground">완료율</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">{companion.stats.daysSinceConnection}</div>
            <div className="text-muted-foreground">연결일</div>
          </div>
        </div>
        
        {/* 최근 활동 */}
        {companion.stats.lastActivityAt && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground text-center">
            마지막 활동: {formatRelativeTime(companion.stats.lastActivityAt)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 3. 과거 미답변 접근 시스템
**`RetroactiveAnswerFlow.tsx`**
```typescript
// 3단계 옵션: "지금 답변하기" → "광고 시청" → "답변 안 하기"
export function RetroactiveAnswerFlow({ assignment }: { assignment: Assignment }) {
  const [step, setStep] = useState<'options' | 'ad' | 'answer' | 'skip'>('options')
  
  return (
    <Dialog>
      <DialogContent>
        {step === 'options' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>놓친 대화에 참여하시겠어요?</DialogTitle>
              <DialogDescription>
                {formatDate(assignment.serviceDay)}의 질문에 아직 답변하지 않으셨어요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2">
              <Button 
                onClick={() => setStep('answer')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                지금 답변하기 ✨
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setStep('ad')}
                className="w-full"
              >
                광고 보고 답변하기 📺
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setStep('skip')}
                className="w-full text-muted-foreground"
              >
                답변하지 않기
              </Button>
            </div>
          </div>
        )}
        
        {step === 'ad' && <AdViewComponent onComplete={() => setStep('answer')} />}
        {step === 'answer' && <RetroactiveAnswerForm assignment={assignment} />}
        {step === 'skip' && <SkipConfirmation assignment={assignment} />}
      </DialogContent>
    </Dialog>
  )
}
```

## 🔧 기술 구현 상세

### 1. 멱등성 보장
```typescript
// 과거 답변 제출 API - 중복 제출 방지
export async function POST(request: NextRequest) {
  const { assignmentId, answer, isRetroactive } = await request.json()
  
  return await prisma.$transaction(async (tx) => {
    // 기존 답변 확인 (자연스러운 멱등성)
    const existing = await tx.answer.findFirst({
      where: { assignmentId, userId: user.id }
    })
    
    if (existing) {
      // 이미 답변했으면 기존 답변 반환
      return NextResponse.json({ answer: existing, alreadyAnswered: true })
    }
    
    // 새 답변 생성 (과거 답변인 경우 isLate 플래그)
    const newAnswer = await tx.answer.create({
      data: {
        assignmentId,
        userId: user.id,
        content: answer,
        isLate: isRetroactive,
        answeredAt: new Date()
      }
    })
    
    // 게이트 상태 확인 (동일한 멱등성 로직)
    await checkAndOpenGate(assignmentId, tx)
    
    return NextResponse.json({ answer: newAnswer, isNew: true })
  })
}
```

### 2. 동반자별 관리 시스템
```typescript
// 별명 수정 API - 양방향 관계 지원
export async function PATCH(request: NextRequest) {
  const { companionId, nickname } = await request.json()
  const user = await requireAuth()(request)
  
  return await prisma.$transaction(async (tx) => {
    const companion = await tx.companion.findFirst({
      where: {
        id: companionId,
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ]
      }
    })
    
    if (!companion) {
      return NextResponse.json({ error: '동반자를 찾을 수 없습니다' }, { status: 404 })
    }
    
    // 사용자 위치에 따라 적절한 필드 업데이트
    const updateData = companion.user1Id === user.id 
      ? { nickname1: nickname }  // user1이 user2에게 부여한 별명
      : { nickname2: nickname }  // user2가 user1에게 부여한 별명
    
    const updated = await tx.companion.update({
      where: { id: companionId },
      data: updateData
    })
    
    return NextResponse.json({ companion: updated })
  })
}
```

### 3. 통계 집계 시스템
```typescript
// 동반자별 통계 계산
export async function getCompanionStats(userId: string, companionId: string) {
  const [companion, assignments, answers] = await Promise.all([
    prisma.companion.findUnique({
      where: { id: companionId },
      include: { user1: true, user2: true }
    }),
    
    prisma.assignment.count({
      where: {
        companion: { id: companionId },
        status: 'active'
      }
    }),
    
    prisma.answer.count({
      where: {
        assignment: {
          companion: { id: companionId }
        },
        userId: userId,
        status: 'submitted'
      }
    })
  ])
  
  const completionRate = assignments > 0 ? answers / assignments : 0
  const daysSinceConnection = Math.floor(
    (Date.now() - companion.connectedAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return {
    completedCount: answers,
    totalAssignments: assignments,
    completionRate,
    daysSinceConnection,
    lastActivityAt: companion.lastActivityAt
  }
}
```

## 📊 사용자 시나리오

### 1. 신규 사용자 (첫 동반자 추가)
```
1. 로그인 후 /settings 진입
2. "연결된 동반자가 없습니다" 빈 상태 화면
3. "첫 번째 동반자 초대하기" CTA 버튼
4. 초대 링크 생성 → 카카오톡으로 공유
5. 상대방 가입 및 연결 완료
6. 자동으로 relationship 감지 및 색상 할당
```

### 2. 기존 사용자 (추가 동반자)
```
1. 동반자 카드 목록 확인 (현재 2명)
2. "+ 새 동반자 초대" 버튼 클릭
3. 관계 선택 ("부모님", "자녀", "형제자매" 등)
4. 초대 링크 생성 → 공유
5. 연결 완료 시 선택한 관계에 맞는 색상 자동 할당
6. 최대 4명까지 관리 가능
```

### 3. 별명 관리 시나리오
```
1. "김영희" 동반자 카드의 이름 부분 클릭
2. 인라인 편집 모드 → "엄마" 입력
3. 체크 버튼 클릭 → API 호출 → 실시간 반영
4. 이후 모든 화면에서 "엄마👩" 표시
5. 히스토리에서도 "엄마의 답변", "나와 엄마의 대화" 등으로 표시
```

### 4. 과거 미답변 접근 시나리오
```
1. 히스토리에서 미완료 대화 발견 (회색 표시)
2. 카드 클릭 → "놓친 대화에 참여하시겠어요?" 모달
3. 옵션 선택:
   a) "지금 답변하기" → 바로 답변 폼
   b) "광고 보고 답변하기" → 30초 광고 → 답변 폼  
   c) "답변하지 않기" → 영구 스킵, 수익화 손실
4. 제출 시 isLate: true 플래그, 상대방에게 알림
```

## 🚀 Phase 2 구현 단계

### Phase 2A (우선순위 최고)
- ✅ 동반자 목록 API 및 UI 구현
- ✅ 별명 수정 인라인 편집 시스템  
- ✅ 히스토리 통합 뷰 (다중 동반자 표시)
- ✅ 과거 미답변 접근 3단계 시스템

### Phase 2B (차순위)
- 🔄 동반자 차단/해제 기능
- 🔄 개별 알림 설정 관리
- 🔄 통계 대시보드 고도화
- 🔄 관계별 맞춤 질문 시스템

### Phase 2C (실험적 기능)
- ⏸️ 동반자별 개별 질문 받기
- ⏸️ 스마트 질문 매칭 (AI 기반)
- ⏸️ 동반자 간 답변 공유 시스템
- ⏸️ 그룹 대화 모드 (모든 동반자 참여)

## 💡 수익화 연계

### 광고 시청 모델
- **과거 미답변 접근**: 광고 시청 후 무료 답변 기회
- **프리미엄 구독**: 광고 없이 자유로운 과거 답변
- **동반자 추가**: 2명까지 무료, 3-4명은 프리미엄

### 데이터 분석 활용
- **가족 관계 패턴**: 익명화된 대화 패턴 분석
- **질문 효과성**: 관계별 선호 질문 유형 파악
- **참여율 예측**: 개인화된 알림 타이밍 최적화

## 🔍 접근성 및 반응형

### AAA 접근성 기준
- **키보드 네비게이션**: Tab → Enter/Space 완전 지원
- **스크린 리더**: "엄마 동반자, 완료된 대화 15개, 완료율 85%"
- **고대비 모드**: 시스템 설정 자동 감지
- **색상 독립**: 아이콘과 텍스트로 정보 구분

### 모바일 퍼스트 반응형
- **Mobile (< 768px)**: 1열 카드 레이아웃
- **Tablet (768-1024px)**: 2열 카드 + 사이드 통계
- **Desktop (> 1024px)**: 3열 카드 + 확장 통계 패널

---

## 🎯 성공 지표

### 핵심 KPI
- **동반자 추가율**: 단일 → 다중 전환율 >50%
- **참여율 증가**: 다중 동반자 사용자의 일일 참여율 +30%
- **완료율 향상**: 과거 미답변 접근으로 전체 완료율 +15%
- **리텐션 증가**: 다중 동반자 사용자 30일 리텐션 +25%

### 사용자 만족도
- **가족 연결감**: "더 많은 가족과 소통할 수 있어서 좋다" >80%
- **편의성**: "별명으로 구분하니 직관적이다" >85%
- **시각적 만족**: "색상으로 구분되어 보기 좋다" >75%

**Phase 2로 마음배달은 "부부 대화"에서 "가족 전체 소통"으로 확장하며, 한국 가족의 따뜻한 연결을 더욱 깊고 넓게 지원합니다.**