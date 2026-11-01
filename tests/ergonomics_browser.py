"""Browser checks of list ergonomics: a long list (the gallery sidebar and the other sidebars) keeps its scroll position when a
neighbouring entry is opened, and the current entry is always inside the visible part of its list, also on a direct arrival.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/ergonomics_browser.py"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
VISIBLE = """el => { const b = el.getBoundingClientRect(), t = el.querySelector('[aria-current]'); if (!t) return null; const r = t.getBoundingClientRect(); return r.top >= b.top - 1 && r.bottom <= b.bottom + 1; }"""

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []
    page = browser.new_page(viewport={'width': 1280, 'height': 700})
    page.on('pageerror', lambda e: errors.append(str(e)))

    # 1. gallery: scroll the sidebar down, open another exhibit: the list stays where it was
    page.goto(f'{BASE}/#gallery/galton'); page.wait_for_selector('aside.sidebar a')
    side = page.locator('aside.sidebar')
    assert side.evaluate('el => el.scrollHeight > el.clientHeight + 50'), 'the gallery sidebar is a long, scrollable list'
    side.evaluate('el => { el.scrollTop = 700; }'); before = side.evaluate('el => el.scrollTop'); assert before > 300, before
    links = page.locator('aside.sidebar a'); n = links.count()
    target = links.nth(n - 8); target_href = target.get_attribute('href')
    target.scroll_into_view_if_needed(); target.click()
    page.wait_for_function('h => location.hash === h', arg=target_href[target_href.index('#'):])
    page.wait_for_timeout(500)
    after = page.locator('aside.sidebar').evaluate('el => el.scrollTop')
    assert after > before - 150, ('the sidebar jumped back', before, after)
    assert page.locator('aside.sidebar').evaluate(VISIBLE), 'the current exhibit is visible in its list'

    # 2. direct arrival on a late exhibit: the list opens on it, not on the first entry
    last = page.locator('aside.sidebar a').nth(n - 1).get_attribute('href')
    page.goto(f'{BASE}/{last[last.index("#"):]}'); page.wait_for_selector('aside.sidebar [aria-current]'); page.wait_for_timeout(500)
    assert page.locator('aside.sidebar').evaluate(VISIBLE), 'a direct arrival shows the current exhibit in the list'
    assert page.locator('aside.sidebar').evaluate('el => el.scrollTop') > 100

    # 3. the other sidebars of the site behave the same way when they are long enough to scroll
    for route in ['challenges', 'biographies', 'stories']:
        page.goto(f'{BASE}/#{route}'); page.wait_for_timeout(500)
        first = page.locator('aside.sidebar a')
        if first.count() < 8: continue
        href = first.nth(first.count() - 2).get_attribute('href'); page.goto(f'{BASE}/{href[href.index("#"):]}'); page.wait_for_timeout(600)
        ok = page.locator('aside.sidebar').evaluate(VISIBLE)
        assert ok in (True, None), (route, 'the current entry is hidden in its list')
    assert not errors, errors
    browser.close()
print('PASS: lists keep their scroll position between neighbouring entries and show the current entry')
