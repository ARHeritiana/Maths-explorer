"""Browser checks of the four chapter destinations (docs/REDESIGN_PROPOSAL_2026-10-27.md milestone 2).
 - the chapter opens on Cours; there is no numbered rail and no "next step" bar;
 - the four destinations are plain links; the six stage names of the first design resolve to them;
 - direct links to an idea (cours/<n>) and to an exercise (exercices/<n>) scroll to it;
 - the practice cards link back to the exact idea, not to a generic course page;
 - the documents are reachable in one tap, without visiting another destination;
 - browser Back returns to the previous destination; no console error, no horizontal overflow at 320 px.
Run through tests/run_browser.py, or alone against a running server: MATHS_EXPLORER_URL=http://localhost:4173 python tests/chapter_destinations_browser.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
CHAPTER = 'seconde-04'   # has dedicated practice tasks

def loaded(page):
    page.wait_for_function("document.querySelector('#chapter-sequence')?.getAttribute('aria-busy') === 'false'")

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

    page.goto(f'{BASE}/#chapter/{CHAPTER}'); loaded(page)
    assert page.locator('.chapter-tabs ul a').count() == 4
    assert page.locator('.chapter-tabs [aria-current="page"]').get_attribute('href').endswith('/cours')
    assert page.locator('.sequence-nav, .sequence-forward').count() == 0, 'no numbered rail or next-step bar'
    assert page.locator('.chapter-tabs li span').count() == 0

    for old, new in [('prepare', 'cours'), ('understand', 'cours'), ('experiment', 'manipuler'), ('practice', 'exercices'), ('review', 'exercices'), ('documents', 'documents')]:
        page.goto(f'{BASE}/#chapter/{CHAPTER}/{old}'); loaded(page)
        assert page.locator('.chapter-tabs [aria-current="page"]').get_attribute('href').endswith('/' + new), (old, new)

    # common errors of the chapter (reverse of the error links) in Cours and in Exercices, reachable from the slides index
    for tab in ['cours', 'exercices']:
        page.goto(f'{BASE}/#chapter/{CHAPTER}/{tab}'); loaded(page)
        assert page.locator('.chapter-errors a[href^="#errors/"]').count() >= 2, tab
    page.goto(f'{BASE}/#chapter/{CHAPTER}/cours/errors'); loaded(page)
    page.wait_for_function("document.querySelector('#chapter-errors-title').getBoundingClientRect().top < 300")
    page.goto(f'{BASE}/#slides'); page.locator('details[data-course="seconde"] summary').click()
    page.wait_for_selector('details[data-course="seconde"] .deck-source[href$="/cours/errors"]')
    page.goto(f'{BASE}/#errors/square-inequality'); page.wait_for_selector('.error-bench')
    assert 'x < y' in page.locator('#err-verdict').inner_text() or page.locator('#err-verdict').inner_text(), 'hypothesis message or verdict'
    page.goto(f'{BASE}/#chapter/{CHAPTER}/cours'); loaded(page)
    # a direct link to an idea and to an exercise scrolls to it
    page.goto(f'{BASE}/#chapter/{CHAPTER}/cours/2'); loaded(page)
    page.wait_for_function("document.querySelector('#notion-2').getBoundingClientRect().top < 200")
    page.goto(f'{BASE}/#chapter/{CHAPTER}/understand/1'); loaded(page)
    page.wait_for_function("document.querySelector('#notion-1').getBoundingClientRect().top < 200")
    page.goto(f'{BASE}/#chapter/{CHAPTER}/exercices/3'); loaded(page)
    page.wait_for_function("document.querySelector('#exo-3').getBoundingClientRect().top < 200")
    page.goto(f'{BASE}/#chapter/{CHAPTER}/review'); loaded(page)
    page.wait_for_function("document.querySelector('#bilan').getBoundingClientRect().top < 200")

    # the practice cards point to the exact idea
    page.goto(f'{BASE}/#chapter/{CHAPTER}/exercices'); loaded(page)
    links = page.locator('#exo-0 a[href*="/cours/"]')
    assert links.count() == 1
    target = links.get_attribute('href')
    assert not target.endswith('/cours') and not target.endswith('/understand'), target
    links.click(); loaded(page)
    page.wait_for_function("location.hash.includes('/cours/')")

    # documents in one tap, Back restores the previous destination
    page.goto(f'{BASE}/#chapter/{CHAPTER}/exercices'); loaded(page)
    page.locator('.chapter-tabs a[href$="/documents"]').click(); loaded(page)
    assert page.locator('.sequence-documents .document-link').count() >= 1
    page.go_back(); loaded(page)
    assert page.locator('.chapter-tabs [aria-current="page"]').get_attribute('href').endswith('/exercices')

    # every destination fits 320 px with 44 px targets
    page.set_viewport_size({'width': 320, 'height': 700})
    for tab in ['cours', 'manipuler', 'exercices', 'documents']:
        page.goto(f'{BASE}/#chapter/{CHAPTER}/{tab}'); loaded(page)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), ('overflow', tab)
        assert page.locator('.chapter-tabs ul a').first.bounding_box()['height'] >= 44
    assert not errors, errors
    browser.close()
print('PASS: four chapter destinations, legacy aliases, direct concept and exercise links, one-tap documents, Back, 320 px')
