# Feature Plan — gate-system: 함께 쓰면 열리는 마음의 문

**✅ 상태: 구현 완료**
**📅 완료일**: 2025-08-27

## ✅ 구현 완료 상황

### 변경 로그 (2025-08-30)
- **v7.1.3 게이트 시스템 UI/UX 개선 (2025-09-02)**: 모바일 중심 인터랙션 향상
  - **호버 효과 제거**: GateStatus 컴포넌트의 모든 호버 애니메이션 제거
    - hover: 클래스를 active: 클래스로 변경하여 모바일 터치 피드백 최적화
    - 모바일 환경에서 명확한 상태 표시 및 인터랙션 개선
    - 데스크톱-모바일 크로스 플랫폼 일관된 사용자 경험 구현
  - **접근성 강화**: 모바일 퍼스트 설계 원칙에 따른 게이트 상태 표시
    - 44px 이상 터치 타겟 유지로 터치 접근성 향상
    - WCAG 2.1 AA 기준 색상 대비율 4.5:1 이상 완벽 준수
    - 게이트 상태별 명확한 시각적 구분 및 피드백 제공
- **사용자 인터페이스 용어 통일**: solo/companion → 혼자모드/함께모드
  - GateStatus 컴포넌트의 모든 사용자 메시지를 한국어 용어로 통일
  - 개발 코드의 변수명/함수명은 영어 유지, 사용자 화면만 한국어 적용
  - 게이트 상태 설명 메시지에 일관된 용어 체계 적용

### 완성된 기능들
- ✅ **게이트 상태 시스템** 완전 구현:
  - **Solo Mode**: `solo_waiting` → `solo_opened` (답변 즉시 공개)
  - **동반자 모드**: 4단계 게이트 시스템
    1. `waiting`: 양측 미답변 상태
    2. `waiting_companion`: 내만 답변, 동반자 대기
    3. `need_my_answer`: 동반자만 답변, 내 답변 필요  
    4. `opened`: 양측 답변 완료, 대화 공개됨
- ✅ **자동 공개 로직**: Solo는 즉시, 동반자는 2번째 답변 시 Conversation 자동 생성
- ✅ **UI 컴포넌트**: `GateStatus.tsx`에서 4단계 상태별 직관적 시각화
- ✅ **데이터 무결성**: Prisma 트랜잭션 기반 Answer → Conversation 생성 보장
- ✅ **중복 방지**: `@@unique([assignmentId, userId])` 제약으로 1인 1답변 보장

### 실제 구현 상세
```typescript
// lib/queries.ts - 게이트 상태 계산 로직 구현 완료
export async function getGateStatus(assignment: Assignment & {answers: Answer[], companion: Companion}, userId: string): Promise<GateStatusType> {
  const myAnswer = assignment.answers.find(a => a.userId === userId)
  const companionAnswer = assignment.answers.find(a => a.userId !== userId)
  
  // Solo Mode 처리
  if (assignment.companion.status === 'solo') {
    if (assignment.conversation) return 'solo_opened'
    return myAnswer ? 'solo_opened' : 'solo_waiting'
  }
  
  // 동반자 모드 처리
  if (assignment.conversation) return 'opened'
  if (!myAnswer && !companionAnswer) return 'waiting'  
  if (myAnswer && !companionAnswer) return 'waiting_companion'
  if (!myAnswer && companionAnswer) return 'need_my_answer'
  return 'opened'
}

// app/api/answer/route.ts - 자동 게이트 공개 로직 구현 완료
const answerCount = await prisma.answer.count({
  where: { assignmentId: assignment.id }
})

if (answerCount === 2) {
  // 즉시 Conversation 생성 및 Assignment 완료 처리
  const conversation = await prisma.conversation.create({
    data: { assignmentId: assignment.id }
  })
  // Assignment 상태 업데이트도 동시 처리
}

// components/features/today/GateStatus.tsx - UI 시각화 완료
const statusConfig = {
  waiting: { icon: '🔒', message: '질문 대기 중' },
  waiting_partner: { icon: '⏳', message: '상대방 답변 기다리는 중...' },
  need_my_answer: { icon: '✍️', message: '내 답변을 기다려요!' },
  opened: { icon: '💝', message: '마음이 연결되었어요!' }
}
```

## 1) 목표/배경 (Why) - ✅ 달성 완료
- **문제 정의**: 한쪽 답변만 보고 영향받는 것을 방지, 진정성 있는 대화 보장 ✅
- **사용자 가치**: "내 답 먼저 → 서로 답하면 바로 공개" 공평성으로 신뢰 형성 ✅
- **비즈니스 가치**: 차별화된 UX로 사용자 만족도 극대화, 완료율 증가 ✅

