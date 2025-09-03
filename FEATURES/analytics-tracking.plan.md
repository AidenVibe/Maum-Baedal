# 사용자 분석 및 트래킹 시스템 계획

**⚠️ 현재 상태: MVP 단계 - 알림 시스템 임시 비활성화**
**🔄 영향 범위**: 알림 효과성 지표 측정 기능 임시 제외
**📋 복구 방법**: `notifications-disabled/` → `notifications/` 폴더명 변경으로 알림 관련 분석 복구 가능

## 📋 계획 개요
**목표**: 프라이버시를 보호하면서 핵심 비즈니스 지표 수집  
**전략**: GA4 + 자체 집계 시스템 혼합 방식 (알림 지표 제외)  
**예상 기간**: 3-4일  

## 🎯 핵심 분석 목표

### 비즈니스 핵심 지표 (KPI)
```
참여율 지표:
├── 일일 질문 응답률 = (답변한 사용자 / 브로드캐스트 받은 사용자) × 100
├── 게이트 공개율 = (공개된 대화 / 생성된 과제) × 100  
├── 완료율 = (양쪽 모두 답변 / 과제 시작) × 100
└── 지속 참여율 = 7일/30일 연속 참여 동반자 수

리텐션 지표:
├── 일일 활성 동반자 (DAC - Daily Active Companions)
├── 주간 활성 동반자 (WAC - Weekly Active Companions)  
├── 월간 활성 동반자 (MAC - Monthly Active Companions)
└── 동반자 이탈률 = 7일 미접속 비율

사용성 지표:
├── 답변 작성 시간 (중앙값)
├── 페이지 이동 패턴 (Today → History 흐름)
├── 모바일 vs 데스크톱 사용 비율
└── 오류 발생률 (API 실패, 타임아웃 등)
```

### 사용자 퍼널 분석
```
가입 퍼널:
랜딩페이지 → 카카오 로그인 → 온보딩 → 첫 답변 → 지속 사용

핵심 전환율:
├── 로그인 전환율 = (로그인 완료 / 랜딩 방문) × 100
├── 온보딩 전환율 = (동반자 연결 / 로그인 완료) × 100
├── 첫 답변 전환율 = (첫 답변 작성 / 온보딩 완료) × 100
└── 지속 사용률 = (7일 후 재사용 / 첫 답변 작성) × 100
```

## 🔧 기술 구현 전략

### ⚠️ 알림 시스템 분석 (임시 비활성화)
**알림 효과성 지표 (알림 시스템 복구 후 측정 가능)**
```
⚠️ 현재 비활성화된 알림 성과 지표:
├── ~~브로드캐스트 도달률 = (발송 성공 / 대상자 수) × 100~~ (임시 제외)
├── ~~알림톡 응답률 = (알림 후 1시간 내 답변 / 알림 발송) × 100~~ (임시 제외)
├── ~~리마인드 효과 = (19시 알림 후 답변 / 미답변 상태) × 100~~ (임시 제외)
└── ~~채널별 전환율 = (카카오톡/SMS 별 응답률 비교)~~ (임시 제외)

⚠️ 현재 비활성화된 비용 효율성 지표:
├── ~~메시지당 참여 유도 비용 = 알림 비용 / 답변 완료수~~ (임시 제외)
├── ~~알림 ROI = (참여 증가 가치 / 알림 발송 비용) × 100~~ (임시 제외)
└── ~~옵트아웃율 = (알림 거부 / 총 알림 대상) × 100~~ (임시 제외)

📋 복구 시 즉시 활성화: 설계 완료된 지표들이 폴더명 변경만으로 복구 가능
```

### 1단계: Google Analytics 4 (GA4) 도입

#### 설치 및 기본 설정
```typescript
// lib/gtag.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const gtag = {
  pageview: (url: string) => {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  },
  event: ({ action, category, label, value }: {
    action: string
    category: string
    label?: string  
    value?: number
  }) => {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// app/layout.tsx에 스크립트 추가
<Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
<Script id="gtag-init">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}');
  `}
