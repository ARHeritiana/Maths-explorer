"""Browser checks of the resource search (#search, header entry, Espace professeur):
 - topic search ("croissance démographique") returns cross-resource results (chapter, experiment, curiosity) with real actions;
 - accent-insensitive; honest empty state; no dead buttons (every action is a link to a live page);
 - project an item (automatismes, projectable filter) and land on the projection page with the chapter preselected;
 - save to favorites (device storage), visible on the dashboard; works with storage blocked;
 - 320 px without overflow, 44 px targets, keyboard, both themes, no console error.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/search_browser.py
"""
import json
import os
from playwright.sync_api import sync_playwright
# The home is the visitor home by default (docs/AUDIENCE_MODES.md); these checks are about the student home.
STUDENT = "try{if(!localStorage.getItem('mx-teacher-entry'))localStorage.setItem('mx-teacher-entry','student')}catch(e){}"

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')

def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')

def search(page, text):
    box = page.locator('.rs input[type=search]')
    box.fill(text)
    page.wait_for_timeout(100)

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []
    context = browser.new_context(viewport={'width': 1280, 'height': 800}, locale='fr-FR')
    context.add_init_script(STUDENT)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(page.url + ' ' + str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

    # header entry reaches the search page
    page.goto(f'{BASE}/#home'); page.wait_for_selector('#home-class')
    page.locator('[data-search-link]').click()
    page.wait_for_selector('.rs input[type=search]')
    assert page.evaluate('location.hash') == '#search'
    assert page.locator('h1').inner_text().strip() in ('Rechercher', 'Search')
    assert page.locator('.rs-suggest button').count() >= 3, 'suggestions before any query'

    # 1. a topic gives cross-resource results, each with real actions
    search(page, 'croissance démographique')
    groups = page.locator('.rs-group h3').evaluate_all('h => h.map(x => x.textContent)')
    joined = ' '.join(groups)
    assert 'Chapitre' in joined and 'Expérience' in joined and 'Curiosité' in joined, groups
    assert 'résultat' in page.locator('.rs-status').inner_text()
    assert page.locator('a.rs-act[data-act="manipulate"]').count() >= 1
    assert page.locator('[data-id="lab:logistic"] a.rs-act').count() == 1
    # accent-insensitive
    n1 = page.locator('.rs-item').count()
    search(page, 'CROISSANCE DEMOGRAPHIQUE')
    assert page.locator('.rs-item').count() == n1

    # 2. no dead buttons: every action is a link to a page that really renders (sample one per action kind)
    seen = {}
    for a in page.locator('a.rs-act').evaluate_all('a => a.map(x => [x.dataset.act, x.getAttribute("href")])'):
        assert a[1] and (a[1].startswith('#') or 'player.html' in a[1]), a
        seen.setdefault(a[0], a[1])
    for kind, href in seen.items():
        if not href.startswith('#') or href.startswith('#bank'): continue  # bank pages race MathJax when visited back to back (existing); their routes are checked by isLiveHash in the unit test
        page.goto(f'{BASE}/{href}'); page.wait_for_selector('#main'); page.wait_for_load_state('networkidle')
        assert 'Page introuvable' not in page.inner_text('#main') and 'Page not found' not in page.inner_text('#main'), href
    page.goto(f'{BASE}/#search'); page.wait_for_selector('.rs input[type=search]')

    # 3. honest empty state
    search(page, 'azertyqwx')
    assert page.locator('.rs-empty').count() == 1 and page.locator('.rs-item').count() == 0
    assert page.locator('.rs-empty button').count() == 1
    page.locator('[data-reset]').click()
    assert page.input_value('.rs input[type=search]') == ''

    # 4. project an item: projectable starters for Première, then Projeter lands on the timed projection
    search(page, 'suites')
    page.evaluate("document.querySelector('.rs-filters').open = true")
    page.select_option('[data-rs="cls"]', 'premiere')
    page.check('[data-rs="projectable"]')
    assert page.locator('.rs-item').count() >= 1
    assert page.locator('.rs-item a.rs-act[data-act="project"]').count() == page.locator('.rs-item').count(), 'only projectable items, all with Projeter'
    assert page.locator('.rs-item [data-act="print"]').count() >= 0
    target = page.locator('[data-id="automatismes:premiere-01"] a[data-act="project"]')
    assert target.count() == 1
    # 5. favorites on the same item, before leaving
    fav = page.locator('[data-id="automatismes:premiere-01"] [data-fav]')
    assert fav.get_attribute('aria-pressed') == 'false'
    fav.click()
    assert page.locator('[data-id="automatismes:premiere-01"] [data-fav]').get_attribute('aria-pressed') == 'true'
    stored = json.loads(page.evaluate("localStorage.getItem('mx-teacher-favorites')"))
    assert stored[0]['type'] == 'resource' and stored[0]['id'] == 'automatismes:premiere-01' and stored[0]['href'], stored
    target.click()
    page.wait_for_function("location.hash === '#automatismes/go' || location.hash.startsWith('#automatismes')")
    page.wait_for_selector('#auto-stage', state='attached')
    assert page.evaluate("localStorage.getItem('mx-teacher-chapter')") == 'premiere-01', 'chapter preselected for the projection'
    assert page.evaluate("document.querySelector('#auto-stage').classList.contains('presenting')"), 'projection stage is open'
    # the favorite shows in the folded "Récents et favoris" of the dashboard, which has no search box of its own (the header has it)
    page.goto(f'{BASE}/#teacher'); page.wait_for_selector('#td-class')
    assert page.locator('#td-search-slot, .td-search').count() == 0, 'one search entry point: the header'
    page.locator('.td-recent summary').click()
    assert 'Automatismes' in page.locator('#td-fav-h ~ .td-items, #td-fav-h ~ ul').first.inner_text()

    # 6. keyboard: type, Tab to the first action, activate with Enter
    page.goto(f'{BASE}/#search'); page.wait_for_selector('.rs input[type=search]')
    page.focus('.rs input[type=search]'); page.keyboard.type('vecteurs')
    page.wait_for_selector('.rs-item')
    for _ in range(12):
        page.keyboard.press('Tab')
        if page.evaluate("document.activeElement.classList.contains('rs-act')"): break
    assert page.evaluate("document.activeElement.classList.contains('rs-act')")
    page.keyboard.press('Enter')
    page.wait_for_function("!location.hash.startsWith('#search')")

    # 7. small screens, both themes, 44 px targets, no overflow
    page.close()  # the projection step may have left the window in full screen
    page = browser.new_context(viewport={'width': 1280, 'height': 800}, locale='fr-FR').new_page()
    page.add_init_script(STUDENT)
    page.on('pageerror', lambda e: errors.append(page.url + ' ' + str(e)))
    for width in (320, 390, 1280):
        for theme in ('jour', 'nuit'):
            page.set_viewport_size({'width': width, 'height': 800})
            page.goto(f'{BASE}/#search'); page.evaluate(f"localStorage.setItem('maths-explorer-theme', '{theme}')")
            page.wait_for_selector('.rs input[type=search]')
            search(page, 'suites')
            assert not overflow(page), (width, theme)
            small = page.evaluate("""[...document.querySelectorAll('.rs a.rs-act, .rs button, .rs input[type=search], .rs select, .rs summary')].filter(e => e.offsetParent).map(e => [e.tagName + '.' + e.className, e.getBoundingClientRect().height]).filter(x => x[1] < 43.5)""")
            assert not small, (width, theme, small[:4])

    # 8. storage blocked: search and favorites still work for the session
    blocked = browser.new_context(viewport={'width': 390, 'height': 800})
    blocked.add_init_script("Object.defineProperty(window, 'localStorage', {get() { throw new DOMException('blocked', 'SecurityError'); }});")
    bp = blocked.new_page()
    berrors = []
    bp.on('pageerror', lambda e: berrors.append(str(e)))
    bp.goto(f'{BASE}/#search'); bp.wait_for_selector('.rs input[type=search]')
    bp.fill('.rs input[type=search]', 'derivee'); bp.wait_for_selector('.rs-item')
    f = bp.locator('.rs-item [data-fav]').first
    f.click()
    assert bp.locator('.rs-item [data-fav]').first.get_attribute('aria-pressed') == 'true', 'kept in memory for the session'
    assert not berrors, berrors
    blocked.close()

    assert not errors, errors
    browser.close()
print('search browser checks passed')
