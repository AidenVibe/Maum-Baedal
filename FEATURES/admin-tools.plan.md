# Feature Plan — admin-tools: Concierge MVP 운영 도구

## 1) 목표/배경 (Why)
- **문제 정의**: 하루 10분 수동 운영으로 최대 효율성 달성
- **운영자 가치**: 브로드캐스트/리마인드/모니터링을 한 곳에서 처리
- **비즈니스 가치**: 자동화 오버엔지니어링 없이 MVP 단계 최적 운영

## 2) 성공 기준 (Acceptance Criteria)
- [ ] **일일 운영 10분**: 08시 브로드캐스트 + 19시 리마인드 체크
- [ ] **브로드캐스트 대상**: 오늘 Assignment 있는 Pair 목록 추출
- [ ] **리마인드 대상**: 미완료 Assignment Pair 목록 추출  
- [ ] **지표 대시보드**: 답변률, 완료율, 질문별 성과 한눈에 확인
- [ ] **질문 관리**: 성과 낮은 질문 비활성화, 새 질문 추가

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
    totalQuestionSwaps: number
    newPairsJoined: number
  }
  alerts: Alert[]  // 이상 징후 알림
}
```

### 2) 브로드캐스트 관리 (/admin/broadcast)
```typescript
// 08시 브로드캐스트 대상 추출
async function getTodayBroadcastTargets() {
  const serviceDay = getServiceDay()
  const pairs = await prisma.pair.findMany({
    where: {
      status: "active",
      assignments: {
        some: {
          serviceDay,
          status: "active"
        }
      }
    },
    include: { user1: true, user2: true }
  })
  
  return pairs.map(pair => ({
    pairId: pair.id,
    user1: pair.user1.nickname,
    user2: pair.user2.nickname,
    questionPreview: "..." // Assignment의 질문 미리보기
  }))
}

// 19시 리마인드 대상 추출  
async function getTodayRemindTargets() {
  const serviceDay = getServiceDay()
  return await prisma.pair.findMany({
    where: {
      assignments: {
        some: {
          serviceDay,
          status: "active",
          answers: { none: {} } // 답변 0개
        }
      }
    }
  })
}
```

### 3) 지표 분석 (/admin/analytics)
```typescript
interface Analytics {
  daily: {
    date: string
    answerStartRate: number    // 브로드캐스트 대비 답변 시작률
    completionRate: number     // 게이트 공개 완료율
    questionSwapRate: number   // 질문 교체율
  }[]
  
  questions: {
    id: string
    content: string
    usageCount: number
    completionRate: number
    swapCount: number
    performance: "high" | "medium" | "low"
  }[]
}
```

### 4) 질문 관리 (/admin/content)
- 전체 질문 목록 + 성과 지표
- 질문 추가/수정/비활성화 기능
- 카테고리별 분류 및 난이도 설정
- 성과 낮은 질문 자동 플래그

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

## 5) 구현 계획 (Tasks)
- [ ] **Step 1: 관리자 인증**
  - [ ] `/admin/login` 페이지 (ADMIN_SECRET 입력)
  - [ ] 인증 미들웨어 구현
  - [ ] 세션 쿠키 관리 (24시간)
  - [ ] 실행: `npm run typecheck`
  
- [ ] **Step 2: 운영 대시보드**
  - [ ] `/admin/dashboard` 페이지 구현
  - [ ] 실시간 통계 API (`/api/admin/dashboard`)
  - [ ] 카드 형태 지표 표시 UI
  - [ ] 실행: `npm run build`
  
- [ ] **Step 3: 브로드캐스트 도구**
  - [ ] `/admin/broadcast` 페이지 구현
  - [ ] 대상자 조회 API (`/api/admin/broadcast`)
  - [ ] CSV 다운로드 기능
  - [ ] 실행: `npm run lint`
  
- [ ] **Step 4: 지표 분석**
  - [ ] `/admin/analytics` 페이지 구현
  - [ ] 차트 라이브러리 연동 (Chart.js 또는 Recharts)
  - [ ] 일/주/월 통계 API
  - [ ] 실행: `npm run test`
  
- [ ] **Step 5: 질문 관리**
  - [ ] `/admin/content` 페이지 구현
  - [ ] 질문 CRUD API
  - [ ] 성과 기반 자동 플래그 로직
  - [ ] 실행: `npm run build`

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