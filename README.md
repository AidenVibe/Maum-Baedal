# 마음배달 v2

> "매일 한 질문으로 가족과 따뜻하게 연결됩니다"

한국 가족을 위한 일일 대화 플랫폼. 게이트 공개 시스템을 통해 진정성 있는 가족 간 대화를 촉진합니다.

## 🎯 핵심 가치

- **게이트 공개**: "내 답 먼저 → 서로 답하면 바로 공개" 공평성
- **05시 서비스 데이**: 명확한 하루 리듬 (KST 05:00~다음날 05:00)
- **질문 교체 1회**: 적당한 선택권 제공
- **Concierge 운영**: 하루 10분 수동 관리로 효율성 극대화

## 🏗️ 기술 스택

- **Framework**: Next.js 15 + App Router + React 19
- **Database**: Neon PostgreSQL + Prisma ORM  
- **Authentication**: NextAuth.js (카카오 OAuth)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel
- **Language**: TypeScript (strict mode)

## 🚀 빠른 시작

### 1. 프로젝트 생성
```bash
# Dear_Q 폴더에서 실행
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 2. 의존성 설치
```bash
# 핵심 패키지 설치
npm install @prisma/client prisma next-auth @auth/prisma-adapter
npm install @radix-ui/react-* lucide-react class-variance-authority clsx tailwind-merge
npm install zod react-hook-form @hookform/resolvers

# 개발 도구
npm install -D @types/node typescript
```

### 3. 환경 설정
```bash
# .env.local 생성
cp .env.example .env.local

# 필수 환경변수 설정
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random-32-char-string"
KAKAO_CLIENT_ID="your-kakao-app-id"
KAKAO_CLIENT_SECRET="your-kakao-app-secret"
ADMIN_SECRET="admin-password"
```

### 4. 데이터베이스 설정
```bash
# Prisma 초기화
npx prisma init

# 스키마 적용
npx prisma db push

# 초기 데이터 시딩
npx prisma db seed
```

### 5. 개발 서버 실행
```bash
npm run dev
# http://localhost:3000 접속
```

## 📁 프로젝트 구조

```
Dear_Q/
├── CLAUDE.md              # 개발 가이드
├── PRD.md                 # 제품 요구사항
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   ├── today/page.tsx          # 🎯 핵심 페이지
│   │   ├── conversation/[id]/page.tsx
│   │   ├── history/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── broadcast/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── content/page.tsx
│   │   └── api/
│   │       ├── today/route.ts      # 핵심 API
│   │       ├── answer/route.ts
│   │       └── admin/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui
│   │   ├── today/                  # 핵심 비즈니스 컴포넌트
│   │   ├── auth/
│   │   ├── conversation/
│   │   └── admin/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── service-day.ts          # 05시 서비스 데이 로직
│   │   └── gate.ts                 # 게이트 공개 시스템
│   └── types/
└── prisma/
    ├── schema.prisma               # 6-Table 설계
    └── seed.ts
```

## 🔧 개발 명령어

```bash
# 개발
npm run dev                 # 개발 서버
npm run build              # 프로덕션 빌드
npm run start              # 프로덕션 서버

# 데이터베이스
npx prisma generate        # 클라이언트 생성
npx prisma db push        # 스키마 반영
npx prisma studio         # DB GUI
npx prisma db seed        # 데이터 시딩

# 코드 품질
npm run typecheck         # TypeScript 검증
npm run lint              # ESLint
```

## 📊 개발 로드맵

### Week 1: Foundation (35h)
- [x] 프로젝트 설정 + Prisma + NextAuth
- [ ] /login + /today 기본 구조
- [ ] 핵심 API + Assignment 로직
- **목표**: 카카오 로그인 → 질문 → 답변 플로우

### Week 2: Business Logic (40h)  
- [ ] 05시 서비스 데이 로직 + 카운트다운
- [ ] 게이트 공개 시스템 + Conversation 생성
- [ ] 질문 교체 + 에러 처리
- **목표**: 2인 게이트 공개 완전 동작

### Week 3: Supporting Features (30h)
- [ ] /history + /conversation/[id] 페이지
- [ ] /onboarding + /settings  
- [ ] 관리자 도구 + Export API
- **목표**: 전체 플로우 + 운영 도구

### Week 4: Production Ready (25h)
- [ ] 모바일 최적화 + 접근성
- [ ] 성능 최적화 + 보안
- [ ] Vercel 배포 + 베타 테스트
- **목표**: 실제 가족 사용 가능

## 🎨 UI/UX 가이드

### 디자인 시스템
- **컬러**: 오렌지 계열 (따뜻함) + 회색 (안정감)
- **타이포그래피**: 한글 최적화 폰트
- **컴포넌트**: shadcn/ui 기반 일관성
- **모바일 퍼스트**: max-width 448px 기준

### 접근성 기준
- **터치 타겟**: 최소 44×44px
- **색상 대비**: 4.5:1 이상
- **키보드 네비게이션**: 완전 지원
- **포커스 인디케이터**: 항상 표시

## 🔒 보안 가이드

### 인증/인가
- NextAuth.js + 카카오 OAuth 2.0
- JWT 세션 (httpOnly 쿠키)
- API 경로별 권한 확인

### 데이터 보호
- 개인정보 최소화 (kakaoSub + nickname)
- 환경변수 암호화 저장
- HTTPS 강제 (Vercel 기본)

### 입력 검증
- Zod 스키마 검증  
- Prisma ORM (SQL Injection 방지)
- 답변 내용 sanitization

## 📈 운영 매뉴얼

### 일일 운영 (10분)
**08:00** - 브로드캐스트
1. `/admin/broadcast` → 대상자 조회
2. 카카오톡 발송 (복붙 1회)

**19:00** - 리마인드 (선택적)
1. `/admin/analytics` → 완료율 확인
2. 낮으면 미완료자 리마인드

### 주간 리뷰 (10분)
1. 지표 분석: 답변률, 완료율, 교체율
2. 질문 튜닝: 성과 낮은 질문 비활성화
3. 사용자 피드백 반영

## 🎯 성공 지표

### 핵심 KPI
- **답변 시작률**: 30% → 50% (4주)
- **완료율**: 60% → 75% (4주)  
- **질문 교체율**: < 20% 유지

### 성능 목표
- **Lighthouse**: 80점 이상
- **TTI**: < 2.5초
- **Bundle Size**: < 500KB

## 📚 참고 문서

- [CLAUDE.md](./CLAUDE.md) - 상세 개발 가이드
- [PRD.md](./PRD.md) - 제품 요구사항 정의서
- [기존 참고 소스](./maeum-baedal/) - UI 컴포넌트 참조

## 🤝 기여 가이드

1. 이 프로젝트는 **단일 개발자 운영** 기준으로 설계됨
2. 모든 변경사항은 **Korean First** 정책 준수
3. **TDD 권장**: 핵심 로직은 테스트 우선 작성
4. **접근성 필수**: AAA 수준 준수

## 📄 라이선스

Private - 개인 프로젝트용

---

**마음배달 v2**로 가족과의 따뜻한 연결을 시작해보세요! 💝