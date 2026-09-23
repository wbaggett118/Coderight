const { spawn } = require('child_process');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Start the server as a child process
const serverProc = spawn(process.execPath, ['server.js'], { stdio: ['ignore', 'pipe', 'pipe'] });

serverProc.stdout.on('data', (d) => process.stdout.write(d));
serverProc.stderr.on('data', (d) => process.stderr.write(d));

let checksDone = false;

function checkHealth() {
  const req = http.get({ hostname: '127.0.0.1', port: PORT, path: '/health', timeout: 2000 }, (res) => {
    if (res.statusCode === 200) {
      console.log('Health check OK');
      runRootCheck();
    } else {
      retry();
    }
  });

  req.on('error', () => retry());
  req.on('timeout', () => { req.destroy(); retry(); });
}

function runRootCheck() {
  if (checksDone) return;
  checksDone = true;
  http.get({ hostname: '127.0.0.1', port: PORT, path: '/' }, (res) => {
    console.log('Root status', res.statusCode);
    cleanup(res.statusCode === 200 ? 0 : 2);
  }).on('error', (err) => {
    console.error('Root check failed', err.message);
    cleanup(2);
  });
}

let retries = 0;
function retry() {
  if (retries++ > 20) {
    console.error('Server did not become healthy in time');
    cleanup(3);
    return;
  }
  setTimeout(checkHealth, 1000);
}

function cleanup(code) {
  if (!serverProc.killed) {
    serverProc.kill();
  }
  process.exit(code);
}

// Give server a moment then start checking
setTimeout(checkHealth, 1000);
