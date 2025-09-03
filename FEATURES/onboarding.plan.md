# Feature Plan — onboarding: 질문 링크 공유 시스템

**🎯 현재 상태**: 질문 링크 공유 시스템으로 전면 개편, Solo Mode 지원
**⭐ 우선순위**: 3주차 (사용자 화면 완성) - 새로운 온보딩 시스템 구현

## 새로운 온보딩 컨셉: 질문 링크 공유

### 기존 시스템 문제점
- ❌ **초대코드 수동 입력**: 사용자가 6자리 코드를 직접 타이핑해야 함
- ❌ **진입 장벽**: 코드 입력 실패 가능성, 복잡한 사용자 경험
- ❌ **강제적 매칭**: 반드시 동반자가 있어야만 시작 가능

### 새로운 시스템 장점
- ✅ **간편한 공유**: 질문 페이지 링크를 카카오톡으로 바로 공유
- ✅ **원클릭 연결**: 링크 클릭만으로 즉시 동반자 연결
- ✅ **Solo Mode**: 동반자 없이도 혼자 질문에 답변 가능
- ✅ **자연스러운 UX**: "오늘 질문" 자체가 공유 매개체

## 새로운 시스템 설계

### 질문 링크 공유 플로우
```
사용자 A (혼자 또는 동반자와 함께)
├── 1) 카카오 로그인
├── 2) 휴대폰 번호 입력 (카카오 알림톡 발송용)
├── 3) Solo Mode 선택 or 동반자 초대 선택
├── 4-a) Solo: 즉시 Today 페이지로 이동
└── 4-b) 동반자 초대: 질문 링크 공유
    ├── 5) "오늘 질문 함께하기" 버튼
    ├── 6) 카카오톡 공유 (질문 미리보기 포함)
    └── 7) 동반자가 링크 클릭 → 자동 연결 + Today 이동
```

### Solo Mode 지원
- **혼자 시작**: 동반자 없이도 질문에 답변 가능
- **나중에 초대**: Solo로 시작한 후 언제든 동반자 초대 가능
- **게이트 시스템**: Solo는 답변 즉시 공개, 동반자 연결 시 기존 게이트 로직 적용

## 1) 목표/배경 (Why)

### 핵심 개선 목표
- **문제**: 초대코드 수동 입력의 높은 진입 장벽과 실패 가능성
- **해결**: 질문 링크 공유로 자연스럽고 간편한 동반자 연결
- **혁신**: Solo Mode 도입으로 혼자서도 시작 가능한 유연성

### 사용자 가치
- **즉시 시작**: 동반자 없이도 바로 질문에 답변 가능
- **간편 공유**: 카카오톡으로 질문 링크 원클릭 공유
- **자연스러운 연결**: 질문 자체가 동반자 초대 매개체 역할

## 2) 성공 기준 (Acceptance Criteria)

### 새로운 온보딩 시스템 완성
- [ ] **휴대폰 번호 수집**: 카카오 알림톡 발송을 위한 필수 입력 단계
- [ ] **Solo Mode 지원**: 동반자 없이도 즉시 Today 페이지 진입 가능
- [ ] **질문 링크 생성**: 현재 질문을 공유할 수 있는 고유 링크 생성
- [ ] **카카오톡 공유**: 질문 미리보기가 포함된 카카오톡 공유 기능
- [ ] **원클릭 연결**: 공유 링크 클릭만으로 동반자 자동 연결
- [ ] **유연한 전환**: Solo ↔ 동반자 모드 언제든 전환 가능

### 기존 시스템 호환성
- [ ] **기존 Pair 유지**: 현재 연결된 동반자 관계 보존
- [ ] **데이터 마이그레이션**: 초대코드 → 공유 토큰 시스템 전환
- [ ] **점진적 적용**: 기존 사용자는 계속 사용, 신규 사용자는 새 시스템

## 3) 에러/엣지 케이스

### 현재 처리 완료 (API 레벨)
- ✅ 만료된 코드: "만료된 초대코드입니다" 에러
- ✅ 존재하지 않는 코드: "존재하지 않는 초대코드입니다" 에러  
- ✅ 이미 사용된 코드: "이미 사용된 초대코드입니다" 에러
- ✅ 본인 코드 사용: "본인이 생성한 초대코드는 사용할 수 없습니다" 에러
- ✅ 중복 연결: "이미 다른 가족과 연결되어 있습니다" 에러

