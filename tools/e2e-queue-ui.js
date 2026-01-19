const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

const pageUrl = 'file:///' + path.resolve(__dirname, '..', 'messaging.html').replace(/\\/g, '/');
const serverPort = process.argv[2] || 8091;
const serverPersist = path.resolve(__dirname, '..', 'data', `messages-ui-test-${serverPort}.json`);

async function startServer(){
  const proc = spawn('node', ['tools/dev-messaging-server.js', '--port', String(serverPort), '--persist', serverPersist], { stdio: ['ignore','pipe','pipe'] });
  proc.stdout.on('data', d => process.stdout.write('[server] ' + d.toString()));
  proc.stderr.on('data', d => process.stderr.write('[server] ' + d.toString()));
  return proc;
}

(async () => {
  console.log('Launching headless browser for UI test');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'load' });

  // ensure no server is running at the test port, try to connect
  await page.waitForSelector('#ws-url');
  await page.evaluate((port) => { document.querySelector('#ws-url').value = 'ws://127.0.0.1:' + port; }, serverPort);
  await page.click('#connect-ws');
  await page.waitForTimeout(300);

  // send message while offline — it should show as pending and be in queue
  await page.type('#msg-input', 'ui test queued message');
  await page.click('#send-msg');
  await page.waitForTimeout(200);

  // open queue panel
  await page.click('#queue-count');
  await page.waitForSelector('#queue-list');
  const firstTemp = await page.evaluate(() => {
    const el = document.querySelector('#queue-list .queue-item');
    return el ? el.dataset.tempid : null;
  });
  console.log('Found queued item temp id: ', firstTemp);
  if (!firstTemp) { console.error('No queued item in UI'); await browser.close(); process.exit(2); }

  // click Cancel for that item (use in-page click to avoid puppeteer click-to-target issues)
  await page.evaluate((sel)=>{ const el = document.querySelector(sel); if (el) el.click(); }, `#queue-list .cancel-btn[data-tempid="${firstTemp}"]`);
  await page.waitForTimeout(200);
  // assert queue empty
  const afterCancel = await page.evaluate(() => localStorage.getItem('gimbi:messaging:outgoingQueue:v1'));
  console.log('queue after cancel ->', afterCancel);
  if (afterCancel && JSON.parse(afterCancel).length) { console.error('Cancel did not clear queue'); await browser.close(); process.exit(2); }

  // re-add a queued message to test retry flow
  await page.type('#msg-input', 'ui retry message');
  await page.click('#send-msg');
  // give the client a moment to persist
  await page.waitForTimeout(400);
  const qBefore = await page.evaluate(() => localStorage.getItem('gimbi:messaging:outgoingQueue:v1'));
  console.log('queued before retry ->', qBefore);

  // start server so retry can succeed
  const serv = await startServer();
  await new Promise(r=>setTimeout(r, 500));

  // open queue and click retry on first item
  await page.click('#queue-count');
  await page.waitForSelector('#queue-list');
  const temp2 = await page.evaluate(() => { const el = document.querySelector('#queue-list .queue-item'); return el ? el.dataset.tempid : null; });
  console.log('retrying temp', temp2);
  await page.evaluate((sel)=>{ const el = document.querySelector(sel); if (el) el.click(); }, `#queue-list .retry-btn[data-tempid="${temp2}"]`);

  // wait to give server/WS time to reconcile
  await page.waitForTimeout(800);

  // pending should be gone from DOM
  const pendingStill = await page.evaluate((t) => !!document.querySelector(`[data-id="${t}"]` && document.querySelector(`[data-id="${t}"]`).classList.contains('pending')), temp2);
  console.log('pending still?', pendingStill);

  const queuedAfter = await page.evaluate(() => localStorage.getItem('gimbi:messaging:outgoingQueue:v1'));
  console.log('queue after retry ->', queuedAfter);

  await browser.close(); serv.kill();

  if (pendingStill) { console.error('Pending still present after retry'); process.exit(2); }
  if (queuedAfter && JSON.parse(queuedAfter).length) { console.error('Queue not emptied after retry'); process.exit(2); }

  console.log('E2E queue UI test passed');
  process.exit(0);
})();
