# 데이터베이스 인덱스 최적화 권고사항

Navigation API 성능 최적화를 위해 다음 인덱스들을 추가하는 것을 권장합니다.

## 현재 Navigation API 쿼리 분석

```typescript
// 현재 구현된 쿼리들:
// 1. 현재 대화 조회 + 권한 확인
WHERE conversation.id = ? AND conversation.status = 'opened' 
  AND assignment.pair.user1Id = ? OR assignment.pair.user2Id = ?

// 2. 이전 대화 조회  
WHERE conversation.status = 'opened' 
  AND assignment.pairId = ? AND assignment.serviceDay < ?
  AND assignment.status = 'completed'
ORDER BY assignment.serviceDay DESC
LIMIT 1

// 3. 다음 대화 조회
WHERE conversation.status = 'opened'
  AND assignment.pairId = ? AND assignment.serviceDay > ?  
  AND assignment.status = 'completed'
ORDER BY assignment.serviceDay ASC  
LIMIT 1
```

## 권장 인덱스 추가

### 1. Assignment 테이블 복합 인덱스

```prisma
// Navigation API 전용 인덱스
@@index([pairId, serviceDay, status])  // 이전/다음 대화 조회 최적화
@@index([serviceDay, status])          // 일자별 조회 최적화  
@@index([status, pairId])              // 상태별 페어 조회
```

### 2. Conversation 테이블 인덱스

```prisma
@@index([assignmentId, status])        // Assignment → Conversation 조회 최적화
@@index([status, createdAt])           // 공개된 대화 시간순 조회
```

### 3. Pair 테이블 인덱스 (권한 확인 최적화)

```prisma
@@index([user1Id, status])            // 사용자별 활성 페어 조회
@@index([user2Id, status])            // 사용자별 활성 페어 조회
```

## Prisma Schema 수정 예시

```prisma
model Assignment {
  // ... 기존 필드들
  
  @@unique([pairId, serviceDay])  // 기존 제약조건 유지
  @@index([pairId, serviceDay, status], name: "assignment_navigation_idx")
  @@index([serviceDay, status], name: "assignment_date_status_idx") 
  @@index([status, pairId], name: "assignment_status_pair_idx")
  @@map("assignments")
}

model Conversation {
  // ... 기존 필드들
  
  @@index([assignmentId, status], name: "conversation_assignment_status_idx")
  @@index([status, createdAt], name: "conversation_status_created_idx")
  @@map("conversations")
}

model Pair {
  // ... 기존 필드들
  
  @@index([user1Id, status], name: "pair_user1_status_idx")
  @@index([user2Id, status], name: "pair_user2_status_idx") 
  @@map("pairs")
}
```

## 성능 측정 기준

### 현재 예상 성능 (인덱스 없음)
- 단일 대화 조회: ~10-50ms (작은 DB), ~100-500ms (큰 DB)
- 이전/다음 대화 조회: ~20-100ms (작은 DB), ~200-1000ms (큰 DB)
- 복합 조회 (Navigation API): ~50-200ms (작은 DB), ~500-2000ms (큰 DB)

### 인덱스 추가 후 목표 성능  
- 단일 대화 조회: ~5-20ms
- 이전/다음 대화 조회: ~10-30ms  
- 복합 조회 (Navigation API): ~20-80ms

## 인덱스 적용 방법

```bash
# 1. Prisma Schema 수정 후
npx prisma db push

# 2. 또는 마이그레이션 생성
npx prisma migrate dev --name add_navigation_indexes

# 3. 프로덕션 적용
npx prisma migrate deploy
```

## 주의사항

### 인덱스 추가 시 고려사항
1. **쓰기 성능 영향**: 인덱스 추가 시 INSERT/UPDATE 성능 약간 저하
2. **저장 공간**: 인덱스당 추가 저장 공간 필요
3. **메모리 사용량**: 인덱스는 메모리에 로드되어 RAM 사용량 증가

### 마음배달 프로젝트에서의 판단
- **읽기:쓰기 비율**: 90:10 (대화 조회가 주요 기능)
- **데이터 크기**: 중소 규모 (~10K pairs, ~100K conversations 예상)  
- **사용자 경험**: Navigation 속도가 사용자 경험에 직접 영향
- **결론**: 인덱스 추가로 얻는 이익이 비용보다 훨씬 큼

## 모니터링 권장사항

### 성능 모니터링
```typescript
// API 응답 시간 로깅 추가
console.time('Navigation API')
const response = await fetchNavigation()
console.timeEnd('Navigation API') // 개발 환경에서 측정

// Prisma 쿼리 로깅 활성화 (개발 환경)
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

### 슬로우 쿼리 감지
```typescript
// 500ms 이상 소요되는 쿼리 감지
const startTime = Date.now()
const result = await prisma.conversation.findFirst(...)
const duration = Date.now() - startTime

if (duration > 500) {
  console.warn(`Slow Navigation query: ${duration}ms`)
}
```

이러한 최적화를 통해 Navigation API의 응답 속도를 크게 개선할 수 있으며, 사용자 경험 향상에 직접적으로 기여할 것입니다.