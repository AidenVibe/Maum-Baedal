# Phase 2 Enhanced Settings Page - 다중 동반자 관리 시스템

**페이지 경로**: `/settings`  
**Phase 1 상태**: 기본 UI 레이아웃 완성 ✅  
**Phase 2 상태**: 다중 동반자 관리 시스템 설계 완료 🚀  
**우선순위**: ⭐⭐⭐ (Phase 2 핵심 기능)  
**핵심 가치**: "최대 4명 가족과 개별 관계 관리"

## 📋 기능 명세서

### 변경 로그 (2025-09-02 업데이트)
- **v7.1.3 UI/UX 개선 완료 (2025-09-02)**: 모바일 중심 사용자 경험 대폭 향상
  - **모바일 중심 호버 효과 제거**: Settings 페이지 모든 인터랙티브 요소 개선
    - CompanionCard, CompanionList hover: 클래스를 active: 클래스로 변경
    - 모바일에서 명확한 활성 상태 표시로 터치 피드백 향상
    - 데스크톱에서도 일관된 인터랙션 제공으로 크로스 플랫폼 UX 통일
  - **동반자 카드 색상 변경**: Today 페이지와 일치하도록 색상 톤 통합
    - 초록색(green-100, green-700) → 노랑색(amber-200, amber-500, yellow-600)
    - 시각적 일관성 향상 및 브랜드 통일성 강화
    - 색상 대비율 4.5:1 이상 접근성 기준 유지
  - **차단하기 기능 완전 삭제**: 사용자 경험 단순화 및 기능 집중
    - CompanionCard, CompanionList에서 차단 관련 모든 코드 제거
    - 핵심 기능인 동반자 관리, 별명 설정, 초대 기능에 집중
    - UI 복잡성 제거로 사용자 친화적 인터페이스 구현
  - **테스트 알림 발송 버튼 삭제**: 운영비용 최적화 및 불필요한 기능 제거
    - Settings 페이지에서 알림톡 테스트 발송 버튼 완전 제거
    - 개발자 도구와 사용자 인터페이스 명확한 분리
    - 실제 사용자에게 불필요한 관리자 기능 노출 방지
  - **혼자모드/함께모드 시나리오별 UI 개선**: 모드별 차별화된 사용자 경험
    - 혼자모드: "아직 동반자가 없습니다" 안내 메시지와 초대 안내 UI
    - 함께모드: 실제 동반자 목록 및 관리 기능 완전 표시
    - 사용자 상황에 맞는 적절한 액션 가이드 제공
- **동반자 카운트 수정**: CompanionList 동반자 수 표시를 (n/4)에서 (n/3)로 변경 - 본인 제외한 초대 동반자만 카운트하는 정확성 개선
- **API 테스트 모드 지원**: `/api/settings/companions`와 `/api/onboarding/generate` API에 test_mode 목업 데이터 추가로 개발 환경 테스트 지원 강화
- **초대 모달 테스트 지원**: InviteModal에서 테스트 모드일 때 목업 초대링크 생성하여 개발 시뮬레이션 기능 완성
- **혼자모드 전환 모달 확인**: 이미 구현되어 있는 솔로→함께 모드 전환 확인 모달 기능 상태 확인 완료
- **알림 시간 선택 시스템 구현 완료 (v6.4)**
  - **3x3 알림 시간 선택 UI**: 일일 질문(8/10/12시), 리마인드(17/19/21시) 드롭다운 선택 구현
  - **동적 시간 제어**: 각 알림 유형별 개별 시간 설정 가능, 실시간 설정 저장
  - **사용자 경험 개선**: "가족의 생활 패턴에 맞는 시간", "가족 식사 시간을 피한 시간" 등 직관적 안내 메시지
  - **NotificationSettings 확장**: `dailyQuestionTime`, `reminderTime` 필드 추가로 시간 설정 지원
  - **향후 A/B 테스트 대비**: 9am vs 12pm 그룹 분할 테스트를 위한 UI 기반 구축 완료
- **6시나리오 알림 시스템 전면 통합 (v0.9.0)**
  - **알림 설정 시스템 전면 개편**: 기존 4개 알림에서 6시나리오 우선순위 체계로 확장
  - **Phase 기반 사용자 제어**: Phase 1(S급) → Phase 2(A급) → Phase 3(B급) 단계별 알림 제어 시스템 구현
  - **비용 투명성 강화**: 사용자별 월간 알림 비용 예상치 및 Phase별 비용 정보 제공
  - **중복 방지 고도화**: 게이트 공개 시 사용자별 세부 알림 선호도 제어 인터페이스 추가
  - **휴면 관리 통합**: 7일-14일-30일 3단계 휴면 관리를 사용자 설정에서 직접 제어 가능
