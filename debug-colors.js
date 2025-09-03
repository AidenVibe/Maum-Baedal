const { chromium } = require('playwright');

async function debugColors() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🌐 스타일 가이드 페이지 접속...');
        await page.goto('http://localhost:3000/style-guide');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // 개발자 도구에서 실제 CSS 값들 확인
        const colorAnalysis = await page.evaluate(() => {
            // 모든 색상 샘플 요소 찾기 (인라인 스타일로 backgroundColor가 설정된 요소들)
            const colorElements = Array.from(document.querySelectorAll('[style*="background-color"], [style*="backgroundColor"]'));
            
            if (colorElements.length === 0) {
                return { error: 'backgroundColor 인라인 스타일을 가진 요소를 찾을 수 없음' };
            }
            
            return colorElements.slice(0, 10).map((element, index) => {
                const computedStyle = window.getComputedStyle(element);
                const inlineStyle = element.style.backgroundColor || element.getAttribute('style');
                
                return {
                    index: index,
                    inlineStyle: inlineStyle,
                    computedBackgroundColor: computedStyle.backgroundColor,
                    computedColor: computedStyle.color,
                    elementTagName: element.tagName,
                    elementClasses: element.className,
                    hasStyle: !!element.getAttribute('style')
                };
            });
        });
        
        console.log('\n🎨 색상 요소 분석 결과:');
        console.log(JSON.stringify(colorAnalysis, null, 2));
        
        // CSS 로딩 상태 확인
        const cssLoadingStatus = await page.evaluate(() => {
            const stylesheets = Array.from(document.styleSheets);
            const tailwindLoaded = stylesheets.some(sheet => {
                try {
                    return Array.from(sheet.cssRules || []).some(rule => 
                        rule.selectorText && rule.selectorText.includes('bg-orange')
                    );
                } catch (e) {
                    return false;
                }
            });
            
            return {
                totalStylesheets: stylesheets.length,
                tailwindLoaded: tailwindLoaded,
                stylesheetHrefs: stylesheets.map(s => s.href).filter(h => h)
            };
        });
        
        console.log('\n📋 CSS 로딩 상태:');
        console.log(JSON.stringify(cssLoadingStatus, null, 2));
        
        // 에러 로그 확인
        const errors = await page.evaluate(() => {
            return {
                consoleErrors: window.lastErrors || [],
                networkErrors: window.networkErrors || []
            };
        });
        
        console.log('\n❌ 브라우저 에러 로그:');
        console.log(JSON.stringify(errors, null, 2));
        
        console.log('\n👀 브라우저를 5초간 열어둡니다...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 디버깅 오류:', error);
    } finally {
        await browser.close();
    }
}

debugColors();