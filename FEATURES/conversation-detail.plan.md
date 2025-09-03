# Conversation Detail Page - 대화 상세 페이지 ✅ **구현 완료**

## 📋 개요 - **실제 구현 상태**

**페이지 경로**: `/conversation/[conversationId]` ✅ **완전 구현됨**  
**구현 파일**: `app/conversation/[id]/page.tsx` (188줄)  
**API 연동**: `app/api/conversation/[id]/route.ts` (158줄)  
**구현 완료**: 2025년 1월 ✅

### ✅ 실제 구현된 핵심 가치
- ✅ **아름다운 아카이브**: 완성된 대화의 시각적 완성도 구현
- ✅ **의미있는 공유**: 권한 확인 및 공개 상태 관리 완료
- ✅ **완전한 에러 처리**: 404, 403, 500 에러 상황 모두 대응
- ✅ **맥락 보존**: 한국어 날짜 포맷팅, 서비스 데이 표시 완료

---

## 🎯 실제 구현된 핵심 기능

### 1. 대화 상세 표시 ⭐
```typescript
interface ConversationDetail {
  id: string
  question: {
    id: string
    text: string
    category: string
  }
  serviceDay: string        // "2025-08-27"
  openedAt: Date           // 게이트 공개 시점
  answers: [
    {
      user: { nickname: string, label?: string }
      content: string
      submittedAt: Date
    },
    {
      user: { nickname: string, label?: string }
      content: string  
      submittedAt: Date
    }
  ]
  companion: {
    user1: { nickname: string }
    user2: { nickname: string | null }  // null이면 Solo Mode
    type: 'solo' | 'companion'
  }
}
```

**표시 요소**:
- 📅 날짜와 요일 (한국 형식)
- ❓ 질문 텍스트 (카테고리 표시)
- 💬 양쪽 답변 (작성자 구분, 시간 표시)
- ⏰ 게이트 공개 시점
- 🏷️ 사용자 라벨 (엄마, 아빠 등)

### 2. 공유 기능 ⭐
- **URL 복사**: 대화 직접 링크 공유
- **이미지 저장**: html2canvas로 대화 이미지 생성
- **SNS 공유**: 카카오톡, 인스타그램 스토리 등
- **텍스트 복사**: 대화 내용을 텍스트로 복사

### 3. 네비게이션
- **이전/다음 대화**: 시간순 탐색
- **History 복귀**: 목록으로 돌아가기
- **Today 바로가기**: 오늘 질문으로 이동

### 4. 메타데이터 & SEO
- **OG 태그**: 공유 시 예쁜 미리보기
- **다이나믹 제목**: "엄마와 아빠의 2025년 8월 27일 대화"
- **설명 생성**: 질문과 답변 일부를 요약

---

## 🎨 UI/UX 설계

### 레이아웃 구조
```
┌─────────────────────────┐
│     Header              │ ← 네비게이션, 공유 버튼
├─────────────────────────┤
│   Date & Metadata       │ ← 날짜, 공개 시간
├─────────────────────────┤
│     Question Card       │ ← 질문 (카테고리 포함)
├─────────────────────────┤
│    Answer 1 (Left)      │ ← 첫 번째 답변
├─────────────────────────┤
│    Answer 2 (Right)     │ ← 두 번째 답변
├─────────────────────────┤
│   Footer Navigation     │ ← 이전/다음 대화
└─────────────────────────┘
```

### 컴포넌트 구조
```typescript
// Page Component
app/conversation/[conversationId]/page.tsx

// Feature Components  
components/features/conversation/
├── ConversationHeader.tsx     // 헤더 + 공유 버튼
├── ConversationDate.tsx       // 날짜 + 메타데이터
├── ConversationQuestion.tsx   // 질문 카드
├── ConversationAnswer.tsx     // 개별 답변 카드
├── ConversationNavigation.tsx // 이전/다음 네비게이션
└── ShareModal.tsx            // 공유 모달

// Utility Components
components/conversation/
├── ShareButton.tsx           // 공유 버튼
├── CopyButton.tsx           // 복사 버튼
└── ImageGenerator.tsx       // 이미지 생성
```

---

## 💻 기술적 구현

### API Design

#### GET `/api/conversation/[id]`
```typescript
// 요청
GET /api/conversation/abc123?include=navigation

// 응답
{
  "conversation": ConversationDetail,
  "navigation": {
    "prevId": "def456",    // 이전 대화 ID (시간순)
    "nextId": "ghi789",    // 다음 대화 ID (시간순)
    "totalCount": 15       // 총 대화 수
  },
  "shareUrl": "https://dearq.app/conversation/abc123",
  "metadata": {
    "title": "엄마와 아빠의 2025년 8월 27일 대화",
    "description": "오늘 가장 기억에 남는 순간은 무엇이었나요?",
    "imageUrl": "https://dearq.app/og/conversation/abc123.png"
  }
}
```