</Script>
```

#### 주요 이벤트 추적
```typescript
// lib/analytics.ts
export const trackEvent = {
  // 답변 관련 이벤트
  answerStart: (questionId: string) => {
    gtag.event({
      action: 'answer_start',
      category: 'engagement',
      label: questionId
    })
  },
  
  answerComplete: (assignmentId: string, timeSpent: number) => {
    gtag.event({
      action: 'answer_complete', 
      category: 'engagement',
      label: assignmentId,
      value: timeSpent
    })
  },
  
  gateOpened: (conversationId: string) => {
    gtag.event({
      action: 'gate_opened',
      category: 'core_feature',
      label: conversationId
    })
  },
  
  // 온보딩 이벤트
  onboardingStart: () => {
    gtag.event({
      action: 'onboarding_start',
      category: 'conversion'
    })
  },
  
  companionConnected: (companionId: string) => {
    gtag.event({
      action: 'companion_connected',
      category: 'conversion', 
      label: companionId
    })
  }
}
```

### 2단계: 자체 집계 시스템 (Privacy-First)

#### 익명 집계 테이블 확장
```sql
-- 기존 daily_stats 테이블 확장
ALTER TABLE daily_stats ADD COLUMN IF NOT EXISTS
  active_companions INTEGER DEFAULT 0,
  answer_completion_rate DECIMAL(5,2) DEFAULT 0,
  gate_open_rate DECIMAL(5,2) DEFAULT 0,
  avg_answer_time_seconds INTEGER DEFAULT 0,
  mobile_usage_rate DECIMAL(5,2) DEFAULT 0;

