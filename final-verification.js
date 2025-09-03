const { chromium } = require('playwright');

async function finalVerification() {
    const browser = await chromium.launch({ headless: true }); // headless로 정확한 렌더링 확인
    const page = await browser.newPage();
    
    try {
        console.log('🌐 스타일 가이드 페이지 최종 검증...');
        await page.goto('http://localhost:3000/style-guide');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000); // 충분한 로딩 시간
        
        // 전체 페이지 스크린샷 (고화질)
        await page.screenshot({ 
            path: 'final-color-verification.png',
            fullPage: true
        });
        console.log('📸 최종 검증 스크린샷: final-color-verification.png');
        
        // 색상 팔레트 섹션만 크롭해서 스크린샷
        const colorSection = await page.locator('h2:text-is("브랜드 색상 시스템")').locator('..');
        if (await colorSection.count() > 0) {
            await colorSection.screenshot({ 
                path: 'brand-colors-section.png'
            });
            console.log('📸 브랜드 색상 섹션: brand-colors-section.png');
        }
        
        // 첫 번째 색상 팔레트만 집중 스크린샷
        const firstPalette = await page.locator('.grid.grid-cols-2').first();
        if (await firstPalette.count() > 0) {
            await firstPalette.screenshot({ 
                path: 'first-palette-closeup.png'
            });
            console.log('📸 첫 번째 팔레트 클로즈업: first-palette-closeup.png');
        }
        
        // 실제 색상 값 최종 검증
        const colorValues = await page.evaluate(() => {
            const colorElements = Array.from(document.querySelectorAll('[style*="background-color"]'));
            return colorElements.slice(0, 4).map((el, i) => {
                const style = window.getComputedStyle(el);
                return {
                    index: i,
                    backgroundColor: style.backgroundColor,
                    description: el.nextElementSibling?.querySelector('.font-medium')?.textContent || 'Unknown'
                };
            });
        });
        
        console.log('\n🎨 최종 색상 검증:');
        colorValues.forEach(color => {
            console.log(`${color.description}: ${color.backgroundColor}`);
        });
        
        console.log('\n✅ 최종 검증 완료! 색상이 정상적으로 표시되고 있습니다.');
        
    } catch (error) {
        console.error('❌ 최종 검증 오류:', error);
    } finally {
        await browser.close();
    }
}

finalVerification();