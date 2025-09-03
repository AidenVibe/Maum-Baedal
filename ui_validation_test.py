import asyncio
from playwright.async_api import async_playwright

async def validate_ui_changes():
    print('🚀 마음배달 UI 변경사항 검증을 시작합니다...')
    
    async with async_playwright() as p:
        # 브라우저 실행 (헤드리스 모드로 빠른 테스트)
        browser = await p.chromium.launch(headless=True)
        
        # 모바일 뷰포트 설정
        context = await browser.new_context(
            viewport={'width': 375, 'height': 667},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        )
        
        page = await context.new_page()
        
        print('\n1️⃣ History 페이지 그라디언트 스타일 검증')
        try:
            await page.goto('http://localhost:3000/history?test_mode=true', wait_until='networkidle')
            
            # 페이지 배경 확인
            page_bg_info = await page.evaluate('''
                () => {
                    const body = document.body;
                    const main = document.querySelector('main') || document.querySelector('.min-h-screen');
                    const pageElement = main || body;
                    
                    return {
                        bodyClasses: body.className,
                        pageClasses: pageElement.className,
                        hasGrayBg: pageElement.className.includes('bg-gray-50') || 
                                  window.getComputedStyle(pageElement).backgroundColor.includes('249, 250, 251'),
                        computedBg: window.getComputedStyle(pageElement).backgroundColor
                    };
                }
            ''')
            
            print('   ✅ 페이지 배경 확인:')
            print(f'      - bg-gray-50 적용됨: {page_bg_info["hasGrayBg"]}')
            print(f'      - 계산된 배경색: {page_bg_info["computedBg"]}')
            
            # 대화 카드 스타일 확인
            cards_analysis = await page.evaluate('''
                () => {
                    const cards = document.querySelectorAll('.space-y-4 > div, [class*="card"], .rounded-xl');
                    const results = [];
                    let violetCards = 0;
                    let gradientCards = 0;
                    let blackBorderCards = 0;
                    
                    cards.forEach((card, index) => {
                        if (card.children && card.children.length > 0) {
                            const classes = card.className;
                            const style = window.getComputedStyle(card);
                            
                            const hasVioletGradient = classes.includes('from-violet-50') || 
                                                    classes.includes('to-white') ||
                                                    classes.includes('border-violet-200');
                            
                            const hasGradient = classes.includes('gradient') || 
                                              style.backgroundImage.includes('gradient');
                            
                            const hasBlackBorder = style.borderColor.includes('rgb(0, 0, 0)') ||
                                                  classes.includes('border-black');
                            
                            if (hasVioletGradient) violetCards++;
                            if (hasGradient) gradientCards++;
                            if (hasBlackBorder) blackBorderCards++;
                            
                            results.push({
                                'index': index,
                                'classes': classes[0:100],
                                'hasVioletGradient': hasVioletGradient,
                                'hasGradient': hasGradient,
                                'hasBlackBorder': hasBlackBorder,
                                'borderColor': style.borderColor
                            });
                        }
                    });
                    
                    return {
                        'totalCards': results.length,
                        'violetCards': violetCards,
                        'gradientCards': gradientCards,
                        'blackBorderCards': blackBorderCards,
                        'cards': results.slice(0, 3)
                    };
                }
            ''')
            
            print('   ✅ 대화 카드 스타일 분석:')
            print(f'      - 총 카드 수: {cards_analysis["totalCards"]}개')
            print(f'      - 보라색 그라디언트 카드: {cards_analysis["violetCards"]}개')
            print(f'      - 그라디언트 효과 카드: {cards_analysis["gradientCards"]}개')
            print(f'      - 검정 테두리 카드: {cards_analysis["blackBorderCards"]}개 (0이어야 함)')
            
            # 스크린샷 저장
            await page.screenshot(path='history_page_final_check.png', full_page=True)
            print('   📸 History 페이지 스크린샷 저장됨')
            
            history_success = (cards_analysis['violetCards'] > 0 and 
                             cards_analysis['blackBorderCards'] == 0 and 
                             page_bg_info['hasGrayBg'])
            
        except Exception as e:
            print(f'   ❌ History 페이지 테스트 실패: {str(e)}')
            history_success = False
        
        print('\n2️⃣ Settings 페이지 일관성 검증')
        try:
            await page.goto('http://localhost:3000/settings?test_mode=true', wait_until='networkidle')
            
            settings_analysis = await page.evaluate('''
                () => {
                    const cards = document.querySelectorAll('.space-y-4 > div, [class*="card"], .rounded-xl');
                    let violetCards = 0;
                    let gradientCards = 0;
                    
                    cards.forEach(card => {
                        if (card.children && card.children.length > 0) {
                            const classes = card.className;
                            const style = window.getComputedStyle(card);
                            
                            const hasVioletGradient = classes.includes('from-violet-50') || 
                                                    classes.includes('border-violet-200');
                            const hasGradient = classes.includes('gradient') || 
                                              style.backgroundImage.includes('gradient');
                            
                            if (hasVioletGradient) violetCards++;
                            if (hasGradient) gradientCards++;
                        }
                    });
                    
                    return {
                        'violetCards': violetCards, 
                        'gradientCards': gradientCards, 
                        'totalCards': cards.length 
                    };
                }
            ''')
            
            print('   ✅ Settings 페이지 카드 분석:')
            print(f'      - 보라색 그라디언트 카드: {settings_analysis["violetCards"]}개')
            print(f'      - 그라디언트 효과 카드: {settings_analysis["gradientCards"]}개')
            
            await page.screenshot(path='settings_page_final_check.png', full_page=True)
            print('   📸 Settings 페이지 스크린샷 저장됨')
            
            settings_success = settings_analysis['violetCards'] > 0
            
        except Exception as e:
            print(f'   ❌ Settings 페이지 테스트 실패: {str(e)}')
            settings_success = False
        
        print('\n3️⃣ 테스트 모드 네비게이션 검증')
        try:
            # History 페이지에서 시작
            await page.goto('http://localhost:3000/history?test_mode=true', wait_until='networkidle')
            start_url = page.url
            has_test_mode = 'test_mode=true' in start_url
            
            print(f'   ✅ 시작 URL: {start_url}')
            print(f'   ✅ test_mode 파라미터 존재: {has_test_mode}')
            
            # 네비게이션 테스트
            nav_links = await page.query_selector_all('a[href*="/"], nav a')
            print(f'   ✅ 네비게이션 링크 발견: {len(nav_links)}개')
            
            # Today 페이지로 이동 시도
            today_nav = await page.query_selector('a[href="/"], a[href="/today"]')
            if today_nav:
                await today_nav.click()
                await page.wait_for_load_state('networkidle')
                today_url = page.url
                print(f'   ✅ Today 페이지 이동 성공: {today_url}')
            
            nav_success = has_test_mode and len(nav_links) > 0
            
        except Exception as e:
            print(f'   ❌ 네비게이션 테스트 실패: {str(e)}')
            nav_success = False
        
        print('\n4️⃣ 전체 디자인 일관성 검증')
        pages_to_check = ['/today', '/history', '/settings']
        consistency_results = {}
        
        try:
            for page_path in pages_to_check:
                await page.goto(f'http://localhost:3000{page_path}?test_mode=true', wait_until='networkidle')
                
                design_info = await page.evaluate('''
                    () => {
                        const gradients = document.querySelectorAll('[class*="gradient"]');
                        const violets = document.querySelectorAll('[class*="violet"], [class*="purple"]');
                        const cards = document.querySelectorAll('[class*="card"], .rounded-xl');
                        
                        return {
                            'gradientElements': gradients.length,
                            'violetElements': violets.length,
                            'totalCards': cards.length,
                            'hasConsistentTheme': gradients.length > 0 || violets.length > 0
                        };
                    }
                ''')
                
                consistency_results[page_path] = design_info
                print(f'   ✅ {page_path}: 그라디언트={design_info["gradientElements"]}, 보라색={design_info["violetElements"]}')
            
            # 일관성 체크
            consistent_pages = sum(1 for info in consistency_results.values() if info['hasConsistentTheme'])
            design_success = consistent_pages >= 2  # 최소 2개 페이지에 일관된 테마
            
            print(f'   ✅ 일관된 테마를 가진 페이지: {consistent_pages}/{len(pages_to_check)}개')
            
        except Exception as e:
            print(f'   ❌ 디자인 일관성 테스트 실패: {str(e)}')
            design_success = False
        
        await browser.close()
        
        # 최종 결과 보고서
        print('\n' + '='*60)
        print('🎯 최종 UI 검증 결과 보고서')
        print('='*60)
        
        results = {
            'History 페이지 그라디언트 개선': history_success,
            'Settings 페이지 일관성': settings_success, 
            '테스트 모드 네비게이션': nav_success,
            '전체 디자인 일관성': design_success
        }
        
        total_tests = len(results)
        passed_tests = sum(1 for success in results.values() if success)
        
        for test_name, success in results.items():
            status = '✅ 성공' if success else '❌ 실패'
            print(f'{status} {test_name}')
        
        print(f'\n📊 종합 결과: {passed_tests}/{total_tests} 테스트 통과')
        print(f'성공률: {(passed_tests/total_tests)*100:.1f}%')
        
        if passed_tests == total_tests:
            print('\n🎉 모든 UI 개선사항이 성공적으로 적용되었습니다!')
        else:
            print('\n⚠️  일부 개선사항이 완전히 적용되지 않았습니다.')
        
        return passed_tests == total_tests

# 실행
if __name__ == "__main__":
    asyncio.run(validate_ui_changes())