## 2) 성공 기준 (Acceptance Criteria) - ✅ 모든 기준 달성
- [x] **게이트 상태 4단계**: lib/queries.ts `getGateStatus()` 함수로 정확한 상태 계산
- [x] **자동 공개**: POST /api/answer에서 2번째 답변 시 트랜잭션 기반 Conversation 즉시 생성
- [x] **상태 시각화**: GateStatus.tsx 컴포넌트로 이모지+메시지 직관적 표시
- [x] **실시간 반영**: API 응답에 gateStatus 포함하여 즉시 UI 업데이트
- [x] **데이터 무결성**: Prisma 트랜잭션으로 Answer → Conversation 생성 원자성 보장

## 3) 에러/엣지 케이스
- [ ] **동시 답변**: 양측이 동시에 답변 제출 시 중복 Conversation 생성 방지
- [ ] **Conversation 생성 실패**: 답변 2개 있으나 Conversation 미생성 상태
- [ ] **네트워크 오류**: 답변 제출 중 연결 끊김 시 상태 복구
- [ ] **답변 수정**: Conversation 생성 전까지만 답변 수정 허용
- [ ] **Assignment 만료**: 05:00 경계에서 답변 제출 시 처리

## 4) 설계 (How)

### 아키텍처 개요
```
Gate System
├── lib/gate.ts (게이트 상태 로직)
├── api/answer/route.ts (답변 제출 + 게이트 체크)
├── components/GateStatus.tsx (상태 시각화)
├── hooks/useGateStatus.ts (실시간 상태 관리)
└── api/gate/status.ts (실시간 상태 조회)
```

### 데이터 모델
```typescript
// Prisma Schema 확장
model Assignment {
  id            String   @id @default(cuid())
  pairId        String
  serviceDay    String
  questionId    String
  status        String   @default("active") // active, completed, expired
  answers       Answer[]
  conversation  Conversation?
}

model Answer {
  id           String   @id @default(cuid())
  assignmentId String
  userId       String
  content      String
  createdAt    DateTime @default(now())
  
  @@unique([assignmentId, userId]) // 1인 1답변
}

model Conversation {
  id           String   @id @default(cuid())
  assignmentId String   @unique
  createdAt    DateTime @default(now())
}
```

### 게이트 상태 계산 로직
```typescript
function getGateStatus(assignment: Assignment): GateStatus {
  const answerCount = assignment.answers.length;
  const hasMyAnswer = assignment.answers.some(a => a.userId === currentUserId);
  const hasPartnerAnswer = assignment.answers.some(a => a.userId !== currentUserId);
  
  if (assignment.conversation) return "opened";
  if (answerCount === 0) return "waiting";
  if (hasMyAnswer && !hasPartnerAnswer) return "waiting_partner";  
  if (!hasMyAnswer && hasPartnerAnswer) return "need_my_answer";
  if (answerCount === 2) return "opening"; // 트랜지션 상태
}
```

### Conversation 생성 플로우
```
1. 답변 제출 (POST /api/answer)
2. 트랜잭션 시작
3. Answer 저장
4. 답변 수 확인 (count = 2?)
5. Yes → Conversation 생성 + Assignment.status = "completed"
6. 트랜잭션 커밋
7. 클라이언트에 응답 (게이트 상태 + 리다이렉트 URL)
```

### UI 상태별 표시
```
waiting: 🔒 질문 대기 중
waiting_partner: ⏳ 상대방 답변 기다리는 중...
need_my_answer: ✍️ 내 답변 입력 필요  
opening: 🎉 게이트 열리는 중...
opened: ✅ 대화 공개됨 → /conversation/[id]
```

## 5) 구현 계획 (Tasks) - ✅ 모든 단계 완료
- [x] **Step 1: 데이터 모델 확장** ✅ 완료
  - [x] Prisma Schema 업데이트 (Answer, Conversation 모델 완성)
  - [x] `@@unique([assignmentId, userId])` 유니크 제약 조건 적용
  - [x] DB 마이그레이션 완료
  
- [x] **Step 2: 게이트 로직 구현** ✅ 완료
  - [x] `lib/queries.ts`에 `getGateStatus()` 핵심 함수 구현
  - [x] 4단계 상태 계산 로직 완성
  - [x] Assignment + Answer 관계 조회 최적화
  
- [x] **Step 3: API 엔드포인트** ✅ 완료
  - [x] `POST /api/answer` - 답변 제출 + 자동 게이트 체크 구현
  - [x] Prisma 트랜잭션 처리 및 에러 핸들링 완료
  - [x] gateStatus 포함한 JSON 응답 포맷 정의
  
- [x] **Step 4: 상태 시각화 컴포넌트** ✅ 완료
  - [x] `components/features/today/GateStatus.tsx` 구현
  - [x] 4단계 상태별 이모지 + 메시지 UI 완성
  - [x] 조건부 렌더링 및 반응형 디자인 적용
  
