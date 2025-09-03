const { chromium } = require('playwright');

async function testLocalhost() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 } // iPhone 13 size
  });
  const page = await context.newPage();
  
  try {
    console.log('🚀 localhost:3000 페이지 테스트 시작...\n');
    
    // 콘솔 에러 감지
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 네트워크 에러 감지  
    const networkErrors = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    // 1. 페이지 접속 테스트
    console.log('1. 페이지 접속 테스트...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    console.log('✅ 페이지 접속 성공');
    
    // 2. 페이지 제목 확인
    console.log('\n2. 페이지 제목 확인...');
    const title = await page.title();
    console.log(`페이지 제목: "${title}"`);
    
    // 3. 현재 URL 확인 (리다이렉트 감지)
    console.log('\n3. 리다이렉트 확인...');
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ 로그인 페이지로 정상 리다이렉트됨');
    } else if (currentUrl.includes('/today')) {
      console.log('✅ Today 페이지로 리다이렉트됨 (인증된 상태)');
    } else {
      console.log(`현재 페이지: ${currentUrl}`);
    }
    
    // 4. 페이지 콘텐츠 확인
    console.log('\n4. 페이지 콘텐츠 확인...');
    
    // 로그인 페이지 요소들 확인
    const loginButton = await page.$('button:has-text("카카오"), button:has-text("로그인"), [data-testid*="login"]');
    if (loginButton) {
      const buttonText = await loginButton.textContent();
      console.log(`✅ 로그인 버튼 발견: "${buttonText}"`);
    }
    
    // 제목이나 헤더 확인
    const headings = await page.$$eval('h1, h2, h3', elements => 
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    if (headings.length > 0) {
      console.log(`페이지 헤딩: ${headings.join(', ')}`);
    }
    
    // 마음배달 브랜드 텍스트 확인
    const brandText = await page.$('text=마음배달');
    if (brandText) {
      console.log('✅ 마음배달 브랜드 텍스트 발견');
    }
    
    // 5. 이미지/아이콘 로딩 상태 확인
    console.log('\n5. 이미지/아이콘 로딩 확인...');
    const images = await page.$$('img');
    console.log(`이미지 수: ${images.length}개`);
    
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      
      if (naturalWidth > 0) {
        console.log(`✅ 이미지 로딩 성공: ${alt || src}`);
      } else {
        console.log(`❌ 이미지 로딩 실패: ${alt || src}`);
      }
    }
    
    // SVG 아이콘 확인
    const svgs = await page.$$('svg');
    console.log(`SVG 아이콘 수: ${svgs.length}개`);
    
    // 6. 모바일 반응형 확인
    console.log('\n6. 모바일 반응형 확인...');
    const viewport = page.viewportSize();
    console.log(`뷰포트: ${viewport.width}x${viewport.height}`);
    
    // 스크롤 가능 여부 확인
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const windowHeight = await page.evaluate(() => window.innerHeight);
    console.log(`페이지 높이: ${bodyHeight}px, 창 높이: ${windowHeight}px`);
    
    // 7. Next.js 특정 요소 확인
    console.log('\n7. Next.js 특정 요소 확인...');
    const nextScripts = await page.$$('script[src*="_next"]');
    console.log(`Next.js 스크립트 수: ${nextScripts.length}개`);
    
    // 하이드레이션 확인
    await page.waitForTimeout(1000); // 하이드레이션 대기
    const isHydrated = await page.evaluate(() => {
      return window.next !== undefined || document.querySelector('[data-reactroot]') !== null;
    });
    console.log(`React 하이드레이션 상태: ${isHydrated ? '완료' : '대기중'}`);
    
    // 8. 네트워크 에러 보고
    console.log('\n8. 네트워크 에러 확인...');
    if (networkErrors.length === 0) {
      console.log('✅ 네트워크 에러 없음');
    } else {
      console.log('❌ 네트워크 에러 발견:');
      networkErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // 9. 콘솔 에러 보고
    console.log('\n9. 콘솔 에러 확인...');
    if (consoleErrors.length === 0) {
      console.log('✅ 콘솔 에러 없음');
    } else {
      console.log('❌ 콘솔 에러 발견:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // 10. 페이지 스크린샷
    console.log('\n10. 스크린샷 캡처...');
    await page.screenshot({ 
      path: 'localhost-test-mobile.png',
      fullPage: true
    });
    console.log('✅ 스크린샷 저장: localhost-test-mobile.png');
    
    // 11. 성능 지표 확인
    console.log('\n11. 성능 지표...');
    const performanceTiming = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        return {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
          loadComplete: Math.round(perfData.loadEventEnd - perfData.fetchStart)
        };
      }
      return null;
    });
    
    if (performanceTiming) {
      console.log(`DOM 로딩 시간: ${performanceTiming.domContentLoaded}ms`);
      console.log(`페이지 완전 로딩 시간: ${performanceTiming.loadComplete}ms`);
    }
    
    // 12. 접근성 기본 확인
    console.log('\n12. 접근성 기본 확인...');
    
    // 포커스 가능한 요소들
    const focusableElements = await page.$$('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    console.log(`포커스 가능한 요소: ${focusableElements.length}개`);
    
    // alt 속성 누락된 이미지
    const imagesWithoutAlt = await page.$$('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      console.log(`❌ alt 속성 누락된 이미지: ${imagesWithoutAlt.length}개`);
    } else {
      console.log('✅ 모든 이미지에 alt 속성 있음');
    }
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:');
    console.error(error.message);
    
    // 현재 페이지 상태 정보
    try {
      const currentUrl = page.url();
      console.log(`현재 URL: ${currentUrl}`);
      
      const title = await page.title();
      console.log(`페이지 제목: "${title}"`);
      
    } catch (e) {
      console.log('페이지 상태 정보를 가져올 수 없음');
    }
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testLocalhost().catch(console.error);