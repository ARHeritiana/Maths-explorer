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

    # The list has two shelves: challenges with a checked number, and open challenges (owner rule, 15 November 2026).
    page.goto(f'{BASE}/#challenges'); page.wait_for_selector('#shelf-open')
    assert page.locator('#shelf-checked').count() == 1 and page.locator('#shelf-open').count() == 1
    assert page.locator('section[aria-labelledby=shelf-open] a[href="#challenges/cham"]').count() == 1, 'chameleons on the open shelf'
    assert page.locator('section[aria-labelledby=shelf-checked] a[href="#challenges/hanoi"]').count() == 1, 'hanoi on the checked shelf'

    # Nim: a checked challenge; the original proof version is folded; the neutral Impossible button checks the answer 0.
    page.goto(f'{BASE}/#challenges/nim'); page.wait_for_selector('#challenge-form')
    orig = page.locator('details.original-statement')
    assert orig.count() == 1 and orig.get_attribute('open') is None, 'original statement collapsed'
    assert not page.locator('#original').is_visible(), 'original text hidden'
    orig.locator('summary').click()
    assert page.locator('#original').is_visible(), 'original opens on demand'
    page.fill('#challenge-answer', '5'); page.click('#challenge-form button[type=submit]')
    fb = page.locator('#challenge-feedback')
    page.wait_for_function("document.querySelector('#challenge-feedback').textContent.trim().length > 0")
    assert fb.inner_text().strip() == 'Pas encore.', fb.inner_text()
    assert 'success' not in (fb.get_attribute('class') or '')
    imp = page.locator('#challenge-impossible')
    assert imp.count() == 1 and imp.inner_text().strip() == 'Impossible'
    imp.click()
    assert page.locator('#challenge-answer').input_value() == '', 'Impossible clears the typed answer'
    page.fill('#challenge-answer', '1'); page.click('#challenge-form button[type=submit]')
    page.wait_for_function("document.querySelector('#challenge-feedback').classList.contains('success')")

    # Chameleons: an open challenge: the classic statement, no answer form, no separate original, the solution below.
    page.goto(f'{BASE}/#challenges/cham'); page.wait_for_selector('#main.challenge-open')
    assert page.locator('#challenge-form, #challenge-answer, #challenge-impossible, details.original-statement').count() == 0
    assert page.locator('.open-note').is_visible()
    assert 'Peut-on' in page.locator('#problem').inner_text()
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
        page.goto(f'{BASE}/#challenges/{cid}'); page.wait_for_selector('#main.challenge-detail', timeout=10000)
        page.wait_for_timeout(250)
        assert page.locator('#main.challenge-detail').get_attribute('data-id') == cid, cid
        assert page.locator('#challenge-form').count() + page.locator('.open-note').count() == 1, f'{cid}: either an answer form or the open note'
        assert not overflow(page), f'{cid}: horizontal overflow at 390 px'
        assert page.locator('.hint-panel, [data-hint-act], [data-hint]').count() == 0, f'{cid}: hints shown'
        page.goto(f'{BASE}/#challenges'); page.wait_for_timeout(50)
    # Open curiosities: the animated explanation sits in the article (section "Explication animée"), mounts at once and plays to its last step.
    OPEN_CURIOSITIES = ['soap-films', 'einstein', 'moving-sofa', 'equidecomposition', 'banach-tarski-gallery', 'mirrored-rooms',
                        'double-pendulum-gallery', 'three-body-gallery', 'fair-goods-gallery', 'baker-gallery']
    for width in [1280, 390]:
        page.set_viewport_size({'width': width, 'height': 844})
        for gid in OPEN_CURIOSITIES:
            page.goto(f'{BASE}/#gallery/{gid}'); page.wait_for_selector('.art-explainer')
            assert page.locator('#lab-quiz, .explain-open, .checkpoint').count() == 0, f'{gid}: an article has no quiz or fold'
            page.wait_for_function("document.querySelector('[data-explain]').__solution", timeout=15000)
            n = page.evaluate("document.querySelector('[data-explain]').__solution.steps")
            page.evaluate(f"document.querySelector('[data-explain]').__solution.seek({n - 1}, 1)")
            assert page.evaluate("!/NaN|undefined|Infinity/.test(document.querySelector('[data-explain] .sol-svg').innerHTML)"), gid
            assert page.locator('[data-explain] .sol-cap').inner_text().strip(), f'{gid}: caption'
            assert not overflow(page), f'{gid}: horizontal overflow at {width} px'
    assert not errors, errors
    browser.close()
print(f'challenge browser checks passed ({len(IDS)} challenges, 10 curiosity explanations)')
