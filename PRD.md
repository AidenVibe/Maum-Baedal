# PRD - 마음배달 v2 제품 요구사항 정의서

## 1. 서비스 개요

### 1.1 서비스 정의
**마음배달 v2** - "매일 한 질문으로 가족과 따뜻하게 연결됩니다"

한국 가족을 대상으로 하는 일일 대화 플랫폼으로, 게이트 공개 시스템을 통해 공평하고 진정성 있는 가족 간 대화를 촉진합니다.

### 1.2 핵심 가치 제안 (Value Proposition)
```yaml
문제_정의: 
  - 가족 간 대화 주제 찾기 어려움
  - 세대 간 소통 부담감
  - 일방적 대화로 인한 불균형

해결_방안:
  - 큐레이션된 일일 질문 제공
  - "내 답 먼저" 게이트로 공평성 보장  
  - 카카오 기반 진입 장벽 최소화

핵심_차별화:
  - 05시 서비스 데이 (명확한 하루 리듬)
  - 게이트 공개 (서로 답하면 바로 공개)
  - 질문 교체 1회 (적당한 선택권)
  - Concierge 운영 (하루 10분 수동 관리)
```

### 1.3 타겟 사용자
**Primary**: 한국 가족 구성원 (2인 1쌍)
- 부모-자녀, 부부, 형제자매, 조부모-손자녀
- 카카오톡 사용자 (국내 95% 보급률)
- 일주일에 2-3회 이상 대화 의지 있는 가족

**Secondary**: 가족 대화 개선 희망자
- 원거리 거주 가족
- 바쁜 일상으로 소통 부족한 가족
- 깊은 대화를 원하지만 시작이 어려운 가족

## 2. 기능 요구사항

### 2.1 사용자 플로우 (User Journey)
```
08시 카카오톡 링크 수신 
    ↓
/today 접속 (자동 로그인)
    ↓
오늘의 질문 확인 
    ↓
[선택] 질문 교체 (1회)
    ↓
내 답변 작성 (2-800자)
    ↓
게이트 대기 상태
    ↓
상대방 답변 완료
    ↓
즉시 대화 공개
    ↓
/history에 누적
```

### 2.2 페이지별 기능 정의

#### **2.2.1 로그인 (/login)**
```yaml
기능:
  - 카카오 1클릭 로그인
  - 자동 세션 유지
  - 로그인 후 /today 리다이렉트

UI_요소:
  - 카카오 로그인 버튼 (브랜드 가이드라인 준수)  
  - 서비스 소개 문구
  - 개인정보처리방침 링크

기술_요구사항:
  - NextAuth.js + Kakao OAuth 2.0
  - 카카오 고유ID(kakaoSub) 저장
  - JWT 세션 관리
```

#### **2.2.2 온보딩 (/onboarding)**
```yaml
기능:
  - 1회용 초대 코드 생성/입력
  - 닉네임 설정 (가족 호칭)
  - 쌍(Pair) 연결 완료

플로우:
  1. 초대 코드 생성 또는 입력 선택
  2. 닉네임 입력 ("엄마", "아빠", "민수" 등)
  3. [선택] 관계 라벨 선택
  4. 쌍 연결 완료 → /today 이동

제약_조건:
  - 초대 코드: 6자리 랜덤 문자열
  - 1회용 사용 후 만료
  - 닉네임: 2-10자, 한글/영문 허용
```

#### **2.2.3 오늘 (/today) ⭐ 핵심 페이지**
```yaml
기능:
  - 오늘의 질문 표시
  - 만료 카운트다운 (다음날 05:00까지)
  - 답변 작성/수정
  - 질문 교체 (1회 제한)
  - 게이트 상태 표시
  - 대화 완성 시 링크 제공

상태별_화면:
  question_ready:    # 질문 확인 상태
    - 질문 카드 + 카운트다운
    - "내 마음 적기" 버튼
    - [조건부] "질문 바꾸기" 버튼
    
  answering:         # 답변 입력 중
    - 질문 카드 (상단 고정)
    - 답변 텍스트 에어리어
    - 글자 수 카운터 (2-800자)
    - 제출/취소 버튼
    
  waiting_partner:   # 내 답변 완료, 상대 대기
    - 전송 완료 메시지
    - 내 답변 미리보기
    - 상대방 상태 표시
    
  conversation_ready: # 양쪽 완료, 대화 보기 가능
    - 완성 축하 메시지  
    - "대화 보러가기" 버튼

기술_요구사항:
  - 실시간 카운트다운 (JavaScript setInterval)
  - 자동 저장/복원 (localStorage 임시)
  - 반응형 모바일 최적화
  - 접근성 준수 (ARIA, 키보드 네비)
```