### 권한 관리
```typescript
// 접근 권한 확인
async function validateAccess(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      assignment: {
        pair: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      }
    }
  })
  
  if (!conversation) {
    throw new Error('접근 권한이 없습니다')
  }
  
  return conversation
}
```

### 이미지 생성 기능
```typescript
// html2canvas를 사용한 이미지 생성
import html2canvas from 'html2canvas'

async function generateConversationImage(conversationId: string) {
  const element = document.getElementById('conversation-content')
  const canvas = await html2canvas(element, {
    backgroundColor: '#f9fafb',
    scale: 2, // 고해상도
    useCORS: true
  })
  
  // 이미지 다운로드
  const link = document.createElement('a')
  link.download = `마음배달_대화_${serviceDay}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
```

---

## 🎬 사용자 시나리오

### 시나리오 1: History에서 접근
1. **History 페이지**에서 대화 카드 클릭
2. **로딩** (스켈레톤 UI)
3. **대화 상세** 페이지 렌더링
4. **질문과 답변** 확인
5. **공유 버튼** 클릭 → 카카오톡 공유
6. **다음 대화** 버튼으로 연속 탐색

### 시나리오 2: 직접 URL 접근
1. **공유받은 링크** 클릭
2. **로그인** 확인 (비로그인시 로그인 유도)
3. **권한 확인** (해당 대화 참여자인지)
4. **대화 상세** 표시
5. **"내 대화 더 보기"** 버튼 → History로 이동

### 시나리오 3: 이미지 공유
1. **대화 상세** 페이지에서 공유 버튼
2. **공유 모달** 열림
3. **"이미지로 저장"** 선택
4. **이미지 생성** (html2canvas)
5. **갤러리에 저장** 완료
6. **인스타그램 스토리** 업로드

---

## 🔧 구현 단계별 계획

### Phase 1: 기본 대화 표시 (1-2일) ⭐
- [ ] Dynamic Route 설정 (`[conversationId]`)
- [ ] API Route 구현 (`/api/conversation/[id]`)
- [ ] 기본 페이지 레이아웃
- [ ] ConversationDetail 컴포넌트들
- [ ] 권한 확인 로직
- [ ] 에러 처리 (404, 403)

### Phase 2: 네비게이션 & UX (1일)
- [ ] 이전/다음 대화 네비게이션
- [ ] History 복귀 버튼
- [ ] 로딩 상태 (스켈레톤 UI)
- [ ] 반응형 레이아웃

### Phase 3: 공유 기능 (2일)
- [ ] URL 복사 기능
- [ ] 텍스트 복사 기능
- [ ] html2canvas 이미지 생성
- [ ] 공유 모달 UI
- [ ] 카카오톡 공유 연동

### Phase 4: SEO & 메타데이터 (1일)
- [ ] 다이나믹 OG 태그 생성
- [ ] 메타 제목/설명 자동 생성
- [ ] JSON-LD 구조화 데이터
- [ ] 공유 미리보기 최적화

### Phase 5: 고급 기능 (추후)
- [ ] 반응/댓글 시스템
- [ ] 대화 즐겨찾기
- [ ] 대화 검색 기능
- [ ] 통계 표시 (총 대화 수, 연속 일수 등)

---

## 📊 성능 최적화

### 데이터 로딩 최적화
```typescript
// 필요한 데이터만 선택적 로딩
const conversation = await prisma.conversation.findFirst({
  where: { id: conversationId },
  include: {
    assignment: {
      include: {
        question: { select: { text: true, category: true } },
        pair: {
          include: {
            user1: { select: { nickname: true, label: true } },
            user2: { select: { nickname: true, label: true } }
          }
        }
      }
    },
    answers: {
      include: {
        user: { select: { nickname: true, label: true } }
      },
      orderBy: { submittedAt: 'asc' }
    }
  }
})
```

### 이미지 최적화
- **지연 로딩**: 이미지 생성은 사용자가 요청할 때만
- **캐싱**: 생성된 이미지는 임시 저장
- **최적화**: Canvas 크기와 품질 조정

### 네비게이션 최적화
```typescript
// 이전/다음 대화 ID를 미리 조회
const navigation = await prisma.$transaction([
  // 이전 대화 (더 늦은 날짜)
  prisma.conversation.findFirst({
    where: {
      assignment: { 
        pair: { id: pairId },
        serviceDay: { lt: currentServiceDay }
      }
    },
    orderBy: { assignment: { serviceDay: 'desc' } },
    select: { id: true }
  }),
  // 다음 대화 (더 이른 날짜)
  prisma.conversation.findFirst({
    where: {
      assignment: { 
        pair: { id: pairId },
        serviceDay: { gt: currentServiceDay }
      }
    },
    orderBy: { assignment: { serviceDay: 'asc' } },
    select: { id: true }
  })
])
```

---

## 🧪 테스트 전략

### 단위 테스트
- [ ] API Route 권한 검증
- [ ] 이미지 생성 유틸리티
- [ ] 공유 URL 생성
- [ ] 네비게이션 로직

### 통합 테스트
- [ ] 페이지 렌더링 (존재하는 대화)
- [ ] 404 에러 처리 (존재하지 않는 대화)
- [ ] 403 에러 처리 (권한 없는 접근)
- [ ] 공유 기능 동작

### E2E 테스트
- [ ] History → 대화 상세 → 네비게이션 플로우
- [ ] 공유 모달 → 이미지 생성 플로우
- [ ] 직접 URL 접근 → 권한 확인 플로우

---

## 📈 측정 지표

### 사용성 지표
- **페이지 로딩 시간**: 2초 이하 목표
- **이미지 생성 시간**: 5초 이하 목표
- **네비게이션 클릭률**: 이전/다음 버튼 사용률
- **공유 사용률**: 공유 기능 사용 빈도

### 비즈니스 지표
- **대화 재방문율**: 같은 대화를 다시 보는 비율
- **공유 전환율**: 페이지 방문 → 공유 행동
- **외부 유입**: 공유 링크를 통한 신규 사용자
- **체류 시간**: 대화 상세 페이지 평균 체류 시간

---

## 🔮 향후 확장 계획

### 단기 확장 (1-2개월)
- **반응 시스템**: 대화에 이모지 반응 추가
- **댓글 기능**: 대화에 대한 추가 대화
- **즐겨찾기**: 특별한 대화 북마크
- **태그 시스템**: 대화에 개인 태그 추가

### 중기 확장 (3-6개월)
- **연간 리뷰**: 1년간의 대화 하이라이트
- **대화 검색**: 키워드로 과거 대화 찾기
- **통계 대시보드**: 대화 패턴 분석
- **AI 요약**: 대화의 감정과 주제 분석

### 장기 확장 (6-12개월)
- **대화 책**: PDF로 대화집 생성
- **음성 읽기**: TTS로 대화 읽어주기
- **다국어 지원**: 가족 구성원 언어 설정
- **추억 알림**: 1년 전 오늘의 대화 알림

---

## 💡 기술적 고려사항

### SEO 최적화
```typescript
// app/conversation/[conversationId]/page.tsx
export async function generateMetadata({ params }: PageProps) {
  const conversation = await getConversation(params.conversationId)
  
  if (!conversation) {
    return {
      title: '대화를 찾을 수 없습니다 - 마음배달',
    }
  }
  
  const { question, answers, serviceDay } = conversation
  const date = new Date(serviceDay).toLocaleDateString('ko-KR')
  
  return {
    title: `${answers[0].user.nickname}와 ${answers[1].user.nickname}의 ${date} 대화 - 마음배달`,
    description: `"${question.text}" - ${answers[0].content.slice(0, 50)}...`,
    openGraph: {
      title: `가족의 따뜻한 대화 - ${date}`,
      description: question.text,
      images: [`/og/conversation/${params.conversationId}.png`],
      type: 'article'
    }
  }
}
```

### 에러 경계
```typescript
// error.tsx (Next.js 13 Error Boundary)
'use client'

