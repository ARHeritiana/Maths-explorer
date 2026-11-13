// Offline support in a real browser (npm run test:offline; needs a built dist/ and Playwright's Chromium).
// Serves dist/ under a sub-path, as GitHub Pages does, then: the worker installs and controls the page, routes are
// opened online, the network is cut (browser offline and server refusing), every route still renders, a formula is
// typeset, the slide player and a foundation lesson opened before still work, a cached PDF answers Range requests, an
// unopened PDF gives the offline page; then a new version is published: the notice appears, nothing changes until
// "Recharger", after which the new version controls the page and the old shell cache is gone.
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const started = Date.now();
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const PREFIX = '/classe/maths-explorer/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.json': 'application/json; charset=utf-8', '.pdf': 'application/pdf', '.woff2': 'font/woff2' };

/* ---------------------------------------------------------------- what to open: read from the generated data */
const shell = JSON.parse(/^self\.__MX_SHELL = (.*);$/m.exec(readFileSync(dist + 'sw.js', 'utf8'))[1]);
const { discoveryChapters } = await import('../dist/js/catalogue-data.js');
const { isLiveHash } = await import('../dist/js/live-curriculum.js');
const chapter = discoveryChapters.find(c => isLiveHash('#chapter/' + c.id));
assert.ok(chapter, 'a live chapter exists in the generated catalogue');
const { STRATEGIES: OLYMPIAD } = await import('../dist/js/olympiad-content.js');
const decks = JSON.parse(readFileSync(dist + 'slides/data/index.json', 'utf8'));
const deck = (Array.isArray(decks) ? decks : decks.decks || Object.values(decks)).find(d => d && d.id && readdirSync(dist + 'slides/data').includes(d.id + '.json'));
assert.ok(deck, 'a deck exists in the generated slide index');
const pdfs = readdirSync(dist + 'resources', { recursive: true }).filter(f => String(f).endsWith('.pdf')).map(String).sort();
const sizeOf = f => readFileSync(dist + 'resources/' + f).length;
const small = pdfs.filter(f => sizeOf(f) < 600e3);
assert.ok(small.length >= 2, 'two small PDFs exist');
const [openedPdf, unopenedPdf] = small.map(f => 'resources/' + f.split(path.sep).join('/'));
const ROUTES = ['#home', '#automatismes', '#bank', '#lab', '#chapter/' + chapter.id];
// Never opened online: only the shell can draw it, formulas included. The Olympiad page is live only in the full
// edition; the limited edition redirects it, so the worksheet generator (shell code only, formulas) is used there.
// A chapter page never opened online is not a candidate: its data is copied only when it is first opened.
const UNOPENED = isLiveHash('#olympiad/' + OLYMPIAD[0].id) ? '#olympiad/' + OLYMPIAD[0].id : '#sheets';

/* ---------------------------------------------------------------- the server: sub-path, Range, a switch, overrides */
const overrides = new Map();   // relative path -> Buffer (the "new version" published later)
let down = false;
const hits = [];
const server = http.createServer(async (req, res) => {
  if (down) return req.socket.destroy();
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith(PREFIX)) { res.writeHead(404); return res.end('outside'); }
    let name = decodeURIComponent(url.pathname.slice(PREFIX.length));
    if (name === '' || name.endsWith('/')) name += 'index.html';
    hits.push(name);
    const target = path.resolve(dist, name);
    if (!target.startsWith(dist)) { res.writeHead(403); return res.end(); }
    const data = overrides.get(name) || ((await stat(target)).isFile() && await readFile(target));
    const etag = '"' + crypto.createHash('sha1').update(data).digest('hex').slice(0, 16) + '"';
    const head = { 'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', ETag: etag, 'Cache-Control': 'max-age=600' };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, head); return res.end(); }
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      const a = Number(range[1]), b = range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
      res.writeHead(206, { ...head, 'Content-Range': `bytes ${a}-${b}/${data.length}` });
      return res.end(data.subarray(a, b + 1));
    }
    res.writeHead(200, head); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://localhost:${server.address().port}${PREFIX}`;

/* ---------------------------------------------------------------- the browser */
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = createRequire('/opt/node-tools/node_modules/')('playwright')); }
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const problems = [];
page.on('pageerror', e => problems.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && /import|module|MathJax/i.test(m.text())) problems.push('console: ' + m.text()); });
page.on('requestfailed', r => { if (r.url().startsWith(base) && /\.(js|css)(\?|$)/.test(r.url())) problems.push('failed: ' + r.url()); });   // other origins are never cached (docs/OFFLINE.md)