- **Enhanced NotificationSettings 모델 확장**
  - `currentPhase`, `dormantStage`, `duplicatePreventionEnabled` 등 6시나리오 전용 필드 추가
  - Phase별 참여 통계 추적 시스템 (`phase1Engagement`, `phase2Engagement`, `phase3Engagement`)
  - 월간 비용 추정 및 알림 횟수 투명성 제공 시스템 구현
- **테스트 시스템 통합 및 Settings 페이지 기능 확장 (v0.8.3)** - 기존 유지
  - **테스트 시스템 통합**: TestScenarioDropdown 컴포넌트로 Settings 페이지 테스트 환경 통합
  - **개발도구 UX 혁신**: 드롭다운 방식으로 Settings 페이지 테스트 시나리오 접근 개선
  - **테스트 시나리오 확장**: Settings 페이지 전용 테스트 케이스 준비 (API 연동 상태에 따라 활성화)
- **InviteModal 컴포넌트 신규 추가**: `/components/features/settings/InviteModal.tsx` - 기존 유지
  - 카카오톡 공유 모달 구현 (동반자 초대하기 버튼에서 직접 실행)
  - 다중 공유 옵션 지원: 카카오톡, 링크 복사, 브라우저 공유 API
  - 온보딩 페이지 리다이렉트 방식에서 모달 방식으로 UX 개선
- **솔로→함께 모드 전환 시스템 검증 완료** - 기존 유지
  - 기존 `connectWithInviteCode` 함수의 자동 전환 로직 검증
  - Today API의 동적 모드 감지 시스템 정상 작동 확인
- **사용자 인터페이스 용어 통일**: solo/companion → 혼자모드/함께모드 - 기존 유지
  - 설정 페이지 전반에 통일된 한국어 용어 적용
  - 개발 소스는 유지, 사용자 화면만 한국어 용어로 변경

### 1. 프로필 관리 섹션

#### 1.1 기본 정보 수정
- **닉네임 변경**: 2-10자, 한글/영문/숫자 허용
- **프로필 이미지**: 이미지 업로드/삭제, 기본 아바타 제공
- **상태 메시지**: 한 줄 소개 (선택사항, 최대 50자)
- **생년월일**: 마케팅/분석 목적 (선택사항)

```typescript
interface ProfileSettings {
  nickname: string           // 필수, 2-10자
  profileImage?: string      // URL 또는 null
  statusMessage?: string     // 선택, 최대 50자
  birthYear?: number        // 선택, 1950-현재년도
  interests?: string[]      // 관심사 태그 (최대 5개)
}
```

#### 1.2 개인화 설정
- **관심사 태그**: 대화 주제 개인화용 (최대 5개 선택)
- **대화 스타일**: 진지함/유머/감성적 등 선호도 설정
- **질문 선호도**: 어떤 유형의 질문을 선호하는지
- **휴대폰 번호**: 카카오톡 알림 발송용 (수정 전용, 온보딩에서 입력)

### 2. ✅ 동반자 관리 섹션 **[핵심 기능 완전 유지됨]** ⭐

**핵심 가치**: "최대 4명 가족과 개별 관계 관리"

#### 2.1 ✅ 동반자 정보 표시 **[완전 구현 유지]**
- **✅ 동반자 카드 그리드**: 최대 4개 카드를 2x2 레이아웃으로 표시 **[유지됨]**
- **✅ 동반자별 색상 구분**: 각자 고유 색상 테마 (빨강, 파랑, 초록, 노랑) **[유지됨]**
- **✅ 가족 관계 아이콘**: 👩엄마, 👨아빠, 👶자녀, 🧓할머니 등 직관적 표시 **[유지됨]**
- **✅ 개별 통계**: 각 동반자와의 완료 대화 수, 완료율, 연결일 **[유지됨]**

#### 2.2 ✅ 동반자 관리 핵심 기능 **[모든 기능 완전 유지됨]**
- **✅ 별명 인라인 편집**: 카드 내에서 직접 "엄마", "아빠" 등 별명 수정 **[유지됨]**
- **✅ 개별 차단/해제**: 특정 동반자만 일시 차단 (다른 동반자와는 계속 대화) **[유지됨]**
- **✅ 다중 동반자 초대**: 새로운 가족 구성원 추가 (최대 3명까지) **[업데이트됨 - 2025-09-02]**
- **✅ 관계별 알림 설정**: 동반자별 개별 알림 시간 및 빈도 설정 **[유지됨]**

#### 2.3 📝 UI 단순화 개선사항 **[복잡성 제거, 핵심은 유지]**
- **❌ 제거됨**: Phase 2 설명 배너 (사용자에게 불필요한 내부 용어)
- **❌ 제거됨**: 통계 전용 탭 (카드 내 통계로 충분)  
- **❌ 제거됨**: 고급 설정 탭 (그룹 알림, 공유 질문 등 복잡한 설정)
- **✅ 유지됨**: 모든 동반자 관리 핵심 기능 (별명, 차단, 초대, 알림설정)

