# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**마음배달 v2** - "매일 한 질문으로 가족과 따뜻하게 연결됩니다"

한국 가족을 위한 대화 플랫폼으로, 게이트 공개 시스템과 운영자 직접 관여 모델(Concierge MVP)을 통해 공평하고 진정성 있는 가족 대화를 지원합니다.

### 핵심 차별화 가치
- **게이트 공개**: "내 답 먼저 → 서로 답하면 바로 공개" 공평성
- **05시 서비스 데이**: 명확한 하루 리듬 (KST 05:00~다음날 05:00)
- **질문 교체 1회**: 적당한 선택권 제공 (답변 0건일 때만)
- **운영 효율성**: 하루 10분 수동 운영 (08시 브로드캐스트 + 19시 리마인드)

## Core Technology Stack

### 기본 스택
- **Framework**: Next.js 15 + App Router + React 19
- **Deployment**: Vercel (서버리스 함수 + 크론)
- **Database**: Neon PostgreSQL (관리형)
- **ORM**: Prisma (타입 안전 + 마이그레이션)
- **Authentication**: NextAuth.js (카카오 OAuth)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript (strict mode)

### 운영 도구
- **관리자 페이지**: `/admin` (환경변수 인증)
- **Export API**: 브로드캐스트/리마인드 대상 추출
- **Analytics**: 일일 지표 수집 + 성과 분석

## Development Commands

### 필수 개발 명령어
```bash
# 프로젝트 초기 설정 (Dear_Q 폴더에서)
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src --import-alias "@/*"

# 의존성 설치
npm install --legacy-peer-deps  # React 19 호환성
npm install @prisma/client prisma next-auth @auth/prisma-adapter
npm install @radix-ui/react-slot lucide-react class-variance-authority clsx tailwind-merge
npm install zod react-hook-form @hookform/resolvers

# 개발 서버
npm run dev                     # 개발 서버 시작 (http://localhost:3000)
npm run build                   # 프로덕션 빌드
npm run start                   # 프로덕션 서버 실행

# 데이터베이스 (Prisma 초기화 후)
npx prisma init                # Prisma 초기 설정
npx prisma generate            # Prisma 클라이언트 생성
npx prisma db push            # 스키마를 DB에 반영
npx prisma studio             # 데이터베이스 GUI (http://localhost:5555)
npx prisma db seed            # 초기 데이터 시딩

# 품질 관리
npm run lint                  # ESLint 검사
npm run typecheck             # TypeScript 타입 체크 (tsc --noEmit)
npm test                      # 테스트 실행 (추후 구현 예정)
```

### 환경 설정
```bash
# .env.local 필수 환경변수
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
KAKAO_CLIENT_ID="your-kakao-app-id"
KAKAO_CLIENT_SECRET="your-kakao-app-secret"
ADMIN_SECRET="admin-password"
```

## Project Structure

```
Dear_Q/                       # 메인 프로젝트 폴더 (새로 생성)
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 그룹
│   │   ├── login/
│   │   └── onboarding/
│   ├── today/               # 핵심 페이지 ⭐
│   ├── conversation/[id]/
│   ├── history/
│   ├── settings/
│   ├── admin/               # 관리자 도구
│   └── api/                 # API Routes
├── components/              # React 컴포넌트
│   ├── ui/                 # shadcn/ui (maeum-baedal에서 복사)
│   └── features/           # 기능별 컴포넌트
├── lib/                     # 유틸리티
├── prisma/                  # DB 스키마
└── maeum-baedal/           # 기존 참고 소스

```

## Architecture & Key Patterns

### 6페이지 IA (Information Architecture)
```
사용자 페이지 (6개):
├── /login              # 카카오 1클릭 로그인
├── /onboarding         # 1회용 초대코드로 쌍 연결
├── /today              # 통합 홈페이지 ⭐ (질문+답변+게이트 상태)
├── /conversation/[id]  # 공개된 대화 상세
├── /history            # 완료된 대화 목록
└── /settings           # 쌍 관리, 계정 설정

관리자 페이지 (4개):
├── /admin/dashboard    # 운영 대시보드
├── /admin/broadcast    # 브로드캐스트 관리
├── /admin/analytics    # 지표 분석
└── /admin/content      # 질문 관리
```

### 3+3 API 구조
```
핵심 API (3개):
├── GET  /api/today         # 오늘 과제 조회/생성
├── POST /api/answer        # 답변 제출 + 게이트 확인  
└── POST /api/today/swap    # 질문 교체 (1회 제한)

지원 API (3개):
├── GET /api/conversation/[id]  # 공개된 대화 조회
├── GET /api/history           # 완료된 대화 목록
└── POST /api/onboarding       # 초대코드 처리

운영 API (4개):
├── GET /api/admin/broadcast   # 08시 브로드캐스트 대상
├── GET /api/admin/analytics   # 일일 지표
├── GET /api/admin/content     # 질문 성과 분석
└── GET /api/admin/dashboard   # 운영 대시보드
```