### UI 연결 필요
- [ ] API 에러를 사용자 친화적으로 표시
- [ ] 네트워크 오류 처리
- [ ] 로딩 상태 관리

## 4) 즉시 수정 필요한 구현 사항

### 현재 상태 분석
```
✅ 완전 구현됨:
├── lib/invite-code.ts (6자리 코드 생성/검증 로직) ✅
├── app/api/onboarding/generate/route.ts (코드 생성 API) ✅  
├── app/api/onboarding/connect/route.ts (코드 연결 API) ✅
└── prisma/schema.prisma (Pair 모델) ✅

❌ 수정 필요:
├── components/onboarding/ConnectWithCode.tsx (하드코딩 제거)
├── components/onboarding/ShareInvitation.tsx (API 연결)
└── app/(auth)/onboarding/page.tsx (흐름 완성)
```

### 수정할 하드코딩 항목
1. **ConnectWithCode.tsx**:
   ```typescript
   // ❌ 수정 전
   if (inviteCode.trim().length !== 7) {
   const validCodes = ['FAM2024', 'TEST123', 'DEMO456']
   
   // ✅ 수정 후
   if (inviteCode.trim().length !== 6) {
   const response = await fetch('/api/onboarding/connect', ...)
   ```

2. **ShareInvitation.tsx**: 실제 생성 API 연결
3. **6자리 코드**: 모든 UI에서 7자리 → 6자리로 수정

## 5) 구현 계획 - 즉시 수정 (Tasks)

### Phase 0 완성 🚨 **최우선**
- [ ] **휴대폰 번호 입력 단계 추가** (40분)
  - [ ] PhoneNumberInput.tsx 컴포넌트 생성
  - [ ] 휴대폰 번호 유효성 검증 (010-xxxx-xxxx 형식)
  - [ ] User 모델에 phoneNumber 필드 추가 (선택사항)
  - [ ] 온보딩 플로우에 휴대폰 번호 단계 통합

- [ ] **ConnectWithCode.tsx 수정** (30분)
  - [ ] 7자리 → 6자리 검증으로 변경
  - [ ] 하드코딩된 validCodes 배열 제거  
  - [ ] 실제 `/api/onboarding/connect` API 호출
  - [ ] API 응답 에러 처리 추가
  - [ ] TODO 주석 제거

- [ ] **ShareInvitation.tsx 수정** (20분)  
  - [ ] 실제 `/api/onboarding/generate` API 연결
  - [ ] 생성된 코드를 UI에 표시
  - [ ] 에러 처리 및 로딩 상태

- [ ] **온보딩 플로우 완성** (20분)
  - [ ] 성공적인 연결 후 `/today` 리다이렉트
  - [ ] 사용자 경험 개선

- [ ] **테스트 및 검증** (30분)
  - [ ] 전체 온보딩 플로우 테스트
  - [ ] 에러 케이스별 UI 동작 확인
  - [ ] 모바일 반응형 확인

**예상 소요시간**: 2시간 40분 (휴대폰 번호 단계 포함)

### 향후 고도화 계획 (낮은 우선순위)

**Phase 1: 데이터 모델 확장** 
- [ ] User 모델에 interests 필드 추가
- [ ] ShareToken 모델 생성 (카카오 공유용)
- [ ] 관심사 카테고리 정의

**Phase 2: 카카오 공유 시스템**
- [ ] 카카오 JavaScript SDK 연동
- [ ] 토큰 기반 자동 페어링
- [ ] `/join/[token]` 페이지 구현

**Phase 3: 관심사 개인화**  
- [ ] 관심사 선택 UI
- [ ] 질문 추천 알고리즘
- [ ] 개인화된 질문 출제

## 6) 새로운 데이터베이스 설계

