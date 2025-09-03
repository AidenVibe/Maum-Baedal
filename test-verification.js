const { chromium } = require('playwright');

async function runVerification() {
  console.log('🚀 브라우저 검증 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('\n1️⃣ 닉네임 입력 포커스 스타일 검증...');
    
    // 온보딩 페이지 접속
    await page.goto('http://localhost:3000/onboarding?test_mode=true');
    await page.waitForLoadState('networkidle');
    
    // 페이지가 로드되었는지 확인
    const title = await page.title();
    console.log(`   페이지 제목: ${title}`);
    
    // 닉네임 입력 필드 확인
    const nicknameInput = page.locator('input[placeholder*="이름을"]');
    await nicknameInput.waitFor({ timeout: 5000 });
    
    console.log('   닉네임 입력 필드 발견됨');
    
    // 포커스 전 스타일 확인
    await nicknameInput.focus();
    await page.waitForTimeout(500);
    
    // 포커스된 input의 computed style 확인
    const focusedStyles = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="이름을"]');
      if (!input) return null;
      
      const styles = window.getComputedStyle(input);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        borderColor: styles.borderColor,
        boxShadow: styles.boxShadow,
        backgroundColor: styles.backgroundColor
      };
    });
    
    console.log('   포커스 스타일:', JSON.stringify(focusedStyles, null, 2));
    
    // ring 색상이 라벤더/바이올렛인지 확인
    const isViolet = focusedStyles.boxShadow.includes('168, 139, 250') || 
                    focusedStyles.boxShadow.includes('139, 168, 250') ||
                    focusedStyles.boxShadow.includes('rgb(168, 139, 250)') ||
                    focusedStyles.boxShadow.includes('A78BFA');
                    
    console.log(`   ✅ 포커스 스타일 확인: ${isViolet ? '라벤더/바이올렛 링' : '다른 색상 링'}`);
    
    console.log('\n2️⃣ 테스트 시나리오 상태 표시 검증...');
    
    // Today 페이지로 이동
    await page.goto('http://localhost:3000/today?test_mode=true');
    await page.waitForLoadState('networkidle');
    
    // 우상단 상태 표시 확인
    const statusDisplay = page.locator('.fixed.top-4.right-4');
    const hasStatusDisplay = await statusDisplay.isVisible();
    
    console.log(`   우상단 상태 표시: ${hasStatusDisplay ? '✅ 표시됨' : '❌ 표시 안됨'}`);
    
    if (hasStatusDisplay) {
      const statusText = await statusDisplay.textContent();
      console.log(`   상태 내용: "${statusText?.slice(0, 100)}..."`);
    }
    
    // TestScenarioDropdown 확인
    const dropdown = page.locator('select, [role="combobox"]');
    const hasDropdown = await dropdown.count() > 0;
    
    console.log(`   테스트 시나리오 드롭다운: ${hasDropdown ? '✅ 존재함' : '❌ 없음'}`);
    
    console.log('\n3️⃣ 혼자모드 상태 로직 검증...');
    
    // 테스트 페이지로 이동
    await page.goto('http://localhost:3000/test');
    await page.waitForLoadState('networkidle');
    
    // Solo 모드 시나리오 선택 시뮬레이션 (드롭다운이 있으면)
    if (await dropdown.count() > 0) {
      console.log('   드롭다운에서 Solo 모드 선택 시뮬레이션...');
      
      // Solo 모드 선택 후 Today 페이지 이동
      await page.goto('http://localhost:3000/today?test_mode=true&dev_scenario=solo_new');
      await page.waitForLoadState('networkidle');
      
      // 게이트 상태 확인
      const gateStatus = await page.textContent('body');
      const hasSoloMode = gateStatus.includes('혼자모드') || gateStatus.includes('Solo');
      const hasWaitingPartner = gateStatus.includes('상대방 답변 대기') || gateStatus.includes('동반자');
      
      console.log(`   혼자모드 표시: ${hasSoloMode ? '✅ 표시됨' : '❌ 표시 안됨'}`);
      console.log(`   상대방 답변 대기 메시지: ${hasWaitingPartner ? '❌ 잘못 표시됨' : '✅ 표시 안됨 (올바름)'}`);
    }
    
    console.log('\n🎉 검증 완료!');
    
  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error);
  } finally {
    await page.screenshot({ 
      path: 'verification-result.png', 
      fullPage: true 
    });
    console.log('📸 검증 결과 스크린샷 저장: verification-result.png');
    
    await browser.close();
  }
}

runVerification().catch(console.error);