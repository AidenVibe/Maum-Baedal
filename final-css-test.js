const { chromium } = require('playwright');

async function testCSSFix() {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    
    try {
        console.log('🎨 CSS 수정사항 최종 테스트...');
        await page.goto('http://localhost:3000/style-guide');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // CSS 클래스 및 변수 확인
        const cssAnalysis = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.color-swatch-override'));
            
            return elements.slice(0, 6).map((el, i) => {
                const computedStyle = window.getComputedStyle(el);
                const cssVarValue = computedStyle.getPropertyValue('--swatch-color');
                
                return {
                    index: i,
                    hasClass: el.classList.contains('color-swatch-override'),
                    cssVariable: cssVarValue,
                    computedBackground: computedStyle.background,
                    computedBackgroundColor: computedStyle.backgroundColor,
                    inlineStyle: el.getAttribute('style')
                };
            });
        });
        
        console.log('\n🔍 CSS 수정사항 분석:');
        cssAnalysis.forEach((data, i) => {
            console.log(`요소 ${i}:`);
            console.log(`  클래스 적용: ${data.hasClass}`);
            console.log(`  CSS 변수: ${data.cssVariable}`);
            console.log(`  배경색: ${data.computedBackgroundColor}`);
            console.log(`  배경: ${data.computedBackground}`);
            console.log(`  인라인: ${data.inlineStyle}`);
            console.log('');
        });
        
        // 새로운 스크린샷 촬영
        await page.screenshot({ 
            path: 'css-fix-final-test.png',
            fullPage: true
        });
        console.log('📸 CSS 수정 최종 스크린샷: css-fix-final-test.png');
        
        // 브라우저를 5초간 열어두어서 시각적 확인 가능
        console.log('👀 브라우저를 5초간 열어둡니다. 색상이 보이는지 확인해주세요...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ CSS 테스트 오류:', error);
    } finally {
        await browser.close();
    }
}

testCSSFix();