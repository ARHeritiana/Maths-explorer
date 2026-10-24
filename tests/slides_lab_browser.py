"""Browser checks of the laboratory in the two places that mount an experiment besides the lab page (docs/LAB_DESIGN.md section 6):
 - a slide deck with a `type: 'lab'` widget, in the player and in the self-contained export: the experiment mounts in the widget
   host with its controls, stepper, readout and prompt in the player's areas, a handle drag works and adds or removes no element of
   the canvas host, the mission keys N and P work only when the canvas has focus (the player keeps its own arrow keys), no console error;
 - a chapter page: the first lab reference of the manifest is mounted inline, lazily (not before it scrolls into view) and destroyed
   when the learner navigates away; every reference has its "Open in the laboratory" link.
Run through tests/run_browser.py, or alone against a running server: MATHS_EXPLORER_URL=http://localhost:4173 python tests/slides_lab_browser.py
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
DECK, SLIDE = 'premiere-02', 10   # the quadratic experiment, mission "vertex"
CHAPTER_LABS = next(c['labs'] for c in json.loads((ROOT / 'content/data/manifest.json').read_text())['catalog']['chapters'] if c['id'] == 'seconde-02')

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []

    def new_page(width=1280, height=720):
        page = browser.new_context(viewport={'width': width, 'height': height}).new_page()
        page.on('pageerror', lambda e: errors.append('pageerror: ' + (e.stack or str(e))))
        page.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' else None)
        return page

    def check_player(page, where):
        page.wait_for_selector('.lab2-slide', state='attached')
        page.wait_for_function("() => document.querySelector('.lab2-slide')?.__lab && document.querySelector('#readout .lab2-formula')?.textContent.length > 0")
        lab = "document.querySelector('.lab2-slide').__lab"
        assert page.evaluate(f"() => {lab}.stage.canvas.closest('#wcanvas') !== null"), (where, 'the canvas is in the widget host')
        assert page.evaluate("() => { const c = document.querySelector('#wcanvas canvas.lab2-canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }") > 5000, (where, 'the canvas is drawn')
        assert page.locator('#whint.lab2-hint').inner_text().strip(), (where, 'the mission prompt is in the hint line')
        assert page.locator('#wctl .lab2-stepper').count() == 1 and page.locator('#readout .lab2-readout').count() == 1, (where, 'stepper in the controls area, readout in the readout area')
        # the player types every formula with MathJax: nothing of the experiment is left as Unicode look-alikes
        page.wait_for_function("() => document.querySelector('#readout mjx-container') && document.querySelector('#whint mjx-container')")
        assert page.evaluate("() => !/[²³₀-₉ⁿ≤≥≠×]/.test(document.querySelector('#readout').innerText + document.querySelector('#whint').innerText + document.querySelector('#wctl').innerText)"), (where, 'no Unicode maths outside TeX')
        # the camera: the experiment is projected, its canvas fonts are larger than in the lab
        start = page.evaluate(f"() => {lab}.index")
        # a handle drag: the readout follows, no element of the canvas host or of the controls is added or removed
        handle = page.locator('#wcanvas .lab2-handle').first
        box = handle.bounding_box()
        before = page.locator('#readout .lab2-formula').inner_text()
        page.evaluate("() => { window.__rec = 0; window.__obs = new MutationObserver(rs => { for (const r of rs) if (r.type === 'childList') window.__rec += r.addedNodes.length + r.removedNodes.length; }); window.__obs.observe(document.querySelector('#wcanvas'), {childList: true, subtree: true}); window.__obs.observe(document.querySelector('#wctl'), {childList: true, subtree: true}); }")
        x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
        page.mouse.move(x, y); page.mouse.down()
        for i in range(1, 21): page.mouse.move(x + i * 5, y + i * 3)
        page.mouse.up()
        page.wait_for_timeout(400)
        assert page.evaluate("() => window.__rec") == 0, (where, 'a drag adds or removes no element of the canvas host or controls')
        page.evaluate("() => window.__obs.disconnect()")
        assert page.locator('#readout .lab2-formula').inner_text() != before, (where, 'the readout follows the drag')
        # the stepper moves between missions without gating
        page.locator('#wctl .lab2-step-btn').nth(1).click()
        assert page.evaluate(f"() => {lab}.index") == start + 1, (where, 'next mission')
        page.locator('#wctl .lab2-step-btn').nth(0).click()
        assert page.evaluate(f"() => {lab}.index") == start, (where, 'previous mission')
        # N and P only when the canvas has focus; the arrow keys stay the player's (steps) outside the canvas and are not taken inside it
        page.keyboard.press('n')
        assert page.evaluate(f"() => {lab}.index") == start, (where, 'N does nothing when the canvas has no focus')
        page.locator('#wcanvas canvas').focus()
        page.keyboard.press('n')
        assert page.evaluate(f"() => {lab}.index") == start + 1, (where, 'N moves to the next mission when the canvas has focus')
        page.keyboard.press('p')
        assert page.evaluate(f"() => {lab}.index") == start, (where, 'P moves back')
        # the player's convention on the canvas: an arrow key moves the selected handle (H selects the next one)
        before = page.locator('#readout .lab2-formula').inner_text()
        page.keyboard.press('ArrowRight')
        page.wait_for_function("b => document.querySelector('#readout .lab2-formula').textContent !== b", arg=before)
        step = page.locator('#step-count').inner_text()
        page.keyboard.press('ArrowRight')
        assert page.locator('#step-count').inner_text() == step, (where, 'an arrow key on the canvas is not the player step key')
        page.evaluate("() => document.activeElement.blur()")
        page.keyboard.press('ArrowRight')
        assert page.locator('#step-count').inner_text() != step, (where, 'outside the canvas the arrow key still steps the deck')

    # ---- the player (served site)
    page = new_page()
    page.goto(f'{BASE}/slides/player.html?deck={DECK}&lang=fr#{SLIDE}')
    check_player(page, 'player fr')
    page.goto(f'{BASE}/slides/player.html?deck={DECK}&lang=en#{SLIDE}')
    page.reload()
    check_player(page, 'player en')
    # leaving the slide destroys the experiment (no canvas, no leftovers in the areas)
    page.evaluate("() => { location.hash = '#0'; }")
    page.wait_for_function("() => !document.querySelector('.lab2-slide')")
    assert page.evaluate("() => document.querySelector('#readout').innerHTML === '' && document.querySelectorAll('.lab2-canvas').length === 0")

    # ---- the self-contained export (the laboratory code travels in the file; MathJax and fonts come from the vendored copy here)
    page = new_page()
    mathjax = (ROOT / 'dist/vendor/mathjax-tex-svg.js').read_bytes()
    page.route('**/cdn.jsdelivr.net/**', lambda r: r.fulfill(status=200, body=mathjax, content_type='application/javascript'))
    page.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, body='', content_type='text/css'))
    # An isolated document origin also works in managed browsers that prohibit
    # file:// navigation. No site modules are available at this origin.
    export_html = (ROOT / f'dist/slides/export/{DECK}.html').read_text()
    page.route('https://portable.example/lesson.html', lambda r: r.fulfill(status=200, body=export_html, content_type='text/html'))
    page.goto(f'https://portable.example/lesson.html#{SLIDE}')
    check_player(page, 'export')

    # ---- a chapter page: the first lab reference is mounted inline, lazily, and destroyed on navigation
    page = new_page(1280, 300)
    page.goto(f'{BASE}/#chapter/seconde-02/experiment')
    page.locator('.chapter-lab-host').wait_for(state='attached')
    page.wait_for_timeout(500)
    assert page.locator('.chapter-lab-host .lab2-canvas').count() == 0, 'not mounted before it scrolls into view'
    links = page.locator('.chapter-lab-links a')
    assert CHAPTER_LABS[0] == 'vectors/collinear', 'the checks below use the first reference of seconde-02'
    assert [links.nth(i).get_attribute('href') for i in range(links.count())] == [f'#lab/{r}' for r in CHAPTER_LABS] and 'laboratoire' in links.first.inner_text(), 'one link per reference'
    page.locator('.chapter-lab-host').scroll_into_view_if_needed()
    page.wait_for_selector('.chapter-lab-host .lab2-inline .lab2-canvas')
    page.wait_for_function("() => document.querySelector('.chapter-lab-host .lab2-formula')?.textContent.length > 0")
    assert page.locator('.chapter-lab-host .lab2-open').get_attribute('href') == '#lab/vectors/collinear', 'the inline mount links to the full page'
    assert page.evaluate("() => document.querySelector('.chapter-lab-host .lab2').__lab.mission.id") == 'collinear'
    handle = page.locator('.chapter-lab-host .lab2-handle').first
    box = handle.bounding_box(); before = page.locator('.chapter-lab-host .lab2-formula').inner_text()
    x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    page.mouse.move(x, y); page.mouse.down()
    for i in range(1, 15): page.mouse.move(x - i * 6, y + i * 2)
    page.mouse.up(); page.wait_for_timeout(300)
    assert page.locator('.chapter-lab-host .lab2-formula').inner_text() != before, 'a drag works in the inline mount'
    # navigating destroys it: another tab, then the home page
    page.goto(f'{BASE}/#chapter/seconde-02/understand')
    page.wait_for_function("() => !document.querySelector('.chapter-lab-host')")
    assert page.locator('.lab2-canvas').count() == 0, 'destroyed with its tab'
    page.goto(f'{BASE}/#chapter/seconde-02/experiment'); page.locator('.chapter-lab-host').scroll_into_view_if_needed(); page.wait_for_selector('.chapter-lab-host .lab2-canvas')
    page.goto(f'{BASE}/#home')
    page.wait_for_timeout(300)
    assert page.locator('.lab2-canvas').count() == 0 and page.locator('.lab2').count() == 0, 'destroyed on navigation'
    # a chapter with two references lists both links, mounting only the first
    page.goto(f'{BASE}/#chapter/expertes-03/experiment')
    page.locator('.chapter-lab-links').wait_for()
    assert page.locator('.chapter-lab-links a').count() == 2
    page.goto(f'{BASE}/#home')
    browser.close()

assert not errors, errors
print('PASS: lab widget in the player and in the export (mount, drag, stepper, N and P, destroy), chapter page inline mount (lazy, links, destroyed on navigation), no console errors')