-- 새로운 집계 테이블
CREATE TABLE user_journey_funnel (
  date DATE PRIMARY KEY,
  landing_visits INTEGER DEFAULT 0,
  login_attempts INTEGER DEFAULT 0, 
  login_success INTEGER DEFAULT 0,
  onboarding_starts INTEGER DEFAULT 0,
  companion_connections INTEGER DEFAULT 0,
  first_answers INTEGER DEFAULT 0,
  day7_retention INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 실시간 집계 함수
```typescript
// lib/analytics-server.ts
export async function recordAnalyticsEvent(eventType: string, metadata?: any) {
  // 개인정보는 절대 저장하지 않음
  const anonymizedEvent = {
    type: eventType,
    timestamp: new Date(),
    serviceDay: getServiceDay(),
    // 사용자 식별 정보는 제외, 집계용 데이터만
    ...sanitizeMetadata(metadata)
  }
  
  // 실시간 카운터 업데이트
  await updateDailyStats(anonymizedEvent)
}

// 매일 05시 배치 집계
export async function generateDailyReport() {
  const today = getServiceDay()
  
  const stats = await prisma.$transaction(async (tx) => {
    // 활성 동반자 수 (어제 답변한 동반자)
    const activeCompanions = await tx.companion.count({
      where: {
        assignments: {
          some: {
            serviceDay: today,
            answers: { some: {} }
          }
        }
      }
    })
    
    // 답변 완료율
    const totalAssignments = await tx.assignment.count({
      where: { serviceDay: today }
    })
    
    const completedAnswers = await tx.answer.count({
      where: { assignment: { serviceDay: today } }
    })
    
    const completionRate = totalAssignments > 0 ? 
      (completedAnswers / (totalAssignments * 2)) * 100 : 0
      
    return { activeCompanions, completionRate, /* ... */ }
  })
  
  // daily_stats 테이블에 저장
  return await saveDailyStats(today, stats)
}
```

### 3단계: 프라이버시 보호 조치

#### GDPR/개인정보보호법 준수
```typescript
// components/CookieConsent.tsx
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  
  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent')
    if (!consent) {
      setShowBanner(true)
    } else if (consent === 'accepted') {
      // GA4 활성화
      initializeGA()
    }
  }, [])
  
  const handleAccept = () => {
    localStorage.setItem('analytics_consent', 'accepted')
    initializeGA()
    setShowBanner(false)
  }
  
  const handleDecline = () => {
    localStorage.setItem('analytics_consent', 'declined')
    // 자체 익명 집계만 사용
    setShowBanner(false)
  }
  
  return showBanner ? (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <p className="text-sm mb-3">
        더 나은 서비스 제공을 위해 익명화된 사용 데이터를 수집합니다. 
        개인 대화 내용은 절대 수집하지 않습니다.
      </p>
      <div className="flex gap-2">
        <Button onClick={handleAccept} size="sm">동의</Button>
        <Button onClick={handleDecline} variant="outline" size="sm">거부</Button>
      </div>
    </div>
  ) : null
}
```

#### 데이터 최소화 원칙
```typescript
// 절대 수집하지 않는 데이터
const FORBIDDEN_DATA = [
  '답변 내용 (content)',
  '사용자 실명 정보',
  '카카오 프로필 상세정보', 
  '개별 사용자 식별 가능한 로그',
  'IP 주소 (GA4 익명화 설정)',
  '위치 정보'
]

// 수집하는 데이터 (익명화됨)
const COLLECTED_DATA = [
  '페이지 방문 패턴 (익명)',
  '기능 사용 빈도 (집계)',
  '에러 발생 패턴 (개인정보 제외)',
  '성능 지표 (응답시간 등)',
  '디바이스 유형 (모바일/데스크톱)'
]
```

## 📊 대시보드 및 리포팅

### 운영자용 대시보드 (/admin/analytics)
```typescript
// 핵심 지표 카드
const DashboardCards = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <MetricCard 
      title="일일 활성 동반자"
      value={stats.activeCompanions}
      change={stats.companionChange}
    />
    <MetricCard 
      title="답변 완료율" 
      value={`${stats.completionRate}%`}
      change={stats.rateChange}
    />
    <MetricCard
      title="게이트 공개율"
      value={`${stats.gateOpenRate}%` }
      change={stats.gateChange}
    />
    <MetricCard
      title="7일 리텐션"
      value={`${stats.retention7d}%`}
      change={stats.retentionChange}
    />
  </div>
)

// 트렌드 차트 (최근 30일)
const TrendChart = () => {
  const chartData = useDailyStats(30)
  return (
    <LineChart data={chartData} xAxis="date" yAxis="activeCompanions" />
  )
}
```

### 주간 리포트 자동 생성
```typescript
// 매주 월요일 08시 실행
export async function generateWeeklyReport() {
  const lastWeek = getLastWeekRange()
  
  const report = {
    period: lastWeek,
    metrics: {
      totalCompanions: await getActiveCompanions(lastWeek),
      avgDailyAnswers: await getAverageAnswers(lastWeek), 
      topPerformingQuestions: await getTopQuestions(lastWeek),
      userJourneyFunnel: await getFunnelMetrics(lastWeek)
    },
    insights: generateInsights(metrics),
    recommendations: generateRecommendations(metrics)
  }
  
  // 운영자에게 이메일 발송 (또는 슬랙 알림)
  await sendWeeklyReport(report)
}
```

## 🎯 성공 지표 및 목표

### Phase 1 목표 (베타 테스트 시작)
- [ ] GA4 기본 설정 완료 및 데이터 수집 시작
- [ ] 핵심 5개 이벤트 추적 (로그인, 온보딩, 답변, 게이트, 리텐션)
- [ ] 자체 집계 시스템 daily_stats 확장
- [ ] 쿠키 동의 배너 구현
- [ ] 기본 관리자 대시보드 (/admin/analytics)

### Phase 2 목표 (베타 테스트 중)
- [ ] 사용자 퍼널 분석 자동화
- [ ] 주간 리포트 자동 생성
- [ ] A/B 테스트 기반 구현 (질문 유형별 성과)
- [ ] 실시간 알림 (이상 지표 감지)
- [ ] 개인정보 보호 정책 문서화

### 측정 가능한 성과 지표
```
베타 테스트 성공 기준:
├── 답변 완료율 > 60%
├── 게이트 공개율 > 50%  
├── 7일 리텐션 > 40%
├── 평균 답변 시간 < 3분
└── 에러율 < 1%

서비스 성장 지표:
├── 월간 신규 동반자 증가율 > 20%
├── 평균 사용 지속 기간 > 30일
├── NPS (Net Promoter Score) > 50
└── 주간 활성률 > 70%
```

## 💡 GA vs 믹스패널 vs 자체 시스템 비교

### Google Analytics 4
**장점**: 무료, 설치 간단, 웹 표준, 대부분 개발자 친숙  
**단점**: 개인정보 이슈, 유럽 제약, 이벤트 설정 복잡  
**마음배달 적합도**: ⭐⭐⭐⭐ (기본 웹 분석용으로 최적)

### 믹스패널
**장점**: 이벤트 분석 특화, 코호트 분석 강력, 실시간 대시보드  
**단점**: 유료 (월 $25+), 초기 설정 복잡, 한국어 지원 제한  
**마음배달 적합도**: ⭐⭐ (MVP 단계에서는 과도한 투자)

### 자체 집계 시스템  
**장점**: 프라이버시 완전 제어, 비즈니스 로직 특화, 무료  
**단점**: 개발 시간 필요, 고도화 작업 지속 필요  
**마음배달 적합도**: ⭐⭐⭐⭐⭐ (가족 대화 플랫폼 특성상 필수)

### 권장 조합: GA4 + 자체 시스템
- **GA4**: 웹 표준 지표, 사용자 행동 패턴, SEO 성과
- **자체 시스템**: 답변률, 게이트 공개율, 동반자 관계 분석
- **단계적 도입**: 베타 테스트와 함께 시작, 데이터 누적 후 고도화

이 전략으로 마음배달이 사용자 프라이버시를 보호하면서도 서비스 성장에 필요한 핵심 지표를 효과적으로 수집할 수 있을 것입니다.