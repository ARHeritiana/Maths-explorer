"""Browser checks of the shared challenge layer (site/js/app.js challengeDetail and bindChallenges):
 - no hint panel and no hint buttons (owner rule: no hints in the UI);
 - the original statement sits in a closed disclosure under the answer form and opens on demand;
 - a wrong answer gets the neutral "Pas encore." with no coaching;
 - the Impossible button exists only where the answer can be impossible (cham), and counts as the answer 0;
 - the written solution is a closed "Version écrite" disclosure inside the worked solution;
 - every challenge folder opens at 390 px with its answer form, no horizontal overflow and no console error.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/challenge_browser.py
"""
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
root = Path(__file__).resolve().parents[1]
IDS = re.findall(r'^import \* as \w+ from "\./([\w-]+)/index\.js";', (root / 'site/js/challenges/registry.js').read_text(), re.M)
assert len(IDS) >= 30, IDS

def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []
    context = browser.new_context(viewport={'width': 1280, 'height': 800}, locale='fr-FR')
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(page.url + ' ' + str(e)))
    page.on('console', lambda m: errors.append(page.url + ' ' + m.text) if m.type == 'error' else None)

    # Chameleons: default 13 · 15 · 17 is impossible, so the answer is 0.
    page.goto(f'{BASE}/#challenges/cham'); page.wait_for_selector('#challenge-form')
    orig = page.locator('details.original-statement')
    assert orig.count() == 1 and orig.get_attribute('open') is None, 'original statement collapsed'
    assert not page.locator('#original').is_visible(), 'original text hidden'
    orig.locator('summary').click()
    assert page.locator('#original').is_visible(), 'original opens on demand'
    assert page.locator('.challenge-detail article .original').count() == 0, 'no original block above the activity'
    page.fill('#challenge-answer', '5'); page.click('#challenge-form button[type=submit]')
    fb = page.locator('#challenge-feedback')
    page.wait_for_function("document.querySelector('#challenge-feedback').textContent.trim().length > 0")
    assert fb.inner_text().strip() == 'Pas encore.', fb.inner_text()
    assert 'success' not in (fb.get_attribute('class') or '')
    imp = page.locator('#challenge-impossible')
    assert imp.count() == 1 and imp.inner_text().strip() == 'Impossible'
    imp.click()
    page.wait_for_function("document.querySelector('#challenge-feedback').classList.contains('success')")
    assert page.locator('#challenge-answer').input_value() == '', 'Impossible clears the typed answer'
    # Worked solution: the written version is a closed disclosure inside it.
    page.locator('details.solution > summary').click()
    written = page.locator('details.solution details.written')
    assert written.count() == 1 and written.get_attribute('open') is None, 'written version collapsed'
    assert not page.locator('#solution-text').is_visible()
    written.locator('summary').click()
    assert page.locator('#solution-text').is_visible()

    # A challenge whose answer is always a number has no Impossible button.
    page.goto(f'{BASE}/#challenges/hanoi'); page.wait_for_selector('#challenge-form')
    assert page.locator('#challenge-impossible').count() == 0, 'no Impossible button on hanoi'

    # Every challenge opens on a phone.
    page.set_viewport_size({'width': 390, 'height': 844})
    for cid in IDS:
        page.goto(f'{BASE}/#challenges/{cid}'); page.wait_for_selector('#challenge-form', timeout=10000)
        page.wait_for_timeout(250)
        assert page.locator('#challenge-form').get_attribute('data-id') == cid, cid
        assert not overflow(page), f'{cid}: horizontal overflow at 390 px'
        assert page.locator('.hint-panel, [data-hint-act], [data-hint]').count() == 0, f'{cid}: hints shown'
        page.goto(f'{BASE}/#challenges'); page.wait_for_timeout(50)
    assert not errors, errors
    browser.close()
print(f'challenge browser checks passed ({len(IDS)} challenges)')
