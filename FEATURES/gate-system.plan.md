# Feature Plan — gate-system: 게이트 공개 시스템

## 1) 목표/배경 (Why)
- **문제 정의**: 한쪽 답변만 보고 영향받는 것을 방지, 진정성 있는 대화 보장
- **사용자 가치**: "내 답 먼저 → 서로 답하면 바로 공개" 공평성으로 신뢰 형성
- **비즈니스 가치**: 차별화된 UX로 사용자 만족도 극대화, 완료율 증가

## 2) 성공 기준 (Acceptance Criteria)
- [ ] **게이트 상태 4단계**: 
  1. 양측 미답변: "질문 대기 중"
  2. 내만 답변: "상대방 답변 기다리는 중..."  
  3. 상대만 답변: "내 답변 입력 필요"
  4. 양측 답변 완료: 즉시 Conversation 생성 + 공개
- [ ] **자동 공개**: 2번째 답변 제출 즉시 Conversation 생성 및 리다이렉트
- [ ] **상태 시각화**: 게이트 진행 상황을 직관적 UI로 표시
- [ ] **실시간 반영**: 상대방 답변 완료 시 자동으로 UI 갱신
- [ ] **데이터 무결성**: Answer → Conversation 생성 과정에서 데이터 일관성 보장

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

## 5) 구현 계획 (Tasks)
- [ ] **Step 1: 데이터 모델 확장**
  - [ ] Prisma Schema 업데이트 (Answer, Conversation)
  - [ ] 유니크 제약 조건 추가
  - [ ] DB 마이그레이션 실행
  - [ ] 실행: `npx prisma db push && npx prisma generate`
  
- [ ] **Step 2: 게이트 로직 구현** 
  - [ ] `lib/gate.ts` 핵심 함수 구현
  - [ ] getGateStatus, shouldOpenGate 함수
  - [ ] 단위 테스트 작성
  - [ ] 실행: `npm run test -- gate`
  
- [ ] **Step 3: API 엔드포인트**
  - [ ] `/api/answer` POST - 답변 제출 + 게이트 체크
  - [ ] 트랜잭션 처리 및 에러 핸들링
  - [ ] 응답 포맷 정의 (상태 + 리다이렉트)
  - [ ] 실행: `npm run typecheck`
  
- [ ] **Step 4: 상태 시각화 컴포넌트**
  - [ ] `GateStatus` 컴포넌트 구현
  - [ ] 4단계 상태별 UI 분기
  - [ ] 로딩 및 에러 상태 처리
  - [ ] 실행: `npm run build`
  
- [ ] **Step 5: 실시간 업데이트** 
  - [ ] `useGateStatus` 훅 구현
  - [ ] 폴링 또는 WebSocket 연동
  - [ ] 자동 리다이렉트 로직
  - [ ] 실행: `npm run lint && npm run test`

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