# Feature Plan — onboarding: 초대코드 기반 쌍 연결

## 1) 목표/배경 (Why)
- **문제 정의**: 가족 구성원 간 1:1 연결을 안전하고 간편하게 처리
- **사용자 가치**: 복잡한 친구 추가 없이 "초대코드" 하나로 즉시 연결
- **비즈니스 가치**: 쌍 연결 과정 단순화로 이탈률 최소화

## 2) 성공 기준 (Acceptance Criteria)
- [ ] **초대코드 생성**: 한 사용자가 고유한 6자리 코드 생성 (예: "ABC123")
- [ ] **코드 입력**: 상대방이 해당 코드 입력 → 즉시 Pair 생성
- [ ] **1회성 코드**: 사용된 코드는 즉시 무효화 (1:1 연결만 허용)
- [ ] **가족 관계 설정**: 연결 과정에서 "엄마/아들" 등 라벨 설정
- [ ] **연결 완료 안내**: 쌍 생성 후 "/today 이용 가능" 안내

## 3) 에러/엣지 케이스
- [ ] **잘못된 코드**: 존재하지 않는 코드 입력 시 에러 메시지
- [ ] **만료된 코드**: 24시간 후 자동 만료 처리
- [ ] **이미 연결됨**: 같은 사용자와 중복 연결 시도 방지
- [ ] **본인 코드**: 자신이 생성한 코드를 자신이 입력하는 경우
- [ ] **코드 충돌**: 중복 코드 생성 방지 (낮은 확률이지만)

## 4) 설계 (How)

### 아키텍처 개요
```
Onboarding System
├── app/(auth)/onboarding/page.tsx (온보딩 메인)
├── components/onboarding/InviteCodeGenerator.tsx 
├── components/onboarding/InviteCodeInput.tsx
├── components/onboarding/FamilyLabelSelector.tsx
├── api/onboarding/generate/route.ts (코드 생성)
├── api/onboarding/connect/route.ts (쌍 연결)
└── lib/invite-code.ts (코드 생성 로직)
```

### 초대코드 생성 로직
```typescript
function generateInviteCode(): string {
  // 6자리 영숫자 조합 (0, O, I, 1 제외로 가독성 향상)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 중복 확인 후 DB 저장
async function createInviteCode(userId: string) {
  let code: string
  let attempts = 0
  
  do {
    code = generateInviteCode()
    attempts++
  } while (await isCodeExists(code) && attempts < 10)
  
  return await prisma.pair.create({
    data: {
      user1Id: userId,
      user2Id: "", // 연결 시 채움
      inviteCode: code,
      status: "pending"
    }
  })
}
```

### 온보딩 플로우
```
A 사용자 (초대하는 사람):
1. /onboarding → "가족 초대하기" 선택
2. 가족 관계 설정 (예: "나는 엄마")
3. "초대코드 생성" → "MOM123" 생성됨
4. 코드 공유 (카카오톡, 문자 등)

B 사용자 (초대받는 사람):
1. /onboarding → "초대코드 입력" 선택  
2. "MOM123" 입력
3. 가족 관계 설정 (예: "나는 아들")
4. "연결하기" → Pair 완성
5. → /today 페이지로 리다이렉트
```

### 데이터 모델 업데이트
```typescript
model Pair {
  id         String   @id @default(cuid())
  user1Id    String   // 초대한 사람
  user2Id    String?  // 초대받은 사람 (nullable)
  inviteCode String   @unique
  status     String   @default("pending") // pending, active, expired
  createdAt  DateTime @default(now())
  expiresAt  DateTime // 24시간 후 만료
}

model User {
  // 기존 필드들...
  label      String?  // "엄마", "아들", "아빠", "딸" 등
}
```

### UI/UX 플로우
- **선택 화면**: "초대하기" vs "코드 입력하기" 2가지 옵션
- **코드 생성**: 큰 글씨로 코드 표시 + 복사 버튼 + 공유하기
- **코드 입력**: 6자리 입력 필드 + 자동 대문자 변환
- **관계 설정**: 드롭다운 또는 버튼 선택 (엄마, 아빠, 아들, 딸, 기타)

## 5) 구현 계획 (Tasks)
- [ ] **Step 1: 초대코드 생성 로직**
  - [ ] `lib/invite-code.ts` 구현
  - [ ] `/api/onboarding/generate` POST 엔드포인트
  - [ ] 중복 방지 및 만료 시간 설정
  - [ ] 실행: `npm run typecheck`
  
- [ ] **Step 2: 온보딩 메인 페이지**
  - [ ] `/app/(auth)/onboarding/page.tsx` 구현
  - [ ] "초대하기" vs "참여하기" 선택 UI
  - [ ] 반응형 모바일 디자인
  - [ ] 실행: `npm run build`
  