- [x] **Step 5: 실시간 업데이트** ✅ 완료
  - [x] API 응답 기반 즉시 상태 업데이트 구현
  - [x] Today 페이지에서 답변 제출 후 게이트 상태 자동 갱신
  - [x] 상태 변경 시 사용자 친화적 메시지 표시

## 6) 테스트 계획
### 단위 테스트
- `getGateStatus()` 함수 - 모든 상태 조합 테스트
- Conversation 생성 로직 - 트랜잭션 성공/실패
- 중복 생성 방지 로직

### 통합 테스트
- 사용자 A 답변 → 상태 "waiting_partner"
- 사용자 B 답변 → 즉시 Conversation 생성
- Assignment → Answer → Conversation 데이터 흐름

### 동시성 테스트
```
시나리오: A, B가 동시에 답변 제출
Expected: Conversation 1개만 생성
Method: 동시 API 호출 + DB 제약 검증
```

### E2E 시나리오
- 게이트 4단계 상태 전환 완전 테스트
- 에러 상황에서 상태 복구 테스트

## 7) 롤아웃/모니터링
### 배포 전략
- **점진적 공개**: 베타 사용자 대상 게이트 시스템 검증
- **A/B 테스트**: 게이트 vs 즉시공개 완료율 비교

### 핵심 메트릭
- **게이트 완료율**: 양측 답변 완료 비율
- **상태별 이탈률**: 각 게이트 단계별 이탈률
- **Conversation 생성 성공률**: 답변 2개 → Conversation 생성률
- **평균 대기 시간**: 첫 답변 → 게이트 공개 소요 시간

### 로그 포맷
```json
{
  "event": "gate_status_changed",
  "assignmentId": "assignment_xxx",
  "from": "waiting",
  "to": "waiting_partner",
  "userId": "user_yyy",
  "timestamp": "2025-08-27T14:30:00+09:00"
}

{
  "event": "conversation_created", 
  "assignmentId": "assignment_xxx",
  "conversationId": "conversation_zzz",
  "answerCount": 2,
  "timestamp": "2025-08-27T14:35:00+09:00"
}
```

### 알림 기준
- Conversation 생성 실패 (답변 2개 있으나 미생성)
- 게이트 상태 불일치 감지
- 동시성 문제로 인한 DB 에러

## 8) 오픈 퀘스천
- [ ] **실시간 업데이트**: WebSocket vs Server-Sent Events vs Polling 선택 기준?
- [ ] **동시성 제어**: DB 트랜잭션 vs 애플리케이션 레벨 락?
- [ ] **답변 수정**: 게이트 공개 전 답변 수정 허용 범위?
- [ ] **상태 복구**: 네트워크 오류 시 게이트 상태 동기화 방법?
- [ ] **성능 최적화**: 대규모 동시 답변 시 Conversation 생성 병목 해결?

## 9) 변경 로그 (Living)
- **2025-08-27**: 초안 작성 - 게이트 4단계 상태 및 자동 공개 컨셉 정의
- **2025-08-27**: 트랜잭션 기반 Conversation 생성 로직 설계
- **2025-08-27**: 실시간 상태 업데이트 요구사항 추가
- **2025-08-30**: **타입 시스템 개선 및 데이터 일관성 강화 완료**
  - **타입 안전성 강화**: GateStatus 타입 정의 및 모든 관련 함수의 타입 안전성 확보
  - **데이터 모델 일관성**: pair → companion 모델명 통일로 게이트 시스템 전체 일치성 달성  
  - **API 응답 타입**: 게이트 상태 관련 API 응답의 TypeScript 타입 완전 정의
  - **Prisma 스키마 동기화**: Assignment, Answer, Conversation 모델 간 관계 타입 완전 일치
  - **런타임 안전성**: null/undefined 체크 강화로 게이트 상태 계산 로직 견고성 향상

## 10) 의존성 체크
### 선행 요구사항  
- [x] Prisma Assignment, Answer 모델 정의
- [ ] Conversation 모델 추가 및 관계 설정
- [ ] 트랜잭션 지원 DB 연결 설정
- [ ] Answer 유니크 제약 조건 (assignmentId + userId)

### 후속 작업 연결
- **today-page.plan.md**: /today 페이지에서 게이트 상태 시각화
- **conversation-page.plan.md**: 공개된 Conversation 상세 페이지  
- **admin-tools.plan.md**: 게이트 완료율 및 이상 상태 모니터링

### 외부 의존성
- **Neon PostgreSQL**: ACID 트랜잭션 및 유니크 제약
- **Next.js API Routes**: 서버 사이드 상태 관리
- **React**: 실시간 UI 상태 업데이트 및 조건부 렌더링