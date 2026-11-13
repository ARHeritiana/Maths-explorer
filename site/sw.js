/* Maths Explorer service worker: the application shell always starts, and what was opened stays available offline.
   Contract and limits: docs/OFFLINE.md. The build (build/mxbuild/offline.py) replaces the next line by the manifest of
   the shell: { version, bytes, files: [[path, sha1 of the content cut to 10 characters], ...] }. */
self.__MX_SHELL = null;

const SHELL = self.__MX_SHELL;
const SCOPE = new URL('./', self.location).href;                 // the folder of index.html
const SCOPE_PATH = new URL(SCOPE).pathname;
const PREFIX = 'mx|' + SCOPE_PATH + '|';                         // two editions may share one origin
const SHELL_PREFIX = PREFIX + 'shell|';
const SHELL_CACHE = SHELL_PREFIX + (SHELL ? SHELL.version : 'none');
const RUNTIME = PREFIX + 'runtime|1';
const META = SCOPE + '__mx-offline-index__';                     // sizes and dates of the runtime entries
const LIMITS = { entries: 400, bytes: 150 * 1024 * 1024, item: 40 * 1024 * 1024 };
const NETWORK_WAIT = 4000;                                       // ms before a cached copy answers a slow network
const FILES = new Map(SHELL ? SHELL.files : []);
const HASH10 = /^[0-9a-f]{10}$/;
const FRESH = /\.(html?|json|js|mjs|css)$/i;                     // network first; anything else: stale-while-revalidate

const subtle = self.crypto && self.crypto.subtle;
async function sha10(buffer) {
  if (!subtle) return null;
  const bytes = new Uint8Array(await subtle.digest('SHA-1', buffer));
  return [...bytes.slice(0, 5)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const kept = (headers, extra = {}) => {
  const out = { ...extra };
  for (const name of ['content-type', 'etag', 'last-modified']) { const v = headers.get(name); if (v) out[name] = v; }
  return out;
};

/* ---------------------------------------------------------------- install: the shell, verified, all or nothing */
async function shellEntry(path, hash, old) {
  for (const cache of old) {                                     // an unchanged file is copied, not downloaded again
    const hit = await cache.match(SCOPE + path);
    if (!hit) continue;
    const buffer = await hit.arrayBuffer();
    if (await sha10(buffer) === hash) return new Response(buffer, { headers: kept(hit.headers) });
  }
  const response = await fetch(SCOPE + path + '?v=' + hash, { cache: 'no-cache' });
  if (response.status !== 200) throw new Error('shell file ' + path + ': HTTP ' + response.status);
  const buffer = await response.arrayBuffer();
  const actual = await sha10(buffer);
  // A deployment in progress can serve a file of another version: refuse it, the next update check tries again.
  if (actual && actual !== hash) throw new Error('shell file ' + path + ' does not match the manifest');
  return new Response(buffer, { headers: kept(response.headers) });
}

async function install() {
  const cache = await caches.open(SHELL_CACHE);
  const done = new Set((await cache.keys()).map(r => r.url));    // an interrupted install of this version resumes
  const names = (await caches.keys()).filter(n => n.startsWith(SHELL_PREFIX) && n !== SHELL_CACHE);
  const old = await Promise.all(names.map(n => caches.open(n)));
  const todo = SHELL.files.filter(([path]) => !done.has(SCOPE + path));
  let next = 0;
  const worker = async () => {
    while (next < todo.length) {
      const [path, hash] = todo[next++];
      await cache.put(SCOPE + path, await shellEntry(path, hash, old));
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
}

if (SHELL) {
  // No skipWaiting here: a new version waits until the page asks for it (Reload in the notice) or every tab is closed.
  self.addEventListener('install', event => event.waitUntil(install()));
  self.addEventListener('activate', event => event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(SHELL_PREFIX) && name !== SHELL_CACHE) await caches.delete(name);
    await self.clients.claim();                                  // first visit: start caching what this page opens
  })()));
  self.addEventListener('fetch', onFetch);
} else {
  // Served without a build (no manifest): do nothing and go away.
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', event => event.waitUntil(self.registration.unregister()));
}

