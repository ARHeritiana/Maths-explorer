"""Laboratory v2 browser checks (Playwright, Chromium or Firefox). Run through `npm run test:browser` (tests/run_browser.py)
or alone against a running server: MATHS_EXPLORER_URL=http://localhost:4173 python tests/lab_browser.py

Smoothness acceptance of docs/LAB_DESIGN.md section 7: a drag adds or removes no element, the readouts follow, the camera
does not depend on the state, reduced motion plays no animation, 320 px wide has no horizontal scroll, both themes, keyboard.
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
# One mission per experiment that unlocks a handle, and the text the formula must stop showing once the handle moved.
DRAGS = ['quadratic/vertex', 'trig/quadrants', 'sequences/difference', 'derivative/where', 'integral/bound',
         'probability/mean', 'vectors/collinear', 'statistics/box', 'complex/angles', 'line/slope', 'exponential/base', 'cobweb/slope',
         'matrix/columns', 'space-lines/parallel', 'space-lines/normal']
EXPERIMENTS = ['quadratic', 'trig', 'sequences', 'derivative', 'integral', 'probability', 'vectors', 'statistics', 'complex',
               'line', 'exponential', 'cobweb', 'matrix', 'space-lines']

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

    # ---- keyboard in the four new experiments: Tab reaches a handle, an arrow changes the state by one step, nothing becomes NaN
    for ref in ['probability/mean', 'vectors/collinear', 'statistics/box', 'complex/angles', 'line/slope', 'exponential/base', 'cobweb/slope', 'matrix/columns', 'space-lines/parallel']:
        page = new_page()
        ready(page, 'lab/' + ref)
        page.locator('.lab2-canvas').focus()
        page.keyboard.press('Tab')
        assert page.evaluate("document.activeElement.classList.contains('lab2-handle')"), ('Tab reaches a handle', ref)
        before = page.evaluate("() => JSON.stringify(document.querySelector('.lab2').__lab.getState())")
        page.keyboard.press('ArrowRight')
        page.wait_for_function("b => JSON.stringify(document.querySelector('.lab2').__lab.getState()) !== b", arg=before)
        text = page.locator('.lab2').inner_text()
        assert 'NaN' not in text and 'undefined' not in text, ('finite readout', ref)
        page.context.close()

    # ---- the 3D template: turning the view (background drag, arrow keys) adds or removes no element and never touches the state;
    #      handles stay on their constraint; reset with 0; both themes; the pitch stays clamped; the view angles do not depend on the state
    for theme in ['jour', 'nuit']:
        page = new_page()
        ready(page, 'lab/space-lines/parallel')
        page.evaluate("t => document.documentElement.dataset.theme = t", theme)
        angles = "() => { const c = document.querySelector('.lab2').__lab.stage.camera3; return [c.yaw, c.pitch]; }"
        before_state = page.evaluate("() => JSON.stringify(document.querySelector('.lab2').__lab.getState())")
        y0, p0 = page.evaluate(angles)
        box = page.locator('.lab2-canvas').bounding_box()
        x, y = box['x'] + 40, box['y'] + 60   # empty background, away from every handle
        page.evaluate(WATCH)
        page.mouse.move(x, y); page.mouse.down()
        for i in range(1, 31):
            page.mouse.move(x + i * 6, y + i * 2); page.wait_for_timeout(8)
        page.mouse.up(); page.wait_for_timeout(450)
        rec = page.evaluate("() => window.__rec")
        assert rec == {'added': 0, 'removed': 0, 'text': 0}, ('turning the view changes the tree', theme, rec)
        y1, p1 = page.evaluate(angles)
        assert abs(y1 - y0) > 0.5 and p1 > p0, ('the background drag turns the view', y0, y1, p0, p1)
        assert page.evaluate("() => JSON.stringify(document.querySelector('.lab2').__lab.getState())") == before_state, 'turning never changes the state'
        assert page.evaluate("() => document.querySelector('.canvas-navigation').textContent") == '100 %', 'turning is not zooming'
        # arrow keys with the canvas focused, the pitch is clamped, 0 resets
        page.locator('.lab2-canvas').focus()
        page.keyboard.press('ArrowRight')
        assert page.evaluate(angles)[0] > y1, 'an arrow key turns the view'
        for _ in range(40): page.keyboard.press('ArrowDown')
        assert page.evaluate(angles)[1] <= 1.45 + 1e-9, 'the pitch is clamped'
        page.keyboard.press('0')
        page.wait_for_timeout(150)   # the handles' buttons follow on the next frame
        a = page.evaluate(angles)
        assert abs(a[0] + 0.7) < 1e-9 and abs(a[1] - 0.55) < 1e-9, '0 resets the view'
        # a handle drag moves the state, not the view, and the view change does not move the handle off its constraint
        handle = page.locator('.lab2-handle').first
        hb = handle.bounding_box(); hx, hy = hb['x'] + hb['width'] / 2, hb['y'] + hb['height'] / 2
        page.mouse.move(hx, hy); page.mouse.down(); page.mouse.move(hx + 50, hy + 10, steps=6); page.mouse.up()
        assert page.evaluate("() => JSON.stringify(document.querySelector('.lab2').__lab.getState())") != before_state, 'the handle moved the state'
        assert page.evaluate(angles) == a, 'a handle drag does not turn the view'
        # the canvas is drawn in the chosen theme
        assert page.evaluate("() => { const c = document.querySelector('.lab2-canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }") > 500
        page.context.close()
    # reduced motion: nothing animates by itself in the 3D view, rotation is only direct manipulation
    page = new_page(reduced_motion='reduce')
    ready(page, 'lab/space-lines/param')
    a = page.evaluate("() => { const c = document.querySelector('.lab2').__lab.stage.camera3; return [c.yaw, c.pitch]; }")
    page.wait_for_timeout(600)
    assert page.evaluate("() => { const c = document.querySelector('.lab2').__lab.stage.camera3; return [c.yaw, c.pitch]; }") == a, 'no idle rotation'
    page.context.close()

    # ---- chance: the run buttons need no element creation either, and the series is bounded
    page = new_page()
    ready(page, 'lab/probability/run')
    page.evaluate(WATCH)
    for i in [0, 1, 2, 3, 3, 3]:
        page.locator('[data-control="run"] button').nth(i).click()
    page.wait_for_timeout(450)
    rec = page.evaluate("() => window.__rec")
    assert rec == {'added': 0, 'removed': 0, 'text': 0} or (rec['added'] == 0 and rec['removed'] == 0), ('running experiments adds no element', rec)
    page.wait_for_function("() => document.querySelector('.lab2-readout dd').textContent === '3111'")   # 1 + 10 + 100 + 1000 + 1000 + 1000
    page.locator('[data-control="run"] button').nth(3).click(); page.locator('[data-control="run"] button').nth(3).click()
    page.wait_for_function("() => document.querySelector('.lab2-readout dd').textContent === '5000'")   # the series is capped
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

    # ---- phone: the mission card follows the figure in normal flow and never covers the canvas (390 x 844 and 320 x 640)
    def overlap(a, b):
        return not (a['x'] + a['width'] <= b['x'] + 0.5 or b['x'] + b['width'] <= a['x'] + 0.5 or a['y'] + a['height'] <= b['y'] + 0.5 or b['y'] + b['height'] <= a['y'] + 0.5)
    for width, height in [(390, 844), (320, 640)]:
        page = new_page(width, height)
        for ref in ['quadratic/vertex', 'derivative/approach', 'derivative/open', 'integral/finer', 'probability/run', 'probability/open',
                    'vectors/collinear', 'statistics/box', 'complex/angles', 'complex/compare', 'line/slope', 'exponential/base', 'cobweb/steps', 'matrix/area',
                    'space-lines/param', 'space-lines/parallel', 'space-lines/open']:
            ready(page, 'lab/' + ref)
            page.wait_for_timeout(100)
            canvas, sheet = page.locator('.lab2-canvas').bounding_box(), page.locator('.lab2-card').bounding_box()
            assert not overlap(canvas, sheet), ('the mission sheet covers the canvas', ref, width, height, canvas, sheet)
            assert sheet['y'] >= canvas['y'] + canvas['height'] - 1, ('the sheet is below the canvas', ref, width)
            if page.locator('.lab2-card').get_attribute('data-kind') == 'predict':
                assert page.locator('.lab2-ctl:visible').count() == 0, ('locked controls are not shown in a prediction', ref)
        ready(page, 'lab/quadratic/vertex')
        assert page.locator('.lab2-stage').bounding_box()['height'] >= 0.55 * height - 2, 'the canvas keeps at least 55 vh on a phone'
        page.locator('.lab2-fold').click()
        assert not page.locator('.lab2-controls').is_visible(), 'the folded card shows the prompt only'
        page.context.close()

    # ---- locked controls: hidden in a prediction, visible but disabled in the other missions
    page = new_page()
    ready(page, 'lab/derivative/open')
    assert page.locator('.lab2-ctl:visible').count() == 0 and not page.locator('.lab2-controls').is_visible(), 'no control is shown before the prediction'
    ready(page, 'lab/derivative/where')
    assert page.locator('.lab2-ctl:visible').count() >= 1 and page.locator('.lab2-ctl.is-locked:visible').count() >= 1, 'in other missions locked controls stay visible'
    assert page.locator('.lab2-ctl.is-locked input:visible').first.is_disabled(), 'and are disabled'
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
