# Feature Plan — daily-reset-5am: KST 05:00 서비스 데이 리셋

## 1) 목표/배경 (Why)
- **문제 정의**: "하루"의 기준을 명확히 하여 사용자 경험 일관성 확보
- **사용자 가치**: "05:00~다음날 05:00"가 하나의 질문 사이클이라는 직관적 이해
- **비즈니스 가치**: 일정한 리듬으로 사용 패턴 형성, 운영 효율성 극대화

## 2) 성공 기준 (Acceptance Criteria)
- [ ] **정확한 서비스 데이**: KST 05:00 기준으로 날짜 계산 (예: 8/27 04:59 → 8/26, 8/27 05:00 → 8/27)
- [ ] **Assignment 고유성**: 한 Pair는 동일 서비스 데이에 단 하나의 Assignment만 보유
- [ ] **자동 생성**: 05:00 이후 첫 접속 시 새로운 Assignment 자동 생성
- [ ] **상태 전환**: 이전 Assignment가 미완료라면 "expired" 상태로 변경
- [ ] **로그 기록**: 서비스 데이 전환 및 Assignment 생성 이벤트 로깅

## 3) 에러/엣지 케이스  
- [ ] **시간대 오류**: 서버 시간이 UTC인 경우 KST 변환 로직
- [ ] **동시 접속**: 여러 사용자가 05:00 직후 동시 접속 시 중복 생성 방지
- [ ] **미완료 Assignment**: 전날 미답변 Assignment 처리 방안
- [ ] **데이터 정합성**: Assignment.serviceDay와 실제 날짜 불일치 감지
- [ ] **배치 실패**: Assignment 생성 실패 시 재시도 로직

## 4) 설계 (How)

### 아키텍처 개요
```
Service Day System
├── lib/service-day.ts (핵심 로직)
├── api/today/route.ts (Assignment 조회/생성)
├── middleware.ts (시간대 처리)
└── cron/daily-reset.ts (배치 작업, 선택적)
```

### 핵심 로직 (getServiceDay 함수)
```typescript
function getServiceDay(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  
  // 05시 이전이면 전날로 처리
  if (kst.getHours() < 5) {
    kst.setDate(kst.getDate() - 1);
  }
  
  return kst.toISOString().split('T')[0]; // "YYYY-MM-DD"
}
```

### 데이터베이스 제약
```sql
-- Prisma Schema
model Assignment {
  id          String   @id @default(cuid())
  pairId      String
  serviceDay  String   // "2025-08-27"
  questionId  String
  status      String   @default("active")
  
  @@unique([pairId, serviceDay]) -- 중복 방지
}
```

### Assignment 생성 플로우
```
1. getServiceDay() → 현재 서비스 데이 계산
2. Assignment 조회 (pairId + serviceDay)
3. 없으면 → 새 Assignment 생성
4. 있으면 → 기존 Assignment 반환
5. 상태가 "expired"면 → 새 Assignment 생성
```

## 5) 구현 계획 (Tasks)
- [ ] **Step 1: 핵심 라이브러리 구현**
  - [ ] `lib/service-day.ts` 구현
  - [ ] getServiceDay, isNewServiceDay 함수
  - [ ] timezone 테스트 케이스 작성
  - [ ] 실행: `npm run test -- service-day`
  
- [ ] **Step 2: Assignment 관리 로직**
  - [ ] `lib/assignment.ts` 구현  
  - [ ] findOrCreateAssignment 함수
  - [ ] 중복 생성 방지 로직 (DB 트랜잭션)
  - [ ] 실행: `npm run typecheck`
  
- [ ] **Step 3: API 엔드포인트 연동**
  - [ ] `/api/today` GET에서 서비스 데이 로직 적용
  - [ ] Assignment 생성 시 로그 기록
  - [ ] 실행: `npm run build`
  
- [ ] **Step 4: 상태 전환 로직**
  - [ ] 이전 Assignment "expired" 처리
  - [ ] 미완료 데이터 아카이빙
  - [ ] 실행: `npm run lint && npm run test`
  
- [ ] **Step 5: 배치 최적화 (선택적)**
  - [ ] Vercel Cron으로 05:00 일괄 처리
  - [ ] 대량 사용자 대응 전략
  - [ ] 실행: `npm run build`

## 6) 테스트 계획
### 단위 테스트
- `getServiceDay()` 함수 - 다양한 시간대 테스트
- Assignment 생성 로직 - 중복 방지 검증
- 시간대 변환 정확성

### 통합 테스트  
- 04:59 → 05:00 시점 Assignment 생성
- 동일 Pair 중복 Assignment 생성 시도
- 서버 재시작 후 일관성 유지

### 시나리오 테스트
```
Given: 2025-08-27 04:59 (KST)
When: 사용자가 /today 접속
Then: 2025-08-26 serviceDay Assignment 조회/생성

Given: 2025-08-27 05:01 (KST)  
When: 같은 사용자가 /today 접속
Then: 2025-08-27 serviceDay 새 Assignment 생성
```

## 7) 롤아웃/모니터링
### 배포 전략
- **단계적 적용**: 기존 Assignment 호환성 유지
- **롤백 대비**: 기존 UTC 기준 로직 백업 유지

### 핵심 메트릭
- **Assignment 생성 정확성**: 서비스 데이별 생성 수
- **중복 생성 방지율**: DB 제약 위반 시도 횟수
- **응답 시간**: Assignment 조회/생성 소요 시간

### 로그 포맷
```json
{
  "event": "assignment_created",
  "pairId": "pair_xxx", 
  "serviceDay": "2025-08-27",
  "timestamp": "2025-08-27T05:01:23+09:00",
  "previousAssignment": "assignment_yyy"
}
```

### 알림 기준
- Assignment 생성 실패
- 서비스 데이 계산 오류
- DB 제약 위반 발생

## 8) 오픈 퀘스천
- [ ] **서버리스 환경**: Vercel Edge Runtime에서 정확한 시간 계산 보장?
- [ ] **데이터 보관**: 만료된 Assignment 아카이빙 정책?
- [ ] **배치 vs 실시간**: 05:00 일괄 처리 vs 사용자 접속 시 생성?
- [ ] **타임존 변경**: 사용자 이주 시 서비스 데이 기준 변경 필요성?
- [ ] **성능**: 대규모 사용자 시 Assignment 생성 부하 대응?

## 9) 변경 로그 (Living)
- **2025-08-27**: 초안 작성 - KST 05:00 기준 서비스 데이 컨셉 정의
- **2025-08-27**: 중복 방지 로직 및 DB 제약 조건 추가
- **2025-08-27**: Vercel 서버리스 환경 고려사항 반영

## 10) 의존성 체크
### 선행 요구사항
- [x] Prisma Assignment 모델 정의
- [x] Pair 모델 및 관계 설정
- [ ] 시간대 처리 미들웨어 구성
- [ ] DB 연결 및 트랜잭션 설정

### 후속 작업 연결
- **today-page.plan.md**: /today 페이지에서 Assignment 조회 로직 연동
- **gate-system.plan.md**: Assignment 상태 전환과 게이트 공개 연동
- **admin-tools.plan.md**: 일일 Assignment 생성 통계 모니터링

### 외부 의존성
- **Neon PostgreSQL**: UNIQUE 제약 및 트랜잭션 지원
- **Vercel Edge Runtime**: 정확한 시간 계산 및 환경 변수
- **Next.js Middleware**: 시간대 처리 및 요청 전처리