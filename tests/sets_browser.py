"""Browser checks of the foundations lesson #basics/sets in both languages and both themes.
 - the lesson opens in its iframe in the language of the site, the iframe takes the height the lesson reports;
 - no console error, no failed or external request, no horizontal overflow of the lesson at 320, 390 and 1440 px,
   also with doubled text;
 - the site theme reaches the lesson (dark tokens) and the lesson stays readable;
 - keyboard only: the tabs answer the arrows, a region of the Venn diagram toggles with Enter, quiz answers are buttons,
   every control is at least 44 px high;
 - reduced motion: the lesson declares it and nothing animates.
Run alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/sets_browser.py (needs a running server and Playwright)."""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'):
        options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    cases = 0
    for lang, title in (('fr', 'Ensembles'), ('en', 'Sets and operations')):
        context = browser.new_context(viewport={'width': 390, 'height': 900}, reduced_motion='reduce')
        context.add_init_script("localStorage.setItem('maths-explorer-v1', JSON.stringify({lang:'%s'}))" % lang)
        page = context.new_page()
        problems = []
        page.on('pageerror', lambda e: problems.append('pageerror ' + str(e)))
        page.on('console', lambda m: problems.append('console ' + m.text) if m.type in ('error', 'warning') else None)
        page.on('requestfailed', lambda r: problems.append('failed ' + r.url))
        page.on('request', lambda r: problems.append('external ' + r.url) if not r.url.startswith(BASE) and not r.url.startswith(('data:', 'blob:')) else None)
        page.goto(BASE + '/#basics/sets')
        frame_el = page.locator('#basics-frame')
        frame_el.wait_for()
        assert frame_el.get_attribute('lang') == lang
        assert ('sets.en.html' in frame_el.get_attribute('src')) == (lang == 'en')
        frame = page.frame_locator('#basics-frame')
        frame.locator('h1').wait_for()
        assert frame.locator('h1').inner_text() == title, (lang, frame.locator('h1').inner_text())
        assert frame.locator('html').get_attribute('lang') == lang
        # neighbour links and the index card
        assert page.locator('a[href="#basics/division"]').count() >= 1
        for theme in ('jour', 'nuit'):
            wanted = 'dark' if theme == 'nuit' else 'light'
            if (frame.locator('html').get_attribute('data-theme') or 'light') != wanted:
                page.locator('[data-theme-toggle]').click()
                page.wait_for_function("document.getElementById('basics-frame').contentDocument.documentElement.dataset.theme === '%s'" % wanted)
            ink = frame.locator('body').evaluate('el => getComputedStyle(el).backgroundColor')
            assert ink == ('rgb(15, 27, 33)' if wanted == 'dark' else 'rgb(244, 247, 250)'), (lang, theme, ink)
            for width in (320, 390, 1440):
                page.set_viewport_size({'width': width, 'height': 900})
                page.wait_for_timeout(150)
                for enlarged in (False, True):
                    page.frame_locator('#basics-frame').locator('html').evaluate(
                        "(el, on) => { let s = el.ownerDocument.getElementById('zoom'); if (!s) { s = el.ownerDocument.createElement('style'); s.id = 'zoom'; el.ownerDocument.head.append(s); } s.textContent = on ? 'html{font-size:200%!important}' : ''; }", enlarged)
                    for tab in ('explore', 'learn', 'practice', 'reference'):
                        frame.locator('#tab-' + tab).click()
                        page.wait_for_timeout(60)
                        overflow = frame.locator('html').evaluate('el => el.scrollWidth - el.clientWidth')
                        assert overflow <= 1, (lang, theme, width, enlarged, tab, 'horizontal overflow', overflow)
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (lang, theme, width, enlarged, tab, 'page overflow')
                        cases += 1
                    # the iframe is as tall as the lesson (the lesson reports its size)
                    page.wait_for_timeout(200)
                    inner = frame.locator('html').evaluate('el => el.scrollHeight')
                    outer = page.locator('#basics-frame').evaluate('el => el.getBoundingClientRect().height')
                    assert abs(inner - outer) <= 4, (lang, theme, width, enlarged, inner, outer)
                page.frame_locator('#basics-frame').locator('html').evaluate("el => { const s = el.ownerDocument.getElementById('zoom'); if (s) s.textContent = ''; }")
        # keyboard
        page.set_viewport_size({'width': 390, 'height': 900})
        frame.locator('#tab-explore').focus()
        page.keyboard.press('ArrowRight')
        assert frame.locator('#tab-learn').get_attribute('aria-selected') == 'true'
        page.keyboard.press('ArrowLeft')
        assert frame.locator('#tab-explore').get_attribute('aria-selected') == 'true'
        region = frame.locator('#explore-svg [data-region="11"]')
        region.focus()
        page.keyboard.press('Enter')
        assert frame.locator('#explore-svg [data-region="11"]').get_attribute('aria-pressed') == 'true'
        assert frame.locator('#explore-svg [data-region="11"]').evaluate('el => el === el.ownerDocument.activeElement')
        frame.locator('#tab-practice').click()
        answers = frame.locator('#quiz-area .answer')
        assert answers.count() == 4
        answers.nth(0).focus()
        page.keyboard.press('Enter')
        assert frame.locator('#quiz-next').evaluate('el => el === el.ownerDocument.activeElement')
        # target size of the controls that are visible in the practice tab
        small = frame.locator('button:visible').evaluate_all("els => els.filter(e => e.getBoundingClientRect().height < 43.5).map(e => e.textContent.trim().slice(0, 20))")
        assert small == [], (lang, 'controls under 44 px', small)
        frame.locator('#tab-explore').click()
        small = frame.locator('button:visible').evaluate_all("els => els.filter(e => e.getBoundingClientRect().height < 43.5).map(e => e.textContent.trim().slice(0, 20))")
        assert small == [], (lang, 'controls under 44 px (explore)', small)
        # reduced motion: no running animation or transition in the lesson
        assert frame.locator('html').evaluate('el => el.ownerDocument.getAnimations().length') == 0
        assert not problems, (lang, problems)
        context.close()
    browser.close()
    print('sets lesson browser checks passed:', cases, 'tab layouts')
