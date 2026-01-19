const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

const pageUrl = 'file:///' + path.resolve(__dirname, '..', 'messaging.html').replace(/\\/g, '/');
const serverPort = process.argv[2] || 8090;
const serverPersist = path.resolve(__dirname, '..', 'data', `messages-test-${serverPort}.json`);

async function startServer(){
  const proc = spawn('node', ['tools/dev-messaging-server.js', '--port', String(serverPort), '--persist', serverPersist], { stdio: ['ignore','pipe','pipe'] });
  proc.stdout.on('data', d => process.stdout.write('[server] ' + d.toString()));
  proc.stderr.on('data', d => process.stderr.write('[server] ' + d.toString()));
  return proc;
}

(async () => {
  console.log('Launching headless browser');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'load' });

  // set WS url to port that is NOT running
  await page.waitForSelector('#ws-url');
  await page.evaluate((port) => { document.querySelector('#ws-url').value = 'ws://127.0.0.1:' + port; }, serverPort);

  // initial connect attempt (should fail)
  await page.click('#connect-ws');
  await page.waitForTimeout(300);

  // send a message while disconnected
  await page.type('#msg-input', 'offline queued message');
  await page.click('#send-msg');
  await page.waitForTimeout(200);

  // confirm queue in localStorage
  const qKey = 'gimbi:messaging:outgoingQueue:v1';
  const queued = await page.evaluate((k)=> localStorage.getItem(k), qKey);
  console.log('Queued (before server) ->', queued);
  if (!queued) { console.error('No queue found — test failed'); await browser.close(); process.exit(2); }

  // start server to accept connection
  console.log('Starting test server on port', serverPort);
  const serv = await startServer();
  await new Promise(r => setTimeout(r, 600));

  // reconnect by clicking connect
  await page.click('#connect-ws');

  // wait for server ack to come through and pending class to be removed
  const pendingGone = await page.waitForFunction(()=> {
    const el = document.querySelector('[data-id^="local-"]');
    return !el || !el.classList.contains('pending');
  }, { timeout: 5000 }).catch(e => false);

  console.log('pendingGone?', pendingGone);

  // check localStorage queue empty
  const queuedAfter = await page.evaluate((k)=> localStorage.getItem(k), qKey);
  console.log('Queued (after server) ->', queuedAfter);

  await browser.close();
  serv.kill();

  if (!pendingGone) {
    console.error('Message did not get acked and reconciled'); process.exit(2);
  }

  if (queuedAfter && JSON.parse(queuedAfter).length) { console.error('Queue not emptied after flush'); process.exit(2); }

  console.log('E2E queue send/flush test passed');
  process.exit(0);
})();
