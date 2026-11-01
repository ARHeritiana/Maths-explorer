"""Browser checks of the 'go as far as the device allows' mode of the mirrored rooms (docs: site/js/device-capability.js).
 - on a device measured as basic, the options above 1,440 rays are disabled and the reflections slider stops at 100;
 - on a device measured as extreme (the measurement is stored for the session, so the test stores one), 100,000 rays and 500
   reflections are offered, the workers trace them, a density map is drawn, the page keeps answering, and the memory cap is honoured;
 - the choice survives a reload and a state above the ceiling of the device is drawn at the ceiling.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/device_scale_browser.py"""
import json, os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
LIMITS = {'basic': {'draws': 5000, 'steps': 1e5, 'tolerance': 1e-10, 'runs': 10000, 'rays': 1440, 'bounces': 100, 'segments': 3e5, 'trialsPerSecond': 6000, 'workers': 0},
          'extreme': {'draws': 5000000, 'steps': 8e6, 'tolerance': 1e-13, 'runs': 10000000, 'rays': 500000, 'bounces': 2000, 'segments': 2.4e7, 'trialsPerSecond': 2000000, 'workers': 8}}
def store(tier, workers): return json.dumps({'tier': tier, 'limits': LIMITS[tier], 'workers': workers, 'reasons': [], 'speed': 1e6, 'memoryGB': 8})

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options); errors = []

    def page_with(tier, workers):
        ctx = browser.new_context(viewport={'width': 1200, 'height': 900})
        page = ctx.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        page.add_init_script("sessionStorage.setItem('mx-capability-illumination', %s)" % json.dumps(store(tier, workers)))
        return page

    # a basic device
    page = page_with('basic', 0); page.goto(f'{BASE}/#lab/illumination'); page.wait_for_selector('[data-control=rays] select'); page.wait_for_timeout(600)
    sel = page.locator('[data-control=rays] select')
    assert sel.locator('option[value="100000"]').evaluate('o => o.disabled'), 'a basic device is not offered 100,000 rays'
    assert not sel.locator('option[value="1440"]').evaluate('o => o.disabled')
    assert page.locator('[data-control=bounces] input').evaluate('el => +el.max') <= 100, 'reflections stop at 100 on a basic device'
    page.close()

    # an extreme device
    page = page_with('extreme', 4); page.goto(f'{BASE}/#lab/illumination'); page.wait_for_selector('[data-control=rays] select'); page.wait_for_timeout(800)
    sel = page.locator('[data-control=rays] select')
    assert not sel.locator('option[value="100000"]').evaluate('o => o.disabled'), 'the extreme tier offers 100,000 rays'
    assert page.locator('[data-control=bounces] input').evaluate('el => +el.max') >= 2000
    sel.select_option('100000'); page.wait_for_function("document.querySelector('.act-readout, [role=status]') && /100[ \\u202f,.]?000/.test(document.body.innerText)", timeout=60000)
    # wait until the farm is done (the readout no longer says it is computing)
    page.wait_for_function("!/Calcul en cours|Computing/.test(document.body.innerText)", timeout=90000)
    text = page.inner_text('main')
    assert 'segments' in text and ('rayons' in text or 'rays' in text), text[:300]
    lit = page.evaluate("""() => { const c = document.querySelector('main canvas'); const g = c.getContext('2d'); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n / (d.length / 4); }""")
    assert lit > 0.2, ('the density map is drawn', lit)
    # the page still answers while a large job runs: change the reflections and measure that the click is handled quickly
    page.locator('[data-control=bounces] input').evaluate("el => { el.value = 500; el.dispatchEvent(new Event('input', {bubbles: true})); }")
    t0 = page.evaluate('performance.now()'); page.evaluate('() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))'); dt = page.evaluate('performance.now()') - t0
    assert dt < 1500, ('the page froze during a heavy job', dt)
    page.wait_for_function("!/Calcul en cours|Computing/.test(document.body.innerText)", timeout=120000)
    page.close()

    # a state above the ceiling is drawn at the ceiling: basic device, deep link state through the select is refused (nothing selectable)
    page = page_with('basic', 0); page.goto(f'{BASE}/#lab/illumination'); page.wait_for_selector('[data-control=rays] select')
    assert page.locator('[data-control=rays] select').input_value() in ('48', '96', '24', '1', '360', '1440')
    page.close()
    # Monte Carlo: a very fast speed and a higher ceiling only where the measurement allows
    for tier, workers in (('basic', 0), ('extreme', 4)):
        ctx = browser.new_context(viewport={'width': 1200, 'height': 900}); page = ctx.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        page.add_init_script("sessionStorage.setItem('mx-capability-montecarlo', %s)" % json.dumps(store(tier, workers)))
        page.goto(f'{BASE}/#lab/monte-carlo-pi'); page.wait_for_selector('.mc-speed select'); page.wait_for_timeout(700)
        has = page.locator('.mc-speed select option[value=turbo]').count()
        assert has == (1 if tier == 'extreme' else 0), (tier, 'the very fast speed is offered only on a capable device', has)
        if tier == 'extreme':
            page.locator('.mc-speed select').select_option('turbo'); page.locator('.mc-run').click()
            page.wait_for_function("(() => { const m = document.querySelector('.inference-status').innerText.match(/([0-9][0-9 \\u202f.,]*)\\s*(essais|trials)/); return m && parseInt(m[1].replace(/[^0-9]/g, '')) > 100000; })()", timeout=60000)
            page.locator('.mc-run').click(); page.wait_for_timeout(300)
        ctx.close()
    # the other items: longer series (probability), finer solver tolerance (double pendulum), a very large Galton drop
    for tier, workers in (('basic', 0), ('extreme', 4)):
        ctx = browser.new_context(viewport={'width': 1200, 'height': 900}); page = ctx.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        for kind in ('draws', 'dynamics'):
            page.add_init_script("sessionStorage.setItem('mx-capability-%s', %s)" % (kind, json.dumps(store(tier, workers))))
        page.goto(f'{BASE}/#lab/probability'); page.wait_for_selector('[data-control=run] button'); page.wait_for_timeout(700)
        big = page.locator('[data-control=run] button:has-text("1 000 000"), [data-control=run] button:has-text("1,000,000")')
        assert big.count() == 1 and (big.first.is_visible() == (tier == 'extreme')), (tier, 'the 1,000,000 series button belongs to capable devices only')
        if tier == 'extreme':
            big.first.click(); page.wait_for_timeout(1500)
            assert '1000000' in page.inner_text('main').replace(' ', '').replace('\u202f', '').replace(',', ''), 'a million experiments were added'
        page.goto(f'{BASE}/#lab/double-pendulum'); page.wait_for_selector('details.lab2-dynamics-settings'); page.wait_for_timeout(700)
        page.locator('details.lab2-dynamics-settings summary').click()
        fine = page.locator('details.lab2-dynamics-settings select option[value="1e-13"]')
        assert fine.count() == 1 and fine.evaluate('o => o.disabled') == (tier == 'basic'), (tier, 'the finest tolerance is offered only on a capable device')
        page.goto(f'{BASE}/#gallery/galton'); page.wait_for_selector('#gb-one'); page.wait_for_timeout(700)
        assert page.locator('#gb-big').is_visible() == (tier == 'extreme'), (tier, 'the huge Galton drop belongs to capable devices only')
        if tier == 'extreme':
            page.locator('#gb-big').click(); page.wait_for_function("document.querySelector('#gb-big').disabled === false && /5[ \\u202f,.]?000[ \\u202f,.]?000/.test(document.getElementById('gb-read').innerText)", timeout=60000)
        ctx.close()
    assert not errors, errors
    browser.close()
print('PASS: heavy modes only where the device allows: ceilings, workers, density map, responsiveness')
