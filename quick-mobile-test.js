// 모바일 환경에서의 빠른 플리커링 검증
const { chromium } = require('playwright');

async function quickMobileFlickeringTest() {
  console.log('📱 모바일 환경 플리커링 빠른 검증...\n');

  const browser = await chromium.launch({ 
    headless: true // 빠른 테스트를 위해 headless로 실행
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE 크기
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  try {
    console.log('🔥 핵심 검증 항목만 빠르게 테스트');

    // 1. 빠른 로딩 시간 측정
    console.log('\n⚡ 로딩 성능 (캐시된 환경)');
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/history?test_mode=true');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = (Date.now() - startTime) / 1000;
    console.log(`   📊 DOM 로딩: ${loadTime.toFixed(3)}초 (${loadTime < 1.0 ? '✅ 우수' : '⚠️ 개선필요'})`);

    // 2. 하이드레이션 플리커링 검증 (핵심)
    console.log('\n🎯 하이드레이션 플리커링 검증');
    
    // 플리커링 감지 스크립트
    const flickerDetected = await page.evaluate(() => {
      let flickerCount = 0;
      const startTime = performance.now();
      
      const observer = new MutationObserver((mutations) => {
        const now = performance.now();
        // 500ms 이후의 DOM 변화만 플리커링으로 간주
        if (now - startTime > 500) {
          flickerCount += mutations.length;
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      
      return new Promise((resolve) => {
        setTimeout(() => {
          observer.disconnect();
          resolve(flickerCount);
        }, 2000);
      });
    });

    console.log(`   📊 하이드레이션 후 DOM 변화: ${flickerDetected}개 (${flickerDetected === 0 ? '✅ 플리커링 없음' : '⚠️ 플리커링 감지됨'})`);

    // 3. 테스트 모드 컴포넌트 확인
    console.log('\n🧪 테스트 모드 활성화 확인');
    
    await page.waitForTimeout(1000);
    const testComponents = await page.$$('.bg-blue-50.border.border-blue-200');
    console.log(`   📊 테스트 컴포넌트: ${testComponents.length}개 (${testComponents.length > 0 ? '✅ 정상' : '❌ 실패'})`);

    // 4. 시각적 안정성 (CLS) 빠른 측정
    console.log('\n📐 시각적 안정성 (CLS)');
    
    const clsValue = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1500);
      });
    });

    console.log(`   📊 CLS 점수: ${clsValue.toFixed(4)} (${clsValue < 0.1 ? '✅ 우수' : '⚠️ 개선필요'})`);

    // 5. 종합 평가
    console.log('\n🎯 종합 평가');
    
    const scores = {
      loading: loadTime < 1.0,
      flickering: flickerDetected === 0,
      testMode: testComponents.length > 0,
      cls: clsValue < 0.1
    };

    const successCount = Object.values(scores).filter(Boolean).length;
    const totalCount = Object.keys(scores).length;
    const percentage = (successCount / totalCount * 100).toFixed(1);

    console.log(`   📊 성공률: ${successCount}/${totalCount} (${percentage}%)`);
    
    if (successCount === totalCount) {
      console.log('   🎉 완벽! UI 플리커링 문제가 완전히 해결되었습니다.');
    } else if (successCount >= totalCount * 0.75) {
      console.log('   ✅ 우수! 대부분의 UI 문제가 해결되었습니다.');
    } else {
      console.log('   ⚠️  일부 개선이 필요합니다.');
    }

    // Before/After 비교를 위한 스크린샷
    await page.screenshot({ 
      path: 'mobile_history_after_fix.png',
      fullPage: false // 뷰포트만 캡처
    });
    console.log('\n📸 모바일 스크린샷 저장: mobile_history_after_fix.png');

    return {
      loadTime,
      flickerDetected,
      testComponents: testComponents.length,
      clsValue,
      scores,
      successRate: percentage
    };

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    return null;
  } finally {
    await browser.close();
  }
}

// 실행
quickMobileFlickeringTest().then(result => {
  if (result) {
    console.log('\n✨ 빠른 검증 완료!');
    console.log(`💡 핵심 성과: ${result.flickerDetected === 0 ? '플리커링 완전 해결' : '일부 플리커링 존재'}`);
    console.log(`⚡ 성능: ${result.loadTime < 1.0 ? '빠른 로딩' : '로딩 개선 필요'}`);
    console.log(`📐 안정성: CLS ${result.clsValue.toFixed(4)} ${result.clsValue < 0.1 ? '(우수)' : '(개선필요)'}`);
  }
}).catch(console.error);