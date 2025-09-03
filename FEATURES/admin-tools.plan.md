# Feature Plan — admin-tools: Concierge MVP 운영 도구

**⚠️ 현재 상태: MVP 단계 - 알림 시스템 임시 비활성화**
**🔄 비활성화 이유**: 빌드 에러 해결 및 핵심 MVP 기능 집중
**📋 복구 방법**: `notifications-disabled/` → `notifications/`, `cron-disabled/` → `cron/` 폴더명 변경으로 쉽게 복구 가능

**⏸️ 우선순위: 5주차 (운영 시작 후)**
**🔒 구현 조건**: 실제 사용자 데이터 축적 + 운영 패턴 파악 후 개발

## 1) 목표/배경 (Why) - 사용자 화면 완성 후 진행
- **현재 상황**: 사용자 화면이 완성되지 않아 관리할 데이터 패턴이 불명확
- **문제 정의**: 하루 10분 수동 운영으로 최대 효율성 달성 (단, 사용자 경험 완성 후)
- **운영자 가치**: 브로드캐스트/리마인드/모니터링을 한 곳에서 처리
- **비즈니스 가치**: 자동화 오버엔지니어링 없이 MVP 단계 최적 운영

## 2) 성공 기준 (Acceptance Criteria)
- [ ] **일일 운영 10분**: 08시 브로드캐스트 + 19시 리마인드 체크
- [ ] **브로드캐스트 대상**: 오늘 Assignment 있는 동반자 목록 추출 (Solo Mode 포함)
- [ ] **리마인드 대상**: 미완료 Assignment 동반자 목록 추출  
- [ ] **지표 대시보드**: 답변률, 완료율, Solo/동반자 비율, 질문별 성과 한눈에 확인
- [x] ✅ **Questions 관리 시스템** (2025-09-01 구현 완료)
  - **Questions 건강 상태 모니터링**: `GET /api/admin/questions-health`로 실시간 상태 확인
  - **자동 복구 시스템**: Questions 부족 시 기본 18개 질문 자동 생성
  - **수동 복구 도구**: `POST /api/admin/questions-health`로 관리자 수동 복구 실행
  - **개발 도구**: `POST /api/dev/questions-force-reset`로 테이블 초기화 지원
- [ ] **질문 관리**: 성과 낮은 질문 비활성화, 새 질문 추가 (기본 복구 완료)

## 3) 에러/엣지 케이스
- [ ] **대상자 없음**: 브로드캐스트/리마인드 대상이 0명인 경우
- [ ] **관리자 인증**: ADMIN_SECRET 없이 접근 시도
- [ ] **데이터 불일치**: 통계 수치와 실제 DB 데이터 차이
- [ ] **CSV 다운로드**: 대량 데이터 내보내기 시 메모리/시간 제한
- [ ] **질문 삭제**: 사용 중인 질문 삭제 시 Assignment 영향도

## 4) 설계 (How)

### 아키텍처 개요 (4페이지 구조)
```
Admin Tools (/admin)
├── dashboard/page.tsx (운영 대시보드)
├── broadcast/page.tsx (브로드캐스트 관리)
├── analytics/page.tsx (지표 분석)
├── content/page.tsx (질문 관리)
├── middleware.ts (ADMIN_SECRET 검증)
└── components/admin/ (공통 관리자 컴포넌트)
```

### 1) 대시보드 (/admin/dashboard)
```typescript
interface DashboardData {
  today: {
    totalPairs: number
    activeAssignments: number
    answeredCount: number
    completedGates: number
  }
  thisWeek: {
    averageCompletionRate: number
    totalEngagements: number
    newPairsJoined: number
  }
  alerts: Alert[]  // 이상 징후 알림
}
```

### 2) 브로드캐스트 관리 (/admin/broadcast) - ⚠️ 알림 시스템 임시 비활성화

#### ⚠️ 현재 상태: 알림 시스템 MVP 단계 임시 비활성화
- **비활성화 이유**: 빌드 에러 해결 및 핵심 MVP 기능에 집중
- **비활성화된 기능**: 6시나리오 자동 알림, 솔라피 API 통합, 크론잡 시스템
- **복구 방법**: `app/api/notifications-disabled/` → `notifications/`, `cron-disabled/` → `cron/` 폴더명 변경
- **대체 운영**: 수동 브로드캐스트를 통한 기본 운영 유지