self.addEventListener('message', event => {
  const type = event.data && event.data.type;
  if (type === 'mx-skip-waiting') self.skipWaiting();
  if (type === 'mx-version' && event.ports[0]) event.ports[0].postMessage({ version: SHELL && SHELL.version, files: FILES.size, bytes: SHELL && SHELL.bytes, limits: LIMITS });
});

/* ---------------------------------------------------------------- runtime cache with a budget */
let meta = null, chain = Promise.resolve();
async function loadMeta(cache) {
  if (meta) return meta;
  const stored = await cache.match(META);
  let table = {};
  try { if (stored) table = await stored.json(); } catch { table = {}; }
  // Reconcile with the real entries (the worker may have been stopped between a put and the index write).
  const urls = new Set((await cache.keys()).map(r => r.url));
  for (const url of Object.keys(table)) if (!urls.has(url)) delete table[url];
  for (const url of urls) if (url !== META && !table[url]) await cache.delete(url);
  return meta = table;
}
async function trim(cache, table) {
  const order = Object.keys(table).sort((a, b) => table[a][1] - table[b][1]);   // oldest first
  let total = order.reduce((sum, url) => sum + table[url][0], 0), count = order.length;
  for (const url of order) {
    if (count <= LIMITS.entries && total <= LIMITS.bytes) break;
    await cache.delete(url); total -= table[url][0]; count--; delete table[url];
  }
}
function record(url, response, size) {
  chain = chain.then(async () => {
    const cache = await caches.open(RUNTIME), table = await loadMeta(cache);
    await cache.put(url, response);
    table[url] = [size, Date.now()];
    await trim(cache, table);
    await cache.put(META, new Response(JSON.stringify(table), { headers: { 'content-type': 'application/json' } }));
  }).catch(() => {});                                            // quota or storage error: the page already has its answer
  return chain;
}
const touch = url => { if (meta && meta[url]) meta[url][1] = Date.now(); };   // written with the next record

// Keep a copy of a complete, same-origin answer. Never a partial (206), opaque, redirected or error answer.
async function save(url, response, version) {
  if (response.status !== 200 || response.type !== 'basic') return;
  if (Number(response.headers.get('content-length') || 0) > LIMITS.item) return;
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > LIMITS.item) return;
  if (version && HASH10.test(version)) {
    const actual = await sha10(buffer);
    // The server now has another version of this file: do not keep it under the old address, look for the update.
    if (actual && actual !== version) { self.registration.update().catch(() => {}); return; }
  }
  await record(url, new Response(buffer, { headers: kept(response.headers) }), buffer.byteLength);
}
const keep = (event, url, response, version) => event.waitUntil(save(url, response.clone(), version).catch(() => {}));

async function cached(url) {
  const hit = await (await caches.open(RUNTIME)).match(url);
  if (hit) touch(url);
  return hit;
}

/* ---------------------------------------------------------------- answers */
function shellKey(path, url) {
  const file = path === '' ? 'index.html' : path, hash = FILES.get(file);
  if (!hash) return null;
  const v = url.searchParams.get('v');
  if (v && HASH10.test(v) && v !== hash) return null;            // a module of another version is never served from the shell
  return SCOPE + file;
}

const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('timeout')), ms);
  promise.then(v => { clearTimeout(timer); resolve(v); }, e => { clearTimeout(timer); reject(e); });
});

// Ask the server again, cheaply when a copy exists (conditional request: 304 means the copy is current).
async function revalidate(event, request, url, copy) {
  const headers = {};
  if (copy) {
    const etag = copy.headers.get('etag'), modified = copy.headers.get('last-modified');
    if (etag) headers['If-None-Match'] = etag; else if (modified) headers['If-Modified-Since'] = modified;
  }
  const conditional = Object.keys(headers).length > 0;
  let response = await fetch(conditional ? new Request(url.href, { headers }) : request);
  if (conditional && response.status === 304) { touch(url.href); return copy; }
  if (conditional && response.redirected) response = new Response(response.body, { status: response.status, headers: response.headers });
  if (response.status === 200) keep(event, url.href, response);
  return response;
}