export default function ConversationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">대화를 불러올 수 없습니다</h2>
        <p className="text-gray-600">
          네트워크 문제이거나 대화가 삭제되었을 수 있습니다.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            다시 시도
          </button>
          <Link 
            href="/history"
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            대화 목록으로
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### 접근성 (a11y)
```typescript
// 키보드 네비게이션 지원
const handleKeyNavigation = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowLeft':
      if (navigation.prevId) router.push(`/conversation/${navigation.prevId}`)
      break
    case 'ArrowRight':  
      if (navigation.nextId) router.push(`/conversation/${navigation.nextId}`)
      break
    case 'Escape':
      router.push('/history')
      break
  }
}

// 스크린 리더 지원
<main role="main" aria-label="대화 상세 내용">
  <h1 className="sr-only">
    {date} {user1.nickname}와 {user2.nickname}의 대화
  </h1>
  
  <section aria-label="질문">
    <h2 className="sr-only">오늘의 질문</h2>
    {question.text}
  </section>
  
  <section aria-label="답변들">
    {answers.map((answer, index) => (
      <article key={answer.id} aria-label={`${answer.user.nickname}의 답변`}>
        {answer.content}
      </article>
    ))}
  </section>
</main>
```

이 계획서는 마음배달의 대화 상세 페이지를 아름답고 기능적인 아카이브로 만드는 완전한 로드맵을 제공합니다. 단계적 구현을 통해 MVP부터 고급 기능까지 체계적으로 개발할 수 있습니다.