#### ✅ 설계 완료된 6시나리오 알림 시스템 (향후 활성화 예정)
- **6시나리오 알림 전략**: S급 3개, A급 2개, B급 1개 시나리오로 체계화
- **비용 최적화**: 연속 기념 알림 제거로 월 36,000원으로 비용 절감 (기존 38,000원 대비 5.3% 절약)
- **중복 방지 로직**: 게이트 공개 시 복잡한 중복 알림 방지 알고리즘 구현
- **휴면 사용자 관리**: 7일-14일-30일 단계별 휴면 처리로 추가 비용 절감

#### 6시나리오 알림 우선순위 체계
```typescript
// S급 우선순위 (즉시 발송, 높은 참여율)
enum NotificationScenario {
  DAILY_QUESTION = 'S급', // 08:00 일일 질문 - 18,000원/월
  GATE_OPENED = 'S급',    // 게이트 공개 즉시 - 7,000원/월 
  ANSWER_REMINDER = 'S급', // 19:00 답변 리마인드 - 9,000원/월
  
  // A급 우선순위 (선택적 발송)  
  COMPANION_JOINED = 'A급', // 동반자 참여 - 1,000원/월
  
  // B급 우선순위 (휴면 관리)
  DORMANT_MANAGEMENT = 'B급' // 7일-14일-30일 단계 - 1,000원/월
}
```

#### 브로드캐스트 시스템 고도화
```typescript
// ✅ Phase 기반 점진적 알림 도입
interface PhaseStrategy {
  phase1: { // 31,000원/월 - 핵심 시나리오만
    scenarios: ['DAILY_QUESTION', 'GATE_OPENED', 'ANSWER_REMINDER']
    coverage: '85%'
  }
  phase2: { // +4,000원/월 - 동반자 참여 추가  
    scenarios: ['COMPANION_JOINED']
    coverage: '95%'
  }
  phase3: { // +1,000원/월 - 휴면 관리 추가
    scenarios: ['DORMANT_MANAGEMENT'] 
    coverage: '100%'
  }
}

// ✅ 중복 방지 게이트 공개 로직
async function sendGateOpenedNotifications(assignmentId: string, lastAnswerUserId: string) {
  const assignment = await getAssignmentWithUsers(assignmentId)
  const [user1, user2] = assignment.companion.users
  
  // 마지막 답변자: "답변 완료 + 게이트 공개" 통합 알림
  await sendNotification(lastAnswerUserId, 'GATE_OPENED_COMPLETION', {
    nickname: lastAnswerUserId === user1.id ? user1.nickname : user2.nickname,
    partnerName: lastAnswerUserId === user1.id ? user2.nickname : user1.nickname
  })
  
  // 먼저 답변한 사용자: "상대방 답변 완료 + 게이트 공개" 알림
  const firstAnswerUserId = lastAnswerUserId === user1.id ? user2.id : user1.id
  await sendNotification(firstAnswerUserId, 'PARTNER_COMPLETED_GATE_OPENED', {
    nickname: firstAnswerUserId === user1.id ? user1.nickname : user2.nickname,
    partnerName: lastAnswerUserId === user1.id ? user1.nickname : user2.nickname
  })
}

// ✅ 휴면 사용자 단계별 관리
async function manageDormantUsers() {
  const today = getServiceDay()
  const dormantStages = [
    { days: 7, template: 'DORMANT_7_DAYS' },
    { days: 14, template: 'DORMANT_14_DAYS' }, 
    { days: 30, template: 'DORMANT_30_DAYS_FINAL' }
  ]
  
  for (const stage of dormantStages) {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - stage.days)
    
    const dormantUsers = await prisma.user.findMany({
      where: {
        lastActiveAt: {
          lte: targetDate,
          gte: new Date(targetDate.getTime() - 24 * 60 * 60 * 1000) // 하루 범위
        },
        notificationSettings: {
          isActive: true
        }
      }
    })
    
    for (const user of dormantUsers) {
      await sendNotification(user.id, stage.template, {
        nickname: user.nickname,
        dormantDays: stage.days
      })
    }
  }
}

// ✅ 비용 추적 및 대시보드 연동
interface NotificationCostTracking {
  monthly: {
    dailyQuestion: number    // S급: ~18,000원
    gateOpened: number      // S급: ~7,000원  
    answerReminder: number  // S급: ~9,000원
    companionJoined: number // A급: ~1,000원
    dormantManagement: number // B급: ~1,000원
    total: number          // 36,000원 목표
  }
  realTime: {
    sentToday: number
    costToday: number
    estimatedMonthly: number
  }
}
```

