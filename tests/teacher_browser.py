"""Browser checks of the Espace professeur (#teacher), the device-local entrance.
 - no preference: the student home opens untouched, with a way to choose the Teacher area;
 - choosing it is remembered: a fresh visit with an empty address lands on the dashboard, the logo goes there,
   and a visible switch returns to the student home (and is remembered too);
 - class and chapter selectors override and persist; the chapter list is limited to the class;
 - En classe launch pad: seven tiles, each available tile reaches its page in one click, the automatismes tile starts the
   timed series, Projecteur / Tableau seul persists, the séance proposal is stored and shown;
 - every pad tile is a working link to an existing page (opened, no "Page introuvable");
 - storage blocked: the page still works and shows the banner;
 - mode bar (Préparer, En classe, Détente): hidden for students, shown for the teacher entrance, remembered;
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
    hrefs = page.locator('a.lp-tile').evaluate_all('a => a.map(x => x.getAttribute("href"))')
    assert len(hrefs) >= 4, hrefs
    assert page.locator('.lp-grid > li').count() == 7, 'seven phases'
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    page.locator('a.lp-tile[data-recent-id="automatismes"]').click(); page.wait_for_selector('#auto-stage.presenting')
    assert page.evaluate('location.hash') == '#automatismes', 'automatismes tile: one click to the timed series'
    for href in hrefs:
        page.goto(f'{BASE}/#teacher'); dashboard(page)
        page.locator(f'a.lp-tile[href="{href}"]').first.click()
        page.wait_for_timeout(400)
        if href.startswith('#'):
            assert page.locator('h1').first.inner_text() != 'Page introuvable', href
        else:
            assert 'player.html' in page.url, page.url
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    assert page.locator('.td-items a').count() >= 1, 'opened actions are listed as recent items'

    # 4a. board view persists across a reload; the pad keeps the link as Ouvrir; a standard séance is proposed, stored and shown
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    page.locator('[data-view="tableau"]').click()
    assert page.locator('.lp-script').count() == 7 and page.locator('a.lp-open').count() >= 4
    page.reload(); dashboard(page)
    assert page.locator('[data-view="tableau"]').get_attribute('aria-pressed') == 'true', 'switch persists'
    assert page.evaluate("JSON.parse(localStorage.getItem('mx-teacher-tools')).view") == 'tableau'
    page.locator('[data-view="projecteur"]').click()
    page.locator('[data-td="propose"]').click()
    assert page.locator('.lp-blocks li').count() >= 4
    assert page.evaluate("JSON.parse(localStorage.getItem('mx-teacher-seance')).blocks.length") >= 4
    page.reload(); dashboard(page)
    assert page.locator('.lp-blocks li').count() >= 4, 'séance stored'
    page.locator('.lp-blocks a').first.click(); page.wait_for_timeout(300)
    assert page.locator('h1').first.inner_text() != 'Page introuvable'

    # 4b. shared class and chapter reach the generators, lessons and exercises; one-click timed starters
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    chapter = 'premiere-02'   # a chapter that has generator questions
    assert chapter in options_
    page.select_option('#td-class', 'premiere'); page.select_option('#td-chapter', chapter)
    page.goto(f'{BASE}/#sheets'); page.wait_for_selector('#gen-form')
    assert page.locator('[data-ctx-note]').count() == 1, 'the preselected chapter is announced'
    assert page.locator('input[name="chapter"]:checked').evaluate_all('e => e.map(x => x.value)') == [chapter]
    page.locator('[data-ctx-all]').click()
    assert page.locator('input[name="chapter"]:checked').count() == 0, 'one click widens to every chapter'
    assert page.locator('[data-ctx-note]').count() == 0
    page.goto(f'{BASE}/#resources/premiere'); page.wait_for_selector('[data-ctx-strip]')
    assert page.locator('[data-ctx-strip] a').first.get_attribute('href') == f'#chapter/{chapter}'
    page.goto(f'{BASE}/#resources/seconde'); page.wait_for_selector('.chapter-grid')
    assert page.locator('[data-ctx-strip]').count() == 0, 'another class is never filtered by the device choice'
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    recents = page.locator('.td-items a').evaluate_all('a => a.map(x => x.getAttribute("href"))')
    assert '#sheets' in recents and '#resources/premiere' in recents, recents
    page.select_option('#td-class', 'premiere'); page.select_option('#td-chapter', chapter)   # browsing seconde moved the class
    page.locator('.td-timed summary').click()
    page.fill('#td-auto-minutes', '3'); page.press('#td-auto-minutes', 'Tab')
    page.fill('#td-auto-count', '5'); page.press('#td-auto-count', 'Tab')
    page.select_option('#td-auto-seed', 'new')
    page.locator('a.td-go').click()
    page.wait_for_selector('#auto-stage.presenting')
    assert page.evaluate('location.hash') == '#automatismes', 'reload never relaunches'
    assert page.input_value('input[name=minutes]') == '3' and page.input_value('input[name=count]') == '5'
    assert page.evaluate("document.querySelector(\"select[name=cls]\").value") == "premiere", page.evaluate("[document.querySelector(\"select[name=cls]\").value, localStorage.getItem(\"mx-home-course\")]")
    assert page.locator('input[name="chapter"]:checked').evaluate_all('e => e.map(x => x.value)') == [chapter]
    seed1 = page.input_value('input[name=seed]')
    q1 = page.locator('#st-q').inner_text()
    page.locator('#st-play').click(); page.wait_for_timeout(1300)
    assert page.locator('#st-timer').inner_text() != '', 'timer runs'
    page.keyboard.press('a'); page.wait_for_timeout(200)
    assert page.locator('#st-reveal').get_attribute('aria-pressed') == 'true', 'solution reveal still works'
    page.locator('#st-play').click()
    page.keyboard.press('Escape')
    page.evaluate("document.querySelector('#auto-stage').classList.remove('presenting')")
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    page.locator('.td-timed summary').click(); page.select_option('#td-auto-seed', 'keep'); page.locator('a.td-go').click()
    page.wait_for_selector('#auto-stage.presenting')
    assert page.input_value('input[name=seed]') == seed1, 'same-series policy keeps the code'
    assert page.locator('[data-act="print-student"]').count() == 1 and page.locator('[data-act="tex-student"]').count() == 1 and page.locator('[data-act="projection-file"]').count() == 1
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    page.evaluate('document.documentElement.classList.remove("is-presenting")')

    # 5. switch back to the student home
    page.locator('[data-set-entry="student"]').click()
    page.wait_for_selector('#home-class')
    assert page.evaluate("localStorage.getItem('mx-teacher-entry')") == 'student'
    page.goto(f'{BASE}/'); page.reload(); page.wait_for_selector('#home-class')
    assert page.evaluate('location.hash') in ('', '#home')

    # 5b. mode bar: absent for a fresh student, present after choosing the teacher entrance, remembered across reloads
    fresh = browser.new_context(viewport={'width': 1280, 'height': 800}); fp = fresh.new_page()
    fp.on('pageerror', lambda e: errors.append(str(e)))
    fp.goto(f'{BASE}/'); fp.wait_for_selector('#home-class')
    assert fp.locator('nav.modebar').count() == 0, 'student experience untouched'
    fp.goto(f'{BASE}/#resources'); fp.wait_for_selector('.chapter-grid, main')
    assert fp.locator('nav.modebar').count() == 0
    fp.goto(f'{BASE}/'); fp.locator('.teacher-entry summary').click(); fp.locator('[data-set-entry="teacher"]').click(); dashboard(fp)
    assert fp.locator('nav.modebar a').count() == 3
    assert fp.locator('nav.modebar [aria-current="page"]').get_attribute('data-teacher-mode') == 'classe'
    fp.locator('nav.modebar a[data-teacher-mode="preparer"]').click(); fp.wait_for_selector('h1')
    assert fp.evaluate('location.hash') == '#prepare' and fp.locator('h1').first.inner_text() in ('Préparer', 'Prepare')
    assert fp.locator('nav.modebar [aria-current="page"]').get_attribute('data-teacher-mode') == 'preparer'
    fp.locator('nav.modebar a[data-teacher-mode="detente"]').click(); fp.wait_for_selector('h1')
    assert fp.evaluate('location.hash') == '#relax' and fp.locator('h1').first.inner_text() in ('Détente', 'Relax')
    fp.locator('nav.modebar a[data-teacher-mode="classe"]').click(); dashboard(fp)
    assert fp.evaluate('location.hash') == '#teacher'
    for h in ('#prepare', '#relax'):
        fp.goto(f'{BASE}/{h}'); fp.wait_for_selector('h1')
        for a in fp.locator('main a[href^="#"]').evaluate_all('a => a.map(x => x.getAttribute("href"))'):
            fp.goto(f'{BASE}/{a}'); fp.wait_for_timeout(250)
            assert fp.locator('h1:text-matches("^(Page introuvable|Page not found)$")').count() == 0, a
    # a tool opened from a mode keeps that mode highlighted, also after a reload
    fp.goto(f'{BASE}/#prepare'); fp.wait_for_selector('h1'); fp.locator('nav.modebar a[data-teacher-mode="preparer"]').click()
    fp.goto(f'{BASE}/#bank/annales'); fp.wait_for_selector('nav.modebar')
    assert fp.locator('nav.modebar [aria-current="page"]').get_attribute('data-teacher-mode') == 'preparer'
    fp.reload(); fp.wait_for_selector('nav.modebar')
    assert fp.locator('nav.modebar [aria-current="page"]').get_attribute('data-teacher-mode') == 'preparer', 'remembered mode survives a reload'
    assert fp.evaluate("localStorage.getItem('mx-teacher-mode')") == 'preparer'
    for width in (320, 390):
        fp.set_viewport_size({'width': width, 'height': 800})
        for h in ('#teacher', '#prepare', '#relax', '#bank/annales'):
            fp.goto(f'{BASE}/{h}'); fp.wait_for_selector('nav.modebar')
            assert not overflow(fp), (width, h)
            assert fp.locator('nav.modebar a').evaluate_all('a => a.every(x => x.getBoundingClientRect().height >= 43)')
    fresh.close()

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
