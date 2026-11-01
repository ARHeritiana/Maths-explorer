"""Browser checks of list ergonomics, for every collection of the site (gallery, challenges, biographies, stories, errors):
 - each open entry has the list of its collection beside it (a sticky column on wide screens, a strip of chips on phones);
 - the list keeps its scroll position when a neighbouring entry is opened and shows the current entry, also on a direct arrival;
 - this holds whatever the length of the collection: the desktop check uses a short window so that even a short list must scroll,
   and a collection with no list, or a list that cannot be reached, fails (nothing is skipped silently).
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/ergonomics_browser.py"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
COLLECTIONS = {'gallery': 'galton', 'challenges': None, 'biographies': None, 'stories': None, 'errors': None}
LINKS = 'aside.sidebar a.lab-link'
VISIBLE_Y = """el => { const b = el.getBoundingClientRect(), t = el.querySelector('[aria-current]'); if (!t) return null; const r = t.getBoundingClientRect(); return r.top >= b.top - 1 && r.bottom <= b.bottom + 1; }"""
VISIBLE_X = """el => { const b = el.getBoundingClientRect(), t = el.querySelector('[aria-current]'); if (!t) return null; const r = t.getBoundingClientRect(); return r.left >= b.left - 1 && r.right <= b.right + 1; }"""

def goto(page, route):
    page.goto(f'{BASE}/#{route}'); page.wait_for_timeout(400)

def first_entry(page, name):
    """Open the index of a collection and return the href of its first entry (the entry pages carry the list)."""
    goto(page, name); page.wait_for_selector('main a[href^="#%s/"]' % name)
    return page.locator('main a[href^="#%s/"]' % name).first.get_attribute('href')

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []

    def new_page(width, height):
        page = browser.new_page(viewport={'width': width, 'height': height}); page.on('pageerror', lambda e: errors.append(str(e))); return page

    for name in COLLECTIONS:
        # ---- wide screen, short window: the sticky column scrolls by itself
        page = new_page(1280, 420)
        entry = first_entry(page, name); page.goto(f'{BASE}/{entry}'); page.wait_for_selector(LINKS)
        count = page.locator(LINKS).count(); assert count >= 4, (name, 'the list of the collection is missing or too short', count)
        side = page.locator('aside.sidebar')
        assert side.evaluate('el => el.scrollHeight > el.clientHeight + 20'), (name, 'a list must scroll by itself in a short window')
        side.evaluate('el => { el.scrollTop = el.scrollHeight; }'); before = side.evaluate('el => el.scrollTop'); assert before > 50, (name, before)
        target = page.locator(LINKS).nth(count - 3); href = target.get_attribute('href')
        target.scroll_into_view_if_needed(); before = side.evaluate('el => el.scrollTop')   # measured after the click's own scroll
        target.click(); page.wait_for_function('h => location.hash === h', arg=href[href.index('#'):]); page.wait_for_timeout(500)
        after = page.locator('aside.sidebar').evaluate('el => el.scrollTop')
        assert after > before * 0.8, (name, 'the list jumped back to the top', before, after)
        assert page.locator('aside.sidebar').evaluate(VISIBLE_Y), (name, 'the current entry is hidden in its list')
        # direct arrival on the last entry
        last = page.locator(LINKS).nth(count - 1).get_attribute('href'); page.goto(f'{BASE}/{last[last.index("#"):]}'); page.wait_for_selector('aside.sidebar [aria-current]'); page.wait_for_timeout(500)
        assert page.locator('aside.sidebar').evaluate(VISIBLE_Y), (name, 'a direct arrival must show the current entry in the list')
        page.close()

        # ---- phone: the strip of chips scrolls sideways and keeps its position
        page = new_page(390, 800)
        entry = first_entry(page, name); page.goto(f'{BASE}/{entry}'); page.wait_for_selector(LINKS)
        strip = page.locator('aside.sidebar .lab-links'); count = page.locator(LINKS).count()
        assert strip.evaluate('el => getComputedStyle(el).overflowX') in ('auto', 'scroll'), (name, 'the list is a scrollable strip on phones')
        assert strip.evaluate('el => el.scrollWidth > el.clientWidth + 20'), (name, 'a strip of', count, 'entries must scroll sideways at 390 px')
        strip.evaluate('el => { el.scrollLeft = el.scrollWidth; }'); before = strip.evaluate('el => el.scrollLeft'); assert before > 50, (name, before)
        target = page.locator(LINKS).nth(count - 3); href = target.get_attribute('href')
        target.scroll_into_view_if_needed(); before = strip.evaluate('el => el.scrollLeft')
        target.click(); page.wait_for_function('h => location.hash === h', arg=href[href.index('#'):]); page.wait_for_timeout(500)
        after = page.locator('aside.sidebar .lab-links').evaluate('el => el.scrollLeft')
        assert after > before * 0.8, (name, 'the strip jumped back to its first chip', before, after)
        assert page.locator('aside.sidebar .lab-links').evaluate(VISIBLE_X), (name, 'the current chip is hidden in the strip')
        last = page.locator(LINKS).nth(count - 1).get_attribute('href'); page.goto(f'{BASE}/{last[last.index("#"):]}'); page.wait_for_selector('aside.sidebar [aria-current]'); page.wait_for_timeout(500)
        assert page.locator('aside.sidebar .lab-links').evaluate(VISIBLE_X), (name, 'a direct arrival must show the current chip')
        page.close()
    assert not errors, errors
    browser.close()
print('PASS: every collection keeps its list beside the open entry, with its scroll position, on wide screens and on phones')
