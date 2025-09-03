const { chromium } = require('playwright');

async function testFix() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        console.log('🔧 수정 사항 테스트 중...');
        await page.goto('http://localhost:3000/style-guide');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // 수정 후 색상 검증
        const colorCheck = await page.evaluate(() => {
            const colorElements = Array.from(document.querySelectorAll('[style*="background"]'));
            return colorElements.slice(0, 5).map((el, i) => {
                const computedStyle = window.getComputedStyle(el);
                return {
                    index: i,
                    backgroundColor: computedStyle.backgroundColor,
                    background: computedStyle.background,
                    inlineStyle: el.getAttribute('style')
                };
            });
        });
        
        console.log('\n🎨 수정 후 색상 상태:');
        colorCheck.forEach(color => {
            console.log(`요소 ${color.index}:`);
            console.log(`  - backgroundColor: ${color.backgroundColor}`);
            console.log(`  - background: ${color.background}`);
            console.log(`  - 인라인 스타일: ${color.inlineStyle}`);
            console.log('');
        });
        
        // 새 스크린샷 촬영
        await page.screenshot({ 
            path: 'after-fix-verification.png',
            fullPage: true
        });
        console.log('📸 수정 후 스크린샷: after-fix-verification.png');
        
        // 색상 팔레트 첫 번째 섹션만 스크린샷
        const firstColorGrid = await page.locator('.grid.grid-cols-2').first();
        if (await firstColorGrid.count() > 0) {
            await firstColorGrid.screenshot({ 
                path: 'first-colors-after-fix.png'
            });
            console.log('📸 첫 번째 색상 그리드: first-colors-after-fix.png');
        }
        
    } catch (error) {
        console.error('❌ 테스트 오류:', error);
    } finally {
        await browser.close();
    }
}

testFix();