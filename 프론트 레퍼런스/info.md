# 마음배달 (Heart Delivery) - 프로젝트 구조 및 페이지 목록

## 프로젝트 개요
가족 간 소통을 위한 일일 질문 서비스. 카카오톡 기반으로 앱 설치 없이 사용 가능하며, 라벨 기반으로 가족에게 질문을 전송하고 답변을 주고받는 모바일 우선 웹 애플리케이션입니다.

## 페이지 계층구조 및 설명

### 🏠 메인 페이지
- **`/` (app/page.tsx)** - 랜딩 페이지
  - 서비스 소개 및 주요 기능 안내
  - 카카오 로그인 버튼 및 임시 진입 버튼
  - 서비스 특징 카드 (오늘의 질문, 가족과 연결, 추억 쌓기)

### 🔐 인증 및 온보딩
- **`/login` (app/login/page.tsx)** - 로그인 페이지
  - 카카오 OAuth 로그인 (현재 임시 진입 버튼으로 대체)
  - 서비스 소개 및 로그인 유도

- **`/onboarding` (app/onboarding/page.tsx)** - 온보딩 프로세스
  - 4단계 온보딩: 닉네임 입력 → 시작 모드 선택 → 알림 시간 설정 → 관심 주제 선택
  - 프로그레스 바 및 단계별 안내
  - 최소 2개, 최대 5개 관심 주제 선택

### 🏡 핵심 기능 페이지 (GNB 접근 가능)
- **`/home` (app/home/page.tsx)** - 홈 화면
  - 오늘의 질문 카드 및 카테고리 표시
  - 3단계 상태 스테퍼 (확인 → 내 답변 → 상대 답변)
  - 동적 CTA 버튼 (가족에게 보내기, 내 답변 쓰기, 대화 보기)
  - 개발자 테스트 패널

- **`/conversation` (app/conversation/page.tsx)** - 대화 목록 (리다이렉트)
  - 첫 번째 대화로 자동 리다이렉트

- **`/conversation/[id]` (app/conversation/[id]/page.tsx)** - 대화 상세
  - 참여자 상태 개요 및 답변 현황
  - 자기표현 게이트 (상대방 답변 블러 처리)
  - 반응 시스템 (5가지 반응 타입)
  - 공유 기능

- **`/history` (app/history/page.tsx)** - 지난 대화 목록
  - 카테고리별 필터링 (가로 스크롤 숨김)
  - 가족별, 기간별 검색 및 필터
  - 대화 카드 목록 (상세 페이지로 링크)

- **`/history/detail/[id]` (app/history/detail/[id]/page.tsx)** - 지난 대화 상세
  - 과거 대화 내용 조회 전용
  - 뒤로가기 버튼 포함

- **`/weekly` (app/weekly/page.tsx)** - 주간 하이라이트
  - 주간 대화 통계 및 베스트 대화
  - 이미지 생성 및 소셜 공유 기능
  - 지난 주 하이라이트 카드 (상세 페이지로 링크)

- **`/weekly/detail/[date]` (app/weekly/detail/[date]/page.tsx)** - 주간 하이라이트 상세
  - 특정 주의 하이라이트 상세 조회
  - 뒤로가기 버튼 포함

### ✍️ 답변 및 전송
- **`/answer` (app/answer/page.tsx)** - 답변 작성
  - 질문에 대한 답변 작성 폼
  - 글자 수 제한 및 유효성 검사
  - 임시 저장 기능

- **`/send` (app/send/page.tsx)** - 가족에게 보내기
  - 가족 선택 모달 (최근 가족 우선 정렬)
  - 차단된 가족 경고 표시
  - 카카오톡 공유 시뮬레이션

- **`/r/[token]` (app/r/[token]/page.tsx)** - 수신자 답변 페이지
  - 토큰 기반 답변 페이지 (카카오톡 링크로 접근)
  - 가족 매칭 확인 모달
  - 토큰 유효성 검사 및 에러 처리

### ⚙️ 설정 및 관리
- **`/settings` (app/settings/page.tsx)** - 설정
  - 닉네임 수정 모달
  - 알림 시간 설정 (저장 버튼 포함)
  - 리마인더 토글 (파란색 스위치)
  - 계정 삭제 (2단계 확인)

- **`/labels` (app/labels/page.tsx)** - 가족 정보 관리
  - 가족 라벨 목록 및 관리
  - 이름 변경 모달 (가시성 개선)
  - 가족 연결 상태 표시

### 📄 정책 페이지
- **`/privacy` (app/privacy/page.tsx)** - 개인정보처리방침
- **`/terms` (app/terms/page.tsx)** - 이용약관

## 주요 컴포넌트
- **`components/mobile-nav.tsx`** - 하단 GNB (4개 탭: 홈, 대화, 히스토리, 주간)
- **`lib/dummy-data.ts`** - 개발용 더미 데이터
- **`lib/auth.ts`** - 인증 관련 유틸리티

## 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Font**: Pretendard (Korean)
- **State Management**: localStorage (개발 단계)
- **Icons**: Lucide React

## 주요 특징
- 📱 모바일 퍼스트 디자인
- 🎨 WCAG AA 준수 색상 시스템
- 🔄 자기표현 게이트 시스템
- 📊 주간 하이라이트 자동 생성
- 🔗 토큰 기반 공유 시스템
- 💾 로컬 스토리지 기반 상태 관리

## 네비게이션 구조
\`\`\`
/ (랜딩)
├── /login → /onboarding → /home
├── /home (GNB)
│   ├── /answer
│   ├── /send
│   └── /conversation/[id]
├── /conversation (GNB) → /conversation/conv_1
├── /history (GNB)
│   └── /history/detail/[id]
├── /weekly (GNB)
│   └── /weekly/detail/[date]
├── /settings
│   └── /labels
└── /r/[token] (외부 링크)
\`\`\`

## 개발 상태
- ✅ 모든 핵심 기능 구현 완료
- ✅ 모바일 최적화 완료
- ✅ 접근성 개선 완료
- 🔄 백엔드 연동 대기 (현재 더미 데이터 사용)
- 🔄 카카오 OAuth 연동 대기
