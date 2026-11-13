"""Browser checks of the Espace professeur (#teacher), the device-local entrance.
 - no preference: the limited edition opens the Teacher area; 'Espace élève' (mode bar) and 'Espace professeur' (footer) switch and persist;
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

    # 1. a device that never chose is a visitor: visitor home, nothing stored, no mode bar; the profile menu switches
    page.goto(f'{BASE}/'); page.wait_for_selector('.home-visitor')
    assert page.evaluate('location.hash') in ('', '#home')
    assert page.evaluate("localStorage.getItem('mx-teacher-entry')") is None, 'landing alone stores nothing'
    assert page.locator('nav.modebar').count() == 0 and page.locator('.brand').get_attribute('href') == '#home'
    assert page.locator('#home-figure-stage canvas').count() == 1, 'the visitor home has a figure to move'
    menu = page.locator('.audience-menu summary'); assert menu.bounding_box()['height'] >= 43
    menu.click(); page.locator('.audience-list [data-set-entry="teacher"]').click(); dashboard(page)
    assert page.evaluate('location.hash') == '#teacher' and page.evaluate("localStorage.getItem('mx-teacher-entry')") == 'teacher'
    assert page.locator('.audience-menu[open]').count() == 0, 'the menu closes on a choice'
    assert page.locator('nav.modebar').count() == 1 and page.locator('.brand').get_attribute('href') == '#teacher'
    sw = page.locator('nav.modebar a[data-set-entry="student"]'); assert sw.count() == 1
    assert sw.bounding_box()['height'] >= 43, 'student link target is at least 44 px'
    page.goto(f'{BASE}/#home'); page.wait_for_selector('#home-class')
    assert page.evaluate('location.hash') == '#home', 'an explicit #home opens the home, not redirected'
    page.goto(f'{BASE}/'); dashboard(page)
    sw.click(); page.wait_for_selector('#home-class')
    assert page.evaluate('location.hash') == '#home' and page.evaluate("localStorage.getItem('mx-teacher-entry')") == 'student'
    page.goto(f'{BASE}/'); page.reload(); page.wait_for_selector('#home-class')
    assert page.evaluate('location.hash') in ('', '#home'), 'the student choice persists on reload'
    assert page.locator('nav.modebar').count() == 0 and page.locator('.brand').get_attribute('href') == '#home'
    # visitor and student share #home: the choice redraws the page without a hash change
    page.locator('.audience-menu summary').click(); page.locator('.audience-list [data-set-entry="visitor"]').click()
    page.wait_for_selector('.home-visitor'); assert page.evaluate("localStorage.getItem('mx-teacher-entry')") == 'visitor'
    page.locator('.audience-cards [data-set-entry="student"]').click(); page.wait_for_selector('#home-class')
    back = page.locator('footer a[data-set-entry="teacher"]'); assert back.count() == 1 and back.is_visible()
    assert back.bounding_box()['height'] >= 43
    back.click(); dashboard(page)
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
    assert page.locator('.lp-script, .lp-tag, a.lp-open').count() == 0, 'no board scripts in Tableau seul'
    assert page.locator('a.lp-tile').count() >= 4
    # one click from #teacher in Tableau seul: the automatismes list, not the projection stage
    page.locator('a.lp-tile[data-recent-id="automatismes"]').click(); page.wait_for_selector('#gen-list li')
    assert page.locator('#auto-stage.presenting').count() == 0, 'not the projection stage'
    assert page.locator('#gen-answers[open]').count() == 1 and page.locator('#gen-list li').count() >= 3
    assert page.locator('#gen-list .gen-answer').first.is_hidden(), 'answers hidden by default'
    assert page.locator('[data-act="project"]').is_visible(), 'projection stays one click away'
    page.locator('#gen-toggle-answers').click(); assert page.locator('#gen-list .gen-answer').first.is_visible()
    page.goto(f'{BASE}/#teacher'); dashboard(page)
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
    page.locator('.td-recent summary').click()
    recents = page.locator('.td-items a').evaluate_all('a => a.map(x => x.getAttribute("href"))')
    assert '#sheets' in recents and '#resources/premiere' in recents, recents
    page.select_option('#td-class', 'premiere'); page.select_option('#td-chapter', chapter)   # browsing seconde moved the class
    page.locator('.td-settings summary').click()
    page.fill('#td-auto-minutes', '3'); page.press('#td-auto-minutes', 'Tab')
    page.fill('#td-auto-count', '5'); page.press('#td-auto-count', 'Tab')
    page.select_option('#td-auto-seed', 'new')
    page.locator('.lp-grid a.lp-tile').first.click()
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
    page.locator('.td-settings summary').click(); page.select_option('#td-auto-seed', 'keep'); page.locator('.lp-grid a.lp-tile').first.click()
    page.wait_for_selector('#auto-stage.presenting')
    assert page.input_value('input[name=seed]') == seed1, 'same-series policy keeps the code'
    assert page.locator('[data-act="print-student"]').count() == 1 and page.locator('[data-act="tex-student"]').count() == 1 and page.locator('[data-act="projection-file"]').count() == 1
    page.goto(f'{BASE}/#teacher'); dashboard(page)
    page.evaluate('document.documentElement.classList.remove("is-presenting")')

    # 5. switch back to the student home
    page.locator(".td-settings summary").click(); page.locator('.td-settings [data-set-entry="student"]').click()
    page.wait_for_selector('#home-class')
    assert page.evaluate("localStorage.getItem('mx-teacher-entry')") == 'student'
    page.goto(f'{BASE}/'); page.reload(); page.wait_for_selector('#home-class')
    assert page.evaluate('location.hash') in ('', '#home')

    # 5b. mode bar: absent for a fresh student, present after choosing the teacher entrance, remembered across reloads
    fresh = browser.new_context(viewport={'width': 1280, 'height': 800}); fp = fresh.new_page()
    fp.on('pageerror', lambda e: errors.append(str(e)))
    fp.goto(f'{BASE}/'); fp.wait_for_selector('.home-visitor')
    assert fp.locator('nav.modebar').count() == 0, 'unstored choice: visitor, no bar'
    fp.locator('.audience-cards [data-set-entry="student"]').click(); fp.wait_for_selector('#home-class')
    assert fp.locator('nav.modebar').count() == 0, 'student experience untouched'
    fp.goto(f'{BASE}/#resources'); fp.wait_for_selector('.chapter-grid, main')
    assert fp.locator('nav.modebar').count() == 0
    fp.goto(f'{BASE}/'); fp.wait_for_selector('#home-class'); fp.locator('footer a[data-set-entry="teacher"]').click(); dashboard(fp)
    assert fp.locator('nav.modebar a[data-teacher-mode]').count() == 3
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
    # 5b2. Détente: the day's cards (four in the limited edition, five with the Olympiad), every link opens a real page, redraw
    fp.goto(f'{BASE}/#relax'); fp.wait_for_selector('#rx-today .rx-card')
    olympiad_live = fp.evaluate("import('./js/live-curriculum.js').then(m => m.isLiveHash('#olympiad'))")
    assert fp.locator('#rx-today .rx-card').count() == (5 if olympiad_live else 4), 'the picks of the day'
    assert fp.locator('#rx-today .rx-card a.rx-go').count() == fp.locator('#rx-today .rx-card').count()
    fp.locator('#rx-draw').click()
    assert fp.locator('#rx-surprise .rx-card').count() == 1 and fp.locator('#rx-live').inner_text().strip() != ''
    for a in fp.locator('#rx-today a.rx-go, .rx-more a').evaluate_all('a => a.map(x => x.getAttribute("href"))'):
        fp.goto(f'{BASE}/{a}'); fp.wait_for_timeout(300)
        assert fp.locator('h1:text-matches("^(Page introuvable|Page not found)$")').count() == 0, a
    for width in (320, 390, 1440):
        fp.set_viewport_size({'width': width, 'height': 800}); fp.goto(f'{BASE}/#relax'); fp.wait_for_selector('#rx-today .rx-card')
        fp.locator('#rx-draw').click()
        assert not overflow(fp), ('relax', width)
        assert fp.locator('.rx-go, .rx-more a, .rx-draw').evaluate_all('a => a.every(x => x.getBoundingClientRect().height >= 43)'), width
    fp.set_viewport_size({'width': 1280, 'height': 800})
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

    # 5c. in-class dock: only for a device in mode classe, on tool pages
    dk = browser.new_context(viewport={'width': 1280, 'height': 800}); dp = dk.new_page()
    dp.on('pageerror', lambda e: errors.append(str(e)))
    dp.goto(f'{BASE}/#resources'); dp.wait_for_selector('.chapter-grid, main')
    assert dp.locator('#mx-dock').count() == 0, 'students never get the dock'
    assert dp.evaluate("[...document.scripts].length >= 0") and not dp.evaluate("performance.getEntriesByType('resource').some(r => r.name.includes('dock.js'))"), 'students do not download it'
    dp.evaluate("localStorage.setItem('mx-teacher-entry','teacher'); localStorage.setItem('mx-teacher-mode','classe')")
    for h in ('#teacher', '#prepare', '#relax', '#home', ''):
        dp.goto(f'{BASE}/{h}'); dp.wait_for_selector('h1, #home-class'); dp.wait_for_timeout(300)
        assert dp.locator('#mx-dock:visible').count() == 0, f'no dock on {h or "home"}'
    dp.goto(f'{BASE}/#teacher'); dashboard(dp)
    dp.select_option('#td-class', 'premiere'); dp.select_option('#td-chapter', 'premiere-02')
    for h in ('#bank/premiere/premiere-02', '#automatismes', '#lab', '#chapter/premiere-02'):
        dp.goto(f'{BASE}/{h}'); dp.wait_for_selector('#mx-dock:visible')
        assert dp.locator('#mx-dock .dock-link').count() == 7, h
        assert dp.locator('#mx-dock .dock-back').get_attribute('href') == '#teacher'
        assert dp.evaluate("parseFloat(getComputedStyle(document.body).paddingBottom) >= 56"), 'content clears the dock'
    dp.goto(f'{BASE}/#bank/premiere/premiere-02'); dp.wait_for_selector('#mx-dock:visible')
    assert dp.locator('#mx-dock [aria-current="page"]').get_attribute('data-dock-phase') == 'exercices'
    # links reach their pages in one click
    for phase in ('automatismes', 'activite', 'cours', 'outils'):
        dp.goto(f'{BASE}/#bank/premiere/premiere-02'); dp.wait_for_selector('#mx-dock:visible')
        link = dp.locator(f'#mx-dock a[data-dock-phase="{phase}"]'); href = link.get_attribute('href')
        link.click(); dp.wait_for_timeout(500)
        if href.startswith('#'):
            assert dp.locator('h1').first.inner_text() not in ('Page introuvable', 'Page not found'), href
            if phase == 'automatismes':
                dp.wait_for_selector('#auto-stage.presenting')
                assert dp.locator('#mx-dock:visible').count() == 0, 'the one-click series opens the projection: dock hidden'
                dp.evaluate("document.querySelector('#auto-stage').classList.remove('presenting'); document.documentElement.classList.remove('is-presenting')")
            else:
                assert dp.locator('#mx-dock:visible').count() == 1, 'dock stays on the next tool page'
        else:
            assert 'player.html' in dp.url, dp.url
    dp.goto(f'{BASE}/#automatismes'); dp.wait_for_selector('#mx-dock:visible')
    assert dp.locator('#mx-dock a[data-dock-next]').count() == 1 and dp.locator('#mx-dock a[data-dock-prev]').count() == 0
    dp.locator('#mx-dock a[data-dock-next]').click(); dp.wait_for_timeout(300)
    assert dp.evaluate('location.hash').startswith('#bank/'), 'next goes to the following phase'
    dp.locator('#mx-dock .dock-back').click(); dashboard(dp)
    assert dp.locator('#mx-dock:visible').count() == 0
    # collapse persists across a reload
    dp.goto(f'{BASE}/#lab'); dp.wait_for_selector('#mx-dock:visible')
    dp.locator('#mx-dock [data-dock-toggle]').click()
    assert dp.locator('#mx-dock .dock-link').count() == 0 and dp.locator('#mx-dock .dock-tab').count() == 1
    assert dp.evaluate("JSON.parse(localStorage.getItem('mx-teacher-tools')).dockCollapsed") is True
    dp.reload(); dp.wait_for_selector('#mx-dock .dock-tab')
    assert dp.locator('#mx-dock .dock-link').count() == 0, 'collapsed after reload'
    dp.locator('#mx-dock .dock-tab').click(); assert dp.locator('#mx-dock .dock-link').count() == 7
    # hidden while the automatismes projection stage is open
    dp.goto(f'{BASE}/#teacher'); dashboard(dp)
    dp.locator('a.lp-tile[data-recent-id="automatismes"]').click(); dp.wait_for_selector('#auto-stage.presenting')
    assert dp.locator('#mx-dock:visible').count() == 0, 'hidden during the projection stage'
    dp.keyboard.press('Escape'); dp.evaluate("document.fullscreenElement && document.exitFullscreen(); document.querySelector('#auto-stage').classList.remove('presenting'); document.documentElement.classList.remove('is-presenting')")
    dp.wait_for_selector('#mx-dock', state='visible', timeout=5000)
    assert dp.locator('#mx-dock:visible').count() == 1, 'back after the projection'
    # no overflow, 44 px targets, both themes
    for width in (320, 390, 1440):
        dp.set_viewport_size({'width': width, 'height': 800})
        for theme in ('jour', 'nuit'):
            for h in ('#bank/premiere/premiere-02', '#automatismes', '#lab', '#chapter/premiere-02'):
                dp.goto(f'{BASE}/{h}'); dp.wait_for_selector('#mx-dock:visible')
                dp.evaluate(f"document.documentElement.dataset.theme = '{theme}'")
                assert not overflow(dp), (width, theme, h)
                small = dp.evaluate("""() => [...document.querySelectorAll('#mx-dock a, #mx-dock button')].filter(e => e.offsetParent && e.getBoundingClientRect().height < 43).map(e => e.outerHTML.slice(0, 80))""")
                assert not small, small
                assert dp.evaluate("(() => { const r = document.querySelector('#mx-dock').getBoundingClientRect(); return r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; })()")
    dk.close()

    # 5b. Préparer: add from the chapter sheet and from search, reorder, reload keeps it, launch in class shows the strip
    pg = context.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(f'{BASE}/#prepare'); pg.wait_for_selector('#pp-class')
    pg.evaluate("localStorage.removeItem('mx-teacher-seance')"); pg.reload(); pg.wait_for_selector('#pp-class')
    pg.select_option('#pp-class', 'premiere'); pg.select_option('#pp-chapter', 'premiere-02')
    pg.locator('[data-pp="add-phase"]').first.click()
    assert pg.locator('.pp-block').count() == 1
    pg.fill('#pp-q', 'second degré'); pg.wait_for_selector('.pp-result [data-pp="add-result"]')
    pg.locator('[data-pp="add-result"]').first.click()
    assert pg.locator('.pp-block').count() == 2
    first_title = pg.locator('.pp-block strong').first.inner_text()
    stored = lambda: pg.evaluate("JSON.parse(localStorage.getItem('mx-teacher-seance')).blocks.map(b => b.id)")
    assert pg.locator('[data-pp="up"], [data-pp="down"]').count() == 0, 'no up/down buttons'
    # keyboard: ArrowDown on the focused grip moves the block and keeps focus on a grip
    pg.locator('.pp-grip').first.focus(); pg.keyboard.press('ArrowDown')
    assert pg.locator('.pp-block strong').nth(1).inner_text() == first_title, 'reordered by keyboard'
    assert pg.evaluate("document.activeElement.classList.contains('pp-grip')"), 'focus kept on a grip'
    assert 'position 2' in pg.locator('#pp-live').inner_text()
    # real pointer drag: add a third block, drag the 3rd above the 1st
    pg.locator('[data-pp="add-result"]').nth(1).click()
    assert pg.locator('.pp-block').count() == 3
    before = stored(); assert len(before) == 3
    g3, b1 = pg.locator('.pp-grip').nth(2).bounding_box(), pg.locator('.pp-block').first.bounding_box()
    pg.mouse.move(g3['x'] + g3['width'] / 2, g3['y'] + g3['height'] / 2); pg.mouse.down()
    pg.mouse.move(g3['x'] + 4, g3['y'] - 20, steps=4); pg.mouse.move(g3['x'] + 4, b1['y'] + 4, steps=6)
    assert pg.locator('.pp-drop-line').count() == 1 and pg.locator('.pp-block.is-lifted').count() == 1, 'insertion line while dragging'
    pg.mouse.up()
    assert stored() == [before[2], before[0], before[1]], ('dropped first', before, stored())
    assert pg.locator('.pp-drop-line').count() == 0
    pg.locator('.pp-grip').nth(1).click(); assert stored() == [before[2], before[0], before[1]], 'a click on a grip moves nothing'
    first_title = pg.locator('.pp-block strong').first.inner_text()
    pg.locator('[data-pp="remove"]').last.click(); assert pg.locator('.pp-block').count() == 2
    first_title = pg.locator('.pp-block strong').nth(1).inner_text()
    pg.reload(); pg.wait_for_selector('#pp-class')
    assert pg.locator('.pp-block').count() == 2 and pg.locator('.pp-block strong').nth(1).inner_text() == first_title, 'reload keeps it'
    pg.locator('#pp-launch').click(); pg.wait_for_selector('.lp-blocks')
    assert pg.locator('.lp-blocks li').count() == 2 and pg.evaluate('location.hash') == '#teacher'
    for width in (320, 390, 1440):
        pg.set_viewport_size({'width': width, 'height': 800})
        pg.goto(f'{BASE}/#prepare'); pg.wait_for_selector('#pp-class')
        assert not overflow(pg), ('prepare', width)
        small = pg.evaluate("""() => [...document.querySelectorAll('#main a, #main button, #main select, #main input:not([type=checkbox])')]
          .filter(e => e.offsetParent && !e.classList.contains('sr-only') && e.getBoundingClientRect().height < 43).map(e => e.outerHTML.slice(0, 80))""")
        assert not small, small
    pg.close()

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
