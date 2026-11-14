"""Browser checks of the "related resources" box on chapter, gallery exhibit and laboratory pages:
 - the box appears after scrolling to the end of the page, with live links that open real pages;
 - nothing is repeated from the boxes the page already has (same hrefs), nothing points at the page itself;
 - a page with nothing related shows no box and no heading;
 - the index modules are not requested before the end of the page nears the viewport (students do not pay for the box);
 - 320/390/1280 px in both themes without horizontal overflow, 44 px links, no console error.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/related_browser.py
"""
import os
from playwright.sync_api import sync_playwright
# The home is the visitor home by default (docs/AUDIENCE_MODES.md); these checks are about the student home.
STUDENT = "try{if(!localStorage.getItem('mx-teacher-entry'))localStorage.setItem('mx-teacher-entry','student')}catch(e){}"

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
HEAVY = ('resource-sources', 'resource-index', 'related-box')
PAGES = [('chapter', '#chapter/premiere-01'), ('gallery', '#gallery/logistic-gallery'), ('lab', '#lab/exponential')]

def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')

def open_page(page, hash_, theme='jour'):
    page.goto(f'{BASE}/#home'); page.evaluate(f"localStorage.setItem('maths-explorer-theme', '{theme}')")
    page.goto(f'{BASE}/{hash_}'); page.wait_for_selector('#main')
    page.wait_for_function("!document.querySelector('#chapter-sequence') || document.querySelector('#chapter-sequence').getAttribute('aria-busy') === 'false'")
    page.wait_for_load_state('networkidle')

def scroll_end(page):
    page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)')

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []
    context = browser.new_context(viewport={'width': 390, 'height': 700}, locale='fr-FR')
    context.add_init_script(STUDENT)
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(page.url + ' ' + str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    requested = []
    page.on('request', lambda r: requested.append(r.url))

    for kind, hash_ in PAGES:
        page.close()  # a fresh document: modules loaded for the previous page would hide the lazy request
        page = context.new_page()
        page.on('pageerror', lambda e: errors.append(page.url + ' ' + str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        requested = []
        page.on('request', lambda r: requested.append(r.url))
        open_page(page, hash_)
        # students do not pay: the index is not requested while the end of the page is far away
        assert page.evaluate('document.documentElement.scrollHeight') > 1700, (kind, 'page too short to prove lazy loading')
        assert page.locator('.related-slot').count() == 1 and page.locator('.related-box').count() == 0, kind
        assert not [u for u in requested if any(h in u for h in HEAVY)], (kind, [u for u in requested if any(h in u for h in HEAVY)])
        assert not any('slides/data/index.json' in u for u in requested), 'the deck index is never fetched'
        scroll_end(page)
        page.wait_for_selector('.related-box', timeout=8000)
        assert any('related-box' in u for u in requested), kind
        assert not any('slides/data/index.json' in u for u in requested), 'the box never fetches the deck index'
        box = page.locator('.related-box')
        assert box.locator('h2').count() == 1 and box.get_attribute('aria-labelledby') == 'related-box-title'
        links = box.locator('a').evaluate_all('a => a.map(x => x.getAttribute("href"))')
        assert 1 <= len(links) <= 6 and len(set(links)) == len(links), (kind, links)
        assert hash_ not in links
        # nothing repeated from what the page already links to
        others = page.evaluate("""() => [...document.querySelectorAll('#main a[href^="#"]')].filter(a => !a.closest('.related-box')).map(a => a.getAttribute('href'))""")
        base = lambda h: '/'.join(h.split('/')[:2]) if h.split('/')[0] in ('#lab', '#chapter', '#gallery') else h
        dup = [h for h in links if base(h) in {base(o) for o in others}]
        assert not dup, (kind, dup)
        # no stolen focus, no console error, links open real pages
        assert page.evaluate("document.activeElement === document.body || !document.activeElement.closest('.related-box')")
        for h in links[:3]:
            page.goto(f'{BASE}/#home'); page.goto(f'{BASE}/{h}'); page.wait_for_selector('#main'); page.wait_for_load_state('networkidle')
            txt = page.inner_text('#main')
            assert 'Page introuvable' not in txt and 'Page not found' not in txt, h
        # leaving the page cancels: a late load of the box must not appear on another page
        open_page(page, hash_)
        page.goto(f'{BASE}/#home'); page.wait_for_selector('#home-class')
        scroll_end(page); page.wait_for_timeout(600)
        assert page.locator('.related-box').count() == 0

    # a page with nothing related shows no box, no heading, no empty slot
    open_page(page, '#gallery/reuleaux'); scroll_end(page)
    page.wait_for_function("!document.querySelector('.related-slot')", timeout=8000)
    assert page.locator('.related-box').count() == 0 and 'Ressources liées' not in page.inner_text('#main')

    # English edition of the heading (lab pages follow the interface language)
    open_page(page, '#lab/exponential'); page.evaluate("localStorage.setItem('maths-explorer-v1', JSON.stringify({lang: 'en'}))")
    page.goto(f'{BASE}/#home'); page.goto(f'{BASE}/#lab/exponential'); page.reload(); page.wait_for_selector('#lab2-host'); scroll_end(page)
    page.wait_for_selector('.related-box', timeout=8000)
    assert page.locator('.related-box h2').inner_text() == 'Related resources', page.locator('.related-box h2').inner_text()
    page.evaluate("localStorage.removeItem('maths-explorer-v1')")

    # small screens, both themes: no overflow, 44 px targets
    for width in (320, 390, 1280):
        for theme in ('jour', 'nuit'):
            page.set_viewport_size({'width': width, 'height': 800})
            for kind, hash_ in PAGES:
                open_page(page, hash_, theme); scroll_end(page)
                page.wait_for_selector('.related-box', timeout=8000)
                assert not overflow(page), (width, theme, kind)
                small = page.evaluate("""[...document.querySelectorAll('.related-box a')].map(e => e.getBoundingClientRect().height).filter(h => h < 43.5)""")
                assert not small, (width, theme, kind, small)
                right = page.evaluate("Math.max(...[...document.querySelectorAll('.related-box a')].map(e => e.getBoundingClientRect().right)) <= window.innerWidth")
                assert right, (width, theme, kind)

    assert not errors, errors[:5]
    browser.close()
print('related browser checks passed')
