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
            pg.goto(f'http://127.0.0.1:{port}/slides/player.html?deck={d["id"]}&lang={lang}#0'); pg.wait_for_selector('#r1')
            for i in range(d['slides']):
                pg.evaluate(f'location.hash="#{i}"'); pg.wait_for_function(f'document.querySelector(".count")?.textContent.startsWith("{i+1} /")')
                pg.wait_for_timeout(60)
                pg.evaluate('document.querySelector("#all-steps")?.click()')   # reveal every step so the whole slide is checked
                CHECK = '''() => {
                  const st = document.querySelector('#stage'), out = [];
                  if (st.querySelector('[data-mml-node="mtext"][fill="red"]')) out.push('undefined macro (red text) in maths');
                  if (st.querySelector('mjx-merror,[data-mjx-error]')) out.push('mathjax error: ' + (st.querySelector('mjx-merror,[data-mjx-error]').textContent||'').slice(0,80));
                  const shown = (st.querySelector('#col')?.innerText || '') + ' ' + (st.querySelector('#rt')?.innerText || '');
                  if (/\\\\\\(|\\\\\\)|\\\\\\[|\\\\[a-z]{3,}/.test(shown)) out.push('raw TeX: ' + (shown.match(/\\\\[a-zA-Z]+|\\\\\\(/)||[''])[0]);
                  if (/[²³₀-₉⁰¹⁴-⁹ⁿˣ≤≥≠−×]/.test(shown.replace(/[\u2212]/g,''))) out.push('Unicode maths outside TeX: ' + (shown.match(/.{0,12}[²³₀-₉⁰¹⁴-⁹ⁿˣ≤≥≠×].{0,6}/)||[''])[0]);
                  if (st.querySelector('#readout') && st.querySelector('#readout').textContent.trim() && !st.querySelector('#readout mjx-container')) out.push('readout without typeset maths');
                  const flow = st.querySelector('#flow');
                  if (!flow || flow.innerText.trim().length < 3) out.push('empty');
                  else { if (flow.scrollWidth > flow.clientWidth + 2) out.push('text wider than the column ' + (flow.scrollWidth - flow.clientWidth));
                    const wide = [...flow.querySelectorAll('mjx-container[display="true"]')].find(m => m.scrollWidth > m.clientWidth + 2);
                    if (wide) out.push('equation wider than the column ' + (wide.scrollWidth - wide.clientWidth)); }
                  if (st.scrollWidth > st.clientWidth + 2 || st.scrollHeight > st.clientHeight + 2) out.push('stage overflow');
                  if (st.querySelector('#dl,#lng')) out.push('redundant player action');
                  return out; }'''
                bad = pg.evaluate(CHECK)
                for x in bad: errors.append(f'{d["id"]} {lang} #{i}: {x}')
                if pg.query_selector('canvas'):
                    box = pg.query_selector('canvas').bounding_box()
                    if not box: continue   # the figure gave way to a wide equation
                    pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2); pg.mouse.down(); pg.mouse.move(box['x'] + box['width'] / 2 + 40, box['y'] + box['height'] / 2 + 30); pg.mouse.up()
                    pg.wait_for_timeout(250)
                    for y in pg.evaluate(CHECK):
                        if y not in bad: errors.append(f'{d["id"]} {lang} #{i} after drag: {y}')
    b.close()
errors += ['console: ' + l for l in dict.fromkeys(logs)]
print('\n'.join(errors[:80]) or 'slides OK')
print(len(errors), 'problems')
sys.exit(1 if errors else 0)