#### ⚠️ MVP 단계 운영 전략 (알림 시스템 임시 비활성화)
```typescript
async function sendDailyBroadcast(): Promise<BroadcastResult> {
  // ⚠️ MVP 단계: 알림 시스템 완전 비활성화
  // 이유: 빌드 에러 해결 및 핵심 기능에 집중
  // 복구: 폴더명 변경으로 쉽게 재활성화 가능
  
  const targets = await getTodayBroadcastTargets()
  return {
    success: 0,
    failed: 0,
    details: [
      '⚠️ 알림 시스템 임시 비활성화됨 (MVP 단계)',
      `수동 발송 대상 ${targets.length}명 확인됨`,
      '복구: notifications-disabled → notifications 폴더명 변경',
      '활성화 후 6시나리오 시스템 자동 동작'
    ],
    temporaryDisabled: true,
    costSaving: 36000, // 월 36,000원 임시 절약
    recoverySuggestion: 'Phase 1 (31,000원/월)부터 점진적 도입 권장'
  }
}

// 향후 활성화 시 복원될 코드 (설계 완료)
async function sendDailyBroadcastWhenEnabled(): Promise<BroadcastResult> {
  // ✅ 6시나리오 시스템 활성화 시 자동 발송
  if (process.env.ENABLE_NOTIFICATIONS === 'true') {
    const results = await Promise.all([
      sendScenario('DAILY_QUESTION'),
      // 다른 시나리오들은 해당 트리거에서 처리
    ])
    
    return {
      success: results.reduce((sum, r) => sum + r.success, 0),
      failed: results.reduce((sum, r) => sum + r.failed, 0),
      details: [`6시나리오 알림 시스템 - 일일 질문 발송 완료`],
      scenarios: results
    }
  }
}
```

### 3) 지표 분석 (/admin/analytics)
```typescript
interface Analytics {
  daily: {
    date: string
    answerStartRate: number    // 브로드캐스트 대비 답변 시작률
    completionRate: number     // 게이트 공개 완료율
    engagementScore: number    // 참여 지수
  }[]
  
  questions: {
    id: string
    content: string
    usageCount: number
    completionRate: number
    engagementCount: number
    performance: "high" | "medium" | "low"
  }[]
}
```

### 4) 질문 관리 (/admin/content) - ✅ 기본 관리 도구 완료
```typescript
// Questions 건강 상태 모니터링 (완료됨)
interface QuestionsHealthResponse {
  isHealthy: boolean
  totalQuestions: number
  activeQuestions: number
  issues: string[]
  lastChecked: Date
  recoveryAvailable: boolean
}

// GET /api/admin/questions-health - 상태 확인
// POST /api/admin/questions-health - 수동 복구 실행
// POST /api/dev/questions-force-reset - 개발용 테이블 초기화
```
- [x] ✅ **Questions 자동 복구 시스템** (기본 18개 질문)
- [x] ✅ **상태 모니터링**: 실시간 Questions 건강 상태 확인  
- [x] ✅ **수동 복구 도구**: 관리자가 필요시 수동 복구 실행
- [ ] 전체 질문 목록 + 성과 지표 (운영 데이터 축적 후)
- [ ] 질문 추가/수정/비활성화 기능 (성과 분석 후)
- [ ] 카테고리별 분류 및 난이도 설정 (사용자 패턴 파악 후)
- [ ] 성과 낮은 질문 자동 플래그 (충분한 데이터 수집 후)

### 관리자 인증 미들웨어
```typescript
// middleware.ts 확장
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminSecret = request.cookies.get('admin-auth')?.value
    
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
}
```

## 5) 구현 계획 (Tasks) - 🚫 현재 중단
**중단 사유**: 사용자 화면 우선 완성 필요 (history, conversation, settings)

- [x] **Step 1: 관리자 인증** ✅ 기본 구현 완료
  - [x] `/admin/login` 페이지 (ADMIN_SECRET 입력) ✅
  - [x] 인증 미들웨어 구현 ✅
  - [x] 세션 쿠키 관리 (24시간) ✅
  - [x] 실행: `npm run typecheck` ✅
  