const step = async (name, run) => { const t = Date.now(); await run(); console.log(`ok   ${name} (${((Date.now() - t) / 1000).toFixed(1)} s)`); };
const workerVersion = () => page.evaluate(() => new Promise(resolve => {
  const channel = new MessageChannel();
  channel.port1.onmessage = e => resolve(e.data);
  navigator.serviceWorker.controller.postMessage({ type: 'mx-version' }, [channel.port2]);
}));
const cacheNames = () => page.evaluate(() => caches.keys());
const runtimeHas = suffix => page.evaluate(async suffix => {
  for (const name of await caches.keys()) if (name.includes('|runtime|')) for (const r of await (await caches.open(name)).keys()) if (new URL(r.url).pathname.endsWith(suffix)) return true;
  return false;
}, suffix);
async function open(hash) {
  await page.evaluate(h => { location.hash = h; }, hash);
  await page.waitForFunction(h => location.hash === h && document.querySelector('#main h1')?.textContent.trim().length > 0, hash, { timeout: 15000 });
  const title = (await page.textContent('#main h1')).trim();
  assert.ok(!/introuvable|not found/i.test(title), `${hash} renders a real page, got "${title}"`);
  return title;
}

// A foundation lesson is a page of its own inside an iframe: read its address from the lessons index page.
let lesson = null;
async function openLesson() {
  if (!lesson) { await open('#basics'); lesson = await page.getAttribute('#main a[href^="#basics/"]', 'href'); }
  await page.evaluate(h => { location.hash = h; }, lesson);
  const frame = page.frameLocator('#main iframe').first();
  await frame.locator('body :is(button, canvas, svg, h1, h2)').first().waitFor({ timeout: 15000 });
}

