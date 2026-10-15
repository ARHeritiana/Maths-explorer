"""Browser integration checks. Run against `npm start` with Python Playwright installed.
PLAYWRIGHT_CHROMIUM_PATH optionally selects a system browser.
"""
import os
from playwright.sync_api import sync_playwright

LABS = ['quadratic','trig','sequences','probability','derivative','integral','vectors','statistics','complex']
ANSWERS = ['2','-1','48','3','6','1/3','0','4','5']
CHALLENGES = ['doors','chess','nim','pigeonhole','squares','hanoi','eggs','konigsberg','josephus','ramsey','artgallery','gridpaths','horses','cake','queens','snail','bridge','lighteggs','fakecoins','reflect','lunes','star','box','merge','cham','inversions','piles']
CHALLENGE_ANSWERS = ['10','30','1','8','400','63','14','1','19','6','4','210','7','900','3','8','17','2','45','5','24','180','5','719','0','13','45']
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
    page.on('pageerror', lambda e: errors.append(e.stack or str(e)))
    assert page.goto(BASE).status == 200
    # The welcome page is neutral (no school level in its text), draws live art, and the gallery holds the curiosities.
    page.wait_for_selector('.stage-fg'); page.wait_for_timeout(1200)
    home = page.locator('.welcome').inner_text()
    assert 'Tonga soa' in home and not any(w in home for w in ['Seconde', 'Première', 'Terminale', 'lycée', 'Bac']), 'the home page does not assume a curriculum'
    assert page.evaluate("() => { const c = document.querySelector('.stage-fg'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 500; }"), 'the hero drawing is not blank'
    assert page.locator('.wonder').count() == 0 and page.locator('.stage-cta').count() == 1, 'the home page is one animation and one door'
    page.goto(BASE+'/#gallery'); assert page.locator('.wonder').count() == 6
    page.goto(BASE+'/#lab'); assert page.locator('.lab-link').count() == 9, 'the laboratory keeps the nine guided experiments'
    page.goto(BASE+'/#lab/galton'); page.wait_for_selector('#object-stage canvas'); assert page.evaluate('location.hash') == '#gallery/galton', 'curiosities redirect to the gallery'
    for language in ['fr','en']:
        page.locator('[data-lang="'+language+'"]').click()
        for lab,answer in zip(LABS,ANSWERS):
            page.goto(BASE+'/#lab/'+lab)
            page.locator('#plot svg').first.wait_for()
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
            for summary in page.locator('.hint-panel summary, .solution-wide summary').all():
                summary.click()
            assert page.locator('.hint-panel details[open]').count() == 2 and page.locator('.solution-wide details[open]').count() == 1
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
    assert page.evaluate("JSON.parse(localStorage.getItem('maths-explorer-v1')).completed.length") == 36
    page.goto(BASE+'/#challenges')
    for kind,count in [('play',18),('olympiad',9),('all',27)]:
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
        assert lab == 'trig' or page.locator('#chart-data th[scope="col"]').count() >= 2
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
    page.locator('.notes summary').click(); page.locator('#observation').fill('N=2, midpoint sum < 1/3 < right sum')
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
        extra.locator('#plot svg').first.wait_for()
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
    # Each challenge has a hands-on activity that works without reading the solution.
    page.set_viewport_size({'width':1366,'height':1100})
    page.goto(BASE+'/#challenges/doors')
    page.locator('#dr-k').fill('100')
    assert page.locator('.door.open').count() == 10
    page.goto(BASE+'/#challenges/chess')
    svg = page.locator('.dom-svg'); svg.scroll_into_view_if_needed(); box = svg.bounding_box(); unit = box['width'] / (12 + 352 + 28 + 104 + 16)
    def at(x, y): return box['x'] + x * unit, box['y'] + y * unit
    page.mouse.move(*at(392 + 6 + 41, 12 + 84 + 19)); page.mouse.down(); page.mouse.move(*at(100, 78), steps=8); page.mouse.up()
    assert page.locator('.dom[data-d]').count() == 1 and '60' in page.locator('#dm-read').inner_text()
    page.mouse.move(*at(100, 78)); page.mouse.down(); page.mouse.move(box['x'] + box['width'] - 4, box['y'] + box['height'] - 4, steps=8); page.mouse.up()
    assert page.locator('.dom[data-d]').count() == 0
    page.goto(BASE+'/#challenges/nim')
    page.locator('[data-take="1"]').click()
    page.wait_for_function("document.querySelectorAll('.stone.gone').length >= 2")
    page.goto(BASE+'/#challenges/pigeonhole')
    for n in range(1, 8): page.locator('.pick[data-n="%d"]' % n).click()
    assert page.locator('.pick.clash').count() == 0
    page.locator('.pick[data-n="15"]').click()
    assert page.locator('.pick.clash').count() == 2
    page.goto(BASE+'/#challenges/squares')
    page.locator('#sq-n').fill('12'); assert '144' in page.locator('#sq-read strong').inner_text()
    # Challenges added in October 2026: activities, animated solutions and the touch fix for the domino board.
    page.goto(BASE+'/#challenges/artgallery')
    page.locator('#ag-convex').click(); page.locator('.ag-svg').scroll_into_view_if_needed(); box = page.locator('.ag-svg').bounding_box()
    page.mouse.click(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)   # the centre of a convex gallery is inside it
    assert page.locator('.ag-guard').count() == 1 and '100 %' in page.locator('#ag-read').inner_text(), 'one guard watches a convex gallery'
    page.locator('#ag-m-vertex').click(); assert page.locator('.ag-vertex').count() == 12, 'vertices can be moved'
    page.locator('#ag-random').click(); assert page.locator('.ag-guard').count() == 0, 'a new gallery starts without guards'
    assert page.locator('#original').count() == 1, 'the original question is shown above the checkable one'
    page.goto(BASE+'/#challenges/eggs')
    page.locator('.floor[data-f="50"]').click()
    assert page.locator('#eg-read strong').first.inner_text() == '1'
    page.goto(BASE+'/#challenges/hanoi')
    page.locator('#hn-n').fill('2')
    for a, b in [(0, 1), (0, 2), (1, 2)]:
        page.locator('.hn-peg[data-peg="%d"]' % a).click(); page.locator('.hn-peg[data-peg="%d"]' % b).click()
    assert 'Pile déplacée en 3' in page.locator('#hn-read').inner_text() or 'Stack moved in 3' in page.locator('#hn-read').inner_text()
    page.goto(BASE+'/#challenges/ramsey')
    page.locator('[data-e="0-1"]').click()
    assert page.locator('.rm-edge.c1').count() == 1
    page.goto(BASE+'/#challenges/konigsberg')
    page.locator('[data-b="0"]').dispatch_event('click'); page.locator('[data-b="1"]').dispatch_event('click')   # curved: the centre of the box is not on the stroke
    assert page.locator('.kb-bridge.crossed').count() == 2
    page.goto(BASE+'/#challenges/josephus')
    page.locator('#js-n').fill('7'); page.locator('#js-run').click()
    page.wait_for_function("document.querySelector('#js-read strong')")
    assert page.locator('#js-read strong').inner_text() == '7'
    for challenge in CHALLENGES:
        page.goto(BASE+'/#challenges/'+challenge)
        page.locator('.solution summary').click()
        first = page.locator('.sol-cap').inner_text()
        for _ in range(6):   # a click first finishes the step being animated, the next one moves on
            if '3 /' in page.locator('.sol-count').inner_text(): break
            page.locator('[data-a="next"]').click()
        assert '3 /' in page.locator('.sol-count').inner_text(), challenge
        assert page.locator('.sol-cap').inner_text() != first, challenge
        assert page.evaluate("!/NaN|undefined|Infinity/.test(document.querySelector('.sol-svg').innerHTML)"), challenge
    # Variations: the statement, the answer check, the experiment and the animated solution follow the chosen data.
    page.goto(BASE+'/#challenges/doors')
    page.locator('input[data-var="n"]').fill('50')
    page.locator('input[data-var="n"]').dispatch_event('change')
    assert '50' in page.locator('#problem').inner_text() and page.locator('.door').count() == 50
    page.locator('#challenge-answer').fill('7'); page.locator('#challenge-form button').click()
    assert 'success' in page.locator('#challenge-feedback').get_attribute('class')   # floor(sqrt(50)) = 7
    page.locator('#var-reset').click()
    assert page.locator('.door').count() == 100
    for challenge in CHALLENGES:
        page.goto(BASE+'/#challenges/'+challenge)
        for _ in range(3):
            page.locator('#var-random').click()
            body = page.locator('main').inner_text()
            assert not any(w in body for w in ('NaN', 'undefined', 'Infinity', 'null')), (challenge, body[:200])
            page.locator('.solution summary').click() if page.locator('.solution[open]').count() == 0 else None
            page.locator('[data-a="restart"]').click()
            for _ in range(12):
                if page.locator('[data-a="next"]').is_disabled(): break
                page.locator('[data-a="next"]').click()
            assert page.evaluate("!/NaN|undefined|Infinity/.test(document.querySelector('.sol-svg').innerHTML)"), challenge
    # The classic puzzles: each activity responds and agrees with the mathematics.
    page.set_viewport_size({'width':1100,'height':1000})
    def go(c):   # the variation panel remembers the last data: start each puzzle from its defaults
        page.goto(BASE+'/#challenges/'+c)
        if page.locator('#var-reset').count(): page.locator('#var-reset').click()
    def hint(n, act):   # open hint n in the panel and press its button, which acts on the canvas
        page.locator('.hint-panel details').nth(n - 1).locator('summary').click(); page.locator('[data-hint-act="%s"]' % act).click()
    go('gridpaths')
    assert page.locator('#gp-counts').count() == 0, 'the path counts are a hint, not a control'
    page.locator('#gp-rand').click(); hint(2, 'counts')
    assert '210' in page.locator('#gp-read').inner_text() and 'Chemin au hasard' not in page.locator('#gp-read').inner_text()
    go('horses')
    for h in range(5): page.locator('.cl-tok[data-h="%d"]'%h).click()
    page.locator('#hs-race').click(); assert page.locator('#hs-log li').count() == 1
    tok = page.locator('.cl-tok[data-h="24"]').bounding_box(); arena = page.locator('.cl-arena').bounding_box()   # horses can be rearranged by dragging
    page.mouse.move(tok['x'] + tok['width'] / 2, tok['y'] + tok['height'] / 2); page.mouse.down()
    page.mouse.move(arena['x'] + arena['width'] * 0.95, arena['y'] + arena['height'] * 0.95, steps=6); page.mouse.up()
    assert page.locator('.cl-tok[data-h="24"]').evaluate("e => e.style.getPropertyValue('--c')") == '7', 'a dragged horse lands in the cell under the pointer'
    assert page.locator('.cl-tok[data-h="24"]').get_attribute('aria-pressed') == 'false', 'dragging does not select'
    page.locator('#hs-home').click(); assert page.locator('.cl-tok[data-h="24"]').evaluate("e => e.style.getPropertyValue('--c')") == '4'

    go('cake')
    assert page.locator('#ck-kit').is_hidden() and page.locator('[data-hint-act]').count() == 2, 'the cake starts as a 3D view only; hints carry the buttons'
    page.locator('#ck-lock').click(); page.wait_for_timeout(1000)
    hint(1, 'top'); page.wait_for_timeout(300)
    hint(2, 'grid'); page.wait_for_timeout(300)
    assert page.locator('#ck-size-out').inner_text() == '5' and page.locator('#ck-snap').is_checked(), 'hint 2 places the grid with a side of 5 units'
    page.locator('[data-tool="segment"]').click(); page.locator('.ck-stage').scroll_into_view_if_needed()   # scroll first: the stage position is read in viewport coordinates
    box = page.locator('.ck-stage').bounding_box(); kx, ky = box['width'] / 640, box['height'] / 430
    scr = lambda x, y: (box['x'] + (320 + 330 * (x / 5 - 0.5)) * kx, box['y'] + (214 - 330 * (y / 5 - 0.5)) * ky)
    for (x, y) in [(4, 0), (5, 3), (3, 5), (0, 4), (0, 0)]:   # a first wrong set (the last cut is missing), then the right one
        if (x, y) == (0, 0): assert 'équitable' not in page.locator('#ck-read').inner_text()
        page.mouse.click(*scr(2.5, 2.5)); page.mouse.click(*scr(x, y))
    page.wait_for_timeout(1500)
    assert 'équitable' in page.locator('#ck-read').inner_text() or 'fair' in page.locator('#ck-read').inner_text(), 'five equal cuts from the centre share the cake fairly'
    go('queens')
    hint(2, 'peek'); assert page.locator('.qn-cell.queen').count() == 1, 'hint 2 places a single queen of a good placement'
    go('snail')
    for _ in range(15): page.locator('#sn-next').click()
    assert '8' in page.locator('#sn-read strong').last.inner_text() or '10' in page.locator('#sn-read').inner_text()
    assert page.locator('#sn-next').is_disabled()
    go('bridge')
    def cross(*who):
        for i in who: page.locator('.br-man[data-i="%d"]'%i).click()
        page.locator('#br-go').click()
    cross(0,1); cross(0); cross(2,3); cross(1); cross(0,1)
    assert '17' in page.locator('#br-read').inner_text() and page.locator('#br-log li').count() == 5
    go('lighteggs')
    for i in (1,2,3): page.locator('.cl-egg[data-i="%d"]'%(i-1)).click()
    for i in (4,5,6):
        page.locator('.cl-egg[data-i="%d"]'%(i-1)).click(); page.locator('.cl-egg[data-i="%d"]'%(i-1)).click()
    page.locator('#eg-weigh').click(); assert page.locator('#eg-read').inner_text().strip()
    go('fakecoins')
    hint(2, 'fill'); page.locator('#fc-weigh').click()
    import re
    grams = int(re.search(r'(\d+) g', page.locator('#fc-read').inner_text()).group(1))
    page.locator('.fc-g[data-i="%d"]'%(550 - grams - 1)).click()
    assert 'strong' in page.locator('#fc-read').inner_html(), 'the shortfall names the fake pile'
    # Euclidean geometry and invariants: each activity responds and agrees with the mathematics.
    go('reflect'); hint(2, 'mirror'); assert 'AB′' in page.locator('#rf-read').inner_text() and '5 m' in page.locator('#rf-read').inner_text()
    go('lunes'); assert '24' in page.locator('#ln-read').inner_text()
    go('star'); page.locator('#st-rand').click(); assert '180' in page.locator('#st-read').inner_text()
    go('box')
    assert page.locator('input[name="bx"]').count() == 0, 'the box offers no unfolding choice before a hint'
    hint(1, 'net'); page.wait_for_timeout(2300); assert page.locator('#bx-barflat').is_visible() and page.locator('#bx-read strong').count() == 1
    hint(2, 'line'); assert 'segment' in page.locator('#bx-read').inner_text()
    page.locator('#bx-fold').click(); page.wait_for_timeout(1800)
    page.locator('.bx-stage').evaluate("e => { const b = e.__box(); b.add([1, 0, 4 / 3]); b.add([1, 2, 4]); }")   # the shortest route of the 1 x 2 x 4 box
    page.wait_for_timeout(500); assert 'Bravo' in page.locator('#bx-read').inner_text() or 'Well done' in page.locator('#bx-read').inner_text()
    go('merge')
    for _ in range(4): page.locator('#mg-rand').click()
    hint(2, 'invariant')
    assert '720' in page.locator('#mg-read').inner_text().replace('\u202f','').replace('\u00a0','').replace(' ','')
    go('cham'); page.locator('.cm-meet:not([disabled])').first.click(); assert 'Rencontres' in page.locator('#cm-read').inner_text() or 'Meetings' in page.locator('#cm-read').inner_text()
    go('inversions'); page.locator('#iv-all').click(); assert '13' in page.locator('#iv-read').inner_text()
    go('piles'); page.locator('#pl-rand').click(); assert '45' in page.locator('#pl-read').inner_text()
    if engine == 'chromium':
        touch = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
        tp = touch.new_page(); tp.goto(BASE+'/#challenges/chess'); tp.locator('.dom-svg').scroll_into_view_if_needed()
        cdp = touch.new_cdp_session(tp)
        src = tp.locator('[data-src="h"]').bounding_box(); target = tp.locator('.dom-svg').bounding_box(); y0 = tp.evaluate('scrollY')
        sx, sy = src['x'] + src['width'] / 2, src['y'] + src['height'] / 2; ex, ey = target['x'] + target['width'] * 0.4, target['y'] + target['height'] * 0.3
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': sx, 'y': sy}]})
        for i in range(1, 11): cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': sx + (ex - sx) * i / 10, 'y': sy + (ey - sy) * i / 10}]})
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        tp.wait_for_timeout(200)
        assert tp.locator('.dom[data-d]').count() == 1 and abs(tp.evaluate('scrollY') - y0) < 5, 'a finger dragging a domino must not scroll the page'
        # The gallery on a phone: a finger-drawn shape becomes the curve to redraw, and neither piece scrolls the page.
        import math
        def swipe(pts, box):
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': box['x'] + pts[0][0] * box['width'], 'y': box['y'] + pts[0][1] * box['height']}]})
            for fx, fy in pts[1:]: cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': box['x'] + fx * box['width'], 'y': box['y'] + fy * box['height']}]})
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        tp.goto(BASE+'/#gallery/fourier'); tp.wait_for_selector('#fr-stage canvas'); tp.locator('#fr-stage canvas').scroll_into_view_if_needed(); y1 = tp.evaluate('scrollY')
        swipe([(0.5 + 0.25 * math.cos(a / 20 * 2 * math.pi), 0.5 + 0.3 * math.sin(a / 20 * 2 * math.pi)) for a in range(21)], tp.locator('#fr-stage canvas').bounding_box()); tp.wait_for_timeout(300)
        assert tp.locator('[name="fr-shape"][value="mine"]').is_checked() and abs(tp.evaluate('scrollY') - y1) < 5, 'a finger-drawn shape is redrawn by circles without scrolling'
        tp.goto(BASE+'/#gallery/mandelbrot'); tp.wait_for_selector('#mb-stage canvas'); tp.locator('#mb-stage canvas').scroll_into_view_if_needed(); y1 = tp.evaluate('scrollY')
        swipe([(0.6, 0.5), (0.5, 0.5), (0.4, 0.5), (0.3, 0.5)], tp.locator('#mb-stage canvas').bounding_box()); tp.wait_for_timeout(300)
        assert abs(tp.evaluate('scrollY') - y1) < 5, 'dragging the Mandelbrot set does not scroll the page'
        assert tp.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        touch.close()
    # Laboratory objects: each scene mounts, draws on a canvas, reacts, stays inside the viewport and its quiz works.
    OBJECTS = {'galton':'0.375','reuleaux':'6','platonic':'30','chaos':'27','fourier':'4','mandelbrot':'3'}
    for width in [1280,390]:
        page.set_viewport_size({'width':width,'height':900})
        for lab,answer in OBJECTS.items():
            page.goto(BASE+'/#lab/'+lab)
            page.locator('#object-stage canvas').first.wait_for()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width,lab)
            assert not page.locator('#plot').count()
            page.fill('#quiz-answer', answer); page.locator('#lab-quiz button[type=submit]').click()
            assert page.locator('#quiz-feedback').inner_text().strip(), lab
    page.set_viewport_size({'width':1280,'height':900})
    page.goto(BASE+'/#lab/galton'); page.get_by_role('button', name='+ 100').or_(page.get_by_role('button', name='Add 100')).first.click(); page.wait_for_timeout(300)
    assert 'billes' in page.locator('.act-readout').first.inner_text() or 'balls' in page.locator('.act-readout').first.inner_text()
    page.goto(BASE+'/#lab/platonic'); page.locator('#pl-t-why').click()
    assert page.locator('.pl-cell.solid').count() == 5, 'exactly five (p, q) pairs make a solid'
    page.locator('.pl-cell[data-p="4"][data-q="4"]').click(); assert page.locator('.pl-cell.sel').get_attribute('data-p') == '4'
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
