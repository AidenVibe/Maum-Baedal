#!/usr/bin/env tsx
/**
 * Conversation Detail API 수동 테스트 스크립트
 * 
 * 사용법:
 * 1. 개발 서버 실행: npm run dev
 * 2. 다른 터미널에서: npx tsx scripts/test-conversation-api.ts
 */

// 테스트 설정
const BASE_URL = 'http://localhost:3000'
const TEST_CONVERSATION_ID = 'test_conv_id' // 실제 테스트 시 변경 필요

// ANSI 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log()
  log(`${'='.repeat(50)}`, 'cyan')
  log(title, 'bright')
  log(`${'='.repeat(50)}`, 'cyan')
}

async function testConversationAPI() {
  logSection('Conversation Detail API 테스트')

  // 1. 인증 없이 요청 테스트
  log('\n1. 인증 없이 요청 (401 예상)', 'yellow')
  try {
    const response = await fetch(`${BASE_URL}/api/conversation/${TEST_CONVERSATION_ID}`)
    const data = await response.json()
    
    if (response.status === 401) {
      log(`✅ 예상대로 401 반환: ${data.error}`, 'green')
    } else {
      log(`❌ 예상과 다른 상태 코드: ${response.status}`, 'red')
    }
  } catch (error) {
    log(`❌ 요청 실패: ${error}`, 'red')
  }

  // 2. 존재하지 않는 대화 요청 테스트
  log('\n2. 존재하지 않는 대화 요청 (404 예상)', 'yellow')
  try {
    const response = await fetch(`${BASE_URL}/api/conversation/invalid_id_12345`, {
      credentials: 'include' // 쿠키 포함
    })
    const data = await response.json()
    
    if (response.status === 404 || response.status === 401) {
      log(`✅ 예상대로 ${response.status} 반환: ${data.error || '인증 필요'}`, 'green')
    } else {
      log(`❌ 예상과 다른 상태 코드: ${response.status}`, 'red')
    }
  } catch (error) {
    log(`❌ 요청 실패: ${error}`, 'red')
  }

  // 3. 정상 요청 시뮬레이션 (실제 conversationId 필요)
  log('\n3. 정상 요청 시뮬레이션', 'yellow')
  log('   실제 테스트를 위해서는:', 'blue')
  log('   - 로그인된 상태에서 브라우저의 개발자 도구 사용', 'blue')
  log('   - 또는 유효한 세션 쿠키로 요청', 'blue')
  log('   - conversation ID는 /today 페이지에서 확인 가능', 'blue')

  // 예시 cURL 명령어 출력
  logSection('수동 테스트용 cURL 명령어')
  
  console.log('\n# 1. 브라우저에서 로그인 후 쿠키 확인')
  console.log('# 개발자 도구 > Application > Cookies > next-auth.session-token 값 복사')
  
  console.log('\n# 2. cURL로 테스트')
  console.log(`curl -X GET \\`)
  console.log(`  "${BASE_URL}/api/conversation/YOUR_CONVERSATION_ID" \\`)
  console.log(`  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \\`)
  console.log(`  -H "Accept: application/json"`)
  
  console.log('\n# 3. 또는 fetch로 브라우저 콘솔에서 직접 테스트')
  console.log(`fetch('/api/conversation/YOUR_CONVERSATION_ID')`)
  console.log(`  .then(res => res.json())`)
  console.log(`  .then(data => console.log(data))`)
}

// 테스트 데이터 생성을 위한 헬퍼
async function createTestData() {
  logSection('테스트 데이터 생성 안내')
  
  log('테스트 데이터를 생성하려면:', 'yellow')
  log('1. 두 명의 사용자로 로그인 (다른 브라우저/시크릿 모드 사용)', 'blue')
  log('2. 초대코드로 쌍 연결 (/onboarding)', 'blue')
  log('3. 오늘 페이지에서 각각 답변 제출 (/today)', 'blue')
  log('4. 게이트가 열리면 conversationId 확인', 'blue')
  log('5. /api/conversation/{conversationId}로 테스트', 'blue')
}

// 메인 실행
async function main() {
  try {
    await testConversationAPI()
    await createTestData()
    
    logSection('테스트 완료')
    log('더 자세한 테스트는 Jest 테스트를 실행하세요:', 'cyan')
    log('npm test app/api/conversation/[id]/route.test.ts', 'cyan')
  } catch (error) {
    log(`테스트 중 오류 발생: ${error}`, 'red')
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}