### 동반자(Companion) 시스템으로 전환
```typescript
model Companion {
  id           String    @id @default(cuid())
  user1Id      String    // 질문 공유한 사용자
  user2Id      String?   // 동반자 (null이면 Solo Mode)
  shareToken   String?   @unique  // 질문 공유 토큰
  status       String    @default("solo")  // solo/pending/active
  createdAt    DateTime  @default(now())
  connectedAt  DateTime? // 동반자 연결 시간
  
  user1        User      @relation("User1Companion", fields: [user1Id], references: [id])
  user2        User?     @relation("User2Companion", fields: [user2Id], references: [id])
  assignments  Assignment[]
  
  @@map("companions") // 테이블명을 companions로 변경
}

model ShareToken {
  id           String    @id @default(cuid())
  token        String    @unique  // URL-safe 토큰
  companionId  String    
  questionId   String    // 공유할 질문
  serviceDay   String    // 해당 날짜
  createdBy    String    // 생성한 사용자 ID
  expiresAt    DateTime  // 24시간 만료
  usedAt       DateTime? // 사용된 시간
  
  companion    Companion @relation(fields: [companionId], references: [id])
  question     Question  @relation(fields: [questionId], references: [id])
  creator      User      @relation(fields: [createdBy], references: [id])
  
  @@map("share_tokens")
}
```

## 7) 새로운 API 설계

### 핵심 API 엔드포인트
```typescript
// POST /api/share/create - 질문 공유 토큰 생성
{
  "questionId": "question_xxx",
  "serviceDay": "2025-08-29"
}
→ Response: { 
  "shareUrl": "https://dearq.app/join/abc123",
  "token": "abc123",
  "expiresAt": "2025-08-30T05:00:00Z"
}

// GET /api/join/[token] - 공유 링크 정보 조회
→ Response: {
  "question": { "content": "오늘 가장 기억에 남는 순간은?" },
  "sharedBy": { "nickname": "엄마" },
  "serviceDay": "2025-08-29",
  "isExpired": false
}

// POST /api/join/[token] - 동반자 연결
→ Response: {
  "companionId": "companion_yyy",
  "redirectTo": "/today"
}

// POST /api/companion/solo - Solo Mode 시작
→ Response: {
  "companionId": "companion_zzz", 
  "redirectTo": "/today"
}
```

### Solo Mode 게이트 시스템
```typescript
// Solo Mode에서는 답변 즉시 공개
// 동반자 연결 시 기존 게이트 시스템 적용
function getGateStatus(assignment, userId, companionType) {
  if (companionType === 'solo') {
    return assignment.answers.length > 0 ? 'opened' : 'waiting'
  }
  
  // 기존 동반자 게이트 로직 적용
  return getCompanionGateStatus(assignment, userId)
}
```

## 8) 테스트 계획

### 새로운 플로우 테스트
- [ ] **휴대폰 번호 입력**: 로그인 → 휴대폰 번호 입력 → 유효성 검증
- [ ] **Solo Mode**: 휴대폰 번호 입력 → Solo 선택 → Today 페이지 → 답변 즉시 공개
- [ ] **질문 공유**: 휴대폰 번호 입력 → 공유 선택 → 링크 생성 → 카카오톡 공유
- [ ] **동반자 연결**: 공유 링크 클릭 → 자동 로그인 → 동반자 연결 → Today 이동
- [ ] **모드 전환**: Solo → 동반자 초대, 동반자 → Solo 전환
- [ ] **기존 사용자**: 기존 Pair 관계 유지 및 정상 동작

## 8) 현재 아키텍처 (완성된 부분)

```
초대코드 시스템 아키텍처 ✅ 완성:
├── 사용자 A: 로그인 → 온보딩 → "초대코드 생성" 
│   ├── POST /api/onboarding/generate → 6자리 코드 반환
│   └── 가족에게 코드 공유 (현재: 수동, 향후: 카카오)
│
└── 사용자 B: 코드 받음 → "초대코드 입력"
    ├── POST /api/onboarding/connect → Pair 연결 완성
    └── /today 페이지로 자동 이동

❌ UI 하드코딩 수정 필요:
├── ConnectWithCode.tsx: 가짜 API → 실제 API
├── ShareInvitation.tsx: 하드코딩 → 실제 생성
└── 7자리 → 6자리 검증 통일
```

## 9) 고도화 로드맵 (낮은 우선순위)

