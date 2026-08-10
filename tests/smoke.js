const http = require('http');
const app = require('../server');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log('Smoke test: server started');
});

function checkPath(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port: PORT, path, timeout: 2000 }, (res) => {
      const status = res.statusCode;
      res.resume();
      resolve(status === 200);
    });
    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

(async () => {
  try {
    // wait for server to be ready
    let ok = false;
    for (let i = 0; i < 20; i++) {
      try {
        if (await checkPath('/health')) { ok = true; break; }
      } catch (e) {}
      await new Promise(r => setTimeout(r, 1000));
    }
    if (!ok) throw new Error('health check failed');

    const rootOk = await checkPath('/');
    if (!rootOk) throw new Error('/ returned non-200');

    console.log('Smoke test passed');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('Smoke test failed:', err && err.message ? err.message : err);
    server.close(() => process.exit(2));
  }
})();
