"""Laboratory v2 browser checks (Playwright, Chromium or Firefox). Run through `npm run test:browser` (tests/run_browser.py)
or alone against a running server: MATHS_EXPLORER_URL=http://localhost:4173 python tests/lab_browser.py

Smoothness acceptance of docs/LAB_DESIGN.md section 7: a drag adds or removes no element, the readouts follow, the camera
does not depend on the state, reduced motion plays no animation, 320 px wide has no horizontal scroll, both themes, keyboard.
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
# One mission per experiment that unlocks a handle, and the text the formula must stop showing once the handle moved.
DRAGS = ['quadratic/vertex', 'trig/quadrants', 'sequences/difference', 'derivative/where', 'integral/bound']
EXPERIMENTS = ['quadratic', 'trig', 'sequences', 'derivative', 'integral']

WATCH = """() => {
  window.__rec = {added: 0, removed: 0, text: 0};
  const host = document.querySelector('#lab2-host');
  window.__obs = new MutationObserver(rs => { for (const r of rs) if (r.type === 'childList') {
    for (const n of r.addedNodes) n.nodeType === 1 ? window.__rec.added++ : window.__rec.text++;
    for (const n of r.removedNodes) n.nodeType === 1 ? window.__rec.removed++ : window.__rec.text++; } });
  window.__obs.observe(host, {childList: true, subtree: true});
}"""

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'):
        options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    engine = os.environ.get('MATHS_EXPLORER_BROWSER', 'chromium')
    if engine == 'firefox' and os.environ.get('MOZ_DISABLE_CONTENT_SANDBOX') == '1':
        options['firefox_user_prefs'] = {'security.sandbox.content.level': 0}
    browser = getattr(p, engine).launch(**options)
    errors = []

    def new_page(width=1280, height=900, **kw):
        page = browser.new_context(viewport={'width': width, 'height': height}, **kw).new_page()
        page.on('pageerror', lambda e: errors.append(e.stack or str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        return page

    def ready(page, route):
        page.goto(BASE + '/#' + route)
        page.locator('.lab2-canvas').wait_for()
        page.wait_for_function("() => document.querySelector('.lab2-formula').textContent.length > 0")

    # ---- a drag adds or removes no element, in each experiment, in both themes
    for theme in ['jour', 'nuit']:
        page = new_page()
        for ref in DRAGS:
            ready(page, 'lab/' + ref)
            page.evaluate("t => document.documentElement.dataset.theme = t", theme)
            assert page.evaluate("() => { const c = document.querySelector('.lab2-canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }") > 500, ('the canvas is drawn', ref, theme)
            handle = page.locator('.lab2-handle').first
            box = handle.bounding_box()
            before = page.locator('.lab2-formula').inner_text()
            page.evaluate(WATCH)
            x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
            page.mouse.move(x, y); page.mouse.down()
            for i in range(1, 31):
                page.mouse.move(x + i * 4, y + (i % 7) * 3 - 10)
                page.wait_for_timeout(8)
            page.mouse.up()
            page.wait_for_timeout(450)   # the delayed screen-reader announcement must not add an element either
            rec = page.evaluate("() => window.__rec")
            assert rec == {'added': 0, 'removed': 0, 'text': 0}, ('a drag changes the tree', ref, theme, rec)
            assert page.locator('.lab2-formula').inner_text() != before or ref.endswith('where'), ('the readout follows the drag', ref)
            assert page.evaluate("() => window.__rec.added + window.__rec.removed") == 0
        page.context.close()

    # ---- no horizontal scroll from 320 px up, both themes, every experiment, first and last mission, index too
    for width in [320, 390, 768]:
        page = new_page(width, 720)
        for theme in ['jour', 'nuit']:
            page.goto(BASE + '/#lab'); page.locator('.lab2-card-link').first.wait_for()
            page.evaluate("t => document.documentElement.dataset.theme = t", theme)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), ('lab index', width, theme)
            for e in EXPERIMENTS:
                page.goto(BASE + '/#lab/' + e); page.locator('.lab2-canvas').wait_for()
                n = page.locator('.lab2-dot').count()
                for k in range(n):
                    page.evaluate("k => { const l = document.querySelector('.lab2').__lab; l.setMission(k); }", k)
                    page.wait_for_timeout(60)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), ('overflow', e, k, width, theme)
                    wide = page.evaluate("() => [...document.querySelectorAll('.lab2 *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => el.className).slice(0, 3)")
                    assert not wide, ('an element crosses the right edge', e, k, width, wide)
                    assert page.locator('.lab2-canvas').bounding_box()['height'] >= 0.5 * min(720, 900) - 10 or width > 720, ('the canvas keeps its height', e, width)
        page.context.close()

    # ---- keyboard: Tab reaches the handle, arrows move one grid step, N and P change missions, the address follows
    page = new_page()
    ready(page, 'lab/trig/quadrants')
    page.locator('.lab2-canvas').focus()
    page.keyboard.press('Tab')
    assert page.evaluate("document.activeElement.classList.contains('lab2-handle')"), 'Tab reaches the first handle'
    first = page.locator('.lab2-readout dd').first.inner_text()
    page.keyboard.press('ArrowRight')
    page.wait_for_function("f => document.querySelector('.lab2-readout dd').textContent !== f", arg=first)
    assert '35°' in page.locator('.lab2-readout dd').first.inner_text(), 'one grid step is 5 degrees'
    page.keyboard.press('Shift+ArrowRight')   # pans the camera, not the handle
    assert '35°' in page.locator('.lab2-readout dd').first.inner_text()
    page.keyboard.press('+')
    assert page.locator('.canvas-navigation').text_content() != '100 %', 'plus zooms'
    page.keyboard.press('0')
    assert page.locator('.canvas-navigation').text_content() == '100 %', 'zero resets the view'
    page.evaluate("() => document.querySelector('.lab2').__lab.setState({deg: 120})")
    page.wait_for_function("() => document.querySelector('.lab2-card').classList.contains('is-done')")
    page.locator('.lab2-nav .primary').focus()
    page.keyboard.press('Tab'); page.keyboard.press('Shift+Tab')
    page.locator('.lab2-prompt').focus()
    page.keyboard.press('n')
    assert page.evaluate('location.hash') == '#lab/trig/exact', 'N goes to the next mission and updates the address'
    page.keyboard.press('p')
    assert page.evaluate('location.hash') == '#lab/trig/quadrants'
    page.goto(BASE + '/#lab/trig/associated'); page.locator('.lab2-canvas').wait_for()
    assert page.locator('.lab2-step').inner_text().startswith('Mission 5') or '5/6' in page.locator('.lab2-step').inner_text(), 'a deep link opens that mission'
    page.context.close()

    # ---- the camera is independent of the state: zoom, then change the state, the zoom stays
    page = new_page()
    ready(page, 'lab/quadratic/vertex')
    page.locator('.lab2-canvas').hover()
    page.mouse.wheel(0, -300)
    page.wait_for_function("() => document.querySelector('.canvas-navigation').textContent !== '100 %'")
    zoom = page.locator('.canvas-navigation').text_content()
    page.evaluate("() => document.querySelector('.lab2').__lab.setState({b: -2, c: 1})")
    page.wait_for_timeout(100)
    assert page.locator('.canvas-navigation').text_content() == zoom, 'changing parameters never rescales'
    page.context.close()

    # ---- reduced motion: no animation; play advances one step per press. Otherwise play moves and pauses.
    page = new_page(reduced_motion='reduce')
    ready(page, 'lab/derivative/approach')
    start = page.evaluate("() => Math.abs(document.querySelector('.lab2').__lab.getState().h)")
    page.locator('.lab2-play').click()
    page.wait_for_timeout(300)
    step1 = page.evaluate("() => Math.abs(document.querySelector('.lab2').__lab.getState().h)")
    assert step1 < start, 'a press moves one step'
    page.wait_for_timeout(500)
    assert page.evaluate("() => Math.abs(document.querySelector('.lab2').__lab.getState().h)") == step1, 'no motion without a press under reduced motion'
    assert 'Pas suivant' in page.locator('.lab2-play').inner_text() or 'Next step' in page.locator('.lab2-play').inner_text()
    page.context.close()
    page = new_page()
    ready(page, 'lab/derivative/approach')
    page.locator('.lab2-play').click()
    page.wait_for_function("() => Math.abs(document.querySelector('.lab2').__lab.getState().h) < 0.5")
    page.locator('.lab2-play').click()
    page.wait_for_timeout(100)
    paused = page.evaluate("() => Math.abs(document.querySelector('.lab2').__lab.getState().h)")
    page.wait_for_timeout(400)
    assert page.evaluate("() => Math.abs(document.querySelector('.lab2').__lab.getState().h)") == paused, 'pause stops the motion'
    page.context.close()

    # ---- a slider, a choice and a contrast, with the real controls
    page = new_page()
    ready(page, 'lab/integral/finer')
    page.locator('#lab2-integral-n').fill('26')
    page.wait_for_function("() => document.querySelector('.lab2-card').classList.contains('is-done')")
    assert '25' in page.locator('.lab2-feedback').inner_text(), 'the goal message names n = 25'
    ready(page, 'lab/integral/heights')
    page.locator('.lab2-variant').nth(1).click()
    page.locator('.lab2-variant').nth(0).click()
    page.wait_for_function("() => document.querySelector('.lab2-card').classList.contains('is-done')")
    ready(page, 'lab/trig/exact')
    page.locator('.lab2-segment', has_text='cosine').click() if page.locator('.lab2-segment', has_text='cosine').count() else page.locator('.lab2-segment', has_text='cosinus').click()
    assert page.locator('[data-control="fn"] .lab2-segment.is-on').inner_text() in ['cosine', 'cosinus']
    page.context.close()

    # ---- phone: the card folds, the figure keeps at least 55 vh
    page = new_page(390, 800)
    ready(page, 'lab/quadratic/vertex')
    assert page.locator('.lab2-stage').bounding_box()['height'] >= 0.55 * 800 - 2, 'the canvas keeps at least 55 vh on a phone'
    page.locator('.lab2-fold').click()
    assert not page.locator('.lab2-controls').is_visible(), 'the folded card shows the prompt only'
    page.context.close()

    # ---- the Gallery redirect and a missing mission keep working
    page = new_page()
    page.goto(BASE + '/#lab/galton'); page.wait_for_selector('#object-stage canvas')
    assert page.evaluate('location.hash') == '#gallery/galton'
    page.goto(BASE + '/#lab/quadratic/not-a-mission'); page.locator('.lab2-canvas').wait_for()
    assert page.evaluate('location.hash') == '#lab/quadratic/open', 'an unknown mission opens the first one and corrects the address'
    page.context.close()

    browser.close()
    assert not errors, errors
print('lab browser checks passed')