**⭐ 핵심 메시지**: 동반자 관리의 모든 실용적 기능은 완벽히 유지되며, 사용자에게 불필요한 UI 복잡성만 제거하여 더 직관적인 경험을 제공합니다.

#### 2.3 Phase 2 UI/UX 설계
```typescript
// 다중 동반자 관리 카드
interface CompanionManagementCard {
  companionId: string
  nickname: string                 // 실명 (김영희)
  userNickname?: string           // 사용자 지정 별명 (엄마)
  relationship: string            // parent, child, sibling, spouse, etc.
  relationshipIcon: string        // 👩, 👨, 👶, 🧓 등
  colorTheme: string             // bg-red-50 border-red-200 등
  stats: {
    completedCount: number
    totalAssignments: number
    completionRate: number       // 0.0 ~ 1.0
    daysSinceConnection: number
    lastActivityAt?: Date
  }
  status: 'active' | 'blocked' | 'paused'
  notificationSettings: {
    enabled: boolean
    dailyTime?: number           // 8, 10, 12시 중 선택
    reminderTime?: number        // 17, 19, 21시 중 선택
  }
}
```

```typescript
// Phase 2 확장: 다중 동반자 관리
interface Phase2CompanionManagement {
  companions: CompanionManagementCard[]  // 최대 4개
  totalStats: {
    totalCompanions: number              // 연결된 동반자 수
    activeCompanions: number             // 활성 동반자 수
    overallCompletionRate: number        // 전체 평균 완료율
    weeklyTrend: number                  // 주간 참여 증감률
  }
  availableSlots: number                 // 남은 초대 가능 수 (4 - companions.length)
  colorPalette: string[]                 // 사용 중인 색상들
  
  // Phase 2 고급 기능
  groupSettings: {
    enableGroupNotifications: boolean    // 그룹 알림 허용
    sharedQuestionMode: boolean         // 모든 동반자가 같은 질문
    familyModeEnabled: boolean          // 가족 모드 (관계 기반 질문)
  }
}
```

### 3. 알림 설정 섹션 - ⚠️ 6시나리오 알림 시스템 임시 비활성화 (MVP 단계)

**⚠️ 현재 상태**: 알림 시스템 임시 비활성화로 UI만 표시, 실제 기능 비활성화
**📋 복구 방법**: `notifications-disabled/` → `notifications/` 폴더명 변경으로 쉽게 복구 가능

#### 3.1 ✅ 6시나리오 알림 시스템 아키텍처 (설계 완료, 임시 비활성화)
- **✅ S급 핵심 알림 (3개)**: 일일질문(08:00), 게이트공개(즉시), 답변리마인드(19:00) - 월 34,000원
- **✅ A급 부가 알림 (2개)**: 동반자참여(즉시) - 월 1,000원  
- **✅ B급 관리 알림 (1개)**: 휴면관리(7일-14일-30일) - 월 1,000원
- **✅ 비용 최적화**: 연속 기념 알림 제거로 총 36,000원/월 달성 (5.3% 절감)
- **✅ 중복 방지 로직**: 게이트 공개 시 복잡한 중복 알림 완전 차단

#### 3.2 ✅ Phase 기반 점진적 도입 전략 (구현 완료)
- **Phase 1 (31,000원/월)**: S급 3개 시나리오만 활성화 - 85% 참여율 달성 목표
- **Phase 2 (+4,000원/월)**: A급 동반자 참여 알림 추가 - 95% 참여율 달성 목표  
- **Phase 3 (+1,000원/월)**: B급 휴면 관리 추가 - 100% 완성도 달성

#### 3.3 ✅ 사용자별 세부 알림 제어 시스템
```typescript
// ✅ 구현 완료: 6시나리오 기반 NotificationSetting 모델 확장
interface Enhanced6ScenarioNotificationSettings {
  // 기본 설정
  isActive: boolean                    // 알림 시스템 전체 활성화
  phoneNumber: string | null           // 휴대폰 번호 (필수)
  currentPhase: 1 | 2 | 3             // 사용자별 Phase 설정
  
  // S급 핵심 알림 (Phase 1 - 필수)
  enableDailyQuestion: boolean         // 08:00 일일 질문 알림 (S급)
  enableAnswerReminder: boolean        // 19:00 답변 리마인드 (S급)
  enableGateOpened: boolean           // 게이트 공개 즉시 알림 (S급)
  
  // A급 부가 알림 (Phase 2 - 선택)
  enableCompanionJoined: boolean       // 동반자 참여 알림 (A급)
  
  // B급 관리 알림 (Phase 3 - 선택)  
  enableDormantManagement: boolean     // 7일-14일-30일 휴면 관리 (B급)
  
  // 고급 설정
  weekendNotifications: boolean        // 주말 알림 수신 허용
  duplicatePreventionEnabled: boolean  // 중복 알림 방지 시스템 활성화
  testNotificationEnabled: boolean     // 관리자 테스트 발송 허용
  
  // 비용 투명성 및 통계
  monthlyNotificationCount: number     // 월간 수신 알림 횟수
  monthlyCostEstimate: number         // 월간 예상 비용 (원)
  lastNotificationAt: Date | null      // 마지막 알림 수신 시간
  dormantStage: 0 | 7 | 14 | 30       // 휴면 단계 (0=활성)
  
  // Phase별 참여 통계
  phase1Engagement: number            // S급 알림 참여율
  phase2Engagement: number            // A급 알림 참여율  
  phase3Engagement: number            // B급 알림 참여율
}
```