#### **2.2.4 대화 (/conversation/[id])**
```yaml  
기능:
  - 완성된 대화 상세 보기
  - 질문 + 양쪽 답변 표시
  - 소셜 공유 기능 (선택사항)

표시_요소:
  - 질문 텍스트 + 카테고리
  - 답변A (작성자 닉네임)
  - 답변B (작성자 닉네임)  
  - 생성 일시
  - [선택] 카카오톡 공유 버튼

접근_제한:
  - 해당 쌍의 구성원만 조회 가능
  - 미완성 대화 접근 시 안내 메시지
  - URL 직접 접근 시 권한 확인
```

#### **2.2.5 히스토리 (/history)**
```yaml
기능:
  - 완료된 대화 목록 표시  
  - 날짜별/카테고리별 필터
  - 페이지네이션 (10개씩)

카드_정보:
  - 질문 미리보기 (50자)
  - 답변 미리보기 (각 30자)
  - 생성 날짜
  - 카테고리 배지

정렬_옵션:
  - 최신순 (기본)
  - 오래된순
  - [선택] 카테고리별
```

#### **2.2.6 설정 (/settings)**
```yaml
기능:
  - 쌍 관리 (관계명 수정, 연결 해제)
  - 계정 정보 (닉네임 수정)
  - 알림 설정 (현재는 안내만)
  - 로그아웃/탈퇴

쌍_관리:
  - 현재 연결된 가족 표시
  - 관계명 수정 기능
  - 연결 해제 (확인 모달)
  - 새 가족 연결 (초대코드 재생성)

계정_관리:
  - 닉네임 변경 (2-10자)
  - 로그아웃 (세션 정리)  
  - 회원탈퇴 (Soft Delete 권장)
```

### 2.3 관리자 도구 (운영자 전용)

#### **2.3.1 대시보드 (/admin/dashboard)**
```yaml
지표_표시:
  - 오늘 활성 쌍 수
  - 답변 시작률 (1인 이상 답변한 쌍)
  - 완료율 (양쪽 답변한 쌍)  
  - 질문 교체율
  
실시간_활동:
  - 최근 1시간 답변 수
  - 현재 대기 중인 쌍 수
  - 오늘 신규 가입 수

접근_권한:
  - ADMIN_SECRET 환경변수 인증
  - 개발자 전용 (외부 노출 금지)
```

#### **2.3.2 브로드캐스트 (/admin/broadcast)**
```yaml
08시_대상자_추출:
  - 오늘 활성 Assignment 없는 쌍 조회
  - 쌍별 사용자 닉네임 표시
  - 총 대상 수 표시
  - 복사 가능한 대상 리스트

19시_리마인드_추출:  
  - 오늘 Assignment 있지만 미완료인 쌍
  - 1인만 답변한 쌍 우선 표시
  - 아무도 답변 안 한 쌍 구분 표시

발송_이력:
  - 발송 시간 기록
  - 대상 수 기록  
  - 효과성 추적 (발송 후 답변률 변화)
```

#### **2.3.3 분석 (/admin/analytics)**
```yaml
일일_지표:
  - 답변 시작률 추이 (7일)
  - 완료율 추이 (7일)
  - 질문 교체율 (인기 없는 질문 식별)
  
질문_성과:
  - 질문별 답변률 랭킹
  - 카테고리별 성과
  - 교체 빈도 높은 질문 식별

사용자_패턴:
  - 시간대별 활동 분포  
  - 요일별 활동 패턴
  - 평균 답변 길이
```

#### **2.3.4 컨텐츠 관리 (/admin/content)**
```yaml
질문_관리:
  - 활성/비활성 질문 목록
  - 새 질문 추가 (텍스트 + 카테고리)
  - 성과 기반 질문 비활성화
  
카테고리_관리:
  - 카테고리별 질문 수
  - 카테고리별 평균 답변률
  - 인기/비인기 카테고리 식별

질문_뱅크_최적화:
  - 계절/이벤트별 질문 예약
  - A/B 테스트용 질문 세트 관리
```

