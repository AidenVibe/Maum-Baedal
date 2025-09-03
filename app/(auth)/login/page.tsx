'use client'

import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import KakaoLoginButton from '@/components/auth/KakaoLoginButton'
import { ChevronDown, ChevronUp } from 'lucide-react'
import styles from './enhanced-styles.module.css'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'why' | 'how' | null>(null)
  const [showTimeout, setShowTimeout] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  
  // 스와이프 관련 상태
  const [isSwipe, setIsSwipe] = useState(false)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchCurrent, setTouchCurrent] = useState({ x: 0, y: 0 })
  const [swipeOffset, setSwipeOffset] = useState(0)
  
  const introSectionRef = useRef<HTMLElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const tabContentRef = useRef<HTMLDivElement>(null)

  // 기존 로그인 페이지와 동일한 세션 관리 로직
  useEffect(() => {
    console.log('[LOGIN PAGE DEBUG] Status:', status, 'Session:', session?.user)
  }, [status, session])

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('[LOGIN PAGE DEBUG] User authenticated, redirecting to /today')
      router.push('/today')
    }
  }, [status, session, router])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        console.log('[LOGIN PAGE DEBUG] Session loading timeout, showing login form')
        setShowTimeout(true)
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [status])

  // 탭 섹션 표시 함수 (개선된 버전) - useCallback으로 메모이제이션
  const showTabSection = useCallback(() => {
    setActiveTab('why') // 기본값으로 '왜' 탭 표시
    setIsScrolling(true)
    
    setTimeout(() => {
      introSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
      
      // 스크롤 완료 후 포커스 이동
      setTimeout(() => {
        introSectionRef.current?.focus()
        setIsScrolling(false)
      }, 800)
    }, 100)
  }, [])

  const scrollToTop = useCallback(() => {
    setIsScrolling(true)
    
    // 부드러운 스크롤과 함께 시각적 피드백 제공
    const scrollElement = document.documentElement
    const start = scrollElement.scrollTop
    const startTime = performance.now()
    const duration = 800
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // easeInOutCubic 함수로 부드러운 애니메이션
      const easeInOutCubic = (t: number): number => 
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      
      scrollElement.scrollTop = start * (1 - easeInOutCubic(progress))
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      } else {
        // 스크롤 완료 후 포커스 이동
        setTimeout(() => {
          mainContentRef.current?.focus()
          setIsScrolling(false)
        }, 100)
      }
    }
    
    requestAnimationFrame(animateScroll)
  }, [])

  // 탭 전환 함수 - useCallback으로 메모이제이션
  const handleTabClick = useCallback((tab: 'why' | 'how') => {
    setActiveTab(tab)
    setSwipeOffset(0) // 스와이프 오프셋 리셋
  }, [])

  // 탭 전환과 스크롤을 함께 수행하는 함수
  const handleTabClickWithScroll = useCallback((tab: 'why' | 'how') => {
    setActiveTab(tab)
    setSwipeOffset(0)
    setIsScrolling(true)
    
    // 탭 네비게이션 영역으로 부드러운 스크롤
    setTimeout(() => {
      const tabNavElement = document.querySelector('[role="tablist"][aria-label="서비스 소개 탭"]')
      if (tabNavElement) {
        tabNavElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
        
        // 스크롤 완료 후 상태 업데이트
        setTimeout(() => {
          setIsScrolling(false)
        }, 800)
      }
    }, 100)
  }, [])

  // 스와이프 이벤트 핸들러들
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setTouchCurrent({ x: touch.clientX, y: touch.clientY })
    setIsSwipe(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwipe) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    
    // 세로 스크롤이 더 많으면 스와이프 취소
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setIsSwipe(false)
      setSwipeOffset(0)
      return
    }
    
    // 가로 스와이프 진행
    e.preventDefault() // 스크롤 방지
    setTouchCurrent({ x: touch.clientX, y: touch.clientY })
    
    // 스와이프 오프셋 계산 (최대 ±100px로 제한)
    const offset = Math.max(-100, Math.min(100, deltaX * 0.5))
    setSwipeOffset(offset)
  }, [isSwipe, touchStart.x, touchStart.y])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwipe) return
    
    const deltaX = touchCurrent.x - touchStart.x
    const threshold = 50 // 50px 이상 스와이프시 탭 전환
    
    // 탭 전환 로직
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX > 0 && activeTab === 'how') {
        // 오른쪽 스와이프: how → why
        handleTabClick('why')
      } else if (deltaX < 0 && activeTab === 'why') {
        // 왼쪽 스와이프: why → how  
        handleTabClick('how')
      }
    }
    
    // 상태 리셋
    setIsSwipe(false)
    setSwipeOffset(0)
    setTouchStart({ x: 0, y: 0 })
    setTouchCurrent({ x: 0, y: 0 })
  }, [isSwipe, touchStart, touchCurrent, activeTab, handleTabClick])

  // 키보드 이벤트 핸들러 - useCallback으로 메모이제이션
  const handleIntroKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      showTabSection()
    }
  }, [showTabSection])

  const handleTopKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      scrollToTop()
    }
  }, [scrollToTop])

  // 탭 섹션 키보드 네비게이션 (화살표 키)
  const handleTabSectionKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && activeTab === 'how') {
      e.preventDefault()
      handleTabClick('why')
    } else if (e.key === 'ArrowRight' && activeTab === 'why') {
      e.preventDefault()
      handleTabClick('how')
    }
  }, [activeTab, handleTabClick])

  // 스타일 클래스 메모이제이션
  const buttonClassNames = useMemo(() => ({
    intro: `inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 focus:text-violet-700 font-medium transition-colors touch-target rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.smoothTransition} ${styles.enhancedFocus}`,
    scrollTop: `inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 focus:bg-violet-600 font-medium transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.smoothTransition} ${styles.enhancedFocus} ${styles.pulse}`
  }), [])

  const cardClassName = useMemo(() => 
    `bg-white/80 rounded-xl p-6 shadow-lg border border-white/50 ${styles.fadeInUp} ${styles.smoothTransition}`,
  [])

  if (status === 'loading' && !showTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 to-amber-50 p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4" aria-hidden="true"></div>
            <p>로딩 중...</p>
            <span className="sr-only">페이지를 불러오는 중입니다. 잠시만 기다려 주세요.</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'authenticated' && session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 to-amber-50 p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center">
            <img src="/icons/apple-touch-icon.png" alt="마음배달" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg" />
            <h1 className="text-2xl font-bold mb-4">이미 로그인되었습니다</h1>
            <p className="mb-4">안녕하세요 {session.user.name || session.user.email}님</p>
            <Button 
              onClick={() => router.push('/today')} 
              className="px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 touch-target"
            >
              오늘의 질문 보기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-amber-50">
      {/* 스킵 네비게이션 링크 (접근성) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-violet-600 text-white px-4 py-2 rounded-lg z-50"
      >
        메인 콘텐츠로 건너뛰기
      </a>

      {/* Above the fold - 빠른 로그인 섹션 */}
      <main role="main" className="min-h-screen flex flex-col justify-center p-6">
        <div 
          id="main-content"
          ref={mainContentRef}
          className="max-w-md mx-auto w-full"
          tabIndex={-1}
        >
          {/* 헤더 - 이미지 로고 */}
          <header className="text-center mb-8">
            <img 
              src="/icons/apple-touch-icon.png" 
              alt="마음배달 로고" 
              className={`w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg ${styles.floatIcon}`}
            />
            <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${styles.gradientText} ${styles.fadeInUp}`}>
              마음배달
            </h1>
            <h2 className={`text-xl font-medium text-gray-700 mb-4 ${styles.fadeInUp}`}>
              매일 하나의 질문에 답하며<br/>
              가족의 마음을 알아가 보세요
            </h2>
          </header>
          
          {/* 메인 CTA - 카카오 로그인 */}
          <section className={`mb-6 ${styles.scaleIn}`} aria-labelledby="login-heading">
            <h2 id="login-heading" className="sr-only">로그인</h2>
            <KakaoLoginButton />
          </section>
          
          {/* 첫 방문자 안내 - 개선된 가시성 */}
          <nav className="text-center mb-4" aria-label="추가 정보">
            <div className={`bg-white/70 border-2 border-violet-200 rounded-xl p-4 shadow-sm hover:bg-white/90 hover:border-violet-300 hover:shadow-md transition-all ${styles.smoothTransition} ${styles.enhancedCard}`}>
              <button
                onClick={showTabSection}
                onKeyDown={handleIntroKeyDown}
                disabled={isScrolling}
                className="w-full inline-flex items-center justify-center gap-2 text-violet-700 font-semibold touch-target focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="서비스 소개 보기"
                aria-expanded={activeTab !== null}
                aria-controls="intro-section"
              >
                <span className="text-violet-500 mr-1">💡</span>
                처음이신가요? 더 알아보기
                <ChevronDown className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </nav>

          {/* 약관 텍스트 */}
          <footer className="text-xs text-center text-gray-500 leading-relaxed pt-6">
            로그인 시 <a href="/terms" className="underline hover:text-gray-700 text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded">이용약관</a> 및 
            <a href="/privacy" className="underline hover:text-gray-700 text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded ml-1">개인정보 처리방침</a>에 동의합니다.
          </footer>
        </div>
      </main>

      {/* Below the fold - 탭 기반 서비스 소개 섹션 */}
      {activeTab !== null && (
        <section 
          id="intro-section" 
          ref={introSectionRef}
          className={`min-h-screen bg-white/50 backdrop-blur-sm p-6 border-t border-white/30 ${styles.slideInFromBottom} ${styles.glassMorphism}`}
          role="region"
          aria-labelledby="intro-title"
          tabIndex={-1}
          onKeyDown={handleTabSectionKeyDown}
        >
          <div className="max-w-md mx-auto w-full py-8">

            {/* 탭 네비게이션 */}
            <nav className={`mb-8 ${styles.tabContainer}`} role="tablist" aria-label="서비스 소개 탭">
              <div className="flex border-b border-gray-200 relative">
                <button
                  role="tab"
                  aria-selected={activeTab === 'why'}
                  aria-controls="why-panel"
                  id="why-tab"
                  onClick={() => handleTabClick('why')}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      handleTabClick('how')
                    }
                  }}
                  className={`flex-1 px-4 py-3 text-center font-medium touch-target focus:outline-none ${styles.tabHover} ${styles.tabFocus} ${styles.smoothTransition} ${
                    activeTab === 'why'
                      ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                      : 'text-gray-500 hover:text-gray-700 focus:text-gray-700'
                  }`}
                >
                  왜 필요한가요?
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'how'}
                  aria-controls="how-panel"
                  id="how-tab"
                  onClick={() => handleTabClick('how')}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      handleTabClick('why')
                    }
                  }}
                  className={`flex-1 px-4 py-3 text-center font-medium touch-target focus:outline-none ${styles.tabHover} ${styles.tabFocus} ${styles.smoothTransition} ${
                    activeTab === 'how'
                      ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                      : 'text-gray-500 hover:text-gray-700 focus:text-gray-700'
                  }`}
                >
                  어떻게 사용하나요?
                </button>
              </div>
            </nav>

            {/* 탭별 콘텐츠 - 스와이프 지원 */}
            {/* '왜 필요한가요?' 탭 콘텐츠 */}
            {activeTab === 'why' && (
              <div
                ref={tabContentRef}
                id="why-panel"
                role="tabpanel"
                aria-labelledby="why-tab"
                className={`space-y-6 mb-8 ${styles.contentFade}`}
                style={{ transform: `translateX(${swipeOffset}px)`, transition: isSwipe ? 'none' : 'transform 0.3s ease' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* 독립한 자녀의 현실 문제 */}
                <header className="text-center mb-8">
                  <div className="mb-6">
                    <div className="text-6xl mb-4" aria-hidden="true">📞</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      부모님과 '밥 먹었어?' 말고<br/>
                      무슨 대화를 해야 할지 모르겠어요
                    </h3>
                  </div>
                </header>

                {/* 현실적 문제들 */}
                <div className="space-y-4 mb-8">
                  <article className={cardClassName}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <span className="text-2xl">😅</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">독립 후 어색해진 가족 관계</h4>
                        <p className="text-gray-600">함께 살 때는 자연스러웠는데, 이제는 어떤 말을 해야 할지 모르겠어요</p>
                      </div>
                    </div>
                  </article>

                  <article className={cardClassName}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <span className="text-2xl">🔄</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">뻔한 안부 인사의 한계</h4>
                        <p className="text-gray-600">매번 같은 질문, 같은 대답.. 진짜 속 마음은 나누지 못하고 있어요</p>
                      </div>
                    </div>
                  </article>

                  <article className={cardClassName}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <span className="text-2xl">⏰</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">바쁜 일상 속 소통 부족</h4>
                        <p className="text-gray-600">연락하고 싶지만 바쁘다는 핑계로 미루게 되는 일상이에요</p>
                      </div>
                    </div>
                  </article>
                </div>

                {/* 해결책 제시 */}
                <div className="bg-white/80 rounded-xl p-6 shadow-lg border border-white/50">
                  <div className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true">🌱</div>
                    <h4 className="font-bold text-gray-900 text-lg mb-3">
                      너무 가깝지도, 멀지도 않은 거리에서<br/>
                      깊어지는 우리 관계
                    </h4>
                    <p className="text-gray-600 mb-4">
                      적당한 거리에서의 소통으로<br/>
                      다툼 없이 이해를 높이는 안전한 방식.<br/>
                      점진적으로 쌓이는 서로에 대한 앎이 관계를 변화시킵니다.
                    </p>
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <p className="text-sm text-amber-800">
                        💝 가족 외에도 <strong>연인이나 소중한 친구</strong>와도 사용할 수 있어요<br/>
                        서로를 더 깊이 알아가고 싶은 모든 관계에 도움이 됩니다
                      </p>
                    </div>
                  </div>
                {/* "다음: 어떻게 사용하나요?" CTA 버튼 */}
                <div className="text-center mt-8">
                  <button 
                    onClick={() => handleTabClickWithScroll('how')}
                    disabled={isScrolling}
                    className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 focus:bg-violet-600 transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="다음 단계: 어떻게 사용하나요? 탭으로 이동하며 자동 스크롤"
                  >
                    다음: 어떻게 사용하나요? 
                    <ChevronDown className="w-5 h-5 ml-2 rotate-[-90deg]" aria-hidden="true" />
                  </button>
                </div>
                </div>
              </div>
            )}

            {/* '어떻게 사용하나요?' 탭 콘텐츠 */}
            {activeTab === 'how' && (
              <div
                id="how-panel"
                role="tabpanel"
                aria-labelledby="how-tab"
                className={`space-y-6 mb-8 ${styles.contentFade}`}
                style={{ transform: `translateX(${swipeOffset}px)`, transition: isSwipe ? 'none' : 'transform 0.3s ease' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <header className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    🗓️ 3일 시나리오로 알아보기
                  </h3>
                  <p className="text-gray-600">
                    실제 사용 과정을 단계별로 보여드릴게요
                  </p>
                </header>

                {/* 첫째날: 시작 과정 */}
                <article className={cardClassName}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <span className="text-2xl">1️⃣</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">첫째날: 카카오톡으로 간편하게 시작</h4>
                      <p className="text-gray-600 mb-3">
                        부모님께 질문 링크만 카카오톡으로 공유하면 복잡한 설정 없이 바로 시작할 수 있어요
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          💬 "엄마, 이 질문 한번 같이 답해봐요!" + [링크 공유]<br/>
                          → 클릭해서 답하는 과정에서 자동으로 매칭 완료
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                {/* 둘째날: 첫 질문 */}
                <article className={cardClassName}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <span className="text-2xl">2️⃣</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">둘째날: 첫 질문 답변하기</h4>
                      <p className="text-gray-600 mb-3">
                        오전 8시에 자동으로 질문이 도착해요<br/>
                        <strong>나만 먼저 답하고, 상대방도 답해야 서로 공개</strong>
                      </p>
                      <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                        <p className="text-sm text-violet-700">
                          🔐 <strong>함께 쓰면 열리는 마음의 문</strong><br/>
                          서로가 답해야만 상대의 답변을 볼 수 있어서 공평한 대화가 가능해요
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                {/* 셋째날: 관계 발전 */}
                <article className={cardClassName}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <span className="text-2xl">3️⃣</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">셋째날: 대화가 자연스럽게 이어져요</h4>
                      <p className="text-gray-600 mb-3">
                        서로의 답변을 보고 자연스럽게<br/>
                        카카오톡이나 전화로 대화가 이어집니다
                      </p>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-sm text-green-700">
                          💚 <strong>서로에 대한 새로운 발견</strong><br/>
                          "엄마가 이런 생각을 하셨구나!"<br/>
                          "아, 우리 가족이 이런 추억을 소중히 여기는구나!"
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                <div className="bg-white/80 rounded-xl p-6 shadow-lg border border-white/50">
                  <div className="text-center">
                    <div className="text-4xl mb-4" aria-hidden="true">🤝</div>
                    <h4 className="font-bold text-gray-900 text-lg mb-3">
                      1:1 개별 관계로 편안하게
                    </h4>
                    <div className="relative w-full h-32 mb-4">
                      {/* SVG 연결선 - 엄마↔나, 아빠↔나 (엄마-아빠는 연결 안됨) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                        <line 
                          x1="20%" y1="25%" 
                          x2="50%" y2="75%" 
                          stroke="#c4b5fd" 
                          strokeWidth="2"
                          strokeDasharray="none"
                        />
                        <line 
                          x1="80%" y1="25%" 
                          x2="50%" y2="75%" 
                          stroke="#c4b5fd" 
                          strokeWidth="2"
                          strokeDasharray="none"
                        />
                      </svg>
                      
                      {/* 상단: 엄마, 아빠 */}
                      <div className="absolute top-0 left-8 flex flex-col items-center">
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-lg">👩</span>
                        </div>
                        <span className="text-sm text-gray-600">엄마</span>
                      </div>
                      
                      <div className="absolute top-0 right-8 flex flex-col items-center">
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-lg">👨</span>
                        </div>
                        <span className="text-sm text-gray-600">아빠</span>
                      </div>
                      
                      {/* 하단 중앙: 나 */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-lg">🙋‍♀️</span>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">나</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-600 text-sm">
                    동반자들끼리는 서로의 대화를 공유되지 않아요.<br/>
                    각각 나와 개별적인 관계를 유지해서 심리적으로 편안해요.
                  </p>
                </div>
                
                {/* "이전: 왜 필요한가요?" CTA 버튼 */}
                <div className="text-center mt-8">
                  <button 
                    onClick={() => handleTabClickWithScroll('why')}
                    disabled={isScrolling}
                    className="inline-flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:bg-gray-600 transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="이전 단계: 왜 필요한가요? 탭으로 이동하며 자동 스크롤"
                  >
                    <ChevronDown className="w-5 h-5 mr-2 rotate-[90deg]" aria-hidden="true" />
                    이전: 왜 필요한가요?
                  </button>
                </div>
              </div>
            )}

            {/* 새로운 막대형 진행률 인디케이터 */}
            <div className="py-6 px-8" role="tablist" aria-label="페이지 탐색">
              <div className="relative">
                {/* 단계 라벨 */}
                <div className="flex justify-between mb-3">
                  <button
                    onClick={() => handleTabClick('why')}
                    className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 rounded px-2 py-1 ${
                      activeTab === 'why' 
                        ? 'text-violet-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label="왜 필요한가요? 탭으로 이동"
                    aria-pressed={activeTab === 'why'}
                  >
                    왜 필요한가요?
                  </button>
                  <button
                    onClick={() => handleTabClick('how')}
                    className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 rounded px-2 py-1 ${
                      activeTab === 'how' 
                        ? 'text-violet-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label="어떻게 사용하나요? 탭으로 이동"
                    aria-pressed={activeTab === 'how'}
                  >
                    어떻게 사용하나요?
                  </button>
                </div>
                
                {/* 프로그레스 바 */}
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-500 ease-out ${styles.progressBar}`}
                    style={{
                      width: activeTab === 'why' ? '50%' : '100%',
                      transform: 'translateX(0%)'
                    }}
                  />
                  
                  {/* 단계 구분선 */}
                  <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/50 transform -translate-x-0.5" />
                </div>
                
                {/* 단계 번호 */}
                <div className="flex justify-between mt-2">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      activeTab === 'why' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-violet-600 text-white'
                    }`}>
                      1
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      activeTab === 'how' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      2
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 공통 올라가기 버튼 */}
            <nav className="text-center" aria-label="페이지 상단으로">
              <button
                onClick={scrollToTop}
                onKeyDown={handleTopKeyDown}
                disabled={isScrolling}
                className={buttonClassNames.scrollTop}
                aria-label="로그인하러 올라가기"
              >
                <ChevronUp className="w-5 h-5" aria-hidden="true" />
                로그인하러 올라가기
              </button>
            </nav>
          </div>
        </section>
      )}
      
      {/* 스크롤 중 표시 (스크린 리더용) */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {isScrolling && "페이지를 스크롤하는 중입니다"}
      </div>
    </div>
  )
}