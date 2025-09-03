const { chromium } = require('playwright');

(async () => {
  console.log('🚀 상세 온보딩 테스트 시작...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // 모바일 뷰포트 설정
  await page.setViewportSize({ width: 375, height: 667 });
  
  try {
    // 1. 초기 페이지 로딩
    console.log('📱 온보딩 페이지 접속...');
    await page.goto('http://localhost:3000/onboarding?test_mode=true');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📸 1. 초기 상태 스크린샷');
    await page.screenshot({ path: 'step1_initial.png', fullPage: true });
    
    // 2. 테스트 드롭다운 테스트
    try {
      const dropdown = await page.locator('select').first();
      if (await dropdown.isVisible()) {
        console.log('📸 2. 테스트 드롭다운 클릭 전');
        await page.screenshot({ path: 'step2_dropdown_before.png', fullPage: true });
        
        // 드롭다운 옵션 변경
        await dropdown.selectOption({ index: 1 }); // 두 번째 옵션 선택
        await page.waitForTimeout(1000);
        
        console.log('📸 3. 테스트 드롭다운 변경 후');
        await page.screenshot({ path: 'step3_dropdown_after.png', fullPage: true });
      }
    } catch (e) {
      console.log('⚠️ 드롭다운 테스트 스킵:', e.message);
    }
    
    // 3. 닉네임 입력 테스트
    try {
      const nicknameInput = await page.locator('input[placeholder*="이름"], input').first();
      if (await nicknameInput.isVisible()) {
        console.log('📸 4. 닉네임 입력 전');
        await page.screenshot({ path: 'step4_before_nickname.png', fullPage: true });
        
        // 닉네임 입력
        await nicknameInput.fill('테스트유저123');
        await page.waitForTimeout(500);
        
        console.log('📸 5. 닉네임 입력 후 (버튼 색상 변화 확인)');
        await page.screenshot({ path: 'step5_after_nickname.png', fullPage: true });
        
        // 다음 버튼 클릭
        const nextButton = await page.locator('button:has-text("다음")').first();
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(2000);
          
          console.log('📸 6. 다음 단계 이동 후');
          await page.screenshot({ path: 'step6_next_step.png', fullPage: true });
        }
      }
    } catch (e) {
      console.log('⚠️ 닉네임 입력 테스트 실패:', e.message);
    }
    
    // 4. 관심사 선택 테스트
    try {
      // 관심사 카드들 찾기
      const interestButtons = await page.locator('button').all();
      if (interestButtons.length > 0) {
        console.log('📸 7. 관심사 선택 전');
        await page.screenshot({ path: 'step7_interests_before.png', fullPage: true });
        
        // 첫 번째 관심사 카드 클릭
        if (interestButtons[0]) {
          await interestButtons[0].click();
          await page.waitForTimeout(500);
          
          console.log('📸 8. 관심사 선택 후 (카드 활성화 색상 확인)');
          await page.screenshot({ path: 'step8_interest_selected.png', fullPage: true });
        }
        
        // 두 번째 관심사도 선택해보기
        if (interestButtons[1]) {
          await interestButtons[1].click();
          await page.waitForTimeout(500);
          
          console.log('📸 9. 두 번째 관심사 추가 선택');
          await page.screenshot({ path: 'step9_multiple_interests.png', fullPage: true });
        }
      }
    } catch (e) {
      console.log('⚠️ 관심사 선택 테스트 실패:', e.message);
    }
    
    // 5. 시작하기 버튼 확인
    try {
      const startButton = await page.locator('button:has-text("시작"), button:has-text("완료")').first();
      if (await startButton.isVisible()) {
        console.log('📸 10. 시작하기 버튼 확인');
        await page.screenshot({ path: 'step10_start_button.png', fullPage: true });
      }
    } catch (e) {
      console.log('⚠️ 시작하기 버튼 테스트 실패:', e.message);
    }
    
    console.log('✅ 모든 스크린샷 촬영 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 브라우저 종료');
  }
})();