"""Browser checks of the Espace professeur (#teacher), the device-local entrance.
 - no preference: the student home opens untouched, with a way to choose the Teacher area;
 - choosing it is remembered: a fresh visit with an empty address lands on the dashboard, the logo goes there,
   and a visible switch returns to the student home (and is remembered too);
 - class and chapter selectors override and persist; the chapter list is limited to the class;
 - every quick action is a working link to an existing page (opened, no "Page introuvable");
 - storage blocked: the page still works and shows the banner;
 - 320 px without horizontal overflow, in both themes, no console error, controls at least 44 px high.
Run through tests/run_browser.py, or alone against a running server: MATHS_EXPLORER_URL=http://localhost:4173 python tests/teacher_browser.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')

def dashboard(page):
    page.wait_for_selector('#td-class')

def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 1')

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    errors = []
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

    # 1. a new visitor sees the student home, never the dashboard
    page.goto(f'{BASE}/'); page.wait_for_selector('#home-class')
    assert page.evaluate('location.hash') in ('', '#home')
    page.locator('.teacher-entry summary').click()
    page.locator('[data-set-entry="teacher"]').click()
    dashboard(page)
    assert page.evaluate('location.hash') == '#teacher'
    assert page.evaluate("localStorage.getItem('mx-teacher-entry')") == 'teacher'

    # 2. a later visit without a destination lands on the dashboard; the logo too
    page.goto(f'{BASE}/'); page.reload(); dashboard(page)
    assert page.evaluate('location.hash') == '#teacher'
    page.goto(f'{BASE}/#lab'); page.wait_for_selector('.lab-index, main')
    assert page.evaluate('location.hash') == '#lab', 'explicit links are not redirected'
    assert page.locator('.brand').get_attribute('href') == '#teacher'

    # 3. class and chapter
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    page.select_option('#td-class', 'premiere')
    options_ = page.locator('#td-chapter option').evaluate_all('o => o.map(x => x.value).filter(Boolean)')
    assert options_ and all(v.startswith('premiere') for v in options_), options_
    page.select_option('#td-chapter', options_[0])
    page.reload(); dashboard(page)
    assert page.input_value('#td-class') == 'premiere' and page.input_value('#td-chapter') == options_[0]
    assert page.evaluate("localStorage.getItem('mx-home-course')") == 'premiere', 'shared with the rest of the site'

    # 4. every enabled quick action leads to a real page
    hrefs = page.locator('a.td-action').evaluate_all('a => a.map(x => x.getAttribute("href"))')
    assert len(hrefs) >= 4, hrefs
    for href in hrefs:
        page.goto(f'{BASE}/#teacher'); dashboard(page)
        page.locator(f'a.td-action[href="{href}"]').click()
        page.wait_for_timeout(400)
        if href.startswith('#'):
            assert page.locator('h1').first.inner_text() != 'Page introuvable', href
        else:
            assert 'player.html' in page.url, page.url
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    assert page.locator('.td-items a').count() >= 1, 'opened actions are listed as recent items'

    # 5. switch back to the student home
    page.locator('[data-set-entry="student"]').click()
    page.wait_for_selector('#home-class')
    assert page.evaluate("localStorage.getItem('mx-teacher-entry')") == 'student'
    page.goto(f'{BASE}/'); page.reload(); page.wait_for_selector('#home-class')
    assert page.evaluate('location.hash') in ('', '#home')

    # 6. phone width and both themes: no overflow, targets of at least 44 px
    for width in (320, 390, 1440):
        page.set_viewport_size({'width': width, 'height': 800})
        for theme in ('jour', 'nuit'):
            page.goto(f'{BASE}/#teacher'); dashboard(page)
            page.evaluate(f"document.documentElement.dataset.theme = '{theme}'")
            assert not overflow(page), (width, theme)
            small = page.evaluate("""() => [...document.querySelectorAll('#main a, #main button, #main select, #main input')]
              .filter(e => e.offsetParent && e.getBoundingClientRect().height < 43).map(e => e.outerHTML.slice(0, 80))""")
            assert not small, small
    # reduced motion does not matter here (no animation); the page must still render
    page.emulate_media(reduced_motion='reduce'); page.goto(f'{BASE}/#teacher'); dashboard(page)

    # 7. storage blocked
    blocked = browser.new_context(viewport={'width': 1280, 'height': 800})
    blocked.add_init_script("Object.defineProperty(window, 'localStorage', {get() { throw new Error('blocked'); }})")
    bp = blocked.new_page()
    bp.goto(f'{BASE}/#teacher'); dashboard(bp)
    assert bp.locator('.td-banner').count() == 1
    bp.select_option('#td-class', 'seconde')
    assert bp.input_value('#td-class') == 'seconde'

    assert not [e for e in errors if 'blocked' not in e], errors
    browser.close()
print('teacher browser checks passed')