## 3. 기술 요구사항

### 3.1 시스템 아키텍처
```yaml
Frontend:
  - Next.js 15 + App Router
  - React 19 + TypeScript
  - Tailwind CSS + shadcn/ui
  - 모바일 퍼스트 반응형

Backend:  
  - Next.js API Routes (서버리스)
  - Prisma ORM + PostgreSQL
  - NextAuth.js (카카오 OAuth)

Infrastructure:
  - Vercel (배포 + 서버리스 함수)
  - Neon PostgreSQL (관리형)  
  - Vercel Analytics (성능 모니터링)

Development:
  - TypeScript strict mode
  - ESLint + Prettier
  - Husky (pre-commit hooks)
```

### 3.2 데이터베이스 스키마
```sql
-- 핵심 6테이블 구조
users (id, kakaoSub, nickname, label, createdAt)
pairs (id, user1Id, user2Id, inviteCode, status, createdAt)  
questions (id, text, category, difficulty, isActive, totalAssigned, totalAnswered)
assignments (id, pairId, serviceDay, questionId, expiresAt, swapCount, status)
answers (id, assignmentId, userId, content, wordCount, createdAt)
conversations (id, assignmentId, questionText, userAAnswer, userBAnswer, createdAt)

-- 분석 2테이블
daily_stats (id, serviceDay, totalActivePairs, totalAssignments, totalAnswers, totalConversations)
activity_logs (id, action, pairId, metadata, timestamp)

-- 핵심 제약조건
UNIQUE (pairId, serviceDay) -- assignments 테이블
UNIQUE (assignmentId, userId) -- answers 테이블  
UNIQUE (assignmentId) -- conversations 테이블
```

### 3.3 API 명세서

#### **사용자 API**
```yaml
GET /api/today:
  설명: 오늘의 과제 조회/생성
  인증: 필수 (NextAuth 세션)
  응답: { assignment, myAnswer?, partnerStatus, gateStatus, conversationId? }

POST /api/answer:
  설명: 답변 제출 + 게이트 확인
  요청: { assignmentId, content }
  응답: { success, gateStatus, conversationId? }
  
POST /api/today/swap:
  설명: 질문 교체 (1회 제한)  
  요청: { assignmentId }
  응답: { success, newQuestion, remainingSwaps }

GET /api/conversation/[id]:
  설명: 공개된 대화 조회
  인증: 쌍 구성원만
  응답: { id, questionText, answers, createdAt }

GET /api/history:
  설명: 완료된 대화 목록
  파라미터: ?page=1&limit=10
  응답: { conversations, pagination }

POST /api/onboarding:
  설명: 초대코드 처리  
  요청: { action: "create"|"join", inviteCode?, nickname, label? }
  응답: { success, pairId?, inviteCode? }
```

#### **관리자 API**  
```yaml
GET /api/admin/broadcast:
  설명: 브로드캐스트 대상 추출
  인증: ADMIN_SECRET 헤더
  응답: { targets: [{ pairId, users, lastActivity? }], total }

GET /api/admin/analytics:
  설명: 일일 지표 조회
  응답: { today: {...}, trends: {...} }
  
GET /api/admin/content:
  설명: 질문 성과 분석
  응답: { topQuestions: [...], categoryStats: [...] }

GET /api/admin/dashboard:
  설명: 운영 대시보드 데이터
  응답: { stats, recentActivity, alerts? }
```

### 3.4 보안 요구사항
```yaml
인증_인가:
  - NextAuth.js + 카카오 OAuth 2.0
  - JWT 세션 (httpOnly 쿠키)
  - API 경로별 권한 확인

데이터_보호:
  - HTTPS 강제 (Vercel 기본)
  - 환경변수 암호화 저장
  - 개인정보 최소화 (kakaoSub + nickname만)

입력_검증:
  - Zod 스키마 검증
  - SQL Injection 방지 (Prisma ORM)
  - XSS 방지 (답변 내용 sanitization)
  - CSRF 방지 (NextAuth 기본)

관리자_접근:
  - ADMIN_SECRET 환경변수 검증
  - IP 화이트리스트 (선택사항)
  - 관리자 활동 로깅
```

