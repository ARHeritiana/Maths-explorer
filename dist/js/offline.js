// Offline support, page side: registers the service worker (sw.js beside index.html), shows the "offline" badge, the
// "new version" notice and the "not available offline" message. Inert under file://, in Node and in jsdom.
// Contract: docs/OFFLINE.md.

const TEXT = {
  offline: ['Hors connexion', 'Offline'],
  offlineHint: ['Les pages déjà ouvertes restent disponibles.', 'Pages you already opened remain available.'],
  update: ['Nouvelle version disponible', 'New version available'],
  reload: ['Recharger', 'Reload'],
  later: ['Plus tard', 'Later'],
  miss: ['Hors connexion : ce contenu n’a pas encore été ouvert sur cet appareil.', 'Offline: this content has not been opened on this device yet.'],
};

// Pure: what the status bar says for a state { online, update, miss } in a language ('fr' or anything else: English).
export function offlineNotice({ online = true, update = false, miss = false } = {}, lang = 'fr') {
  const t = pair => pair[lang === 'fr' ? 0 : 1];
  const parts = [];
  if (!online) parts.push({ kind: 'offline', text: t(TEXT.offline), title: t(TEXT.offlineHint) });
  if (miss) parts.push({ kind: 'miss', text: t(TEXT.miss) });
  if (update) parts.push({ kind: 'update', text: t(TEXT.update), action: t(TEXT.reload), dismiss: t(TEXT.later) });
  return parts;
}

// Pure: may this environment register a service worker?
export function canRegister(env = globalThis) {
  try {
    const { location, navigator } = env;
    return !!location && /^https?:$/.test(location.protocol) && !!navigator && 'serviceWorker' in navigator && !!navigator.serviceWorker;
  } catch { return false; }
}

const SWITCH = 'mx-offline';   // localStorage: 'off' disables the worker on this device (index.html?offline=off / =on)

export function installOffline(env = globalThis) {
  const { document, navigator, location } = env;
  if (!document?.body || !navigator || typeof env.addEventListener !== 'function') return null;
  const state = { online: navigator.onLine !== false, update: false, miss: false };
  let registration = null, bar = null, missTimer = 0;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'fr');

  const paint = () => {
    const parts = offlineNotice(state, lang());
    if (!bar) {
      if (!parts.length) return;
      bar = document.createElement('div');
      bar.className = 'offline-bar'; bar.setAttribute('role', 'status'); bar.setAttribute('aria-live', 'polite');
      document.body.append(bar);
    }
    bar.hidden = !parts.length;
    bar.replaceChildren(...parts.map(part => {
      const item = document.createElement('span');
      item.className = 'offline-item offline-' + part.kind;
      const label = document.createElement('span');
      label.textContent = part.text; if (part.title) item.title = part.title;
      item.append(label);
      if (part.action) {
        const go = document.createElement('button');
        go.type = 'button'; go.className = 'offline-reload'; go.textContent = part.action; go.addEventListener('click', applyUpdate);
        const no = document.createElement('button');
        no.type = 'button'; no.className = 'offline-later'; no.textContent = part.dismiss;
        no.addEventListener('click', () => { state.update = false; paint(); });
        item.append(go, no);
      }
      return item;
    }));
  };

  env.addEventListener('online', () => { state.online = true; state.miss = false; paint(); registration?.update().catch(() => {}); });
  env.addEventListener('offline', () => { state.online = false; paint(); });
  paint();
  if (!canRegister(env)) return { state, paint };

  const sw = navigator.serviceWorker;
  // Kill switch for debugging and support: index.html?offline=off removes the worker and its caches on this device.
  try {
    const wish = new URLSearchParams(location.search).get('offline');
    if (wish === 'off' || wish === 'on') env.localStorage?.setItem(SWITCH, wish);
    if (env.localStorage?.getItem(SWITCH) === 'off') {
      const scope = new URL('./', location.href);
      sw.getRegistration(scope.href).then(r => r?.unregister()).catch(() => {});
      env.caches?.keys().then(names => names.filter(n => n.startsWith('mx|' + scope.pathname + '|')).forEach(n => env.caches.delete(n))).catch(() => {});
      return { state, paint };
    }
  } catch { /* storage blocked: carry on */ }

  // The new worker takes over only when the user asks (or when every tab is closed). Then every open tab reloads,
  // so no page keeps running old modules against the new cache.
  let controlled = !!sw.controller, reloading = false;
  const reload = () => { if (!reloading) { reloading = true; location.reload(); } };
  function applyUpdate() {
    const waiting = registration?.waiting;
    if (!waiting) return reload();
    waiting.postMessage({ type: 'mx-skip-waiting' });
    env.setTimeout(reload, 4000);                               // the worker did not answer: a plain reload
  }
  sw.addEventListener('controllerchange', () => {
    if (!controlled) { controlled = true; return; }             // first visit: the worker starts serving this page
    reload();
  });
  sw.addEventListener('message', event => {
    if (event.data?.type !== 'mx-offline-miss') return;
    state.miss = true; paint();
    env.clearTimeout(missTimer); missTimer = env.setTimeout(() => { state.miss = false; paint(); }, 8000);
  });

  const announce = () => { if (registration?.waiting && sw.controller) { state.update = true; paint(); } };
  const watch = worker => worker?.addEventListener('statechange', () => { if (worker.state === 'installed') announce(); });
  sw.register('./sw.js', { scope: './' }).then(reg => {
    registration = reg;
    announce(); watch(reg.installing);
    reg.addEventListener('updatefound', () => watch(reg.installing));
    // A tab left open for days still learns about a new version: check when it comes back, at most once an hour.
    let checked = Date.now();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible' || Date.now() - checked < 3600e3) return;
      checked = Date.now(); reg.update().catch(() => {});
    });
  }).catch(() => { /* private mode, blocked storage: the site works without the worker */ });
  return { state, paint };
}