- [ ] **Step 3: 초대코드 생성 플로우**
  - [ ] `InviteCodeGenerator` 컴포넌트
  - [ ] 가족 관계 라벨 선택기
  - [ ] 코드 표시 및 공유 기능
  - [ ] 실행: `npm run lint`
  
- [ ] **Step 4: 코드 입력 및 연결**
  - [ ] `InviteCodeInput` 컴포넌트
  - [ ] `/api/onboarding/connect` POST 엔드포인트
  - [ ] 연결 성공 시 /today 리다이렉트
  - [ ] 실행: `npm run test`
  
- [ ] **Step 5: 에러 처리 및 UX 개선**
  - [ ] 잘못된 코드 입력 시 안내
  - [ ] 로딩 상태 및 성공/실패 피드백
  - [ ] 접근성 고려 (키보드 네비게이션)
  - [ ] 실행: `npm run build`

## 6) 테스트 계획
### 단위 테스트
- 초대코드 생성 로직 (중복 방지, 가독성)
- 코드 유효성 검사 (존재하는지, 만료되었는지)
- Pair 생성 트랜잭션 무결성

### 통합 테스트
- 사용자 A 코드 생성 → 사용자 B 입력 → Pair 생성
- 만료된 코드 입력 → 에러 반환
- 이미 사용된 코드 재입력 → 에러 반환

### E2E 테스트
```
시나리오 1: 정상 연결
Given: 새 사용자 A가 /onboarding 접속
When: "초대하기" → 라벨 설정 → 코드 생성
Then: "ABC123" 코드 생성 및 표시

Given: 새 사용자 B가 /onboarding 접속  
When: "참여하기" → "ABC123" 입력 → 라벨 설정
Then: Pair 생성 후 /today로 리다이렉트

시나리오 2: 에러 케이스
Given: 사용자가 "XYZ999" (존재하지 않는 코드) 입력
When: "연결하기" 클릭
Then: "잘못된 초대코드입니다" 에러 표시
```

## 7) 롤아웃/모니터링
### 배포 전략
- **베타 테스트**: 소수 가족 대상 온보딩 테스트
- **점진적 공개**: 일일 신규 가입 제한으로 서버 부하 관리

### 핵심 메트릭
- **온보딩 완료율**: 코드 생성 → 연결 완료 비율
- **코드 사용률**: 생성된 코드 중 실제 사용된 비율
- **단계별 이탈률**: 각 온보딩 단계에서 이탈하는 비율
- **연결 소요시간**: 코드 생성부터 연결 완료까지 시간

### 로그 포맷
```json
{
  "event": "invite_code_generated",
  "userId": "user_xxx", 
  "inviteCode": "ABC123",
  "userLabel": "엄마",
  "expiresAt": "2025-08-28T14:30:00+09:00"
}

{
  "event": "pair_connected",
  "pairId": "pair_xxx",
  "inviteCode": "ABC123", 
  "user1Label": "엄마",
  "user2Label": "아들"
}
```

## 8) 오픈 퀘스천
- [ ] **코드 길이**: 6자리 vs 4자리 vs 8자리 가독성/보안 트레이드오프?
- [ ] **만료시간**: 24시간 vs 7일 vs 영구 적절한 기간?
- [ ] **가족 관계**: 자유 입력 vs 선택 옵션 vs 생략 가능?
- [ ] **재연결**: Pair 해제 후 재연결 허용 여부?
- [ ] **다중 연결**: 1인이 여러 가족과 연결 가능한가?

## 9) 변경 로그 (Living)
- **2025-08-27**: 초안 작성 - 초대코드 기반 1:1 연결 시스템 설계
- **2025-08-27**: 6자리 코드 생성 로직 및 중복 방지 전략 추가
- **2025-08-27**: 가족 관계 라벨 시스템 및 UX 플로우 정의

## 10) 의존성 체크
### 선행 요구사항
- [x] User, Pair 모델 Prisma 정의
- [x] NextAuth 인증 시스템 구현
- [ ] 초대코드 유니크 제약 조건 DB 설정
- [ ] 만료 시간 기반 자동 정리 배치 (선택적)

### 후속 작업 연결
- **today-page.plan.md**: Pair 연결 완료 후 즉시 이용 가능
- **settings-page.plan.md**: Pair 해제/재연결 관리 기능
- **admin-tools.plan.md**: 초대코드 사용 통계 모니터링

### 외부 의존성
- **Prisma 유니크 제약**: inviteCode 중복 방지
- **Next.js Router**: 온보딩 완료 후 페이지 이동
- **모바일 공유**: 초대코드 카카오톡/문자 공유 기능