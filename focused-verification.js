const { chromium } = require('playwright');

async function focusedVerification() {
  console.log('🎯 집중 검증 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. 온보딩 페이지에서 닉네임 입력 포커스 스타일 검증
    console.log('\n1️⃣ 온보딩 페이지 닉네임 입력 포커스 스타일 검증');
    await page.goto('http://localhost:3000/onboarding?test_mode=true');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 닉네임 입력 필드 찾기
    const nicknameInput = await page.locator('input[placeholder*="이름"]').first();
    const isVisible = await nicknameInput.isVisible();
    
    if (isVisible) {
      console.log('   ✅ 닉네임 입력 필드 발견');
      
      // 포커스 적용
      await nicknameInput.click();
      await page.waitForTimeout(500);
      
      // 포커스된 상태의 box-shadow 확인
      const focusRing = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="이름"]');
        if (!input) return null;
        
        const styles = window.getComputedStyle(input);
        return {
          boxShadow: styles.boxShadow,
          outline: styles.outline,
          borderColor: styles.borderColor
        };
      });
      
      console.log('   포커스 링 스타일:', focusRing.boxShadow);
      
      // 라벤더/바이올렛 색상 확인 (A78BFA = 167, 139, 250)
      const hasVioletRing = focusRing.boxShadow.includes('167, 139, 250') || 
                           focusRing.boxShadow.includes('168, 139, 250');
      
      console.log(`   ${hasVioletRing ? '✅' : '❌'} 포커스 테두리 색상: ${hasVioletRing ? '라벤더/바이올렛 (올바름)' : '다른 색상'}`);
      
      await page.screenshot({ path: 'nickname-focus.png' });
      console.log('   📸 닉네임 포커스 스크린샷 저장: nickname-focus.png');
    } else {
      console.log('   ❌ 닉네임 입력 필드를 찾을 수 없음');
    }

    // 2. Today 페이지에서 CurrentScenarioStatus 확인
    console.log('\n2️⃣ Today 페이지 테스트 시나리오 상태 표시 검증');
    await page.goto('http://localhost:3000/today?test_mode=true');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 우상단 상태 표시 확인
    const statusElement = await page.locator('.fixed.top-4.right-4').first();
    const hasStatus = await statusElement.isVisible();
    
    console.log(`   ${hasStatus ? '✅' : '❌'} 우상단 상태 표시: ${hasStatus ? '표시됨' : '표시 안됨'}`);
    
    if (hasStatus) {
      const statusText = await statusElement.textContent();
      console.log(`   상태 내용: "${statusText?.slice(0, 50)}..."`);
    }

    // TestScenarioDropdown 확인
    const dropdownArea = await page.locator('.fixed.top-0.left-0.right-0').first();
    const hasDropdownArea = await dropdownArea.isVisible();
    
    console.log(`   ${hasDropdownArea ? '✅' : '❌'} 상단 테스트 영역: ${hasDropdownArea ? '표시됨' : '표시 안됨'}`);

    await page.screenshot({ path: 'today-status.png' });
    console.log('   📸 Today 상태 스크린샷 저장: today-status.png');

    // 3. Test 페이지에서 Solo 모드 시나리오 테스트
    console.log('\n3️⃣ Solo 모드 시나리오 테스트');
    await page.goto('http://localhost:3000/test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Solo 모드 버튼 찾기
    const soloButton = await page.locator('text=Solo 모드').first();
    const hasSoloButton = await soloButton.isVisible();
    
    if (hasSoloButton) {
      console.log('   ✅ Solo 모드 버튼 발견');
      await soloButton.click();
      await page.waitForTimeout(1000);
      
      // Today 페이지로 이동하는 버튼 찾기
      const todayButton = await page.locator('text=오늘').first();
      if (await todayButton.isVisible()) {
        await todayButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // 혼자모드 상태 확인
        const pageContent = await page.textContent('body');
        const hasSoloIndicator = pageContent.includes('혼자모드') || pageContent.includes('Solo');
        const hasWaitingPartner = pageContent.includes('상대방 답변 대기') || pageContent.includes('동반자');
        
        console.log(`   ${hasSoloIndicator ? '✅' : '❌'} 혼자모드 상태 표시: ${hasSoloIndicator ? '표시됨' : '표시 안됨'}`);
        console.log(`   ${!hasWaitingPartner ? '✅' : '❌'} 상대방 대기 메시지: ${hasWaitingPartner ? '잘못 표시됨' : '표시 안됨 (올바름)'}`);
        
        await page.screenshot({ path: 'solo-mode-today.png' });
        console.log('   📸 Solo 모드 Today 스크린샷 저장: solo-mode-today.png');
      }
    } else {
      console.log('   ❌ Solo 모드 버튼을 찾을 수 없음');
    }

    console.log('\n🎉 집중 검증 완료!');

  } catch (error) {
    console.error('❌ 검증 중 오류:', error);
  } finally {
    await browser.close();
  }
}

focusedVerification().catch(console.error);