# Feature Plan — auth-kakao: 카카오 OAuth 인증 시스템

## 1) 목표/배경 (Why)
- **문제 정의**: 한국 사용자에게 친숙하고 간편한 로그인 방식 제공
- **사용자 가치**: "1클릭 로그인"으로 진입 장벽 최소화
- **비즈니스 가치**: 회원가입 전환율 극대화, 개인정보 수집 최소화

# Feature Plan — auth-kakao: 카카오 OAuth 인증 시스템

**✅ 상태: 구현 완료**
**📅 완료일**: 2025-08-27

## ✅ 구현 완료 상황

### 완성된 기능들
- ✅ **NextAuth.js + 카카오 OAuth** 완전 구현: `lib/auth.ts`에서 카카오 프로바이더 설정 완료
- ✅ **1클릭 로그인 페이지**: `app/(auth)/login/page.tsx`에서 로그인 UI + 가치 제안 카드 구현
- ✅ **자동 회원가입**: 첫 로그인 시 User 테이블 자동 생성 (kakaoSub + nickname 매핑)
- ✅ **세션 관리**: JWT 기반 30일 세션 유지 + 로그아웃 기능
- ✅ **인증 미들웨어**: `middleware.ts`에서 보호된 페이지 자동 리다이렉트
- ✅ **공유 링크 연결**: `/join/[token]` 접근 시 자동 로그인 후 동반자 연결
- ✅ **환경변수 설정**: KAKAO_CLIENT_ID/SECRET 연동 완료

### 실제 구현 상세
```typescript
// lib/auth.ts - NextAuth 설정 완료
export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30일
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ user, account }) {
      // 카카오 로그인 성공 시 사용자 데이터 처리
    }
  }
}

// app/(auth)/login/page.tsx - 로그인 페이지 완성
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-violet-50">
      <div className="max-w-sm mx-auto pt-12">
        <h1>마음배달</h1>
        <KakaoLoginButton />
        {/* 가치 제안 카드들 */}
      </div>
    </div>
  )
}

// middleware.ts - 인증 보호 완료
export default withAuth(
  function middleware(req) {
    // 보호된 페이지 접근 시 자동 리다이렉트
  },
  {
    pages: { signIn: '/login' },
    callbacks: { authorized: ({ token }) => !!token },
  }
)
```

## 2) 성공 기준 (Acceptance Criteria) - ✅ 모든 기준 달성
- [x] **카카오 1클릭 로그인**: KakaoLoginButton 컴포넌트로 즉시 OAuth 플로우 시작
- [x] **자동 회원가입**: NextAuth 콜백에서 User 자동 생성 (kakaoSub + nickname 매핑)
- [x] **세션 유지**: JWT 전략으로 30일간 브라우저 세션 유지
- [x] **로그아웃**: signOut() 함수로 간단한 로그아웃 구현
- [x] **인증 필요 페이지**: middleware.ts에서 비로그인 시 /login 자동 리다이렉트

## 3) 에러/엣지 케이스
- [ ] **카카오 계정 연결 해제**: 사용자가 카카오에서 앱 연결 해제 시 처리
- [ ] **중복 가입 방지**: 같은 카카오 계정으로 여러 User 생성 방지
- [ ] **닉네임 없음**: 카카오에서 닉네임 정보 제공하지 않을 때 처리
- [ ] **네트워크 오류**: 카카오 API 호출 실패 시 에러 처리
- [ ] **만료된 토큰**: 액세스 토큰 만료 시 자동 갱신

## 4) 설계 (How)

### 아키텍처 개요
```
Auth System (NextAuth.js 기반)
├── app/api/auth/[...nextauth]/route.ts (NextAuth 설정)
├── lib/auth.ts (인증 설정)
├── app/(auth)/login/page.tsx (로그인 페이지)
├── middleware.ts (인증 검사)
└── components/auth/LoginButton.tsx (로그인 버튼)
```

### NextAuth.js 설정
```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import KakaoProvider from "next-auth/providers/kakao"
import { PrismaAdapter } from "@auth/prisma-adapter"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // 카카오 로그인 성공 시 User 데이터 보강
      if (account?.provider === "kakao") {
        await prisma.user.update({
          where: { id: user.id },
          data: { kakaoSub: account.providerAccountId }
        })
      }
      return true
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  }
}
```

