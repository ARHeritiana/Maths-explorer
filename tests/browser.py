"""Browser integration checks. Run against `npm start` with Python Playwright installed.
PLAYWRIGHT_CHROMIUM_PATH optionally selects a system browser.
"""
import os
from playwright.sync_api import sync_playwright

LABS = ['quadratic','trig','sequences','probability','derivative','integral','vectors','statistics','complex']
ANSWERS = ['2','-1','48','3','6','1/3','0','4','5']
CHALLENGES = ['handshakes','doors','chess','nim','pigeonhole','product','inequality','squares']
CHALLENGE_ANSWERS = ['15','10','0','1','8','6','2','400']
BASE = os.environ.get('MATHS_EXPLORER_URL','http://localhost:4173')

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'):
        options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    engine = os.environ.get('MATHS_EXPLORER_BROWSER', 'chromium')
    if engine == 'firefox' and os.environ.get('MOZ_DISABLE_CONTENT_SANDBOX') == '1':
        options['firefox_user_prefs'] = {'security.sandbox.content.level':0}
    browser = getattr(p, engine).launch(**options)
    page = browser.new_page(viewport={'width':1440,'height':1000})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    assert page.goto(BASE).status == 200
    for language in ['fr','en']:
        page.locator('[data-lang="'+language+'"]').click()
        for lab,answer in zip(LABS,ANSWERS):
            page.goto(BASE+'/#lab/'+lab)
            page.locator('#plot svg').wait_for()
            assert page.locator('html').get_attribute('lang') == language
            assert page.locator('#results strong').count() == 3
            sliders = page.locator('[data-param]')
            for i in range(sliders.count()):
                slider = sliders.nth(i)
                for bound in ['min','max']:
                    slider.fill(slider.get_attribute(bound))
                    assert 'NaN' not in page.locator('#results').inner_text()
                    assert 'Infinity' not in page.locator('#results').inner_text()
            page.locator('#reset').click()
            page.locator('#quiz-answer').fill('99999')
            page.locator('#lab-quiz button').click()
            assert page.locator('#quiz-feedback').inner_text()
            page.locator('#quiz-answer').fill(answer)
            page.locator('#lab-quiz button').click()
            assert 'success' in page.locator('#quiz-feedback').get_attribute('class')
        for challenge,answer in zip(CHALLENGES,CHALLENGE_ANSWERS):
            page.goto(BASE+'/#challenges/'+challenge)
            page.locator('#challenge-answer').fill(answer)
            page.locator('#challenge-form button').click()
            assert 'success' in page.locator('#challenge-feedback').get_attribute('class')
            for summary in page.locator('.hint-panel summary').all():
                summary.click()
            assert page.locator('.hint-panel details[open]').count() == 3
    page.goto(BASE+'/#lab/probability')
    page.locator('[data-sim="100"]').click()
    page.locator('[data-sim="1000"]').click()
    assert '1,100' in page.locator('#results').inner_text()
    page.locator('#param-1').fill('0')
    assert page.locator('#results strong').last.inner_text() == '0'
    page.locator('[data-sim="100"]').click()
    assert page.locator('#results strong').first.inner_text() == '0'
    page.goto(BASE+'/#lab/sequences')
    page.locator('[value="geometric"]').check()
    assert '×' in page.locator('#formula').inner_text()
    page.goto(BASE+'/#lab/statistics')
    page.locator('#data-input').fill('<script>alert(1)</script>')
    assert page.locator('#data-error').inner_text()
    assert page.locator('#plot svg').count() == 0
    page.locator('#data-input').fill('2 3 4 5 100')
    assert page.locator('#results strong').nth(1).inner_text() == '4'
    page.reload()
    assert page.locator('html').get_attribute('lang') == 'en'
    assert page.evaluate("JSON.parse(localStorage.getItem('maths-explorer-v1')).completed.length") == 17
    page.goto(BASE+'/#challenges')
    for kind,count in [('play',4),('olympiad',4),('all',8)]:
        page.locator('[data-filter="'+kind+'"]').click()
        assert page.locator('.challenge-card').count() == count
    # Regression: skip navigation must focus the content without changing the route.
    page.goto(BASE+'/#lab/trig')
    page.locator('.skip').focus()
    page.keyboard.press('Enter')
    assert page.evaluate('document.activeElement.id') == 'main'
    assert page.evaluate('location.hash') == '#lab/trig'
    page.locator('#param-0').focus()
    before = float(page.locator('#param-0').input_value())
    page.keyboard.press('ArrowRight')
    assert float(page.locator('#param-0').input_value()) == before + 1
    page.locator('#param-0').fill('180')
    assert page.locator('#results strong').nth(1).inner_text() == '0'
    for route in ['lab/unknown','challenges/unknown','unknown']:
        page.goto(BASE+'/#'+route)
        assert page.locator('#main h1').inner_text() == 'Page not found'
    # Experiment presets agree with the question instead of leaving stale controls.
    for lab in LABS:
        page.goto(BASE+'/#lab/'+lab)
        page.locator('#quiz-preset').click()
        assert page.locator('#chart-data table').count() == 1
        assert page.locator('#chart-data th[scope="col"]').count() >= 2
        assert page.locator('#results strong').count() == 3
    page.goto(BASE+'/#lab/derivative')
    page.locator('#param-0').fill('1')
    page.locator('[name="direction"][value="-1"]').check()
    page.locator('#param-1').fill('0.01')
    assert page.locator('#results strong').first.inner_text() == '1.99'
    assert page.locator('#results strong').last.inner_text() == '0.01'
    page.goto(BASE+'/#lab/integral')
    page.locator('#param-0').fill('2')
    page.locator('[name="method"][value="right"]').check()
    assert page.locator('#results strong').first.inner_text() == '0.625'
    page.locator('[name="method"][value="midpoint"]').check()
    assert page.locator('#results strong').first.inner_text() == '0.3125'
    # Notes survive in-session navigation, language changes and a control reset.
    page.locator('#observation').fill('N=2, midpoint sum < 1/3 < right sum')
    page.locator('[data-lang="fr"]').click()
    assert page.locator('#observation').input_value().startswith('N=2')
    page.locator('#reset').click()
    assert page.locator('#observation').input_value().startswith('N=2')
    page.goto(BASE+'/#lab/statistics')
    page.locator('#data-input').fill('0.0000000001 0.0000000002')
    labels = page.locator('#plot svg > text').all_text_contents()
    assert len(set(labels)) > 3
    assert 'E' in page.locator('#results strong').first.inner_text()
    page.locator('#data-input').fill('0.'+'0'*49+'1 0.'+'0'*49+'2')
    assert page.locator('#plot svg > text').count() <= 16
    assert 'E' in page.locator('#results strong').first.inner_text()
    page.goto(BASE+'/#lab/vectors')
    assert page.locator('#plot line[marker-end]').count() == 3
    for i in [0,1]: page.locator('#param-'+str(i)).fill('0')
    assert 'nul' in page.locator('#results strong').last.inner_text()
    page.locator('[data-lang="en"]').click()
    page.goto(BASE+'/#pathways')
    assert '2027–2028' in page.locator('#main').inner_text()
    assert 'AI SL' in page.locator('#main').inner_text()
    assert 'Removed' in page.locator('#main').inner_text()
    # The app never sends answers or notes through fetch/XHR.
    submissions = []
    page.on('request', lambda req: submissions.append(req.url) if req.resource_type in ['xhr','fetch'] else None)
    page.goto(BASE+'/#lab/quadratic')
    page.locator('#quiz-answer').fill('2')
    page.locator('#lab-quiz button').click()
    assert not submissions, submissions
    # Test malformed storage, read denial and quota/write denial in fresh contexts.
    for script in [
        "localStorage.setItem('maths-explorer-v1','{broken')",
        "localStorage.setItem('maths-explorer-v1',JSON.stringify({lang:'en',completed:[null,'unknown','trig']}))",
        "Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('denied')}})",
        "Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('quota')}})"
    ]:
        context = browser.new_context()
        context.add_init_script(script)
        extra = context.new_page()
        extra_errors = []
        extra.on('pageerror',lambda e: extra_errors.append(str(e)))
        extra.goto(BASE+'/#lab/quadratic')
        extra.locator('#plot svg').wait_for()
        extra.locator('[data-lang="en"]').click()
        extra.locator('#quiz-answer').fill('2')
        extra.locator('#lab-quiz button').click()
        assert 'success' in extra.locator('#quiz-feedback').get_attribute('class')
        if 'denied' in script or 'quota' in script: assert 'unavailable' in extra.locator('footer').inner_text()
        assert not extra_errors, extra_errors
        context.close()
    for width in [1440,768,390,320]:
        page.set_viewport_size({'width':width,'height':900})
        for route in ['lab/'+x for x in LABS]+['challenges','challenges/doors','pathways']:
            page.goto(BASE+'/#'+route)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width,route)
    page.set_viewport_size({'width':768,'height':900})
    for route in ['lab/'+x for x in LABS]+['challenges','challenges/doors','pathways']:
        page.goto(BASE+'/#'+route)
        page.add_style_tag(content='html{font-size:200%}')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), ('200% text',route)
    os.makedirs('test-results',exist_ok=True)
    page.set_viewport_size({'width':1440,'height':1100})
    page.goto(BASE+'/#lab/integral')
    page.screenshot(path='test-results/'+engine+'-desktop.png',full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    page.goto(BASE+'/#lab/probability')
    page.screenshot(path='test-results/'+engine+'-mobile.png',full_page=True)
    assert not errors, errors
    browser.close()
    print('PASS ('+engine+'): bilingual labs and challenges; bounds, presets, two-sided secants, quadratures, data tables, keyboard/skip focus, routes, session notes, storage failures, privacy, 4 viewport widths and all surfaces at 200% text.')
