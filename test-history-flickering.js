// History 페이지 UI 플리커링 검증 스크립트
const { chromium } = require('playwright');

async function testHistoryPageFlickering() {
  console.log('🚀 History 페이지 UI 플리커링 해결 검증 시작...\n');
  
  const results = {
    test_timestamp: new Date().toLocaleString('ko-KR'),
    page_url: 'http://localhost:3000/history?test_mode=true',
    tests: []
  };

  const browser = await chromium.launch({
    headless: false, // UI 변화를 시각적으로 확인
    slowMo: 100      // 동작을 천천히 하여 관찰 가능하도록
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // 모바일 뷰포트 (iPhone 13 크기)
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await context.newPage();

  try {
    console.log('🔍 History 페이지 UI 플리커링 검증을 시작합니다...');

    // 1. 페이지 로딩 시간 측정
    console.log('\n1️⃣ 페이지 로딩 성능 측정');
    
    const startTime = Date.now();
    
    // 네트워크 이벤트 모니터링
    const networkEvents = [];
    page.on('response', response => {
      networkEvents.push({
        url: response.url(),
        status: response.status(),
        timing: Date.now()
      });
    });

    // 페이지 로드
    await page.goto('http://localhost:3000/history?test_mode=true');
    await page.waitForLoadState('networkidle');
    
    const loadTime = (Date.now() - startTime) / 1000;
    
    results.tests.push({
      test_name: '페이지 로딩 시간',
      result: `${loadTime.toFixed(3)}초`,
      status: loadTime < 0.8 ? '개선됨' : '추가 최적화 필요',
      target: '< 0.8초'
    });
    
    console.log(`   📊 로딩 시간: ${loadTime.toFixed(3)}초`);

    // 2. 하이드레이션 플리커링 검증
    console.log('\n2️⃣ 하이드레이션 플리커링 검증');
    
    // DOM 변화 감지 스크립트 주입
    await page.addInitScript(() => {
      window.flickerEvents = [];
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            window.flickerEvents.push({
              type: mutation.type,
              target: mutation.target.tagName || 'TEXT',
              timestamp: performance.now()
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    });

    // 페이지 새로고침하여 DOM 변화 감지 시작
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('   🔍 DOM 변화 감지 활성화됨');

    // 3. 테스트 모드 컴포넌트 확인
    console.log('\n3️⃣ 테스트 모드 컴포넌트 표시 확인');
    
    try {
      // isMounted 상태가 true가 된 후 컴포넌트들이 표시되는지 확인
      await page.waitForTimeout(800); // isMounted가 true가 될 때까지 대기
      
      // 더 구체적으로 테스트 모드 컴포넌트들을 찾기
      const currentScenarioStatus = await page.$('.fixed.top-2.right-2'); // CurrentScenarioStatus
      const testDropdownContainers = await page.$$('.bg-blue-50.border.border-blue-200'); // 테스트 드롭다운 컨테이너
      const testDropdowns = await page.$$('select'); // select 요소
      
      const totalTestComponents = (currentScenarioStatus ? 1 : 0) + testDropdownContainers.length;
      
      if (totalTestComponents > 0) {
        results.tests.push({
          test_name: '테스트 모드 컴포넌트 표시',
          result: `${totalTestComponents}개의 테스트 컴포넌트 표시됨 (상태: ${currentScenarioStatus ? 1 : 0}, 드롭다운: ${testDropdownContainers.length})`,
          status: '성공'
        });
        console.log(`   ✅ 테스트 모드 컴포넌트가 정상 표시됨 (${totalTestComponents}개)`);
        console.log(`      - CurrentScenarioStatus: ${currentScenarioStatus ? '표시됨' : '표시안됨'}`);
        console.log(`      - TestDropdown 컨테이너: ${testDropdownContainers.length}개`);
        console.log(`      - Select 요소: ${testDropdowns.length}개`);
      } else {
        // 페이지 HTML 확인 (디버깅용)
        const pageText = await page.textContent('body');
        const hasTestModeText = pageText.includes('테스트') || pageText.includes('Test');
        
        results.tests.push({
          test_name: '테스트 모드 컴포넌트 표시',
          result: `테스트 컴포넌트가 표시되지 않음 (테스트 텍스트 존재: ${hasTestModeText})`,
          status: hasTestModeText ? '부분적' : '실패'
        });
        console.log('   ❌ 테스트 모드 컴포넌트 표시 실패');
        console.log(`      - 테스트 관련 텍스트 존재: ${hasTestModeText}`);
      }
      
    } catch (error) {
      results.tests.push({
        test_name: '테스트 모드 컴포넌트 표시',
        result: `오류 발생: ${error.message}`,
        status: '실패'
      });
      console.log(`   ❌ 테스트 모드 컴포넌트 확인 실패: ${error.message}`);
    }

    // 4. Mock 데이터 로딩 확인 (300ms 지연)
    console.log('\n4️⃣ Mock 데이터 로딩 확인');
    
    try {
      // 300ms 대기 후 데이터 로딩 상태 확인
      await page.waitForTimeout(400); // 300ms + 여유시간
      
      // 페이지 내용 확인
      const pageContent = await page.textContent('body');
      const hasHistoryContent = pageContent.includes('대화') || pageContent.includes('History') || pageContent.includes('히스토리');
      
      if (hasHistoryContent) {
        results.tests.push({
          test_name: 'Mock 데이터 로딩',
          result: 'History 페이지 콘텐츠 로딩됨',
          status: '성공'
        });
        console.log('   ✅ Mock 데이터 로딩 성공');
      } else {
        results.tests.push({
          test_name: 'Mock 데이터 로딩',
          result: 'History 콘텐츠가 표시되지 않음',
          status: '실패'
        });
        console.log('   ❌ Mock 데이터 로딩 실패');
      }
      
    } catch (error) {
      results.tests.push({
        test_name: 'Mock 데이터 로딩',
        result: `오류 발생: ${error.message}`,
        status: '실패'
      });
      console.log(`   ❌ Mock 데이터 로딩 실패: ${error.message}`);
    }

    // 5. 시각적 안정성 측정 (CLS)
    console.log('\n5️⃣ 시각적 안정성 측정');
    
    try {
      const clsValue = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
          
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 2000);
        });
      });
      
      results.tests.push({
        test_name: 'Cumulative Layout Shift (CLS)',
        result: clsValue.toFixed(4),
        status: clsValue < 0.1 ? '우수' : '개선 필요',
        target: '< 0.1'
      });
      
      console.log(`   📊 CLS 점수: ${clsValue.toFixed(4)} (${clsValue < 0.1 ? '우수' : '개선 필요'})`);
      
    } catch (error) {
      console.log(`   ❌ CLS 측정 실패: ${error.message}`);
    }

    // 6. DOM 변화 이벤트 분석
    console.log('\n6️⃣ DOM 변화 이벤트 분석');
    
    const flickerEvents = await page.evaluate(() => window.flickerEvents || []);
    
    // 초기 로딩 후 발생한 불필요한 DOM 변화 필터링 (500ms 이후)
    const significantChanges = flickerEvents.filter(event => event.timestamp > 500);
    
    results.tests.push({
      test_name: '하이드레이션 후 DOM 변화',
      result: `${significantChanges.length}개의 변화 감지됨`,
      status: significantChanges.length < 3 ? '안정적' : '불안정',
      details: significantChanges.slice(0, 5) // 처음 5개만 기록
    });
    
    console.log(`   📊 하이드레이션 후 DOM 변화: ${significantChanges.length}개`);
    if (significantChanges.length < 3) {
      console.log('   ✅ DOM이 안정적으로 유지됨 (플리커링 해결됨)');
    } else {
      console.log('   ⚠️  일부 DOM 변화가 감지됨 (추가 최적화 필요)');
    }

    // 7. 스크린샷 캡처
    console.log('\n7️⃣ 스크린샷 캡처');
    
    try {
      const screenshotPath = 'history_page_after_fix.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results.screenshot_path = screenshotPath;
      console.log(`   📸 스크린샷 저장됨: ${screenshotPath}`);
      
    } catch (error) {
      console.log(`   ❌ 스크린샷 캡처 실패: ${error.message}`);
    }

    // 8. 성능 지표 수집
    console.log('\n8️⃣ 성능 지표 수집');
    
    try {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        };
      });
      
      results.tests.push({
        test_name: '성능 지표',
        result: `FCP: ${metrics.firstContentfulPaint.toFixed(0)}ms, DOM: ${metrics.domContentLoaded.toFixed(0)}ms`,
        status: metrics.firstContentfulPaint < 1500 ? '우수' : '개선 필요',
        details: metrics
      });
      
      console.log(`   📊 First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(0)}ms`);
      console.log(`   📊 DOM Content Loaded: ${metrics.domContentLoaded.toFixed(0)}ms`);
      
    } catch (error) {
      console.log(`   ❌ 성능 지표 수집 실패: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  } finally {
    await browser.close();
  }

  return results;
}

// 결과 출력 함수
function printResults(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 검증 결과 요약');
  console.log('='.repeat(60));

  results.tests.forEach((test, index) => {
    const statusIcon = ['성공', '개선됨', '우수', '안정적'].includes(test.status) ? '✅' : 
                      test.status.includes('추가') ? '⚠️' : '❌';
    console.log(`${index + 1}. ${test.test_name}: ${statusIcon} ${test.result}`);
    if (test.target) {
      console.log(`   목표: ${test.target}`);
    }
  });

  console.log(`\n📅 테스트 시간: ${results.test_timestamp}`);
  console.log(`🔗 테스트 URL: ${results.page_url}`);
}

// 메인 실행 함수
async function main() {
  const results = await testHistoryPageFlickering();
  printResults(results);
  
  // JSON 결과 저장
  const fs = require('fs');
  fs.writeFileSync('history_page_test_results.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('\n💾 상세 결과가 \'history_page_test_results.json\' 파일에 저장되었습니다.');
  
  // 성공/실패 개수 집계
  const successCount = results.tests.filter(test => ['성공', '개선됨', '우수', '안정적'].includes(test.status)).length;
  const totalCount = results.tests.length;
  
  console.log('\n🎯 검증 결과:');
  console.log(`   성공: ${successCount}/${totalCount} (${(successCount/totalCount*100).toFixed(1)}%)`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 모든 검증 항목이 성공했습니다! UI 플리커링 문제가 완전히 해결되었습니다.');
  } else {
    console.log(`\n⚠️  ${totalCount - successCount}개 항목에서 추가 최적화가 필요합니다.`);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testHistoryPageFlickering };