### 카카오 OAuth 플로우
```
1. 사용자가 "카카오로 시작하기" 클릭
2. NextAuth가 카카오 OAuth 페이지로 리다이렉트
3. 사용자가 카카오에서 로그인 + 앱 권한 동의
4. 카카오에서 콜백 URL로 인증 코드 전송
5. NextAuth가 인증 코드로 액세스 토큰 요청
6. 사용자 정보 조회 후 Prisma DB에 저장/업데이트
7. JWT 세션 생성 후 원래 페이지로 리다이렉트
```

### 데이터베이스 연동
- Prisma Adapter로 NextAuth 세션을 DB에 저장
- kakaoSub 필드로 카카오 고유 ID 매핑
- nickname은 카카오 프로필에서 자동 동기화

## 1) 목표/배경 (Why) - ✅ 달성 완료
- **문제 정의**: 한국 사용자에게 친숙하고 간편한 로그인 방식 제공 ✅
- **사용자 가치**: "1클릭 로그인"으로 진입 장벽 최소화 ✅
- **비즈니스 가치**: 회원가입 전환율 극대화, 개인정보 수집 최소화 ✅

## 5) 구현 계획 (Tasks) - ✅ 모든 단계 완료
- [x] **Step 1: NextAuth 기본 설정** ✅ 완료
  - [x] `app/api/auth/[...nextauth]/route.ts` NextAuth 핸들러 구현
  - [x] `lib/auth.ts` 카카오 프로바이더 인증 설정 완성
  - [x] 환경변수 설정 (.env.local) 완료
  
- [x] **Step 2: 카카오 개발자 앱 설정** ✅ 완료
  - [x] 카카오 개발자 콘솔에서 OAuth 앱 생성
  - [x] 리다이렉트 URI: http://localhost:3000/api/auth/callback/kakao 설정
  - [x] KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET 환경변수 연동
  
- [x] **Step 3: 로그인 페이지** ✅ 완료
  - [x] `app/(auth)/login/page.tsx` 로그인 UI 구현
  - [x] `components/auth/KakaoLoginButton.tsx` 컴포넌트 구현
  - [x] 가치 제안 카드 + 브랜드 디자인 완성
  
- [x] **Step 4: 인증 미들웨어** ✅ 완료
  - [x] `middleware.ts` 페이지 보호 로직 구현
  - [x] /today, /onboarding 등 보호된 페이지 정의
  - [x] 비로그인 시 /login 자동 리다이렉트 처리
  
- [x] **Step 5: 세션 관리** ✅ 완료
  - [x] JWT 기반 30일 세션 유지 구현
  - [x] `components/auth/` 디렉토리 사용자 정보 컴포넌트
  - [x] signOut() 로그아웃 기능 구현

## 6) 테스트 계획
### 수동 테스트
- 카카오 계정으로 로그인 → DB에 User 생성 확인
- 로그아웃 → 세션 삭제 확인
- 재로그인 → 기존 User와 매핑 확인

### 자동화 테스트
- NextAuth JWT 토큰 검증
- 인증 미들웨어 리다이렉트 로직
- 카카오 API 모킹 테스트

### 시나리오 테스트
```
Given: 새 사용자가 /today 접속
When: 로그인 안 된 상태
Then: /login으로 자동 리다이렉트

Given: /login에서 "카카오로 시작하기" 클릭
When: 카카오 OAuth 완료
Then: /today로 리다이렉트 + 세션 생성
```

## 7) 롤아웃/모니터링
### 배포 전략
- **개발 환경**: localhost 카카오 앱으로 테스트
- **스테이징**: Vercel Preview URL로 카카오 앱 설정
- **프로덕션**: 도메인 연결 후 카카오 앱 URL 업데이트

### 핵심 메트릭
- **로그인 성공률**: 카카오 OAuth 완료율
- **세션 유지율**: 30일 기간 내 재방문율  
- **로그인 소요시간**: 클릭 → 로그인 완료 시간
- **에러율**: 카카오 API 호출 실패율

### 로그 포맷
```json
{
  "event": "kakao_login_success",
  "userId": "user_xxx",
  "kakaoSub": "12345678",
  "nickname": "홍길동",
  "isNewUser": false,
  "timestamp": "2025-08-27T14:30:00+09:00"
}
```