#### 3.4 ✅ 중복 방지 시스템 사용자 설정
```typescript
// 게이트 공개 시 중복 알림 방지 사용자 설정
interface GateOpenedNotificationControl {
  // 사용자별 게이트 공개 알림 선호도
  preferIntegratedNotification: boolean // true: 통합알림, false: 분리알림
  
  // 상황별 알림 제어
  notifyWhenIAnswerFirst: boolean      // 내가 먼저 답변할 때 알림
  notifyWhenPartnerAnswersFirst: boolean // 상대방이 먼저 답변할 때 알림
  notifyWhenIAnswerLast: boolean       // 내가 마지막 답변할 때 알림
  
  // 메시지 개인화
  usePartnerNickname: boolean          // 상대방 닉네임 포함 여부
  useContextualMessage: boolean        // 상황별 맞춤 메시지 사용
}
```

#### 3.5 ⚠️ MVP 단계별 운영 전략 (알림 시스템 임시 비활성화)
```typescript
// Phase별 사용자 설정 인터페이스
interface PhaseBasedUserSettings {
  // Phase 1: 필수 핵심 기능 (31,000원/월)
  phase1: {
    enabled: boolean
    scenarios: ['DAILY_QUESTION', 'GATE_OPENED', 'ANSWER_REMINDER']
    userControlLevel: 'basic'  // 기본 on/off만
    costTransparency: true     // 비용 투명 공개
  }
  
  // Phase 2: 선택적 확장 (+4,000원/월)  
  phase2: {
    enabled: boolean
    scenarios: ['COMPANION_JOINED']
    userControlLevel: 'advanced' // 시간대, 빈도 제어
    optInRequired: true        // 사용자 명시적 동의 필요
  }
  
  // Phase 3: 완전 기능 (+1,000원/월)
  phase3: {
    enabled: boolean
    scenarios: ['DORMANT_MANAGEMENT']
    userControlLevel: 'expert'   // 완전 커스터마이징
    autoOptOut: true           // 30일 후 자동 비활성화 옵션
  }
}
```

### 4. 개인정보 및 보안 섹션

#### 4.1 계정 관리
- **연결된 계정**: 카카오 계정 정보 표시
- **로그인 이력**: 최근 로그인 기록 (최대 5개)
- **데이터 다운로드**: 내 모든 대화 데이터 JSON 다운로드

#### 4.2 보안 기능
- **계정 연결 해제**: 카카오 연동 해제 (재로그인 필요)
- **계정 삭제**: 모든 데이터 완전 삭제 (30일 유예기간)
- **개인정보 동의 관리**: 선택적 동의 항목 관리

```typescript
interface SecuritySettings {
  accountInfo: {
    provider: 'kakao'
    connectedAt: Date
    lastLoginAt: Date
  }
  dataExport: {
    available: boolean
    lastExportAt?: Date
  }
  deletion: {
    available: boolean
    gracePeriod: 30 // 일
  }
}
```

### 5. 앱 설정 섹션

#### 5.1 UI/UX 설정
- **다크모드**: 시스템/라이트/다크 모드 선택
- **폰트 크기**: 소/중/대 3단계
- **애니메이션**: 모션 효과 on/off

#### 5.2 시스템 설정
- **언어**: 한국어 고정 (향후 확장 대비)
- **시간대**: KST 고정 (향후 글로벌 확장 대비)
- **데이터 절약**: 이미지 압축, 캐싱 설정

## 🏗️ 현실적 구현 계획 - API 연동 중심

### 현재 완료된 사항 ✅
- [x] **기본 페이지 구조**: `app/settings/page.tsx` 레이아웃 완성
- [x] **하단 네비게이션**: Settings 탭 연결 및 활성화 상태 완료
- [x] **모바일 반응형**: 모바일 퍼스트 UI 완성

### Phase 1: MVP 핵심 기능 (2-3일) 🎯 최우선
- [ ] **사용자 프로필 표시**: 현재 닉네임, 카카오 계정 정보 표시
- [ ] **기존 동반자 정보**: 연결된 동반자, 대화 수, 연결 날짜 (단일 동반자 지원)
- [ ] **기본 API 엔드포인트들**:
  - `GET /api/settings/profile` - 현재 사용자 정보
  - `PATCH /api/settings/profile` - 닉네임 변경
  - `GET /api/settings/companion` - 현재 동반자 정보 (단일)