### 6-Table 미니멀 데이터 설계
```
핵심 테이블:
├── users          # 카카오 기반 사용자 (kakaoSub + nickname)
├── pairs          # 1:1 쌍 연결 (inviteCode)
├── questions      # 질문 뱅크 (category + analytics)
├── assignments    # 일일 과제 (pairId + serviceDay UNIQUE)
├── answers        # 답변 (assignmentId + userId UNIQUE)
└── conversations  # 공개된 대화 (assignment 완료 시 생성)

분석 테이블:
├── daily_stats    # 일일 지표 집계
└── activity_logs  # 익명화된 활동 로그
```

## Critical Development Principles

### 1. 한국어 우선 정책
- **개발자 대화**: Claude와의 모든 대화는 한국어로 진행
- **UI 카피**: 모든 사용자 메시지는 한국어
- **에러 메시지**: 사용자 친화적 한국어 표현
- **로그**: 개발자용은 영어, 사용자 노출은 한국어
- **코드 식별자**: 영어 허용 (변수명, 함수명)
- **문서**: 기술 문서는 한국어, 코드 주석은 영어

### 2. 접근성 기준 (AAA)
- **터치 타겟**: 최소 44×44px
- **색상 대비**: 4.5:1 비율 이상
- **키보드 네비게이션**: 완전한 tab 순서
- **스크린 리더**: 적절한 ARIA 레이블
- **포커스 인디케이터**: 항상 표시, 제거 금지

### 3. 보안 가이드라인
- **개인정보 최소화**: 카카오ID + 닉네임만 수집
- **환경변수 관리**: `.env.local` 절대 커밋 금지
- **관리자 인증**: ADMIN_SECRET 환경변수 필수
- **SQL Injection**: Prisma ORM 사용으로 방지
- **XSS 방지**: 사용자 입력 sanitization

### 4. 성능 기준
- **Lighthouse Score**: 80점 이상 유지
- **TTI (Time to Interactive)**: 2.5초 이하
- **Bundle Size**: 500KB 이하
- **Mobile First**: 모바일 우선 최적화

## Operations Manual (운영 매뉴얼)

### 일일 운영 체크리스트 (하루 10분)

**08:00 - 브로드캐스트 발송**
1. `/admin/broadcast` 접속
2. "오늘 대상자 조회" 클릭 → 대상 쌍 목록 확인
3. 카카오톡에서 다음 메시지 발송:
```
🌅 오늘의 질문이 도착했어요!
가족과 따뜻한 대화를 나눠보세요 ✨

👉 https://dearq.app/today

05시까지 한 줄만 남겨주세요 💝
#마음배달 #가족대화
```
4. 발송 완료 후 `/admin/dashboard`에서 활동 모니터링

**19:00 - 선택적 리마인드**
1. `/admin/analytics`에서 오늘 완료율 확인
2. 완료율이 낮으면 (`/admin/broadcast` → 미완료 대상 조회)
3. 선택적 리마인드 발송:
```
⏰ 오늘 질문 마감이 얼마 남지 않았어요
아직 답변하지 않으셨다면 잠깐만 시간을 내어보세요

👉 https://dearq.app/today

가족이 기다리고 있어요 💙
```

### 주간 리뷰 (주 1회, 10분)
1. `/admin/analytics` 주간 지표 확인:
   - 답변 시작률 (브로드캐스트 대비)
   - 완료율 (게이트 공개율)  
   - 질문 교체율
2. `/admin/content` 질문별 성과 확인
   - 답변률 높은 질문 식별
   - 성과 낮은 질문 비활성화 고려
3. 사용자 피드백 반영

### 트러블슈팅 가이드

**Assignment 생성 오류**
```typescript
// 05시 서비스 데이 로직 확인
const serviceDay = getServiceDay() // "YYYY-MM-DD"
console.log('Current service day:', serviceDay)

// 중복 생성 방지 확인
const existing = await prisma.assignment.findFirst({
  where: { pairId, serviceDay, status: "active" }
})
```

**게이트 공개 실패**
```typescript
// 답변 수 확인
const answerCount = await prisma.answer.count({
  where: { assignmentId }
})
console.log('Answer count:', answerCount) // 2여야 함

// Conversation 생성 상태 확인
const conversation = await prisma.conversation.findFirst({
  where: { assignmentId }
})
```

## Key Implementation Notes