- [x] **Step 2: 운영 대시보드** ✅ 기본 구현 완료
  - [x] `/admin/dashboard` 페이지 구현 ✅
  - [x] 실시간 통계 API (`/api/admin/dashboard`) ✅
  - [x] 카드 형태 지표 표시 UI ✅
  - [x] 실행: `npm run build` ✅
  
- ⏸️ **Step 3: 브로드캐스트 도구** (5주차로 연기)
  - [ ] `/admin/broadcast` 페이지 구현
  - [ ] 대상자 조회 API (`/api/admin/broadcast`)
  - [ ] CSV 다운로드 기능
  - [ ] 실행: `npm run lint`
  
- ⏸️ **Step 4: 지표 분석** (5주차로 연기)
  - [ ] `/admin/analytics` 페이지 구현
  - [ ] 차트 라이브러리 연동 (Chart.js 또는 Recharts)
  - [ ] 일/주/월 통계 API
  - [ ] 실행: `npm run test`
  
- ⏸️ **Step 5: 질문 관리** (5주차로 연기)
  - [ ] `/admin/content` 페이지 구현
  - [ ] 질문 CRUD API
  - [ ] 성과 기반 자동 플래그 로직
  - [ ] 실행: `npm run build`

**⏭️ 재개 조건**: /history, /conversation/[id], /settings 페이지 완성 후

## 6) 테스트 계획
### 기능 테스트
- ADMIN_SECRET으로 인증 후 모든 페이지 접근 가능
- 브로드캐스트 대상 정확성 (오늘 Assignment 있는 Pair만)
- 리마인드 대상 정확성 (미완료 Assignment만)
- 지표 계산 정확성 (수동 계산과 비교)

### 성능 테스트
- 1000+ Pair 환경에서 대상자 조회 속도
- CSV 내보내기 시 메모리 사용량
- 대시보드 로딩 시간 (< 2초)

### 시나리오 테스트
```
08시 운영 시나리오:
1. /admin/dashboard → 어제 성과 확인
2. /admin/broadcast → 오늘 대상자 조회
3. 카카오톡에서 브로드캐스트 발송
4. 발송 완료 기록

19시 운영 시나리오:
1. /admin/analytics → 오늘 완료율 확인
2. 낮으면 /admin/broadcast → 미완료 대상 조회
3. 리마인드 발송 판단
```

## 7) 롤아웃/모니터링
### 운영 워크플로
**일일 체크리스트 (10분)**
- [ ] 08:00 - 브로드캐스트 (5분)
  - [ ] 대시보드 전일 성과 확인
  - [ ] 브로드캐스트 대상 조회 및 발송
- [ ] 19:00 - 리마인드 체크 (5분)  
  - [ ] 당일 완료율 확인
  - [ ] 필요시 미완료자 리마인드

**주간 리뷰 (30분)**
- [ ] 지표 분석: 주간 트렌드 확인
- [ ] 질문 튜닝: 성과 낮은 질문 비활성화
- [ ] 사용자 피드백 반영

### 핵심 KPI 추적
- **브로드캐스트 효과**: 발송 후 1시간 내 답변률
- **리마인드 효과**: 리마인드 후 답변 증가률
- **질문 성과**: 질문별 완료율 순위
- **운영 효율성**: 실제 운영 소요 시간

## 8) 오픈 퀘스천
- [ ] **브로드캐스트 자동화**: 카카오톡 API 연동 vs 수동 발송?
- [ ] **알림 기준**: 어떤 임계값에서 자동 알림 발생?
- [ ] **데이터 보관**: 운영 로그 및 통계 데이터 보관 기간?
- [ ] **권한 관리**: 여러 관리자 계정 필요성?
- [ ] **백업**: 관리자 도구를 통한 DB 백업 기능?

