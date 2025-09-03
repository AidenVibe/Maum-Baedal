const { chromium } = require('playwright');
const path = require('path');

async function testKakaoLinks() {
  console.log('💬 ViberAiden 홈페이지 카카오톡 링크 테스트 시작');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // iPhone 12 크기로 테스트
  await page.setViewportSize({ width: 390, height: 844 });
  
  const htmlFilePath = 'file://' + path.resolve('C:\\Users\\btsoft\\Desktop\\personal\\vibe-cording\\maum-baedal\\Homepage\\new-index.html').replace(/\\/g, '/');
  
  try {
    console.log(`📱 테스트 URL: ${htmlFilePath}`);
    await page.goto(htmlFilePath);
    await page.waitForLoadState('networkidle');
    
    // 카카오톡 링크 분석
    const kakaoLinksAnalysis = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const kakaoLinks = links.filter(link => 
        link.href.includes('kakao') || 
        link.textContent.includes('카카오') ||
        link.textContent.includes('문의')
      );
      
      return kakaoLinks.map(link => {
        const rect = link.getBoundingClientRect();
        const style = window.getComputedStyle(link);
        
        return {
          text: link.textContent.trim(),
          href: link.href,
          target: link.target,
          className: link.className,
          id: link.id,
          visible: rect.width > 0 && rect.height > 0,
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            color: style.color,
            backgroundColor: style.backgroundColor
          },
          isClickable: !link.disabled && style.pointerEvents !== 'none'
        };
      });
    });
    
    console.log('\n📋 카카오톡 링크 상세 분석:');
    kakaoLinksAnalysis.forEach((link, index) => {
      console.log(`\n${index + 1}. "${link.text}"`);
      console.log(`   🔗 URL: ${link.href}`);
      console.log(`   📱 Target: ${link.target || 'same-window'}`);
      console.log(`   👁️  보이는가: ${link.visible ? '✅' : '❌'}`);
      console.log(`   🖱️  클릭가능: ${link.isClickable ? '✅' : '❌'}`);
      console.log(`   📐 크기: ${link.position.width}x${link.position.height}px`);
      console.log(`   🎨 스타일: display=${link.styles.display}, opacity=${link.styles.opacity}`);
    });
    
    // 실제 링크 클릭 테스트 (새 탭으로 열리는지 확인)
    console.log('\n🖱️ 링크 클릭 테스트:');
    
    for (let i = 0; i < kakaoLinksAnalysis.length; i++) {
      const linkInfo = kakaoLinksAnalysis[i];
      
      if (linkInfo.visible && linkInfo.isClickable) {
        try {
          // 링크 요소 찾기
          const linkElement = await page.locator(`a:has-text("${linkInfo.text}")`).first();
          
          if (await linkElement.count() > 0) {
            console.log(`\n${i + 1}. "${linkInfo.text}" 클릭 테스트:`);
            
            // 스크린샷으로 링크 위치 확인
            const linkScreenshot = `mobile-test-screenshots/kakao_link_${i + 1}.png`;
            await linkElement.screenshot({ path: linkScreenshot });
            console.log(`   📸 링크 스크린샷: ${linkScreenshot}`);
            
            // 타겟이 _blank인 경우 새 탭에서 열리는지 테스트
            if (linkInfo.target === '_blank') {
              const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                linkElement.click()
              ]);
              
              // 새 페이지가 열렸는지 확인
              if (newPage) {
                console.log(`   ✅ 새 탭에서 열림`);
                console.log(`   🔗 새 탭 URL: ${newPage.url()}`);
                
                // 카카오톡 오픈채팅으로 이동했는지 확인
                if (newPage.url().includes('kakao')) {
                  console.log(`   💬 카카오톡 페이지 접근 성공`);
                } else {
                  console.log(`   ⚠️  카카오톡이 아닌 페이지로 이동: ${newPage.url()}`);
                }
                
                await newPage.close();
              } else {
                console.log(`   ❌ 새 탭이 열리지 않음`);
              }
            } else {
              console.log(`   ℹ️  같은 탭에서 열리도록 설정됨`);
            }
          }
        } catch (error) {
          console.log(`   ❌ 클릭 테스트 실패: ${error.message}`);
        }
      } else {
        console.log(`\n${i + 1}. "${linkInfo.text}": 클릭 불가 (보이지 않거나 비활성화)`);
      }
    }
    
    // 모바일에서 카카오톡 링크 터치 영역 분석
    console.log('\n📱 모바일 터치 영역 분석:');
    const touchAnalysis = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="kakao"], .contact-btn, .btn-hero'));
      
      return links.map(link => {
        const rect = link.getBoundingClientRect();
        const touchSize = Math.min(rect.width, rect.height);
        const isAccessible = touchSize >= 44; // WCAG 2.1 AAA 기준
        
        return {
          text: link.textContent.trim(),
          touchSize,
          isAccessible,
          recommendation: isAccessible ? '✅ 충분함' : '❌ 44px 이상 권장'
        };
      });
    });
    
    touchAnalysis.forEach((analysis, index) => {
      console.log(`${index + 1}. "${analysis.text}"`);
      console.log(`   터치 크기: ${analysis.touchSize.toFixed(1)}px`);
      console.log(`   접근성: ${analysis.recommendation}`);
    });
    
    console.log('\n📊 === 종합 평가 ===');
    const workingLinks = kakaoLinksAnalysis.filter(link => link.visible && link.isClickable);
    const accessibleLinks = touchAnalysis.filter(link => link.isAccessible);
    
    console.log(`총 카카오톡 관련 링크: ${kakaoLinksAnalysis.length}개`);
    console.log(`작동 가능한 링크: ${workingLinks.length}개`);
    console.log(`터치 접근성 기준 충족: ${accessibleLinks.length}/${touchAnalysis.length}개`);
    
    // 최종 권장사항
    console.log('\n🎯 === 개선 권장사항 ===');
    
    const invisibleLinks = kakaoLinksAnalysis.filter(link => !link.visible);
    if (invisibleLinks.length > 0) {
      console.log('👁️  보이지 않는 링크 발견:');
      invisibleLinks.forEach(link => {
        console.log(`   - "${link.text}" (display: ${link.styles.display})`);
      });
    }
    
    const inaccessibleLinks = touchAnalysis.filter(link => !link.isAccessible);
    if (inaccessibleLinks.length > 0) {
      console.log('📱 터치 영역이 작은 링크:');
      inaccessibleLinks.forEach(link => {
        console.log(`   - "${link.text}" (${link.touchSize.toFixed(1)}px < 44px)`);
      });
    }
    
    if (workingLinks.length === kakaoLinksAnalysis.length && accessibleLinks.length === touchAnalysis.length) {
      console.log('🎉 모든 카카오톡 링크가 정상 작동하며 접근성 기준을 충족합니다!');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ 카카오톡 링크 테스트 완료!');
}

// 테스트 실행
testKakaoLinks().catch(console.error);