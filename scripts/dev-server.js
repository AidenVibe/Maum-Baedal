#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_PORT = 3000;
const ENV_FILE = '.env.local';

async function killPort(port) {
  return new Promise((resolve) => {
    // Windows 환경에서 포트 사용 중인 프로세스 종료
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (!stdout) {
        console.log(`✅ Port ${port} is available`);
        resolve();
        return;
      }

      const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
      const pids = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[parts.length - 1];
      });

      if (pids.length === 0) {
        resolve();
        return;
      }

      console.log(`🔄 Killing processes on port ${port}: ${pids.join(', ')}`);
      
      pids.forEach(pid => {
        if (pid && pid !== '0') {
          exec(`taskkill /PID ${pid} /F`, (error) => {
            if (!error) {
              console.log(`✅ Killed process ${pid}`);
            }
          });
        }
      });

      setTimeout(resolve, 2000);
    });
  });
}

async function updateEnvUrl(port) {
  const envPath = path.join(process.cwd(), ENV_FILE);
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // NEXTAUTH_URL 업데이트
    const urlRegex = /NEXTAUTH_URL="http:\/\/localhost:\d+"/g;
    const newUrl = `NEXTAUTH_URL="http://localhost:${port}"`;
    
    if (urlRegex.test(envContent)) {
      envContent = envContent.replace(urlRegex, newUrl);
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Updated ${ENV_FILE}: ${newUrl}`);
    }
  }
}

async function startDevServer() {
  console.log(`🚀 Starting development server on port ${TARGET_PORT}...`);
  
  // 1. 포트 정리
  await killPort(TARGET_PORT);
  
  // 2. 환경변수 URL 업데이트
  await updateEnvUrl(TARGET_PORT);
  
  // 3. 개발 서버 시작
  const devProcess = spawn('npm', ['run', 'dev', '--', '--port', TARGET_PORT], {
    stdio: 'inherit',
    shell: true
  });

  // 프로세스 종료 시 정리
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping development server...');
    devProcess.kill('SIGINT');
    process.exit(0);
  });

  devProcess.on('close', (code) => {
    console.log(`Development server exited with code ${code}`);
    process.exit(code);
  });
}

if (require.main === module) {
  startDevServer().catch(console.error);
}