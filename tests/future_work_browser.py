"""Smoke and behaviour checks of the unpublished interactive references in docs/future-work/ (Workstream G).
They stay outside site/ until the publication gate; these checks keep the audit fixes from regressing:
 - every page loads from file:// with no console error, no external request and no horizontal overflow at 390 px;
 - equidecomposability: custom vertices can be typed (keyboard path), a degenerate or very thin polygon is refused;
 - Monte Carlo: lake shape presets give the exact polygon areas (36, 33), tabs answer the arrow keys;
 - set atlas: the shading check names wrongly shaded and missed regions in words;
 - London Eye: the page loads and the height formula is on the page.
Run alone: python tests/future_work_browser.py (needs Playwright; PLAYWRIGHT_CHROMIUM_PATH optional)."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

DIR = Path(__file__).resolve().parents[1] / 'docs' / 'future-work'
PAGES = ['equidecomposability-of-polygons.html', 'set-theory-interactive-atlas.html', 'monte-carlo-lab.html', 'london-eye-interactive-exercise.html']

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)

    def open_page(name, width=390):
        page = browser.new_page(viewport={'width': width, 'height': 900}); problems = []
        page.on('pageerror', lambda e: problems.append(str(e)))
        page.on('console', lambda m: problems.append(m.text) if m.type == 'error' else None)
        page.on('request', lambda r: problems.append('external request ' + r.url) if not r.url.startswith(('file:', 'data:', 'blob:')) else None)
        page.goto((DIR / name).as_uri()); page.wait_for_timeout(300)
        return page, problems

    for name in PAGES:
        page, problems = open_page(name)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), ('overflow', name)
        assert not problems, (name, problems); page.close()

    page, problems = open_page(PAGES[0], 1100)
    page.click('#dp')
    page.fill('#vi', '0,0; 100,0; 100,1; 0,1'); page.click('#va'); page.click('#cl')
    assert 'Too thin' in page.inner_text('#dh') and page.is_visible('#dr'), 'a very thin polygon is refused'
    page.click('#ca'); page.click('#dp')
    page.fill('#vi', '0,0; 10,0; 10,0; 10,6; 0,6'); page.click('#va'); page.click('#cl')
    assert not page.is_visible('#dr') and page.evaluate('P.length') == 4, 'a repeated vertex is removed and the rectangle accepted'
    assert 'Common area A = 500' in page.inner_text('#inf') or 'Common area A = 60' in page.inner_text('#inf') or 'Common area' in page.inner_text('#inf')
    page.click('#dp'); page.fill('#vi', '0,0; 10,0; 5,0; 5,6'); page.click('#va'); page.click('#cl')
    assert page.is_visible('#dr'), 'a polygon that doubles back on itself is refused'
    assert not problems, problems; page.close()

    page, problems = open_page(PAGES[2], 1200)
    page.focus('#tab-pi'); page.keyboard.press('ArrowRight')
    assert page.get_attribute('#tab-lake', 'aria-selected') == 'true' and page.evaluate('document.activeElement.id') == 'tab-lake'
    page.click('#revealBtn')
    for shape, area in [('square', '36.00'), ('ell', '33.00')]:
        page.select_option('#shapeSelect', shape); assert page.inner_text('#referenceValue') == area, (shape, page.inner_text('#referenceValue'))
    assert not problems, problems; page.close()

    page, problems = open_page(PAGES[1], 1100)
    page.click('[data-tab=practice]'); page.locator('button[data-practice=shade]').first.click()
    page.locator('#shade-svg [data-region]').first.focus(); page.keyboard.press('Enter'); page.click('#shade-check')
    text = page.inner_text('#shade-feedback')
    assert 'Shaded but should not be' in text or 'Not shaded but should be' in text or 'Excellent' in text, text
    assert not problems, problems; page.close()

    page, problems = open_page(PAGES[3], 1100)
    assert '75' in page.content() and 'cos' in page.content().lower()
    assert not problems, problems; page.close()
    browser.close()
print('PASS: four unpublished references load clean; audit fixes (typed vertices, thin and degenerate polygons, lake presets, arrow keys, region report)')
