"""French-only live interface. Run against npm start with system Chromium or Playwright."""
import os
import shutil
from playwright.sync_api import sync_playwright
# The home is the visitor home by default (docs/AUDIENCE_MODES.md); these checks are about the student home.
STUDENT = "try{if(!localStorage.getItem('mx-teacher-entry'))localStorage.setItem('mx-teacher-entry','student')}catch(e){}"

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173/')
COURSES = ['seconde', 'premiere', 'terminale', 'expertes', 'stmg']

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_PATH') or shutil.which('chromium'))
    context = browser.new_context(locale='en-US', reduced_motion='reduce')
    context.add_init_script("""
      localStorage.setItem('maths-explorer-v1', JSON.stringify({lang:'fr', last:'t10-01', seen:['t10-01']}));
      sessionStorage.setItem('mx-course', 't11s');
      sessionStorage.setItem('mx-pathway', 'mg');
    """)
    context.add_init_script(STUDENT)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def go(route):
        page.goto(BASE + route)
        page.locator('main').wait_for()
        page.wait_for_timeout(150)
        assert page.locator('html').get_attribute('lang') == 'fr'

    def scoped_links():
        bad = page.evaluate("""async () => {
          const {isLiveHash} = await import('./js/live-curriculum.js');
          return [...document.querySelectorAll('#app a[href^="#"]')]
            .map(a => a.getAttribute('href')).filter(h => !isLiveHash(h));
        }""")
        assert not bad, bad

    go('#home')
    assert page.locator('#home-class option').count() == 6
    assert page.locator('.secondary-entry[aria-labelledby="beyond-heading"] a').count() == 3
    assert page.locator('.figure-tab').count() == 0
    assert page.locator('.mainnav a').count() == 3
    assert page.locator('.home-resume').count() == 0
    page.locator('#home-query').fill('dérivée')
    page.locator('.home-result').first.wait_for()
    scoped_links()
    page.locator('#home-query').fill('T11')
    assert page.locator('.home-result').count() == 0
    for course in COURSES:
        go('#resources/' + course)
        assert page.locator('.res-rail [data-course]').count() == 5
        assert page.locator('.res-rail [data-course][aria-pressed="true"]').get_attribute('data-course') == course
        assert page.locator('.chapter-tile').count() > 0
        scoped_links()
    page.locator('#resource-search').fill('logarithme')
    assert page.locator('.chapter-tile').count() > 0
    scoped_links()

    for route in ['#resources/t10', '#slides/t11s', '#bank/t10', '#chapter/t11s-01', '#library/t10-01', '#pack/t10', '#university']:
        go(route)
        assert page.evaluate('location.hash') == '#resources', route
        assert page.locator('.res-rail [data-course]').count() == 5

    go('#slides')
    page.locator('.deck-card').first.wait_for()
    assert page.locator('.slides-page [data-course]').count() == 5
    scoped_links()
    go('#bank')
    assert set(page.locator('.res-rail a[href^="#bank/"]').evaluate_all('(nodes) => nodes.map(n => n.getAttribute("href"))')) == {'#bank/' + course for course in COURSES}
    assert page.locator('.bank-sections a[href="#bank/annales"]').count() == 1
    scoped_links()
    go('#pack')
    page.locator('[name=course]').first.wait_for()
    assert page.locator('[name=course]').count() == 7
    scoped_links()
    go('#sources')
    page.locator('[data-zip]').first.wait_for()
    assert set(page.locator('[data-zip]').evaluate_all('(nodes) => nodes.map(n => n.dataset.zip)')) == set(COURSES + ['automatismes', 'enrichment'])
    go('#library')
    page.locator('#resource-course option').nth(1).wait_for(state='attached')
    assert page.locator('#resource-course option').count() == 8
    assert page.locator('#resource-curriculum option').count() == 2
    scoped_links()
    go('#pathways')
    assert page.evaluate('location.hash') == '#resources'
    assert page.locator('a[href="#pathways"]').count() == 0
    scoped_links()
    for route in ['#chapter/premiere-03/cours', '#chapter/premiere-03/manipuler', '#chapter/premiere-03/documents', '#bank/seconde/seconde-01', '#automatismes', '#sheets', '#lab/quadratic/vertex']:
        go(route)
        assert page.evaluate('location.hash') == route, route
        scoped_links()

    for route, selector in [('#gallery', '.wonder-grid'), ('#gallery/fourier', '#object-stage'),
                            ('#lab', '.lab2-card-link'), ('#topics', '.discovery-page'),
                            ('#basics', 'main'), ('#challenges', 'main'),
                            ('#stories', 'main'), ('#biographies', 'main')]:
        go(route)
        page.locator(selector).first.wait_for()
        assert page.evaluate('location.hash') == route, route
        scoped_links()
    go('#history/advances')
    assert page.evaluate('location.hash') == '#history/advances'
    scoped_links()

    for theme in ['jour', 'nuit']:
        for width in [320, 390, 1280]:
            page.set_viewport_size({'width': width, 'height': 900})
            for route in ['#home', '#resources', '#bank', '#slides', '#pack', '#sources']:
                go(route)
                page.evaluate('(theme) => document.documentElement.dataset.theme = theme', theme)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), (theme, width, route)
    assert not errors, errors
    context.close()
    browser.close()
    print('Other curricula hidden; galleries, curiosities and general collections restored. Navigation, searches, downloads, activities and responsive layouts passed.')
