const { chromium } = require('playwright');

async function verifyColorPalette() {
    const browser = await chromium.launch({ headless: false }); // 브라우저 화면 표시
    const page = await browser.newPage();
    
    try {
        console.log('🌐 스타일 가이드 페이지 접속 중...');
        const response = await page.goto('http://localhost:3000/style-guide');
        console.log(`📡 응답 상태: ${response.status()}`);
        
        // 페이지 완전 로딩 대기
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000); // 5초 추가 대기
        
        // 페이지 제목 확인
        const title = await page.title();
        console.log(`📄 페이지 제목: ${title}`);
        
        // 색상 팔레트 섹션 확인
        const colorSectionExists = await page.locator('h2:text-is("색상 팔레트")').count() > 0;
        console.log(`✅ '색상 팔레트' 섹션: ${colorSectionExists ? '발견됨' : '없음'}`);
        
        if (!colorSectionExists) {
            // 전체 h2 섹션들 확인
            const h2Elements = await page.locator('h2').all();
            console.log(`📋 전체 h2 섹션들:`);
            for (const h2 of h2Elements) {
                const text = await h2.textContent();
                console.log(`  - ${text}`);
            }
        }
        
        // Orange 색상 클래스들 확인
        const orangeClasses = [
            'bg-orange-600',
            'bg-orange-500', 
            'bg-orange-400',
            'bg-orange-300',
            'bg-orange-200',
            'bg-orange-100'
        ];
        
        console.log('\n🎨 Orange 색상 요소들 확인:');
        for (const className of orangeClasses) {
            const elements = await page.locator(`.${className}`).count();
            console.log(`🔍 .${className} 요소 개수: ${elements}`);
            
            if (elements > 0) {
                // 실제 적용된 배경색 확인
                const computedBg = await page.evaluate((cls) => {
                    const element = document.querySelector(`.${cls}`);
                    if (element) {
                        const styles = window.getComputedStyle(element);
                        return styles.backgroundColor;
                    }
                    return null;
                }, className);
                
                console.log(`  → 실제 backgroundColor: ${computedBg}`);
            }
        }
        
        // 스크린샷 촬영
        console.log('\n📸 스크린샷 촬영 중...');
        await page.screenshot({ 
            path: 'style-guide-colors-verification.png',
            fullPage: true 
        });
        console.log('✅ 전체 페이지 스크린샷: style-guide-colors-verification.png');
        
        // 색상 팔레트 섹션만 따로 스크린샷 (있다면)
        if (colorSectionExists) {
            await page.locator('h2:text-is("색상 팔레트")').screenshot({ 
                path: 'color-palette-section.png' 
            });
            console.log('✅ 색상 팔레트 섹션 스크린샷: color-palette-section.png');
        }
        
        // 브라우저를 3초간 열어둔 채로 확인 가능하게 함
        console.log('\n👀 브라우저 화면을 3초간 유지합니다...');
        await page.waitForTimeout(3000);
        
    } catch (error) {
        console.error('❌ 오류 발생:', error);
    } finally {
        await browser.close();
        console.log('🔚 브라우저 종료됨');
    }
}

verifyColorPalette();