### 3.5 성능 요구사항
```yaml
응답시간:
  - TTI (Time to Interactive): < 2.5초
  - API 응답시간: < 500ms  
  - 페이지 로딩: < 1.5초 (3G Fast)

Lighthouse_점수:
  - Performance: 80점 이상
  - Accessibility: 90점 이상  
  - Best Practices: 85점 이상
  - SEO: 80점 이상

용량_최적화:
  - JavaScript Bundle: < 500KB
  - 이미지 최적화: WebP + 지연로딩
  - 폰트 최적화: 서브셋 + preload
```

## 4. 비즈니스 로직

### 4.1 05시 서비스 데이 시스템
```yaml
정의: 
  - KST 05:00 ~ 다음날 05:00을 하루 단위로 정의
  - 서비스 데이 = "YYYY-MM-DD" 형식
  
Assignment_생성:
  - 쌍별 + 서비스데이별 1개만 허용 (UNIQUE 제약)
  - 생성 시점과 관계없이 만료는 항상 다음날 05:00
  - 05:00 이전 접속 시 전날 서비스데이로 취급

만료_처리:
  - 만료 시각 도달 시 status = "expired"
  - 새 접속 시 새로운 Assignment 자동 생성
  - 만료된 Assignment는 히스토리에서 제외
```

### 4.2 게이트 공개 시스템  
```yaml
게이트_상태:
  waiting_me:      # 나만 답변 안 함
  waiting_partner: # 내가 답변했지만 상대 대기
  both_ready:      # 양쪽 답변 완료 → 공개

공개_조건:
  - Assignment에 Answer가 정확히 2개
  - 각각 다른 userId (쌍의 양쪽)
  - 두 번째 답변 제출 시 즉시 Conversation 생성

Conversation_생성:
  - assignmentId를 기준으로 UNIQUE
  - questionText, userAAnswer, userBAnswer 저장
  - Assignment status = "completed" 변경
  - 생성 즉시 양쪽에게 접근 권한 부여
```

### 4.3 질문 교체 시스템
```yaml
교체_조건:
  - Assignment.swapCount = 0 (최초 1회만)
  - Answer가 0개 (아무도 답변 안 한 상태)
  - 만료 전 상태 (status = "active")

교체_로직:
  1. 조건 검증 (트랜잭션 내)
  2. 새 Question 랜덤 선택 (기존과 다름)  
  3. Assignment.questionId 업데이트
  4. Assignment.swapCount = 1 증가
  5. 만료시간 유지 (변경 없음)

제약_사항:
  - 같은 질문으로 교체 방지
  - 하루 1회 제한 엄격 적용
  - 교체 후에는 버튼 비활성화
```

## 5. 운영 요구사항

### 5.1 운영 모델 (Concierge MVP)
```yaml
기본_철학:
  - 자동화보다 수동 제어 우선
  - 하루 10분 운영으로 효율성 확보
  - 데이터 기반 점진적 개선

일일_운영: 
  08:00 - 브로드캐스트:
    1. /admin/broadcast에서 대상자 조회
    2. 카카오톡 수동 발송 (복붙 1회)
    3. 발송 결과 간단 기록
    
  19:00 - 리마인드 (선택적):
    1. /admin/analytics에서 완료율 확인  
    2. 낮으면 미완료자 대상 리마인드
    3. 높으면 생략 (운영자 판단)

주간_리뷰:
  - 지표 분석: 답변률, 완료율, 교체율
  - 질문 튜닝: 성과 낮은 질문 비활성화  
  - 사용자 피드백 반영
```

### 5.2 지표 정의 및 목표
```yaml
핵심_KPI:
  답변_시작률: 브로드캐스트 대비 1인 이상 답변한 쌍 비율
  목표: Week1 30% → Week4 50%
  
  완료율: 시작한 쌍 중 양쪽 모두 답변한 비율
  목표: Week1 60% → Week4 75%
  
  질문_교체율: 전체 Assignment 중 교체한 비율  
  목표: < 20% 유지 (질문 품질 지표)

보조_지표:
  - 평균 답변 길이 (50-200자 권장)
  - 시간대별 활동 분포
  - 가족 관계별 성과 차이
  - 주간 지속률 (3일 이상 연속 사용)
```

