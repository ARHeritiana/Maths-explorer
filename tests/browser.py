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
    browser = p.chromium.launch(**options)
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
    for width in [1440,768,390,320]:
        page.set_viewport_size({'width':width,'height':900})
        for route in ['lab/'+x for x in LABS]+['challenges','challenges/doors','pathways']:
            page.goto(BASE+'/#'+route)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width,route)
    page.set_viewport_size({'width':768,'height':900})
    page.goto(BASE+'/#lab')
    page.add_style_tag(content='html{font-size:32px}')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), '200% text overflow'
    assert not errors, errors
    browser.close()
    print('PASS: bilingual labs, boundary sliders, quizzes, challenges, simulation, data validation, persistence, filters, 4 viewport widths, and 200% text.')
