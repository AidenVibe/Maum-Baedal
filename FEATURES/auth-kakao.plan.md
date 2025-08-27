# Feature Plan — auth-kakao: 카카오 OAuth 인증 시스템

## 1) 목표/배경 (Why)
- **문제 정의**: 한국 사용자에게 친숙하고 간편한 로그인 방식 제공
- **사용자 가치**: "1클릭 로그인"으로 진입 장벽 최소화
- **비즈니스 가치**: 회원가입 전환율 극대화, 개인정보 수집 최소화

## 2) 성공 기준 (Acceptance Criteria)
- [ ] **카카오 1클릭 로그인**: "카카오로 시작하기" 버튼 클릭 → 즉시 로그인
- [ ] **자동 회원가입**: 첫 로그인 시 User 자동 생성 (kakaoSub + nickname)
- [ ] **세션 유지**: 브라우저 종료 후에도 로그인 상태 유지 (30일)
- [ ] **로그아웃**: 간단한 로그아웃 기능
- [ ] **인증 필요 페이지**: 비로그인 시 자동 로그인 페이지 리다이렉트

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

## 5) 구현 계획 (Tasks)
- [ ] **Step 1: NextAuth 기본 설정**
  - [ ] `/api/auth/[...nextauth]/route.ts` 생성
  - [ ] `lib/auth.ts` 인증 설정 구현
  - [ ] 환경변수 설정 (.env.local)
  - [ ] 실행: `npm run typecheck`
  
- [ ] **Step 2: 카카오 개발자 앱 설정**
  - [ ] 카카오 개발자 콘솔에서 앱 생성
  - [ ] OAuth 리다이렉트 URI 설정
  - [ ] 클라이언트 ID/Secret 발급
  - [ ] 실행: 환경변수 업데이트
  
- [ ] **Step 3: 로그인 페이지**
  - [ ] `/app/(auth)/login/page.tsx` 구현
  - [ ] LoginButton 컴포넌트 구현
  - [ ] 로그인 상태별 UI 분기
  - [ ] 실행: `npm run build`
  
- [ ] **Step 4: 인증 미들웨어**
  - [ ] `middleware.ts` 구현
  - [ ] 보호된 페이지 목록 정의
  - [ ] 로그인 필요 시 리다이렉트 로직
  - [ ] 실행: `npm run lint`
  
- [ ] **Step 5: 세션 관리**
  - [ ] 로그아웃 기능 구현
  - [ ] 사용자 정보 표시 컴포넌트
  - [ ] 세션 만료 처리
  - [ ] 실행: `npm run test`

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