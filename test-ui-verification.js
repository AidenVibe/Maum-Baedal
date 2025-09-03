const { chromium } = require('playwright');

async function verifyUIChanges() {
    console.log('=== UI 변경사항 검증 시작 ===\n');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000 // 시각적 확인을 위해 느리게 실행
    });
    
    const context = await browser.newContext({
        viewport: { width: 414, height: 896 }, // iPhone 11 Pro 크기
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    
    const page = await context.newPage();
    const results = {};
    
    try {
        // 1. History 페이지 검증
        console.log('1️⃣ History 페이지 검증 중...');
        await page.goto('http://localhost:3000/history?test_mode=true', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 스크린샷 촬영 (Before 스타일 확인)
        await page.screenshot({ 
            path: 'history-page-verification.png', 
            fullPage: true 
        });
        
        // 대화 카드 요소들 찾기
        const conversationCards = await page.locator('div[class*="bg-"], div[class*="border-"], .space-y-4 > div').all();
        
        if (conversationCards.length > 0) {
            console.log(`✅ ${conversationCards.length}개의 카드 요소 발견`);
            
            // 첫 번째 카드의 스타일 검증
            const firstCard = conversationCards[0];
            const cardClasses = await firstCard.getAttribute('class') || '';
            
            const hasGradient = cardClasses.includes('bg-gradient-to-br') && cardClasses.includes('from-violet-50');
            const hasVioletBorder = cardClasses.includes('border-violet-200');
            const hasBlackBorder = cardClasses.includes('border-black');
            
            results.history = {
                status: hasGradient && hasVioletBorder && !hasBlackBorder ? 'success' : 'partial',
                cardCount: conversationCards.length,
                gradientApplied: hasGradient,
                violetBorder: hasVioletBorder,
                blackBorderRemoved: !hasBlackBorder,
                cardClasses: cardClasses
            };
            
            console.log(`   그라디언트 배경: ${hasGradient ? '✅ 적용됨' : '❌ 미적용'}`);
            console.log(`   Violet 테두리: ${hasVioletBorder ? '✅ 적용됨' : '❌ 미적용'}`);
            console.log(`   검정 테두리 제거: ${!hasBlackBorder ? '✅ 완료' : '❌ 미완료'}`);
            console.log(`   카드 클래스: ${cardClasses}`);
        } else {
            results.history = { status: 'no_cards', message: '대화 카드를 찾을 수 없음' };
            console.log('⚠️  대화 카드를 찾을 수 없습니다.');
        }
        
        // 2. Settings 페이지 검증
        console.log('\n2️⃣ Settings 페이지 검증 중...');
        await page.goto('http://localhost:3000/settings?test_mode=true', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 스크린샷 촬영
        await page.screenshot({ 
            path: 'settings-page-verification.png', 
            fullPage: true 
        });
        
        // 설정 카드 요소들 찾기
        const settingCards = await page.locator('div[class*="bg-"], div[class*="border-"], .space-y-4 > div').all();
        
        if (settingCards.length > 0) {
            console.log(`✅ ${settingCards.length}개의 설정 카드 발견`);
            
            let gradientCards = 0;
            let violetBorderCards = 0;
            let blackBorderCards = 0;
            
            for (const card of settingCards) {
                const cardClasses = await card.getAttribute('class') || '';
                
                if (cardClasses.includes('bg-gradient-to-br') && cardClasses.includes('from-violet-50')) {
                    gradientCards++;
                }
                if (cardClasses.includes('border-violet-200')) {
                    violetBorderCards++;
                }
                if (cardClasses.includes('border-black')) {
                    blackBorderCards++;
                }
            }
            
            results.settings = {
                status: gradientCards > 0 ? 'success' : 'partial',
                totalCards: settingCards.length,
                gradientCards: gradientCards,
                violetBorderCards: violetBorderCards,
                blackBorderCards: blackBorderCards
            };
            
            console.log(`   총 카드 수: ${settingCards.length}`);
            console.log(`   그라디언트 적용 카드: ${gradientCards}개`);
            console.log(`   Violet 테두리 카드: ${violetBorderCards}개`);
            console.log(`   검정 테두리 카드: ${blackBorderCards}개`);
        } else {
            results.settings = { status: 'no_cards', message: '설정 카드를 찾을 수 없음' };
            console.log('⚠️  설정 카드를 찾을 수 없습니다.');
        }
        
        // 3. 테스트 모드 네비게이션 검증
        console.log('\n3️⃣ 테스트 모드 네비게이션 검증 중...');
        
        // History 페이지에서 Today로 이동
        await page.goto('http://localhost:3000/history?test_mode=true', { waitUntil: 'networkidle' });
        
        // GNB에서 Today 버튼 찾기 (여러 가지 셀렉터 시도)
        const todayNavSelectors = [
            'nav a[href="/"]',
            'nav a[href="/today"]', 
            'a[aria-label*="홈"]',
            'a[aria-label*="Today"]',
            'nav button:has-text("홈")',
            'nav button:has-text("Today")',
            '.bottom-nav a:first-child',
            'nav a:first-child'
        ];
        
        let todayNav = null;
        for (const selector of todayNavSelectors) {
            todayNav = await page.locator(selector).first();
            if (await todayNav.count() > 0) {
                console.log(`✅ Today 네비게이션 발견: ${selector}`);
                break;
            }
        }
        
        if (todayNav && await todayNav.count() > 0) {
            await todayNav.click();
            await page.waitForLoadState('networkidle');
            
            const finalUrl = page.url();
            const testModePreserved = finalUrl.includes('test_mode=true');
            
            results.navigation = {
                status: testModePreserved ? 'success' : 'failed',
                fromPage: 'history',
                toPage: 'today',
                finalUrl: finalUrl,
                testModePreserved: testModePreserved
            };
            
            console.log(`   History→Today 네비게이션: ${testModePreserved ? '✅ 성공' : '❌ 실패'}`);
            console.log(`   최종 URL: ${finalUrl}`);
            console.log(`   test_mode 파라미터 보존: ${testModePreserved ? '✅ 보존됨' : '❌ 소실됨'}`);
        } else {
            results.navigation = { status: 'nav_not_found', message: 'GNB 네비게이션 요소를 찾을 수 없음' };
            console.log('⚠️  GNB 네비게이션 요소를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
        results.error = error.message;
    } finally {
        await browser.close();
    }
    
    // 결과 요약
    console.log('\n=== 검증 결과 요약 ===');
    console.log('History 페이지:', results.history?.status || 'error');
    console.log('Settings 페이지:', results.settings?.status || 'error');  
    console.log('네비게이션:', results.navigation?.status || 'error');
    
    return results;
}

// 테스트 실행
verifyUIChanges().then(results => {
    console.log('\n=== 상세 결과 ===');
    console.log(JSON.stringify(results, null, 2));
}).catch(console.error);