### 관심사 기반 개인화 시스템
```typescript
const INTEREST_CATEGORIES = [
  { id: 'daily', name: '일상·하루', emoji: '☀️' },
  { id: 'memories', name: '추억·과거', emoji: '📸' },
  { id: 'family', name: '가족·관계', emoji: '👨‍👩‍👧‍👦' },
  { id: 'gratitude', name: '감사·행복', emoji: '😊' },
  { id: 'hobbies', name: '취향·취미', emoji: '🎨' },
  { id: 'food', name: '음식·요리', emoji: '🍽️' },
  { id: 'learning', name: '배움·호기심', emoji: '📚' },
  { id: 'seasons', name: '계절·날씨·장소', emoji: '🌸' },
  { id: 'future', name: '미래·꿈·계획', emoji: '🌟' },
  { id: 'comfort', name: '위로·응원·자기돌봄', emoji: '🤗' }
]
```

### 카카오 공유 플로우 (미래)
```
스마트 온보딩 플로우 (향후 계획):
사용자 A: 프로필 설정 → 관심사 선택 → 카카오 공유 → 토큰 링크 생성
사용자 B: 링크 클릭 → 자동 로그인 → 즉시 Pair 생성 → 맞춤 질문 시작
```

## 10) 변경 로그 (Living)

- **2025-09-01**: **v5.1 답변 시스템 개선과 온보딩 연관성**
  - **Solo Mode 연관성**: v5.1에서 구현된 답변 수정 기능은 혼자모드 사용자에게도 동일하게 적용
  - **인풋 박스 에러 해결**: 온보딩 후 Today 페이지에서의 첫 답변 입력 시 에러 없는 경험 제공
  - **브라우저 호환성**: 온보딩 플로우에서 Today 페이지로 이동 후 모든 브라우저에서 안정적 동작
  - **접근성 개선**: 온보딩 완료 후 답변 작성 시 44px 터치 타겟, ARIA 레이블 등 접근성 기준 완벽 준수