### Prisma Schema (6-Table Design)
```prisma
// 핵심 모델 구조
model User {
  id        String   @id @default(cuid())
  kakaoSub  String   @unique  // 카카오 고유 ID
  nickname  String
  label     String?
}

model Pair {
  id         String   @id @default(cuid())
  user1Id    String
  user2Id    String
  inviteCode String   @unique
  status     String   @default("active")
}

model Assignment {
  id          String   @id @default(cuid())
  pairId      String
  serviceDay  String   // "YYYY-MM-DD" 형식
  questionId  String
  swapCount   Int      @default(0)
  status      String   @default("active")
  
  @@unique([pairId, serviceDay])  // 중요: 하루에 쌍당 1개
}
```

### Service Day 로직
```typescript
// KST 기준 05:00를 하루의 시작으로 정의
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

### Gate System 핵심
```typescript
// 답변 2개 수집 시 자동으로 Conversation 생성
async function checkAndOpenGate(assignmentId: string) {
  const answers = await prisma.answer.count({
    where: { assignmentId }
  });
  
  if (answers === 2) {
    // 트랜잭션으로 Conversation 생성
    return await prisma.$transaction(async (tx) => {
      // Conversation 생성
      // Assignment status 업데이트
    });
  }
}

```

## Development Workflow

### 4주 마일스톤 계획

**Week 1: Foundation & Core Flow** (35시간)
- Day 1-2: 프로젝트 설정 + Prisma + NextAuth
- Day 3-4: /login + /today 기본 구조 + UI 컴포넌트
- Day 5-7: 핵심 API + Assignment 로직
- 목표: 카카오 로그인 → 질문 → 답변 → 대기 플로우

**Week 2: Business Logic & Gate System** (40시간)  
- Day 8-10: 05시 서비스 데이 로직 + 카운트다운
- Day 11-12: 게이트 공개 시스템 + Conversation 생성
- Day 13-14: 질문 교체 + 에러 처리
- 목표: 2인 게이트 공개 완전 동작

**Week 3: Supporting Features** (30시간)
- Day 15-17: /history + /conversation/[id] 페이지  
- Day 18-19: /onboarding + /settings
- Day 20-21: 관리자 도구 + Export API
- 목표: 전체 사용자 플로우 + 운영 도구

**Week 4: Polish & Production Ready** (25시간)
- Day 22-24: 모바일 반응형 + 접근성 + 로딩 상태
- Day 25-26: 성능 최적화 + 보안 설정  
- Day 27-28: Vercel 배포 + 실제 베타 테스트
- 목표: 실제 가족 사용 가능

### Git 브랜치 전략
```
main              # 프로덕션 배포
├── develop       # 개발 통합
├── feature/auth  # 인증 기능
├── feature/today # /today 페이지
├── feature/admin # 관리자 도구  
└── hotfix/*      # 긴급 수정
```

### 코드 리뷰 가이드
- **타입 안전성**: TypeScript strict 모드 준수
- **접근성**: 44px 터치 타겟, 4.5:1 대비 확인  
- **성능**: 불필요한 리렌더링 방지
- **보안**: 환경변수 하드코딩 금지
- **한국어**: 사용자 메시지 한국어 확인

## Important Files to Review

### 기존 자산 활용
- `maeum-baedal/components/ui/`: shadcn/ui 컴포넌트 전체 복사해서 재사용
- `maeum-baedal/app/home/page.tsx`: TodayPage 구조 참고
- `maeum-baedal/components/mobile-nav.tsx`: 네비게이션 구조 참고
- `maeum-baedal/lib/dummy-data.ts`: 초기 질문 데이터 활용

### 핵심 구현 파일 (생성 필요)
- `prisma/schema.prisma`: 6-Table 스키마 정의
- `lib/auth.ts`: NextAuth 카카오 OAuth 설정
- `lib/service-day.ts`: 05시 서비스 데이 로직 구현
- `lib/gate.ts`: 게이트 공개 시스템 로직
- `app/today/page.tsx`: 핵심 페이지 구현
- `app/api/today/route.ts`: 오늘 과제 API
- `app/api/answer/route.ts`: 답변 제출 API

## Project Standards Summary

이 프로젝트는 **"최소 개발로 최대 가치"** 철학을 따릅니다:

- ✅ **기존 UI 70% 재사용**으로 4주 완성
- ✅ **3+3 API 구조**로 복잡도 최소화  
- ✅ **6-Table 설계**로 확장 가능한 미니멀 아키텍처
- ✅ **Concierge 운영**으로 하루 10분 관리
- ✅ **게이트 공개 + 05시 서비스 데이**로 차별화

모든 개발 작업은 이 가이드를 기준으로 진행하며, 운영 효율성과 사용자 경험을 최우선으로 합니다.