- [ ] **닉네임 변경 기능**: 가장 기본적인 설정 기능

### Phase 2A: Phase 2 다중 동반자 기본 (3-5일) 🚀 핵심 확장
- [ ] **다중 동반자 카드 그리드**: 최대 4개 동반자 2x2 레이아웃 표시
- [ ] **동반자별 색상 구분**: 각 동반자의 고유 색상 테마 적용
- [ ] **별명 인라인 편집**: 카드 내에서 직접 "엄마", "아빠" 별명 수정
- [ ] **가족 관계 아이콘**: 👩, 👨, 👶, 🧓 등 직관적 관계 표시
- [ ] **Phase 2 API 확장**:
  - `GET /api/companions` - 모든 동반자 목록 (다중 지원)
  - `PATCH /api/companions/:id/nickname` - 개별 별명 수정
  - `GET /api/companions/stats` - 전체 동반자 통계
  - `POST /api/companions/invite` - 새 동반자 초대

### Phase 2B: 고급 동반자 관리 (1-2일) - 베타 피드백 후
- [ ] **개별 차단/해제**: 특정 동반자만 일시 차단 기능
- [ ] **통계 대시보드**: 전체 요약 + 개별 성과 분석
- [ ] **관계별 알림 설정**: 동반자별 개별 알림 시간 설정
- [ ] **고급 관리 API**:
  - `PATCH /api/companions/:id/block` - 개별 차단/해제
  - `GET /api/companions/dashboard` - 통합 대시보드 데이터
  - `PATCH /api/companions/:id/notifications` - 개별 알림 설정

#### 1.2 Form 관리 시스템
```typescript
// lib/validation/settings.ts
import { z } from 'zod'

export const profileSettingsSchema = z.object({
  nickname: z.string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(10, '닉네임은 10자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z0-9\s]+$/, '닉네임은 한글, 영문, 숫자만 사용 가능합니다'),
  statusMessage: z.string().max(50, '상태메시지는 50자 이하여야 합니다').optional(),
  birthYear: z.number().min(1950).max(new Date().getFullYear()).optional(),
  interests: z.array(z.string()).max(5, '관심사는 최대 5개까지 선택 가능합니다').optional()
})

export const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean(),
  questionArrival: z.boolean(),
  answerReceived: z.boolean(),
  gateOpened: z.boolean(),
  remindTime: z.number().min(18).max(22),
  weekendNotifications: z.boolean()
})
```

### Phase 3: 고도화 기능 (베타 피드백 후) 📝 나중에
- [ ] **프로필 이미지 업로드**: 실제 요청 있을 때 구현
- [ ] **알림 설정**: 푸시 알림 인프라 구축 후
- [ ] **다크모드**: 사용자 요청 시 구현
- [ ] **계정 삭제**: GDPR 준수 요구 시

### ~~제외된 복잡한 기능들~~ (초기 버전 불필요)
- ~~복잡한 프로필 관리~~ → 닉네임 변경만으로 충분
- ~~고급 알림 설정~~ → 기본 카카오톡/앱 알림 활용
- ~~데이터 내보내기~~ → 실제 요청 없으면 제외
- ~~2단계 인증~~ → 카카오 OAuth로 충분
- ~~테마 커스터마이징~~ → 모바일 앱 아니므로 불필요

### 핵심 API 구조 (간단하게)
```typescript
// GET /api/settings/profile
{
  user: {
    id: string,
    nickname: string,
    kakaoSub: string,
    createdAt: Date
  }
}

// PATCH /api/settings/profile
{
  nickname: string  // 2-10자 한글/영문
}

// GET /api/settings/pair
{
  pair: {
    partnerId: string,
    partnerNickname: string,
    connectedAt: Date,
    conversationCount: number,
    status: 'active' | 'paused'
  } | null
}
```

#### 2.2 프로필 정보 수정 API
```typescript
// app/api/settings/profile/route.ts
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = profileSettingsSchema.parse(body)
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nickname: validatedData.nickname,
        statusMessage: validatedData.statusMessage,
        birthYear: validatedData.birthYear,
        interests: validatedData.interests
      }
    })
    
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '입력 데이터가 올바르지 않습니다',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: '프로필 업데이트에 실패했습니다' }, { status: 500 })
  }
}
```

### Phase 3: 쌍 관리 시스템 (Week 2)

#### 3.1 쌍 관리 컴포넌트
```typescript
// components/settings/PairManagement.tsx
export function PairManagement({ currentPair }: { currentPair: Pair | null }) {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  
  if (!currentPair) {
    return <NoPairState />
  }
  
  return (
    <div className="space-y-6">
      <PairInfo pair={currentPair} />
      <PairStats pairId={currentPair.id} />
      
      <div className="flex flex-col space-y-3">
        <Button 
          variant="outline" 
          onClick={() => setShowPauseDialog(true)}
          className="w-full"
        >
          대화 일시정지
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={() => setShowDisconnectDialog(true)}
          className="w-full"
        >
          쌍 연결 해제
        </Button>
      </div>
      
      <PauseDialog 
        open={showPauseDialog} 
        onClose={() => setShowPauseDialog(false)}
        pairId={currentPair.id}
      />
      
      <DisconnectDialog 
        open={showDisconnectDialog}
        onClose={() => setShowDisconnectDialog(false)}
        pairId={currentPair.id}
      />
    </div>
  )
}
```