### 5.3 콘텐츠 관리
```yaml
질문_뱅크:
  초기: 100개 질문 (카테고리별 10개씩)
  확장: 성과 기반 점진적 추가
  
카테고리:
  - 일상·하루 (가벼운 시작용)
  - 추억·과거 (공통 경험 환기)  
  - 가족·관계 (관계 깊이 탐구)
  - 감사·행복 (긍정적 감정)
  - 취향·취미 (개성 이해)
  - 음식·요리 (공감대 형성)
  - 계절·날씨·장소 (시의성)
  - 미래·꿈·계획 (비전 공유)
  - 위로·응원·자기돌봄 (정서적 지지)
  - 배움·호기심 (지적 교류)

품질_기준:
  - 개인적이면서도 답변 가능한 수준
  - 세대 간 이해 가능한 언어  
  - 2-3문장으로 답변 가능
  - 논란이나 갈등 소지 없음
```

## 6. 성공 지표 및 마일스톤

### 6.1 Week별 검증 기준
```yaml
Week_1_Success: (Foundation)
  - 카카오 로그인 → /today → 답변 제출 100% 동작
  - 개발자 본인 완주 테스트 통과
  - UI 컴포넌트 모바일 최적화 완료

Week_2_Success: (Core Logic)  
  - 2인 게이트 공개 시나리오 100% 성공
  - 05시 서비스 데이 로직 정확도 100%
  - 질문 교체 1회 제한 정상 동작

Week_3_Success: (Full Flow)
  - 전체 사용자 플로우 완주율 90%+
  - 운영자 Export API 정상 동작
  - 히스토리/설정 페이지 완성

Week_4_Success: (Production Ready)
  - 실제 가족 1쌍 3일 연속 사용 달성
  - Lighthouse 80+ 점수 달성
  - 하루 10분 운영 프로세스 확립
```

### 6.2 출시 후 성장 지표
```yaml
Month_1: (MVP 검증)
  - DAU: 10 (가족 5쌍)
  - 답변 완료율: 70%+
  - 버그 리포트: < 5건/주

Month_3: (초기 성장)  
  - DAU: 50 (가족 25쌍)
  - 주간 지속률: 60%+  
  - 운영 시간: 하루 15분 이하

Month_6: (PMF 달성)
  - DAU: 200 (가족 100쌍)
  - 월간 지속률: 50%+
  - 자발적 공유/추천: 월 10건+
```

## 7. 리스크 및 대응 방안

### 7.1 기술적 리스크
```yaml
카카오_OAuth_변경:
  리스크: 카카오 정책 변경으로 인증 불가
  대응: Google OAuth 백업 계획 수립

Vercel_비용_증가:
  리스크: 사용량 증가로 무료 티어 초과
  대응: 사용량 모니터링 + 비용 알림 설정

성능_저하:
  리스크: 사용자 증가로 응답 속도 저하  
  대응: 캐싱 전략 + DB 인덱스 최적화
```

### 7.2 비즈니스 리스크
```yaml
사용자_참여_저조:
  리스크: 초기 사용자 이탈률 높음
  대응: 온보딩 개선 + 질문 품질 향상

운영_부담_증가:  
  리스크: 수동 운영의 한계 도달
  대응: 단계적 자동화 + 운영 도구 확장

경쟁_서비스_등장:
  리스크: 유사 서비스 출시
  대응: 차별화 요소 강화 + 빠른 기능 개선
```

## 8. 개발 우선순위

### 8.1 Must Have (P0)
- 카카오 로그인 + 세션 관리
- /today 통합 페이지 (핵심 UX)  
- 05시 서비스 데이 + 게이트 공개 시스템
- 질문 교체 1회 제한
- 운영자 Export API (브로드캐스트/리마인드)

### 8.2 Should Have (P1)  
- /history + /conversation 페이지
- /onboarding 쌍 연결
- 관리자 대시보드 기본 기능
- 모바일 최적화 + 접근성

### 8.3 Could Have (P2)
- 관리자 분석 도구 고도화
- 소셜 공유 기능  
- 푸시 알림 (웹/앱)
- A/B 테스트 시스템

### 8.4 Won't Have (현 버전 제외)
- 그룹 대화 (3인 이상)
- 실시간 채팅
- 사진/동영상 첨부
- 게임화 요소 (포인트/배지)

---

이 PRD는 **"최소 개발로 최대 가치"** 철학에 따라 작성되었으며, 4주 MVP 완성을 목표로 우선순위가 명확히 정의되어 있습니다. 

모든 요구사항은 운영 효율성과 사용자 경험을 균형있게 고려하여 설계되었습니다.