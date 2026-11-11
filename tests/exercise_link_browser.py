"""Browser checks of one search result per worked exercise and its address #bank/<course>/<chapter>/<exercise id>:
 - searching an exercise title shows it (type "Exercice corrigé"), "Ouvrir" lands on the bank chapter page with that exercise in view,
   its heading focused, MathJax typeset without error; the level filter does not hide it on arrival;
 - a fresh load of the address works (the bank page needs no search index); browser Back returns to the search;
 - "Nouvelles valeurs" on a seeded exercise keeps the page usable; an invalid exercise id falls back to "Page introuvable";
 - 320, 390 and 1280 px in both themes without horizontal overflow; no console error.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/exercise_link_browser.py
Set SHOTS=<dir> to also save screenshots.
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
SHOTS = os.environ.get('SHOTS', '')
EX, CH, CLS = 'g-sec-forfaits', 'seconde-06', 'seconde'   # a seeded exercise listed under two chapters: canonical address is the first

def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')

def in_view(page, ex):
    return page.evaluate("""id => { const r = document.querySelector('[data-ex="' + id + '"]').getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight * .6; }""", ex)

def search(page, text):
    page.locator('.rs input[type=search]').fill(text)
    page.wait_for_timeout(150)

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []
    context = browser.new_context(viewport={'width': 1280, 'height': 800}, locale='fr-FR')
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(page.url + ' ' + str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

    page.goto(f'{BASE}/#search'); page.wait_for_selector('.rs input[type=search]')
    search(page, 'Choisir un forfait')
    item = page.locator(f'.rs-item[data-id="exercise:{EX}"]')
    assert item.count() == 1, 'the exercise is a result'
    group = item.locator('xpath=ancestor::section[contains(@class,"rs-group")]')
    assert 'Exercice corrigé' in group.locator('h3').inner_text(), group.locator('h3').inner_text()
    assert group.locator('.rs-item').first.get_attribute('data-id') == f'exercise:{EX}', 'first in its group'
    assert item.locator('a.rs-act').count() == 1 and item.locator('a.rs-act').get_attribute('data-act') == 'open', 'only Ouvrir'
    assert item.locator('a.rs-act').get_attribute('href') == f'#bank/{CLS}/{CH}/{EX}'
    assert 'Imprimer' not in item.inner_text() and 'Projeter' not in item.inner_text()
    assert 'min' in item.inner_text()
    if SHOTS:
        page.set_viewport_size({'width': 1280, 'height': 800}); item.scroll_into_view_if_needed(); page.screenshot(path=f'{SHOTS}/search-1280.png')
    # accent-insensitive, plural-insensitive
    search(page, 'remises successive')
    assert page.locator('.rs-item[data-id="exercise:g-sec-soldes"]').count() == 1
    search(page, 'Choisir un forfait')
    # the favorite works like any other item
    item = page.locator(f'.rs-item[data-id="exercise:{EX}"]')
    item.locator('[data-fav]').click()
    assert item.locator('[data-fav]').get_attribute('aria-pressed') == 'true'
    item.locator('[data-fav]').click()
    assert item.locator('[data-fav]').get_attribute('aria-pressed') == 'false'

    # Ouvrir: the bank chapter page, the exercise in view and focused, typeset
    item.locator('a.rs-act').click()
    page.wait_for_selector(f'[data-ex="{EX}"]')
    page.wait_for_function("document.activeElement && document.activeElement.closest('.bank-ex')?.dataset.ex === '" + EX + "'")
    page.wait_for_selector(f'[data-ex="{EX}"] mjx-container')
    page.wait_for_timeout(300)
    assert page.evaluate('location.hash') == f'#bank/{CLS}/{CH}/{EX}'
    assert in_view(page, EX), 'exercise scrolled into view'
    assert page.evaluate("document.activeElement.tagName") == 'H3'
    assert page.locator('[data-level-filter="0"]').get_attribute('aria-pressed') == 'true', 'no hiding filter on arrival'
    assert page.locator(f'[data-ex="{EX}"]').is_visible()
    assert page.locator('.bank-ex mjx-merror').count() == 0 and page.locator('.MathJax_Error').count() == 0
    if SHOTS: page.screenshot(path=f'{SHOTS}/bank-1280.png')
    # Back returns to the search
    page.go_back(); page.wait_for_selector('.rs input[type=search]')
    assert page.evaluate('location.hash') == '#search'

    # fresh load of the address: the bank page alone, no search index downloaded
    requested = []
    fresh = context.new_page()
    fresh.on('pageerror', lambda e: errors.append(str(e)))
    fresh.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    fresh.on('request', lambda r: requested.append(r.url))
    fresh.goto(f'{BASE}/#bank/{CLS}/{CH}/{EX}'); fresh.wait_for_selector(f'[data-ex="{EX}"] mjx-container')
    fresh.wait_for_function("document.activeElement && document.activeElement.closest('.bank-ex')?.dataset.ex === '" + EX + "'")
    fresh.wait_for_timeout(300)
    assert in_view(fresh, EX)
    assert not any('resource-index' in u or 'resource-sources' in u or 'resource-search' in u for u in requested), 'bank deep link needs no search index'

    # "Nouvelles valeurs" on the seeded exercise: the card is replaced, the page stays usable, the address does not change
    before = fresh.locator(f'[data-ex="{EX}"] .bank-intro').inner_text()
    n = fresh.locator('.bank-ex').count()
    for _ in range(3):
        fresh.locator(f'[data-ex="{EX}"] [data-renew]').click()
        fresh.wait_for_selector(f'[data-ex="{EX}"] mjx-container')
    assert fresh.locator('.bank-ex').count() == n and fresh.locator(f'[data-ex="{EX}"]').count() == 1
    assert fresh.evaluate('location.hash') == f'#bank/{CLS}/{CH}/{EX}'
    fresh.locator('[data-level-filter="3"]').click()
    fresh.locator('[data-level-filter="0"]').click()
    assert fresh.locator('.bank-ex:visible').count() == n
    # the chapter page without an exercise still behaves as before; the second chapter of the exercise opens too
    fresh.goto(f'{BASE}/#bank/{CLS}/{CH}'); fresh.wait_for_selector('.bank-ex')
    assert fresh.locator('.bank-ex').count() == n and fresh.locator('h1').inner_text().strip() == 'Banque d’exercices'
    fresh.goto(f'{BASE}/#bank/{CLS}/seconde-08/{EX}'); fresh.wait_for_selector(f'[data-ex="{EX}"]')
    # invalid exercise ids fall back like other invalid addresses
    for bad in [f'#bank/{CLS}/{CH}/nope', f'#bank/{CLS}/seconde-01/{EX}', f'#bank/{CLS}/{CH}/{EX}x']:
        fresh.goto(f'{BASE}/{bad}'); fresh.wait_for_selector('main')
        assert fresh.locator('h1').inner_text().strip() == 'Page introuvable', bad
        assert fresh.locator('main a').count() >= 1
    fresh.close()

    # three widths, both themes, no horizontal overflow, targets of 44 px
    for width in (320, 390, 1280):
        for theme in ('light', 'dark'):
            ctx = browser.new_context(viewport={'width': width, 'height': 800}, locale='fr-FR', color_scheme=theme)
            ctx.add_init_script(f"try{{localStorage.setItem('theme','{theme}')}}catch(e){{}}")
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errors.append(str(e)))
            pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            pg.goto(f'{BASE}/#search'); pg.wait_for_selector('.rs input[type=search]'); search(pg, 'forfait')
            assert not overflow(pg), (width, theme, 'search')
            small = pg.evaluate("[...document.querySelectorAll('.rs-item a.rs-act, .rs-item .rs-fav')].filter(e => e.getBoundingClientRect().height < 43.5).length")
            assert small == 0, (width, theme, 'targets', small)
            if SHOTS and theme == 'light' and width in (390, 1280):
                pg.locator(f'.rs-item[data-id="exercise:{EX}"]').scroll_into_view_if_needed(); pg.screenshot(path=f'{SHOTS}/search-{width}.png')
            pg.goto(f'{BASE}/#bank/{CLS}/{CH}/{EX}'); pg.wait_for_selector(f'[data-ex="{EX}"] mjx-container'); pg.wait_for_timeout(400)
            assert not overflow(pg), (width, theme, 'bank')
            assert in_view(pg, EX), (width, theme, 'in view')
            if SHOTS and theme == 'light' and width in (390, 1280): pg.screenshot(path=f'{SHOTS}/bank-{width}.png')
            if SHOTS and theme == 'dark' and width == 390: pg.screenshot(path=f'{SHOTS}/bank-dark-390.png')
            ctx.close()

    # the "show more" of the new group works: a broad word lists many exercises
    page.goto(f'{BASE}/#search'); page.wait_for_selector('.rs input[type=search]'); search(page, 'fonction')
    more = page.locator('.rs-group:has(.rs-item[data-id^="exercise:"]) [data-more]')
    assert more.count() == 1, 'cap and show more on the exercise group'
    grp = more.locator('xpath=ancestor::section[1]')
    assert grp.locator('.rs-item').count() == 5
    more.click(); assert grp.locator('.rs-item').count() > 5

    assert not errors, errors
    browser.close()
print('exercise link browser ok')