#### 3.2 보안이 중요한 작업 처리
```typescript
// components/settings/DisconnectDialog.tsx
export function DisconnectDialog({ open, onClose, pairId }: Props) {
  const [step, setStep] = useState<'confirm' | 'verify' | 'processing'>('confirm')
  const [verificationCode, setVerificationCode] = useState('')
  
  const handleDisconnect = async () => {
    setStep('verify')
    
    // SMS 인증 또는 이메일 인증 코드 발송
    await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pair_disconnect', pairId })
    })
  }
  
  const handleVerification = async () => {
    setStep('processing')
    
    try {
      const response = await fetch('/api/settings/pair/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairId, verificationCode })
      })
      
      if (response.ok) {
        toast.success('쌍 연결이 해제되었습니다')
        onClose()
        // 페이지 새로고침 또는 상태 업데이트
      } else {
        throw new Error('인증에 실패했습니다')
      }
    } catch (error) {
      toast.error('쌍 해제에 실패했습니다')
      setStep('verify')
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        {step === 'confirm' && <ConfirmStep onConfirm={handleDisconnect} />}
        {step === 'verify' && (
          <VerifyStep 
            code={verificationCode}
            onChange={setVerificationCode}
            onVerify={handleVerification}
          />
        )}
        {step === 'processing' && <ProcessingStep />}
      </DialogContent>
    </Dialog>
  )
}
```

### Phase 4: 알림 및 환경설정 (Week 2-3)

#### 4.1 푸시 알림 설정
```typescript
// lib/notifications.ts
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('이 브라우저는 알림을 지원하지 않습니다')
  }
  
  const permission = await Notification.requestPermission()
  
  if (permission === 'granted') {
    // FCM 토큰 등록
    const token = await getFCMToken()
    await registerNotificationToken(token)
  }
  
  return permission
}

export async function updateNotificationSettings(settings: NotificationSettings) {
  const response = await fetch('/api/settings/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  })
  
  if (!response.ok) {
    throw new Error('알림 설정 업데이트에 실패했습니다')
  }
  
  return response.json()
}
```

#### 4.2 다크모드 및 테마 시스템
```typescript
// lib/theme.ts
export type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')
  
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) setTheme(stored)
  }, [])
  
  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' : 'light'
      root.className = systemTheme
    } else {
      root.className = theme
    }
    
    localStorage.setItem('theme', theme)
  }, [theme])
  
  return { theme, setTheme }
}
```

### Phase 5: 데이터 관리 및 보안 (Week 3)

#### 5.1 데이터 내보내기
```typescript
// app/api/settings/data-export/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }
    
    // 사용자의 모든 데이터 수집
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        pairs: {
          include: {
            assignments: {
              include: {
                question: true,
                answers: true,
                conversation: true
              }
            }
          }
        }
      }
    })
    
    // 민감 정보 제거 및 정리
    const exportData = {
      profile: {
        nickname: userData.nickname,
        createdAt: userData.createdAt,
        statusMessage: userData.statusMessage
      },
      conversations: userData.pairs.flatMap(pair => 
        pair.assignments
          .filter(assignment => assignment.conversation)
          .map(assignment => ({
            date: assignment.serviceDay,
            question: assignment.question.content,
            myAnswer: assignment.answers.find(a => a.userId === session.user.id)?.content,
            partnerAnswer: assignment.answers.find(a => a.userId !== session.user.id)?.content,
            openedAt: assignment.conversation?.openedAt
          }))
      ),
      exportedAt: new Date().toISOString()
    }
    
    // JSON 파일로 반환
    const blob = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dearq-data-${Date.now()}.json"`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: '데이터 내보내기에 실패했습니다' }, { status: 500 })
  }
}
```

#### 5.2 계정 삭제 시스템
```typescript
// app/api/settings/account/delete/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }
    
    const { verificationCode, immediate } = await request.json()
    
    // 인증 코드 확인
    const isValidCode = await verifyCode(session.user.id, verificationCode, 'account_deletion')
    if (!isValidCode) {
      return NextResponse.json({ error: '인증 코드가 올바르지 않습니다' }, { status: 400 })
    }
    
    if (immediate) {
      // 즉시 삭제 (관리자 또는 특별한 경우)
      await deleteUserData(session.user.id)
    } else {
      // 30일 유예기간 설정
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          status: 'deletion_requested',
          deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 후
        }
      })
    }
    
    return NextResponse.json({ 
      message: immediate 
        ? '계정이 삭제되었습니다' 
        : '30일 후 계정이 삭제됩니다. 그 전까지 복구할 수 있습니다'
    })
  } catch (error) {
    return NextResponse.json({ error: '계정 삭제 요청에 실패했습니다' }, { status: 500 })
  }
}

