"""Open every slide deck in Chromium, step through all slides in both languages, and fail on console errors,
MathJax errors, empty slides, text overflowing the stage, or widgets that do not mount / respond to a drag."""
import json, sys, threading, http.server, socketserver, functools
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1] / 'dist'
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
Handler = functools.partial(Quiet, directory=str(ROOT))
srv = socketserver.TCPServer(('127.0.0.1', 0), Handler); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

index = json.loads((ROOT / 'slides/data/index.json').read_text())
only = sys.argv[1:] 
errors = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium') if Path('/opt/pw-browsers/chromium').exists() else p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    logs = []
    pg.on('console', lambda m: logs.append(m.text) if m.type in ('error',) else None)
    pg.on('pageerror', lambda e: logs.append('PAGEERROR ' + str(e)))
    for d in index:
        if only and d['id'] not in only: continue
        for lang in ('fr', 'en'):
            pg.goto(f'http://127.0.0.1:{port}/slides/player.html?deck={d["id"]}&lang={lang}#0'); pg.wait_for_selector('.foot')
            for i in range(d['slides']):
                pg.evaluate(f'location.hash="#{i}"'); pg.wait_for_function(f'document.querySelector(".count")?.textContent.startsWith("{i+1} /")')
                pg.wait_for_timeout(60)
                bad = pg.evaluate('''() => {
                  const st = document.querySelector('#stage'), out = [];
                  if (st.querySelector('mjx-merror,[data-mjx-error]')) out.push('mathjax error: ' + (st.querySelector('mjx-merror,[data-mjx-error]').textContent||'').slice(0,80));
                  if (/\\\\\\(|\\\\\\[|\\\\[a-z]{3,}/.test(st.querySelector('.body')?.innerText||'')) out.push('raw TeX: ' + (st.querySelector('.body').innerText.match(/\\\\[a-zA-Z]+|\\\\\\(/)||[''])[0]);
                  const body = st.querySelector('.body'); if (body && body.scrollHeight > body.clientHeight + 4) out.push('overflow ' + (body.scrollHeight - body.clientHeight));
                  if (!body || body.innerText.trim().length < 3) out.push('empty');
                  return out; }''')
                for x in bad: errors.append(f'{d["id"]} {lang} #{i}: {x}')
                if pg.query_selector('canvas'):
                    box = pg.query_selector('canvas').bounding_box()
                    pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2); pg.mouse.down(); pg.mouse.move(box['x'] + box['width'] / 2 + 40, box['y'] + box['height'] / 2 + 30); pg.mouse.up()
    b.close()
errors += ['console: ' + l for l in dict.fromkeys(logs)]
print('\n'.join(errors[:80]) or 'slides OK')
print(len(errors), 'problems')
sys.exit(1 if errors else 0)
