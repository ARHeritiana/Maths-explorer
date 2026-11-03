"""Playwright checks of the unilluminable room (#gallery/mirrored-rooms, js/gallery/gallery-room.js and js/illumination-view.js):
 - Penrose with the lamp at the centre shows four dark zones of about 0.8 square units, in the chips and the readout;
 - the lamp moves with the arrow keys once the canvas has the focus, and the light is recomputed;
 - a room drawn by clicks (grid snapping) is closed by a click on the first vertex, curved, then undone;
 - the light step by step works under reduced motion (one reflection per press), and the L-room challenge is solved at 2 reflections;
 - no horizontal overflow and no page error at 390 px and 1440 px, in both themes.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/room_browser.py"""
import os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
DONE = "!/Calcul de la lumière|Computing the light|Aperçu grossier|Rough preview/.test((document.querySelector('[data-status]')?.textContent||'')+(document.querySelector('[data-detail]')?.textContent||''))"

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options); errors = []

    def open_room(width, theme, motion='no-preference'):
        ctx = browser.new_context(viewport={'width': width, 'height': 1000 if width > 800 else 844}, reduced_motion=motion)
        page = ctx.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        page.add_init_script("sessionStorage.setItem('mx-capability-illumination', JSON.stringify({tier:'basic',limits:{draws:5000,steps:1e5,tolerance:1e-10,runs:10000,rays:1440,bounces:100,segments:3e5,trialsPerSecond:6000,workers:0},workers:0,reasons:[],speed:1e6,memoryGB:8}))")
        page.goto(f'{BASE}/#gallery/mirrored-rooms'); page.wait_for_selector('.room-canvas')
        page.evaluate(f"document.documentElement.dataset.theme = '{theme}'")
        page.wait_for_function(DONE, timeout=60000); page.wait_for_timeout(300)
        return page

    def canvas_point(page, x, y):   # room units to page pixels (the view fits the frame [-6, 6] x [-5, 5] at 90 %)
        box = page.locator('.room-canvas').bounding_box(); u = min(box['width'] / 12, box['height'] / 10) * 0.9
        return box['x'] + box['width'] / 2 + x * u, box['y'] + box['height'] / 2 + y * u

    for width, theme in ((1440, 'jour'), (390, 'nuit')):
        page = open_room(width, theme)
        status = page.inner_text('[data-status]')
        areas = [float(a.replace(',', '.')) for a in re.findall(r'\d\) ([\d.,]+) u', status)]
        assert len(areas) == 4 and all(abs(a - 0.8) < 0.1 for a in areas), status
        assert '4' in page.inner_text('[data-chip=dark]')
        assert page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth') <= 0, ('overflow', width)
        page.close()

    # keyboard: focus the canvas, move the lamp, the light is recomputed
    page = open_room(1440, 'jour')
    page.focus('.room-canvas')
    for _ in range(5): page.keyboard.press('ArrowRight')
    page.wait_for_function("/S = \\(0[,.]5/.test(document.querySelector('[data-detail]')?.textContent || '')", timeout=60000)
    page.wait_for_function(DONE, timeout=60000)

    # draw a room: L shape by clicks, close on the first vertex, curve one wall, undo the curve
    page.click('[data-room=custom]')
    for x, y in ((-5, -4), (1, -4), (1, 0), (5, 0), (5, 4), (-5, 4)):
        page.mouse.click(*canvas_point(page, x, y)); page.wait_for_timeout(80)
    assert 'Open room' in page.inner_text('[data-validation]') or 'ouverte' in page.inner_text('[data-validation]')
    page.mouse.click(*canvas_point(page, -5, -4))
    page.wait_for_function("/Valid room: 6 vertices, area ≈ 64/.test(document.querySelector('[data-validation]').textContent)", timeout=60000)
    page.click('[data-tool=curve]')
    page.mouse.move(*canvas_point(page, 0, 4)); page.mouse.down(); page.mouse.move(*canvas_point(page, 0, 2.5), steps=6); page.mouse.up()
    page.wait_for_function("/area ≈ (?!64)\\d/.test(document.querySelector('[data-validation]').textContent)", timeout=60000)
    page.click('[data-act=undo]')
    page.wait_for_function("/area ≈ 64/.test(document.querySelector('[data-validation]').textContent)", timeout=60000)
    page.close()

    # reduced motion: the light is shown one reflection per press; the L-room challenge
    page = open_room(1440, 'jour', motion='reduce')
    page.click('[data-room=lroom]'); page.wait_for_function(DONE, timeout=60000)
    page.click('[data-act=light-play]'); page.wait_for_timeout(300)
    assert 'Light after 0' in page.inner_text('[data-chip=bounces]'), page.inner_text('[data-chip=bounces]')
    page.click('[data-act=light-step]'); page.wait_for_timeout(300)
    assert 'Light after 1' in page.inner_text('[data-chip=bounces]')
    page.fill('[data-input=bounces]', '2'); page.dispatch_event('[data-input=bounces]', 'input'); page.wait_for_function(DONE, timeout=60000)
    page.click('[data-tab=challenges]')
    assert 'is-done' in page.get_attribute('[data-ch=l-room]', 'class'), 'the L-room challenge is solved at 2 reflections'
    page.close()

    assert not errors, errors
    browser.close()
print('PASS: the unilluminable room: dark zones, keyboard, drawing and undo, reduced motion, challenges, both widths and themes')