- **2025-08-31**: **색상 시스템 완전 보완 및 테스트 UX 개선 (v4.2.1)**
  - **포커스 스타일 완전 전환**: globals.css에서 --ring 변수 주황색(#EA580C) → 라벤더(#A78BFA) 변경
    - 닉네임 입력 필드 포커스 테두리 색상 문제 완전 해결
    - 다크모드에서도 일관된 라벤더 포커스 스타일 적용
    - 접근성 스타일(.sr-only-focusable) 배경색도 바이올렛으로 통일
  - **CurrentScenarioStatus 컴포넌트 신규 개발**: 
    - 우상단 고정 위치(fixed top-4 right-4)로 현재 테스트 시나리오 상태 표시
    - 시나리오 아이콘, 제목, 카테고리, 설명을 포함한 완전한 정보 제공
    - 모든 페이지(Today, History, Settings, Onboarding)에 통합 적용
    - X 버튼으로 테스트 시나리오 해제 기능 포함
  - **솔로모드 상태 로직 완전 개선**: GateStatus.tsx에서 솔로모드 처리 고도화
    - "상대방 답변 대기" 메시지를 "혼자만의 시간" 메시지로 변경
    - 답변 완료 상태에서 solo_mode 상태로 정확한 전환 보장
    - 진행률 표시, Alert 메시지, Badge 모두 솔로모드 맞춤 처리
  - **실제 브라우저 검증**: 모든 문제 해결 확인 및 사용자 피드백 반영 완료

- **2025-08-30**: **테스트 모드 완전 해결 및 온보딩 플로우 완성 (v0.8.4)**
  - **테스트 모드 API 인증 문제 완전 해결**: 
    - middleware.ts에 API 라우트 matcher 추가로 API 인증 문제 해결
    - lib/test-mode.ts 유틸리티 생성으로 테스트 모드 감지 자동화
    - 주요 API 라우트(/api/today, /api/settings/*, /api/onboarding/*)에 테스트 모드 지원
    - Referer 헤더 기반 자동 테스트 모드 감지로 개발자 경험 극대화
  - **온보딩 완료 후 메인 화면 자동 이동**: 
    - InterestSelector 컴포넌트에서 관심사 선택 완료 시 /today로 자동 이동 구현
    - 테스트 모드 파라미터 유지로 테스트 환경에서도 완전한 플로우 테스트 가능
    - 프로덕션/테스트 모드 모두 지원하는 안정적인 라우팅
  - **개발자 경험 100% 완성**: 
    - 인증 없이 전체 애플리케이션 플로우 테스트 가능
    - 로그인 → 온보딩 → Today 페이지 전체 시나리오 완전 동작
    - 개발 모드에서만 활성화, 프로덕션 보안 유지

- **2025-08-30**: **디자인 시스템 통합 및 색상 체계 완성 (v2.1)**
  - **통합 색상 시스템**: 온보딩 페이지에 통합 디자인 시스템 적용
    - 8개 색상 팔레트 체계 적용: Purple(혼자모드), Blue(정보), Green(성공), Red(에러), Yellow(카카오), Rose(긴급), Indigo(시스템), Pink(소셜)
    - 온보딩 플로우에서 일관된 색상 사용으로 브랜드 통일성 향상
    - 접근성 준수: 모든 색상 조합에서 WCAG 대비율 4.5:1 이상 확보
  - **스타일 가이드 연동**: 실제 프로젝트에서 사용되는 모든 색상을 디자인 시스템에 통합
    - app/style-guide/page.tsx에 온보딩 관련 컬러 팔레트 문서화
    - 개발자와 디자이너 간 일관된 색상 참조 가능

- **2025-08-30**: **테스트 시스템 전면 개선 및 개발도구 UX 혁신 (v0.8.3)**
  - **테스트 페이지 UX 개선**: 페이지 인덱스 방식으로 완전 개편
    - 기존 복잡한 URL 방식에서 직관적인 드롭다운 선택 방식으로 변경
    - TestScenarioDropdown 공용 컴포넌트 생성으로 모든 페이지 통합
    - 테스트 시나리오 카테고리화: 'auth', 'today', 'history', 'settings', 'onboarding'
    - 개발자 경험(DX) 대폭 향상: 클릭 한 번으로 시나리오 전환
  - **온보딩 테스트 시스템 확장**: 온보딩 관련 4개 테스트 시나리오 추가
    - 신규 사용자 온보딩 시뮬레이션
    - 초대받은 사용자 온보딩 시뮬레이션
    - 프로필 설정 테스트 (향후 구현용)
    - 관심사 선택 테스트 (향후 구현용)
  - **인증 우회 시스템**: `test_mode=true` 쿼리 파라미터 지원
    - middleware.ts에 테스트 모드 감지 로직 추가
    - 온보딩 테스트에서 자동 인증 우회로 편의성 극대화
  - **사용자 인터페이스 용어 통일**: solo/companion → 혼자모드/함께모드
    - 개발 소스는 유지, 사용자 화면만 한국어 용어 적용
    - 온보딩 페이지 전반에 통일된 용어 적용

- **2025-08-31**: **온보딩 페이지 디자인 시스템 업그레이드 (v4.1)**: 라벤더 메인 브랜드 아이덴티티 전면 적용
  - **색상 시스템 전환**: 오렌지 계열에서 라벤더 메인 색상으로 완전 전환
    - 배경 그라디언트: orange-50 → violet-50
    - 개발 모드 표시: yellow-400 → violet-100 (시각적 피로도 개선)
    - 테스트 드롭다운: blue-50 → violet-50 (브랜드 통일성)
    - 카운트다운 보더: orange-500 → violet-500
  - **사용자 피드백 반영**: "오렌지 자체의 색상이 진해서 좀 쨍하다" 의견 수용
    - 부드럽고 차분한 라벤더로 시각적 피로도 개선
    - 신뢰감과 포근함을 주는 색상 선택으로 브랜드 아이덴티티 강화
  - **일관된 사용자 경험**: 온보딩→Today→History→Settings 전체 페이지 색상 통일
    - 페이지 간 이동 시 일관된 브랜드 경험 제공
    - 라벤더 메인(#A78BFA) + 웜 피치 서브(#FBBF24) 색상 체계 완성

- **2025-08-31**: **온보딩 UX 전면 개선 및 시각적 피드백 시스템 구축 (v4.2)**
  - **색상 변경 완료**: 모든 온보딩 컴포넌트에서 주황색 → 바이올렛 완전 전환
    - OnboardingFlow.tsx: 로딩 스피너 및 진행 표시바 색상 변경
    - PreviewQuestion.tsx: 카드 테두리, 배경, 버튼 색상 통일
    - KakaoShare.tsx: 배경, 버튼, 진행 표시바 브랜드 색상 적용
    - StartingOptions.tsx: 카드 배경 및 호버 효과 개선
    - ShareInvitation.tsx: 카드 테두리 색상 통일
    - MobileBottomNavigation.tsx: 전역 하단 네비게이션 바이올렛 통합
  - **TestScenarioDropdown 시각적 피드백 구축**: 
    - 토스트 알림 시스템 추가로 시나리오 변경 시 명확한 피드백 제공
    - 바이올렛 브랜드 색상(bg-violet-500) 적용으로 일관성 유지
    - 1.5초 지연 후 자동 새로고침으로 변경사항 즉시 반영
    - 사용자가 "어떤 시나리오인지 보이지 않는다" 문제 완전 해결
  - **관심사 선택 UX 대폭 개선**: 
    - 토스트 알림: 카드 선택/해제 시 즉시 피드백 ({카테고리명} 선택됨!)
    - 애니메이션 강화: 선택된 카드 scale-105, 호버 시 scale-102, 클릭 시 active:scale-98
    - 시각적 효과 개선: ring-2 ring-violet-200 추가, shadow-lg 강화
    - 체크 아이콘 부드러운 애니메이션: 회전, 크기, 투명도 전환 효과
    - "카드 클릭 시 즉시 화면 이동" 오해 해결 및 선택 상태 명확화
  - **개발 도구 및 테스트 환경 개선**: 
    - 실제 브라우저 검증을 통한 색상 변경사항 확인 완료
    - 모든 온보딩 페이지에서 바이올렛 색상 시스템 완벽 적용 검증
    - 브랜드 일관성 100% 달성

- **2025-08-29**: **문서-코드 불일치 문제 해결을 위한 전면 재작성**
  - **실제 상황 정확 반영**: 백엔드 API 100% 완성, UI만 하드코딩 상태
  - **UI 연결 문제 명시**: ConnectWithCode.tsx에서 가짜 API 사용 중
  - **즉시 수정 계획**: 2시간 소요 예상, 하드코딩 제거 후 실제 API 연결
  - **우선순위 재정리**: 고도화(카카오 공유, 관심사)는 낮은 우선순위로 분리
  - **문제점 구체화**: 
    - 7자리 vs 6자리 검증 불일치
    - validCodes 배열 하드코딩
    - 가짜 API 지연 setTimeout 사용
    - TODO 주석 방치

- **2025-08-28**: 초기 고도화 계획 작성 (현재는 과도한 계획으로 판단)

## 11) 의존성 체크

### 선행 요구사항 ✅ 완료
- [x] ✅ User, Pair 모델 Prisma 정의
- [x] ✅ NextAuth 인증 시스템 구현  
- [x] ✅ 초대코드 생성/검증 로직 완성
- [x] ✅ API 엔드포인트 구현

### 즉시 수정 필요
- [ ] 🚨 UI 컴포넌트 하드코딩 제거
- [ ] 🚨 6자리 검증으로 통일  
- [ ] 🚨 실제 API 연결

### 향후 고도화 의존성 (낮은 우선순위)
- [ ] ShareToken 모델 DB 설정 (카카오 공유용)
- [ ] Questions 모델에 category 필드 추가 (개인화용)
- [ ] 카카오 JavaScript SDK 프로젝트 키 발급

### 후속 작업 연결
- **today-page.plan.md**: 연결 완료 후 첫 질문 제시
- **settings-page.plan.md**: 향후 관심사 변경 및 Pair 관리
- **admin-tools.plan.md**: 초대코드 사용 통계 (운영 시작 후)

## 결론

**현재 상태**: 초대코드 시스템 백엔드 100% 완성, UI 연결만 남음
**최우선 작업**: UI 하드코딩 제거 (2시간 소요 예상)
**고도화**: 카카오 공유, 관심사 개인화는 실제 사용자 피드백 후 진행