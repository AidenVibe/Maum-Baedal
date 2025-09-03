const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testMobileKoreanText() {
  console.log('🚀 ViberAiden 홈페이지 모바일 한국어 텍스트 테스트 시작');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  // 테스트 결과 디렉토리 생성
  const screenshotDir = path.join(__dirname, 'mobile-test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  const testResults = [];
  
  // 다양한 모바일 디바이스 테스트
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ];
  
  const htmlFilePath = 'file://' + path.resolve('C:\\Users\\btsoft\\Desktop\\personal\\vibe-cording\\maum-baedal\\Homepage\\new-index.html').replace(/\\/g, '/');
  
  console.log(`📱 테스트 URL: ${htmlFilePath}`);
  
  for (const device of devices) {
    console.log(`\n📱 ${device.name} (${device.width}x${device.height}) 테스트 중...`);
    
    const page = await context.newPage();
    await page.setViewportSize({ width: device.width, height: device.height });
    
    try {
      await page.goto(htmlFilePath);
      await page.waitForLoadState('networkidle');
      
      // 페이지 전체 스크린샷
      const fullScreenshot = path.join(screenshotDir, `${device.name.replace(/\s/g, '_')}_full_page.png`);
      await page.screenshot({ 
        path: fullScreenshot, 
        fullPage: true 
      });
      console.log(`✅ 전체 페이지 스크린샷: ${fullScreenshot}`);
      
      // 히어로 섹션 텍스트 분석
      const heroTextInfo = await page.evaluate(() => {
        const heroSubtitle = document.querySelector('.hero-subtitle-text');
        const heroMain = document.querySelector('.hero-main-text');
        const heroSubtitlePara = document.querySelector('.hero-subtitle');
        
        const getTextInfo = (element) => {
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);
          return {
            text: element.textContent.trim(),
            width: rect.width,
            height: rect.height,
            lineHeight: computedStyle.lineHeight,
            wordBreak: computedStyle.wordBreak,
            overflowWrap: computedStyle.overflowWrap,
            lineBreak: computedStyle.lineBreak,
            fontSize: computedStyle.fontSize,
            lines: Math.round(rect.height / parseFloat(computedStyle.lineHeight))
          };
        };
        
        return {
          subtitle: getTextInfo(heroSubtitle),
          main: getTextInfo(heroMain),
          description: getTextInfo(heroSubtitlePara)
        };
      });
      
      // 히어로 섹션 스크린샷
      const heroScreenshot = path.join(screenshotDir, `${device.name.replace(/\s/g, '_')}_hero_section.png`);
      await page.screenshot({ 
        path: heroScreenshot,
        clip: { x: 0, y: 0, width: device.width, height: Math.min(device.height, 800) }
      });
      console.log(`✅ 히어로 섹션 스크린샷: ${heroScreenshot}`);
      
      // 문제 섹션 텍스트 분석
      const problemTextInfo = await page.evaluate(() => {
        const problemCards = Array.from(document.querySelectorAll('.problem-card'));
        return problemCards.map((card, index) => {
          const title = card.querySelector('.problem-title');
          const description = card.querySelector('.problem-description');
          
          const getTextInfo = (element) => {
            if (!element) return null;
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);
            return {
              text: element.textContent.trim().substring(0, 100) + '...',
              wordBreak: computedStyle.wordBreak,
              overflowWrap: computedStyle.overflowWrap,
              textAlign: computedStyle.textAlign,
              lineHeight: computedStyle.lineHeight
            };
          };
          
          return {
            index,
            title: getTextInfo(title),
            description: getTextInfo(description)
          };
        });
      });
      
      // 문제 섹션 스크린샷
      const problemsSection = await page.locator('#problems').first();
      if (await problemsSection.count() > 0) {
        const problemsScreenshot = path.join(screenshotDir, `${device.name.replace(/\s/g, '_')}_problems_section.png`);
        await problemsSection.screenshot({ path: problemsScreenshot });
        console.log(`✅ 문제 섹션 스크린샷: ${problemsScreenshot}`);
      }
      
      // 솔루션 섹션 텍스트 분석
      const solutionTextInfo = await page.evaluate(() => {
        const solutionDescription = document.querySelector('.solution-description');
        const featureItems = Array.from(document.querySelectorAll('.feature-item'));
        
        const getTextInfo = (element) => {
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);
          return {
            text: element.textContent.trim(),
            wordBreak: computedStyle.wordBreak,
            overflowWrap: computedStyle.overflowWrap,
            textAlign: computedStyle.textAlign,
            lineHeight: computedStyle.lineHeight
          };
        };
        
        return {
          description: getTextInfo(solutionDescription),
          features: featureItems.map(item => getTextInfo(item))
        };
      });
      
      // 솔루션 섹션 스크린샷
      const solutionsSection = await page.locator('#solutions').first();
      if (await solutionsSection.count() > 0) {
        const solutionsScreenshot = path.join(screenshotDir, `${device.name.replace(/\s/g, '_')}_solutions_section.png`);
        await solutionsSection.screenshot({ path: solutionsScreenshot });
        console.log(`✅ 솔루션 섹션 스크린샷: ${solutionsScreenshot}`);
      }
      
      // 카카오톡 링크 테스트
      const kakaoLinkTest = await page.evaluate(() => {
        const kakaoLinks = Array.from(document.querySelectorAll('a[href*="kakao"]'));
        return kakaoLinks.map(link => ({
          href: link.href,
          text: link.textContent.trim(),
          target: link.target,
          isVisible: link.offsetWidth > 0 && link.offsetHeight > 0
        }));
      });
      
      // 모바일 네비게이션 테스트
      const mobileNavTest = await page.evaluate(() => {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        return {
          mobileToggleVisible: mobileToggle && mobileToggle.offsetWidth > 0,
          navMenuHidden: navMenu && window.getComputedStyle(navMenu).display === 'none',
          mobileOptimized: window.innerWidth <= 768
        };
      });
      
      // 텍스트 가독성 분석
      const readabilityAnalysis = await page.evaluate(() => {
        const textElements = document.querySelectorAll('p, h1, h2, h3, .problem-description, .solution-description');
        let totalElements = 0;
        let koreanOptimizedElements = 0;
        
        textElements.forEach(element => {
          const style = window.getComputedStyle(element);
          totalElements++;
          
          // 한국어 최적화 체크
          if (style.wordBreak === 'keep-all' || 
              style.wordBreak === 'break-all' ||
              style.overflowWrap === 'break-word') {
            koreanOptimizedElements++;
          }
        });
        
        return {
          totalElements,
          koreanOptimizedElements,
          optimizationRate: totalElements > 0 ? (koreanOptimizedElements / totalElements * 100).toFixed(1) : 0
        };
      });
      
      // 결과 저장
      const result = {
        device: device.name,
        viewport: `${device.width}x${device.height}`,
        heroText: heroTextInfo,
        problemText: problemTextInfo,
        solutionText: solutionTextInfo,
        kakaoLinks: kakaoLinkTest,
        mobileNav: mobileNavTest,
        readability: readabilityAnalysis,
        screenshots: {
          fullPage: fullScreenshot,
          hero: heroScreenshot,
          problems: path.join(screenshotDir, `${device.name.replace(/\s/g, '_')}_problems_section.png`),
          solutions: path.join(screenshotDir, `${device.name.replace(/\s/g, '_')}_solutions_section.png`)
        }
      };
      
      testResults.push(result);
      
      console.log(`📊 ${device.name} 분석 결과:`);
      console.log(`   - 한국어 최적화 적용률: ${readabilityAnalysis.optimizationRate}%`);
      console.log(`   - 카카오톡 링크 개수: ${kakaoLinkTest.length}개`);
      console.log(`   - 모바일 네비게이션: ${mobileNavTest.mobileOptimized ? '최적화됨' : '미최적화'}`);
      
    } catch (error) {
      console.error(`❌ ${device.name} 테스트 중 오류:`, error.message);
    } finally {
      await page.close();
    }
  }
  
  // 종합 리포트 생성
  const reportPath = path.join(screenshotDir, 'mobile_korean_text_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2), 'utf8');
  
  console.log('\n📋 === 종합 테스트 리포트 ===');
  console.log(`📁 스크린샷 저장 위치: ${screenshotDir}`);
  console.log(`📄 상세 리포트: ${reportPath}`);
  
  // 주요 발견사항 요약
  console.log('\n🔍 === 주요 발견사항 ===');
  
  testResults.forEach(result => {
    console.log(`\n📱 ${result.device}:`);
    console.log(`   ✨ 한국어 최적화: ${result.readability.optimizationRate}%`);
    
    // 히어로 텍스트 분석
    if (result.heroText.subtitle) {
      console.log(`   📝 히어로 부제목: "${result.heroText.subtitle.text.substring(0, 30)}..."`);
      console.log(`      - word-break: ${result.heroText.subtitle.wordBreak}`);
      console.log(`      - overflow-wrap: ${result.heroText.subtitle.overflowWrap}`);
    }
    
    // 카카오톡 링크 상태
    const workingKakaoLinks = result.kakaoLinks.filter(link => link.isVisible && link.href.includes('kakao')).length;
    console.log(`   💬 카카오톡 링크: ${workingKakaoLinks}개 작동`);
    
    // 모바일 최적화 상태
    console.log(`   📱 모바일 최적화: ${result.mobileNav.mobileOptimized ? '✅' : '❌'}`);
  });
  
  console.log('\n🎯 === 개선 권장사항 ===');
  
  // 한국어 최적화율이 낮은 디바이스 체크
  const lowOptimizedDevices = testResults.filter(r => parseFloat(r.readability.optimizationRate) < 80);
  if (lowOptimizedDevices.length > 0) {
    console.log('📝 한국어 텍스트 최적화 개선 필요:');
    lowOptimizedDevices.forEach(r => {
      console.log(`   - ${r.device}: ${r.readability.optimizationRate}% (80% 미만)`);
    });
  }
  
  // 카카오톡 링크 문제 체크
  const brokenKakaoLinks = testResults.filter(r => 
    r.kakaoLinks.some(link => !link.isVisible || !link.href.includes('kakao'))
  );
  if (brokenKakaoLinks.length > 0) {
    console.log('💬 카카오톡 링크 문제 발견:');
    brokenKakaoLinks.forEach(r => console.log(`   - ${r.device}`));
  }
  
  await browser.close();
  console.log('\n✅ 모바일 한국어 텍스트 테스트 완료!');
  
  return testResults;
}

// 테스트 실행
testMobileKoreanText().catch(console.error);