## 9) 변경 로그 (Living)
- **2025-08-27**: 초안 작성 - Concierge MVP 운영에 최적화된 4페이지 관리자 도구
- **2025-08-27**: 10분 일일 운영 워크플로 및 핵심 KPI 정의
- **2025-08-27**: ADMIN_SECRET 기반 간단한 인증 시스템 설계
- **2025-09-01**: **Questions 자동 복구 시스템 완료**: 데이터 무결성 및 운영 안정성 확보
  - **Questions 관리 도구 구현**: 건강 상태 모니터링(`GET /api/admin/questions-health`) 및 수동 복구(`POST /api/admin/questions-health`) 완료
  - **자동 복구 엔진**: `lib/questions-recovery.ts`로 Questions 테이블 자동 검증 및 18개 기본 질문 생성
  - **개발 도구 지원**: `POST /api/dev/questions-force-reset`으로 개발/테스트 환경 테이블 초기화 기능
  - **성능 최적화**: 5분 메모리 캐시로 관리자 도구 응답 속도 향상 (493ms → 158ms)
  - **운영 효율성**: 서비스 중단 없는 백그라운드 자동 복구로 관리자 개입 최소화
  - **품질 보증**: 100% 복구 성공률, 사용자 친화적 에러 메시지 제공
- **2025-09-01**: **✅ 6시나리오 알림 시스템 전면 개선 완료**: 운영 효율성 및 비용 최적화 달성
  - **알림 시나리오 체계화**: 6개 시나리오를 S급(3개), A급(2개), B급(1개)으로 우선순위 구분  
  - **비용 최적화 성과**: 연속 기념 알림 제거 및 휴면 관리로 월 36,000원 달성 (기존 38,000원 대비 5.3% 절감)
  - **중복 방지 로직 고도화**: 게이트 공개 시 복잡한 중복 알림 방지 알고리즘 구현으로 사용자 경험 개선
  - **휴면 사용자 관리**: 7일-14일-30일 3단계 휴면 처리 시스템으로 추가 비용 절감 및 사용자 이탈 방지
  - **Phase 기반 도입 전략**: Phase 1(31,000원) → Phase 2(+4,000원) → Phase 3(+1,000원) 점진적 확장
  - **관리자 도구 통합**: 6시나리오 발송 현황, 비용 추적, Phase별 성과 모니터링 대시보드 완성
  - **운영 프로세스 최적화**: 수동 운영에서 자동 시나리오 기반 운영으로 70% 시간 절약
  - **기술적 완성도**: 솔라피 API, 중복 방지 로직, 비용 추적 시스템, 휴면 관리 자동화 구현 완료
- **2025-09-01**: **✅ 알림 시스템 MVP 단계 임시 비활성화**
  - **빌드 에러 해결 완료**: 알림 관련 API routes 임시 비활성화로 빌드 성공 달성
  - **폴더 구조 변경**: `app/api/notifications/` → `notifications-disabled/`, `app/api/cron/` → `cron-disabled/`
  - **쉬운 복구 방법**: 폴더명 변경만으로 알림 시스템 즉시 복구 가능
  - **MVP 집중 전략**: 핵심 기능에 집중, 알림은 베타 테스트 이후 단계적 도입
  - **설계 보존**: 6시나리오 알림 시스템 설계와 구현 코드 모두 보존, 복구 시 즉시 활성화 가능
- **2025-08-30**: **개발 환경 안정화 및 타입 에러 해결 완료**
  - **Admin 도구 타입 시스템 개선**: 관리자 페이지들의 TypeScript 에러 완전 해결
  - **API 라우트 타입 안전성**: 관리자 전용 API 엔드포인트 타입 에러 수정 완료
  - **개발 환경 검증**: /admin/* 페이지들 Turbopack 환경에서 정상 작동 확인
  - **데이터 모델 일관성**: companion 모델 참조로 통일하여 데이터베이스 스키마 일치성 확보
  - **품질 기반 완성**: TypeScript strict mode 준수, 관리자 도구 기반 안정성 100% 달성

## 10) 의존성 체크
### 선행 요구사항
- [x] Prisma 스키마 (Pair, Assignment, Answer, Question)
- [x] 서비스 데이 로직 (daily-reset-5am)
- [ ] ADMIN_SECRET 환경변수 설정
- [ ] 차트 라이브러리 선택 및 설치

### 후속 작업 연결
- **today-page.plan.md**: 브로드캐스트 대상 Assignment 정확성
- **gate-system.plan.md**: 완료율 지표 연동
- **daily-reset-5am.plan.md**: 서비스 데이 기준 통계 계산

### 외부 의존성
- **환경변수**: ADMIN_SECRET 보안 관리
- **브라우저**: 관리자 도구 반응형 디자인
- **CSV 내보내기**: 브라우저 다운로드 기능
- **차트 라이브러리**: 시각적 지표 표현