const OFFLINE_PAGE = back => `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hors connexion · Offline</title>
<style>body{font:1.1rem/1.6 system-ui,sans-serif;margin:0;padding:2rem;max-width:40rem;color:#000;background:#fff}@media(prefers-color-scheme:dark){body{color:#fff;background:#0a0a0a}a{color:#fff}}a{color:#000}</style>
<main><h1>Hors connexion</h1>
<p>Ce document n’a pas encore été ouvert sur cet appareil : il n’est pas disponible sans connexion. Les pages et les documents déjà ouverts le restent.</p>
<p lang="en">Offline: this document has not been opened on this device yet, so it is not available without a connection. Pages and documents you already opened remain available.</p>
<p><a href="${back}">Retour à Maths Explorer · Back to Maths Explorer</a></p></main></html>`;

// Nothing in the network, nothing in the caches.
async function miss(event, request, path) {
  if (request.mode === 'navigate') {
    // An address of the application itself (hash routes live in index.html): start the shell.
    if (!path.includes('/') && (!path.includes('.') || /\.html?$/i.test(path))) {
      const shell = await caches.match(SCOPE + 'index.html', { cacheName: SHELL_CACHE });
      if (shell) return shell;
    }
    return new Response(OFFLINE_PAGE(SCOPE), { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  event.waitUntil((async () => {
    const client = event.clientId && await self.clients.get(event.clientId);
    if (client) client.postMessage({ type: 'mx-offline-miss', url: request.url });
  })());
  return Response.error();
}

// A Range request (PDF viewers, media): answered from a complete cached copy, else passed to the network, never cached.
async function ranged(request, url, key) {
  const full = key ? await caches.match(key, { cacheName: SHELL_CACHE }) : await cached(url.href);
  if (!full) return fetch(request);
  const buffer = await full.arrayBuffer(), size = buffer.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range').trim());
  const type = { 'content-type': full.headers.get('content-type') || 'application/octet-stream', 'accept-ranges': 'bytes' };
  if (!m || (m[1] === '' && m[2] === '')) return new Response(buffer, { headers: type });   // several ranges: the whole file is a valid answer
  let start, end;
  if (m[1] === '') { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'content-range': 'bytes */' + size } });
  return new Response(buffer.slice(start, end + 1), { status: 206, headers: { ...type, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': String(end - start + 1) } });
}

async function respond(event, request, url) {
  let path = url.pathname.slice(SCOPE_PATH.length);
  try { path = decodeURIComponent(path); } catch { /* keep the raw path */ }
  const key = shellKey(path, url);
  if (request.headers.has('range')) return ranged(request, url, key);

  // 1. The shell: always from the cache of this version, so a page never mixes modules of two versions.
  if (key) {
    const hit = await caches.match(key, { cacheName: SHELL_CACHE });
    if (hit) return hit;
  }
  const version = url.searchParams.get('v');
  try {
    // 2. An address that names its version never changes: cache first.
    if (version) {
      const hit = await cached(url.href);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.status === 200) keep(event, url.href, response, version);
      return response;
    }
    const copy = await cached(url.href);
    // 3. Pages, data and scripts without a version: the network when it answers in time, else the copy.
    if (request.mode === 'navigate' || FRESH.test(path)) {
      if (!copy) return await revalidate(event, request, url, null);
      try {
        const response = await withTimeout(revalidate(event, request, url, copy), NETWORK_WAIT);
        return response.status >= 500 ? copy : response;
      } catch { return copy; }
    }
    // 4. Images, figures, unversioned documents: the copy at once, refreshed behind for the next time.
    if (copy) { event.waitUntil(revalidate(event, request, url, copy).catch(() => {})); return copy; }
    return await revalidate(event, request, url, null);
  } catch {
    return miss(event, request, path);
  }
}

function onFetch(event) {
  const request = event.request;
  if (request.method !== 'GET') return;                          // never a form post, never a write
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;   // never another origin
  if (url.pathname === SCOPE_PATH + 'sw.js') return;
  event.respondWith(respond(event, request, url));
}
