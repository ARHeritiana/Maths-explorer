"""Browser checks of the two generator pages (#automatismes, #sheets), for every class of the French curriculum:
 - every question and answer is typeset by MathJax with no error box (mjx-merror) and no raw TeX left on the page;
 - several series per class (the seed arrows), the three kinds of sheet, with the marking scheme;
 - the projection stage steps through the questions, reveals answers and gives the page back when full screen ends;
 - nothing overflows at 390 px;
 - no page error.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/generators_browser.py"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
CLASSES = ['seconde', 'premiere', 'terminale', 'expertes', 'stmg']
SERIES = int(os.environ.get('GEN_SERIES', '3'))

SET_FIELD = """([name, value]) => { const f = document.querySelector('#gen-form'); const els = [...f.querySelectorAll(`[name="${name}"]`)];
  if (!els.length) return false; const el = els.find(e => e.type === 'radio' ? e.value === value : true);
  if (el.type === 'radio' || el.type === 'checkbox') { el.checked = value !== false; } else { el.value = value; }
  el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; }"""
MATH_STATE = """root => { const r = document.querySelector(root); if (!r) return { missing: true };
  const text = r.innerText; return { errors: r.querySelectorAll('mjx-merror, [data-mjx-error]').length,
  raw: (text.match(/\\\\\\(|\\\\\\)|\\\\(frac|dfrac|times|leqslant|geqslant|sqrt|left|right)\\b/g) || []).length,
  math: r.querySelectorAll('mjx-container').length, sample: text.slice(0, 120) }; }"""

def settle(page, root):
    page.wait_for_function("""root => { const r = document.querySelector(root); return r && r.querySelectorAll('mjx-container').length > 0; }""", arg=root, timeout=20000)
    page.wait_for_timeout(250)

def check_math(page, root, where):
    st = page.evaluate(MATH_STATE, root)
    assert not st.get('missing'), (where, 'no', root)
    assert st['errors'] == 0, (where, 'MathJax error boxes', st)
    assert st['raw'] == 0, (where, 'raw TeX left on the page', st)
    return st['math']

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.on('pageerror', lambda e: errors.append(str(e)))
    checked = 0

    # ---- automatismes: answers list (questions and answers) for several series of every class
    page.goto(f'{BASE}/#automatismes'); page.wait_for_selector('#gen-form')
    page.locator('.advanced-settings > summary').click()
    for cls in CLASSES:
        assert page.evaluate(SET_FIELD, ['cls', cls]), ('no class control', cls)
        page.evaluate(SET_FIELD, ['count', '20'])
        for k in range(SERIES):
            page.evaluate("() => { const d = document.querySelector('details.gen-answers'); if (d) d.open = true; }")
            settle(page, '#gen-list')
            n = page.locator('#gen-list > li').count(); assert n >= 10, (cls, 'too few questions', n)
            checked += check_math(page, '#gen-list', f'automatismes {cls} series {k}')
            page.click('#gen-new'); page.wait_for_timeout(300)
        # projection stage: next and reveal
        page.click('[data-act="project"]'); page.wait_for_timeout(1200)   # full screen transition
        first = page.inner_text('#st-q'); page.keyboard.press('ArrowRight'); page.wait_for_timeout(300)
        assert page.inner_text('#st-q') != first, (cls, 'the stage does not step to the next question')
        page.keyboard.press('a'); page.wait_for_timeout(500)
        assert page.inner_text('#st-a').strip(), (cls, 'the answer is not revealed')
        # leaving full screen the browser's way (it keeps Escape for itself) must give the page back
        page.evaluate('document.fullscreenElement && document.exitFullscreen()'); page.wait_for_timeout(600)
        assert page.evaluate("getComputedStyle(document.querySelector('#auto-stage')).position") != 'fixed', (cls, 'the stage still covers the page after full screen ends')

    # ---- sheets: the three kinds, marking scheme on, every class, several series
    page.goto(f'{BASE}/#sheets'); page.wait_for_selector('#gen-form')
    page.locator('.advanced-settings > summary').click()
    for cls in CLASSES:
        page.evaluate(SET_FIELD, ['cls', cls])
        for kind in ['sheet', 'interro', 'devoir']:
            page.evaluate(SET_FIELD, ['kind', kind]); page.evaluate(SET_FIELD, ['bareme', True])
            for k in range(SERIES):
                settle(page, '#gen-preview')
                checked += check_math(page, '#gen-preview', f'sheets {cls} {kind} series {k}')
                page.click('#gen-next'); page.wait_for_timeout(300)

    # ---- phone width: no horizontal overflow on either page
    phone = browser.new_page(viewport={'width': 390, 'height': 800}); phone.on('pageerror', lambda e: errors.append(str(e)))
    for route, root in [('automatismes', '#gen-form'), ('sheets', '#gen-preview')]:
        phone.goto(f'{BASE}/#{route}'); phone.wait_for_selector(root); phone.wait_for_timeout(800)
        over = phone.evaluate('() => document.documentElement.scrollWidth - window.innerWidth')
        assert over <= 1, (route, 'horizontal overflow at 390 px', over)

    assert not errors, errors
    print(f'generators browser checks passed ({checked} typeset formulas, {len(CLASSES)} classes, {SERIES} series each)')
    browser.close()