async function deleteUserData(userId: string) {
  await prisma.$transaction(async (tx) => {
    // 1. 사용자의 모든 답변 삭제
    await tx.answer.deleteMany({ where: { userId } })
    
    // 2. 사용자가 참여한 쌍의 assignments 정리
    const userPairs = await tx.pair.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    })
    
    for (const pair of userPairs) {
      await tx.assignment.deleteMany({ where: { pairId: pair.id } })
      await tx.pair.delete({ where: { id: pair.id } })
    }
    
    // 3. 사용자 계정 삭제
    await tx.user.delete({ where: { id: userId } })
  })
}
```

## 📱 UI/UX 설계

### 모바일 최적화 설계
```typescript
// components/settings/SettingsLayout.tsx
export function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">설정</h1>
            <div className="w-8" /> {/* 균형을 위한 빈 공간 */}
          </div>
        </div>
      </div>
      
      {/* 컨텐츠 영역 */}
      <div className="max-w-md mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
}
```

### 접근성 고려사항
- **키보드 네비게이션**: Tab 순서 최적화, Enter/Space 키 지원
- **스크린 리더**: 적절한 ARIA 레이블 및 role 속성
- **색상 대비**: 4.5:1 이상 비율 유지
- **터치 타겟**: 최소 44×44px 크기 보장
- **포커스 인디케이터**: 명확한 포커스 표시

### 에러 상태 및 로딩 처리
```typescript
// components/settings/SettingsSection.tsx
export function SettingsSection({ 
  title, 
  description, 
  children,
  loading = false,
  error = null 
}: Props) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="w-6 h-6" />
          <span className="ml-2 text-sm text-gray-600">설정을 불러오는 중...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </Button>
        </div>
      ) : (
        children
      )}
    </section>
  )
}
```

## 🗄️ 데이터베이스 확장

### UserPreferences 테이블 추가
```prisma
model UserPreferences {
  id                    String  @id @default(cuid())
  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 알림 설정
  pushNotificationsEnabled     Boolean @default(true)
  questionArrivalEnabled       Boolean @default(true)
  answerReceivedEnabled        Boolean @default(true)
  gateOpenedEnabled           Boolean @default(true)
  remindTime                  Int     @default(19) // 19시
  weekendNotificationsEnabled Boolean @default(true)
  
  // UI 설정
  theme                 String  @default("system") // "light" | "dark" | "system"
  fontSize              String  @default("medium") // "small" | "medium" | "large"
  animationsEnabled     Boolean @default(true)
  
  // 개인화 설정
  conversationStyle     String? // "serious" | "humorous" | "emotional"
  preferredQuestionTypes String[] // ["daily", "deep", "fun", "reflective"]
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  @@map("user_preferences")
}
```

### User 테이블 확장
```prisma
model User {
  // 기존 필드들...
  
  statusMessage        String?
  birthYear           Int?
  interests           String[] // 관심사 태그
  profileImageUrl     String?
  
  // 계정 상태
  status              String   @default("active") // "active" | "paused" | "deletion_requested"
  deletionScheduledAt DateTime?
  
  // 새로운 관계
  preferences         UserPreferences?
  
  @@map("users")
}
```

## 🔐 보안 고려사항

### 1. 민감한 작업 인증
- **쌍 해제**: 이메일/SMS 인증 코드 필요
- **계정 삭제**: 2단계 인증 + 7일 쿨다운
- **데이터 내보내기**: 세션 재인증 필요

### 2. 데이터 보호
- **개인정보 암호화**: 민감 정보는 암호화 저장
- **접근 로그**: 중요 작업은 모두 로깅
- **권한 분리**: 읽기/쓰기/삭제 권한 분리

### 3. API 보안
```typescript
// middleware/auth.ts
export async function requireRecentAuth(maxAge = 5 * 60 * 1000) { // 5분
  return async (req: NextRequest) => {
    const session = await getServerSession()
    if (!session?.user) throw new Error('Authentication required')
    
    const lastAuthTime = req.headers.get('X-Last-Auth-Time')
    if (!lastAuthTime || Date.now() - parseInt(lastAuthTime) > maxAge) {
      throw new Error('Recent authentication required')
    }
    
    return session.user
  }
}
```

## 📊 성능 최적화

### 1. 이미지 최적화
- **프로필 이미지**: WebP 포맷, 여러 크기 생성
- **Lazy Loading**: 설정 섹션별 지연 로딩
- **CDN**: 이미지는 CDN 서빙

### 2. 데이터 캐싱
- **설정 데이터**: React Query로 캐싱
- **사용자 프리퍼런스**: localStorage 백업
- **API Response**: SWR 패턴 적용

### 3. 번들 최적화
```typescript
// 동적 임포트로 코드 분할
const ProfileImageUpload = dynamic(() => import('./ProfileImageUpload'), {
  loading: () => <ProfileImageSkeleton />,
  ssr: false
})