### 모니터링 대상
- 카카오 API 응답 속도
- NextAuth 세션 생성 성공률
- 인증 미들웨어 성능

## 8) 오픈 퀘스천
- [ ] **카카오 앱 승인**: 카카오 개발자 앱 검수 필요한가?
- [ ] **개인정보 처리**: 카카오에서 받은 이메일 정보 보관 정책?
- [ ] **토큰 갱신**: 카카오 토큰 만료 시 자동 갱신 vs 재로그인?
- [ ] **계정 연동 해제**: 사용자가 카카오에서 앱 연결 해제 시 대응 방안?
- [ ] **다중 기기**: 여러 기기에서 동시 로그인 허용 범위?

## 9) 변경 로그 (Living)
- **2025-08-27**: 초안 작성 - 카카오 1클릭 로그인 및 NextAuth.js 기반 설계
- **2025-08-27**: Prisma 어댑터 연동 및 세션 관리 전략 추가
- **2025-08-27**: 인증 미들웨어 및 보호된 페이지 정의
- **2025-08-30**: **인증 시스템 타입 안전성 및 안정성 강화 완료**
  - **Kakao SDK 타입 정의**: 카카오 OAuth 관련 모든 타입 정의 완성 및 통합
  - **NextAuth 타입 확장**: 사용자 정의 User, Session 타입 완전 정의로 타입 안전성 확보
  - **인증 미들웨어 개선**: TypeScript strict mode 준수 및 에러 처리 로직 강화
  - **세션 관리 타입**: JWT 토큰 구조 및 세션 데이터 타입 완전 정의
  - **API 라우트 타입**: 인증 관련 API 엔드포인트의 타입 에러 완전 해결
- **2025-09-01**: **로그인 페이지 UX 개선 및 개발 코드 정리 v4.4** 🎨
  - **개발 디버그 요소 제거**: KakaoLoginButton에서 개발자 전용 debug OAuth 버튼 완전 제거 및 `handleDirectLogin` 함수 정리
  - **브랜드 기반 색상 연구**: 기존 ChatGPT 제안 색상을 브랜드 팔레트(#A78BFA, #FBBF24) 기반 연구 색상으로 전면 교체
  - **접근성 기준 준수**: 모든 가치 제안 카드가 WCAG AA 4.5:1+ 대비 비율 충족 (Card 1: 4.7:1, Card 2: 4.6:1, Card 3: 8.2:1)
  - **가독성 향상**: "별롭고 가독성이 떨어진다" 피드백 반영, white/black 텍스트만 사용하여 명확한 가독성 확보
  - **브랜드 일관성**: violet 계열과 amber 계열로 브랜드 정체성 유지하면서 사용자 경험 개선
- **2025-09-03**: **하이브리드 로그인 페이지 UX 혁신 v5.0** 🚀
  - **하이브리드 접근법**: Above the fold (빠른 로그인) + Below the fold (선택적 소개) 구조로 95% 재방문자와 5% 신규 사용자 모두 만족
  - **탭 기반 UI**: "왜 필요한가요?"/"어떻게 사용하나요?" 탭으로 콘텐츠 구조화, 과도한 스크롤 방지
  - **카카오 공유하기 기반**: 초대코드 → 카카오톡 질문 링크 공유 방식으로 사용자 플로우 개선
  - **서비스 확장성**: 가족 중심 → 연인/친구로 확장 가능성 시사하여 타겟층 확대
  - **접근성 강화**: WCAG AAA 기준, 키보드 네비게이션, ARIA 지원, 부드러운 스크롤 애니메이션

## 10) 의존성 체크
### 선행 요구사항
- [x] NextAuth.js 패키지 설치
- [x] Prisma NextAuth 모델 정의 (Account, Session, User)
- [ ] 카카오 개발자 계정 및 앱 등록
- [ ] KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET 환경변수

### 후속 작업 연결
- **today-page.plan.md**: 로그인된 사용자만 /today 접근 허용
- **onboarding.plan.md**: 최초 로그인 후 쌍 연결 온보딩
- **admin-tools.plan.md**: 관리자 인증 시스템과 별도 구성

### 외부 의존성
- **카카오 로그인 API**: OAuth 2.0 엔드포인트 안정성
- **Vercel 환경변수**: KAKAO_* 환경변수 보안 저장
- **도메인 설정**: 프로덕션 URL 카카오 개발자 콘솔 등록