try {
  await step('first visit: worker installs the shell and controls the page', async () => {
    await page.goto(base);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 60000 });
    const info = await workerVersion();
    assert.equal(info.version, shell.version);
    assert.equal(info.files, shell.files.length);
    const cached = await page.evaluate(async () => { for (const n of await caches.keys()) if (n.includes('|shell|')) return (await (await caches.open(n)).keys()).length; });
    assert.equal(cached, shell.files.length, 'every shell file is in the cache');
    assert.equal(new URL(await page.evaluate(() => navigator.serviceWorker.controller.scriptURL)).pathname, PREFIX + 'sw.js');
    assert.ok(!hits.some(h => h.endsWith('.pdf')), 'no PDF is precached');
    assert.equal(await page.locator('.offline-bar:not([hidden])').count(), 0, 'no notice on a first visit');
  });

  const titles = {};
  await step('online: open ' + ROUTES.join(', '), async () => {
    for (const hash of ROUTES) titles[hash] = await open(hash);
  });

  await step('online: slide player, foundation lesson and one PDF are opened once', async () => {
    const player = await context.newPage();
    await player.goto(base + 'slides/player.html?deck=' + encodeURIComponent(deck.id));
    await player.waitForFunction(() => document.body.innerText.trim().length > 20, null, { timeout: 20000 });
    await player.close();
    await openLesson();
    assert.equal(await page.evaluate(u => fetch(u).then(r => r.status), base + openedPdf), 200);
    await page.waitForFunction(async suffix => {
      for (const name of await caches.keys()) if (name.includes('|runtime|')) for (const r of await (await caches.open(name)).keys()) if (new URL(r.url).pathname.endsWith(suffix)) return true;
      return false;
    }, '/' + openedPdf, { timeout: 10000 });
    assert.ok(await runtimeHas('/slides/player.html'), 'the player page is in the runtime cache');
    assert.ok(await runtimeHas(`/slides/data/${deck.id}.json`), 'the deck is in the runtime cache');
    const beforeRange = await page.evaluate(u => fetch(u, { headers: { Range: 'bytes=0-9' } }).then(async r => [r.status, (await r.arrayBuffer()).byteLength]), base + unopenedPdf);
    assert.deepEqual(beforeRange, [206, 10], 'a Range request for an uncached file passes through');
    await new Promise(r => setTimeout(r, 300));
    assert.ok(!(await runtimeHas('/' + unopenedPdf)), 'a partial answer is never cached');
  });

  await step('offline: reload, every opened route renders, no failed module', async () => {
    down = true; await context.setOffline(true);
    problems.length = 0;
    await page.reload();
    await page.waitForSelector('#main', { timeout: 15000 });
    for (const hash of ROUTES) assert.equal(await open(hash), titles[hash], hash + ' shows the same heading offline');
    assert.deepEqual(problems, []);
    const badge = page.locator('.offline-bar[role="status"] .offline-offline');
    await badge.waitFor({ timeout: 5000 });
    assert.match(await badge.textContent(), /Hors connexion|Offline/);
  });

  await step('offline: a page never opened online renders and MathJax typesets its formulas', async () => {
    await open(UNOPENED);
    await page.waitForFunction(() => document.querySelectorAll('#main mjx-container svg').length > 0, null, { timeout: 20000 });
    assert.equal(await page.locator('#main mjx-container [data-mjx-error]').count(), 0);
    assert.deepEqual(problems, []);
  });

  await step('offline: slide player and foundation lesson opened before still work', async () => {
    const player = await context.newPage();
    const errors = [];
    player.on('pageerror', e => errors.push(e.message));
    player.on('requestfailed', r => { if (r.url().startsWith(base) && /\.(js|css|json)(\?|$)/.test(r.url())) errors.push('failed: ' + r.url()); });
    await player.goto(base + 'slides/player.html?deck=' + encodeURIComponent(deck.id));
    await player.waitForFunction(() => document.body.innerText.trim().length > 20, null, { timeout: 20000 });
    assert.deepEqual(errors, []);
    await player.close();
    await openLesson();
  });

  await step('offline: cached PDF (whole and by Range), unopened PDF, missing data', async () => {
    const expected = readFileSync(dist + openedPdf);
    const whole = await page.evaluate(u => fetch(u).then(async r => [r.status, (await r.arrayBuffer()).byteLength]), base + openedPdf);
    assert.deepEqual(whole, [200, expected.length]);
    const part = await page.evaluate(u => fetch(u, { headers: { Range: 'bytes=100-199' } }).then(async r => [r.status, r.headers.get('content-range'), [...new Uint8Array(await r.arrayBuffer())]]), base + openedPdf);
    assert.equal(part[0], 206);
    assert.equal(part[1], `bytes 100-199/${expected.length}`);
    assert.deepEqual(part[2], [...expected.subarray(100, 200)]);
    const tab = await context.newPage();
    const response = await tab.goto(base + unopenedPdf);
    assert.equal(response.status(), 503);
    assert.match(await tab.textContent('h1'), /Hors connexion/);
    await tab.close();
    const failed = await page.evaluate(u => fetch(u).then(() => false, () => true), base + 'resources/catalog.json?never-opened');
    assert.ok(failed, 'a fetch with no copy fails');
    await page.locator('.offline-bar .offline-miss').waitFor({ timeout: 5000 });
  });

  await step('update: notice appears, nothing changes until Recharger, then the new version controls the page', async () => {
    // Publish a new version: index.html changes, so the manifest inside sw.js changes.
    const index = Buffer.from(readFileSync(dist + 'index.html', 'utf8').replace('<title>', '<meta name="mx-test-version" content="2" /><title>'));
    const files = shell.files.map(([f, h]) => [f, f === 'index.html' ? crypto.createHash('sha1').update(index).digest('hex').slice(0, 10) : h]);
    const next = { ...shell, version: 'test' + shell.version.slice(4), files };
    overrides.set('index.html', index);
    overrides.set('sw.js', Buffer.from(readFileSync(dist + 'sw.js', 'utf8').replace(/^self\.__MX_SHELL = .*;$/m, 'self.__MX_SHELL = ' + JSON.stringify(next) + ';')));
    down = false; await context.setOffline(false);
    hits.length = 0;
    await page.goto(base + '#home');                              // a normal visit: the browser checks sw.js
    const notice = page.locator('.offline-bar[role="status"] .offline-update');
    await notice.waitFor({ timeout: 30000 });
    assert.match(await notice.textContent(), /Nouvelle version disponible|New version available/);
    assert.match(await notice.locator('.offline-reload').textContent(), /Recharger|Reload/);
    assert.equal((await workerVersion()).version, shell.version, 'the old version still controls the page');
    assert.equal(await page.locator('meta[name="mx-test-version"]').count(), 0, 'the running page is untouched');
    const fetched = hits.filter(h => h !== 'sw.js' && h !== 'index.html' && shell.files.some(([f]) => f === h));
    assert.deepEqual(fetched, [], 'unchanged shell files are copied from the old cache, not downloaded again');
    await open('#lab');                                           // still a working old version while the new one waits
    await Promise.all([page.waitForEvent('load', { timeout: 30000 }), notice.locator('.offline-reload').click()]);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller && !!document.querySelector('#main h1'), null, { timeout: 30000 });
    assert.equal((await workerVersion()).version, next.version, 'the new version controls the page');
    assert.equal(await page.locator('meta[name="mx-test-version"]').count(), 1, 'the new index.html is served');
    const shells = (await cacheNames()).filter(n => n.includes('|shell|'));
    assert.deepEqual(shells.map(n => n.split('|').pop()), [next.version], 'the old shell cache is deleted');
    assert.equal(await page.locator('.offline-bar .offline-update').count(), 0);
    down = true; await context.setOffline(true);
    await page.reload();
    await open('#automatismes');                                  // and the new version works offline
    assert.equal(await page.locator('meta[name="mx-test-version"]').count(), 1);
  });

  console.log(`offline browser test: all steps passed in ${((Date.now() - started) / 1000).toFixed(1)} s (shell ${shell.files.length} files, ${(shell.bytes / 1048576).toFixed(2)} MB)`);
} finally {
  await browser.close();
  server.closeAllConnections?.(); server.close();
}