const PairManagement = dynamic(() => import('./PairManagement'), {
  loading: () => <PairManagementSkeleton />
})
```

## 🧪 테스트 전략

### 1. 단위 테스트
- Form validation 로직
- 데이터 변환 함수
- 유틸리티 함수들

### 2. 통합 테스트
- 설정 저장/로드 플로우
- 파일 업로드 시스템
- 알림 권한 요청

### 3. E2E 테스트
```typescript
// tests/settings.e2e.ts
test('사용자가 닉네임을 변경할 수 있다', async ({ page }) => {
  await page.goto('/settings')
  
  await page.fill('[data-testid="nickname-input"]', '새로운닉네임')
  await page.click('[data-testid="save-profile"]')
  
  await page.waitForSelector('[data-testid="success-message"]')
  
  const updatedNickname = await page.textContent('[data-testid="current-nickname"]')
  expect(updatedNickname).toBe('새로운닉네임')
})

test('쌍 해제 시 인증 코드가 필요하다', async ({ page }) => {
  await page.goto('/settings')
  
  await page.click('[data-testid="disconnect-pair"]')
  await page.click('[data-testid="confirm-disconnect"]')
  
  // 인증 코드 입력 화면 표시 확인
  await page.waitForSelector('[data-testid="verification-input"]')
  
  await page.fill('[data-testid="verification-input"]', '123456')
  await page.click('[data-testid="verify-disconnect"]')
  
  await page.waitForSelector('[data-testid="disconnect-success"]')
})
```

## 📋 구현 체크리스트

### Phase 1: 기본 구조 (Week 1)
- [ ] SettingsPage 레이아웃 및 네비게이션
- [ ] 섹션별 Tab 시스템
- [ ] Form validation 스키마 정의
- [ ] 기본 API 엔드포인트 구조

### Phase 2: 프로필 관리 (Week 1-2)
- [ ] 닉네임/상태메시지 수정 기능
- [ ] 프로필 이미지 업로드 시스템
- [ ] 관심사 태그 선택 인터페이스
- [ ] 프로필 업데이트 API

### Phase 3: 쌍 관리 (Week 2)
- [ ] 현재 쌍 정보 표시
- [ ] 쌍 일시정지 기능
- [ ] 쌍 해제 시스템 (인증 포함)
- [ ] 새로운 쌍 연결 인터페이스

### Phase 4: 알림 및 앱 설정 (Week 2-3)
- [ ] 푸시 알림 권한 요청/설정
- [ ] 알림 시간 설정
- [ ] 다크모드 토글
- [ ] 폰트 크기/애니메이션 설정

### Phase 5: 보안 및 데이터 관리 (Week 3)
- [ ] 데이터 내보내기 기능
- [ ] 계정 삭제 시스템 (유예기간 포함)
- [ ] 로그인 이력 표시
- [ ] 개인정보 동의 관리

### Phase 6: 테스트 및 최적화 (Week 3-4)
- [ ] 단위 테스트 작성
- [ ] E2E 테스트 시나리오
- [ ] 성능 최적화
- [ ] 접근성 검증

## 🚀 배포 및 모니터링

### 배포 체크리스트
- [ ] 환경변수 설정 (이미지 업로드 서비스)
- [ ] 데이터베이스 마이그레이션
- [ ] FCM 설정 (푸시 알림)
- [ ] CDN 설정 (이미지 서빙)

### 모니터링 지표
- **설정 페이지 방문률**: 사용자의 설정 페이지 사용 빈도
- **프로필 수정률**: 프로필 정보 변경 빈도
- **알림 활성화율**: 푸시 알림을 활성화한 사용자 비율
- **쌍 해제율**: 쌍 해제 요청 빈도 (이탈 지표)
- **데이터 내보내기 요청**: GDPR 관련 데이터 내보내기 요청 빈도

## 📝 추가 고려사항

### 향후 확장 가능성
- **다국어 지원**: 설정에서 언어 변경 기능
- **테마 커스터마이징**: 색상/폰트 세부 설정
- **고급 알림 설정**: 키워드별, 시간대별 세부 설정
- **소셜 기능**: 프로필 공개 설정, 친구 찾기

### 운영 관리
- **설정 변경 로그**: 중요 설정 변경 시 로깅
- **A/B 테스트**: 설정 UI 개선을 위한 테스트
- **사용자 피드백**: 설정 관련 피드백 수집 시스템

이 계획서를 기반으로 단계적으로 구현하면, 사용자 친화적이면서도 보안이 강화된 설정 페이지를 만들 수 있습니다.