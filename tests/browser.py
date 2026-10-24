"""Browser integration checks. Run against `npm start` with Python Playwright installed.
PLAYWRIGHT_CHROMIUM_PATH optionally selects a system browser.
"""
import os
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright
from accessibility_browser import check_home_chapter

# The experiments with missions (site/js/lab/), walked mission by mission.
EXPERIMENTS = ['quadratic','trig','sequences','derivative','integral','probability','vectors','statistics','complex','line','exponential','cobweb','matrix','space-lines',
               'tiles','euler-primes','fermat','circle-regions','buffon','bertrand']
# A state at which each exploration goal holds, and the answer of each check (lab-engine.test.mjs recomputes them).
WITNESS = {'quadratic/sign':{'a':-1,'b':0,'c':-2},'quadratic/vertex':{'a':1,'b':-4,'c':3},'trig/quadrants':{'deg':120},'trig/exact':{'deg':60},
           'sequences/difference':{'r':-2},'sequences/signs':{'mode':'geom','q':-1.5,'n':6},'derivative/approach':{'h':0.01},
           'derivative/where':{'x':0},'integral/finer':{'n':30},'integral/bound':{'b':2},
           'probability/run':{'runs':1000},'probability/mean':{'p':0.5},'vectors/collinear':{'vx':-3,'vy':-1},'vectors/area':{'ux':2,'uy':0},
           'statistics/box':{'data':[2,4,4,4,5,5,9]},'statistics/mean':{'data':[11,3,4,4,5,6,9]},'complex/scale':{'r':2},'complex/angles':{'tx':1,'ty':1},
           'line/slope':{'bx':1,'by':-1},'line/intercept':{'ax':-2,'ay':1},'exponential/base':{'a':0.5},'exponential/scale':{'k':1.5},'cobweb/steps':{'n':10},
           'cobweb/slope':{'a':-1.5},'matrix/columns':{'a':2,'c':1},'matrix/area':{'d':1.5},'matrix/flat':{'d':0},'space-lines/param':{'t':2},
           'space-lines/parallel':{'ux':2,'uy':0,'uz':-1},'space-lines/normal':{'ax':0,'ay':0,'az':1},
           'tiles/zoom':{'show':1},'tiles/size':{'a':8,'b':5},'euler-primes/hunt':{'n':40},'fermat/f5':{'e':32},'circle-regions/six':{'n':6},
           'buffon/drop':{'runs':1000},'bertrand/ends':{'runs':1000}}
CHECKS = {'quadratic/read':'-2','trig/read':'1/2','sequences/formula':'96','derivative/slope':'6','integral/area':'7/3',
          'probability/read':'2','vectors/read':'7','statistics/read':'8','complex/read':'5',
          'line/read':'2.5','exponential/sequence':'48','cobweb/fixed':'6','matrix/read':'5','space-lines/meet':'2',
          'tiles/det':'1','euler-primes/square':'41','fermat/euler':'10','circle-regions/seven':'57','buffon/theory':'0.318','bertrand/midpoint':'0.25'}

def walk_experiment(page, name):
    """Complete every mission of an experiment through the page: predict, explore, compare, check (wrong then right), explain.
    Exploration is free (nothing waits), but each mission still recognises its goal, answer or argument."""
    page.goto(BASE+'/#lab/'+name)
    page.locator('.lab2-canvas, .lab2-calculation').wait_for()
    count = page.locator('.lab2-dot').count()
    assert 4 <= count <= 6, name
    assert page.locator('.lab2-argument').is_hidden(), 'the argument waits for the last mission'
    for i in range(count):
        kind = page.locator('.lab2-card').get_attribute('data-kind')
        mission = page.evaluate("() => document.querySelector('.lab2').__lab.mission.id")
        assert page.evaluate('location.hash') == '#lab/'+name+'/'+mission
        assert page.locator('.lab2-nav .primary').is_enabled() or i == count-1, 'exploration is free: Next never waits'
        assert page.locator('.lab2-ctl.is-locked').count() == 0, 'every control works in every mission'
        if kind == 'predict':
            page.locator('.lab2-option').first.click()
        elif kind == 'explore':
            page.evaluate("w => document.querySelector('.lab2').__lab.setState(w)", WITNESS[name+'/'+mission])
        elif kind == 'contrast':
            for button in page.locator('.lab2-variant').all(): button.click()
        elif kind == 'check':
            page.locator('.lab2-check input').fill('99999'); page.locator('.lab2-check button[type=submit]').click()
            assert page.locator('.lab2-feedback').inner_text() and not page.locator('.lab2-card.is-done').count(), 'a wrong answer sends back to the figure'
            page.locator('.lab2-check input').fill(CHECKS[name+'/'+mission]); page.locator('.lab2-check button[type=submit]').click()
        elif kind == 'explain':
            assert page.locator('.lab2-reveal').is_hidden()
            page.locator('.lab2-answer textarea').fill('Parce que la figure le montre pour tous les cas.')
            page.locator('.lab2-answer button.primary').click()
            assert page.locator('.lab2-reveal').is_visible(), 'the argument is revealed after an attempt'
        page.wait_for_function("() => document.querySelector('.lab2-card').classList.contains('is-done')")
        if i < count-1: page.locator('.lab2-nav .primary').click()
    assert page.locator('.lab2-argument').is_visible(), 'the argument comes after the last mission'
CHALLENGES = ['gauss-sum','doors','chess','nim','pigeonhole','squares','hanoi','eggs','konigsberg','josephus','ramsey','artgallery','gridpaths','cookies','jugs','fly','horses','cake','queens','snail','bridge','lighteggs','fakecoins','reflect','lunes','star','box','merge','cham','pegs','nails','inversions','piles','cheryl','sumproduct']
CHALLENGE_ANSWERS = ['5050','10','30','1','8','400','63','14','1','19','6','4','210','1001','6','1000','7','900','3','8','17','2','45','5','24','180','5','719','0','0','4','13','45','16','52']
CHALLENGES += ['rooms', 'knights', 'factorials']
CHALLENGE_ANSWERS += ['1', '63', '12']
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
    check_home_chapter(page, BASE, 'test-results')
    page.goto(BASE)
    # The welcome page is neutral (no school level in its text), draws live art, and the gallery holds the curiosities.
    page.wait_for_selector('.stage-fg'); page.wait_for_timeout(1200)
    home = page.locator('.welcome').inner_text()
    assert 'Tonga soa' in home and not any(w in home for w in ['Seconde', 'Première', 'Terminale', 'lycée', 'Bac']), 'the home page does not assume a curriculum'
    assert page.evaluate("() => { const c = document.querySelector('.stage-fg'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 500; }"), 'the hero drawing is not blank'
    assert page.locator('.wonder').count() == 0 and page.locator('.stage-cta').count() == 1, 'the home page is one animation and one door'
    page.goto(BASE+'/#gallery'); page.wait_for_selector('.wonder')
    gallery_ids = page.evaluate("async () => { const {labs} = await import('./js/content.js'); return labs.filter(l => l.custom).map(l => l.id); }")
    assert page.locator('.wonder').count() == len(gallery_ids), 'gallery cards follow the shared catalogue'
    assert {urlparse(a).fragment.split('/')[-1] for a in page.locator('.wonder').evaluate_all('(links) => links.map(a => a.href)')} == set(gallery_ids)
    # Versions belong in query strings; check resource paths rather than the end of the URL.
    decks = page.request.get(BASE+'/slides/data/index.json').json()
    page.goto(BASE+'/#slides')
    page.wait_for_function('n => document.querySelectorAll(".deck-download").length === n', arg=len(decks))
    for mode, extension, signature in [('lecture', '.pdf', b'%PDF-'), ('explore', '.html', b'<!doctype html>')]:
        page.locator('[data-slide-type='+mode+']').click()
        links = page.locator('.deck-download').evaluate_all('(links) => links.map(a => a.href)')
        assert len(links) == len(decks), (mode, len(links), len(decks))
        assert all(urlparse(href).path.endswith(extension) for href in links), (mode, links)
        assert all('v=' in urlparse(href).query for href in links), 'downloads must retain cache versions'
        response = page.request.get(links[0])
        assert response.ok and response.body().lstrip().lower().startswith(signature.lower()), links[0]
        assert page.locator('.deck-list li').evaluate_all('(rows) => rows.every(row => row.querySelector("a:not([download])") && row.querySelector("a[download]"))')

    # The screenshot's single-figure case: curriculum language, direct manipulation, quiet toolbar.
    os.makedirs('test-results', exist_ok=True)
    player = browser.new_page(viewport={'width':1280,'height':720})
    player.on('pageerror', lambda e: errors.append(str(e)))
    player_deck = page.request.get(BASE+'/slides/data/premiere-02.json').json()
    widget_at = next(i for i,s in enumerate(player_deck['slides']) if s['k'] == 'widget')
    player.goto(BASE+'/slides/player.html?deck=premiere-02#'+str(widget_at))
    player.wait_for_selector('#wcanvas canvas')
    assert player.locator('html').get_attribute('lang') == 'fr'
    player.goto(BASE+'/slides/player.html?deck=premiere-02&lang=en#'+str(widget_at))
    player.wait_for_selector('#wcanvas canvas')
    assert player.locator('html').get_attribute('lang') == 'en', 'a requested available edition is honored'
    assert player.locator('#lng,#dl,#explore-choice,.canvas-navigation button').count() == 0
    assert player.locator('#wctl select').count() == 0, 'point selection must stay on the canvas'
    figure = player.locator('#wcanvas canvas')
    player.wait_for_selector('#readout mjx-container')
    before = player.locator('#readout').inner_html()
    figure.focus(); figure.press('ArrowRight')
    player.wait_for_function('before => document.querySelector("#readout").innerHTML !== before', arg=before)
    assert player.locator('#count').inner_text().startswith(str(widget_at+1)+' /'), 'moving a point must not advance the slide'
    player.screenshot(path='test-results/'+engine+'-quiet-player.png', full_page=True)
    player.close()

    # First visit uses the browser language; curriculum pages must not overwrite that preference.
    automatic = browser.new_context(locale='en-GB')
    neutral = automatic.new_page()
    neutral.on('pageerror', lambda e: errors.append(str(e)))
    neutral.goto(BASE+'/#gallery'); neutral.wait_for_selector('.wonder')
    assert neutral.locator('html').get_attribute('lang') == 'en'
    neutral.goto(BASE+'/#university/module-semaine-1'); neutral.wait_for_selector('.sequence-forward')
    assert neutral.locator('html').get_attribute('lang') == 'fr'
    neutral.goto(BASE+'/#gallery'); neutral.wait_for_selector('.wonder')
    assert neutral.locator('html').get_attribute('lang') == 'en'
    automatic.close()

    # Exercise every generated university route and scoped navigation in the real browser.
    university = page.request.get(BASE+'/resources/university/index.json').json()
    page.goto(BASE+'/#university')
    page.wait_for_selector('.university-sequence')
    assert page.locator('.university-sequence').count() == sum(len(s['sequences']) for s in university['sections'])
    for section in university['sections']:
        for at, sequence in enumerate(section['sequences']):
            page.goto(BASE+'/#university/'+sequence['id'])
            page.wait_for_selector('.sequence-forward')
            assert page.locator('html').get_attribute('lang') == section['language']
            assert page.locator('[data-lang]:visible').count() == 0
            expected = [section['sequences'][n]['id'] for n in [at-1,at+1] if 0 <= n < len(section['sequences'])]
            actual = page.locator('.sequence-forward a').evaluate_all('(links) => links.map(a => a.hash.split("/").pop())')
            assert actual == expected, (sequence['id'], actual, expected)
            assert page.locator('a.university-file[download]').count() == 1
    for width in [320,390,1280]:
        page.set_viewport_size({'width':width,'height':900})
        page.goto(BASE+'/#university'); page.wait_for_selector('.university-sequence')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), ('university',width)
    for route in ['courses','slides','pack','library','lab/quadratic','gallery/platonic']:
        page.goto(BASE+'/#'+route)
        page.wait_for_selector('main')
        assert page.locator('select:visible').evaluate_all('(selects) => selects.every(s => [...s.options].filter(o => !o.disabled && !o.closest("optgroup[disabled]")).length > 1)'), route
    page.goto(BASE+'/#gallery/mandelbrot'); page.wait_for_selector('#mb-julia canvas')
    assert page.locator('#mb-in,#mb-out,#mb-reset,.canvas-navigation button').count() == 0
    assert page.locator('#mb-fly').count() == 1, 'retain the mathematical exploration preset'
    for panel in ['#mb-stage','#mb-julia']:
        canvas = page.locator(panel+' canvas')
        canvas.focus(); canvas.press('+')
        assert page.locator(panel+' .canvas-navigation').text_content() != '100 %'
        canvas.press('0')
        assert page.locator(panel+' .canvas-navigation').text_content() == '100 %'
    page.goto(BASE+'/#university/module-semaine-1')
    for key in ['module-workbook','module-statements','module-tex','module-all']:
        response = page.request.get(urljoin(BASE+'/', university['files'][key]['path']))
        assert response.ok, key
        assert response.body().startswith(b'%PDF-' if key in ['module-workbook','module-statements'] else b'PK'), key
    page.set_viewport_size({'width':1440,'height':1000})
    page.goto(BASE+'/#gallery'); page.wait_for_selector('.wonder')
    page.goto(BASE+'/#lab'); assert page.locator('.lab2-card-link').count() == 37, 'the laboratory index includes all registered experiments'
    assert page.locator('.lab2-group').count() == 15
    page.goto(BASE+'/#lab/galton'); page.wait_for_selector('#object-stage canvas'); assert page.evaluate('location.hash') == '#gallery/galton', 'curiosities redirect to the gallery'
    for language in ['fr','en']:
        page.locator('[data-lang="'+language+'"]').click()
        for name in EXPERIMENTS:
            walk_experiment(page, name)
            assert page.locator('html').get_attribute('lang') == language
            assert page.locator('.canvas-navigation button:visible').count() == 0
        for challenge,answer in zip(CHALLENGES,CHALLENGE_ANSWERS):
            page.goto(BASE+'/#challenges/'+challenge)
            page.locator('#challenge-answer').fill(answer)
            page.locator('#challenge-form button').click()
            assert 'success' in page.locator('#challenge-feedback').get_attribute('class')
            for summary in page.locator('.hint-panel summary, .solution-wide summary').all():
                summary.click()
            assert page.locator('.hint-panel details[open]').count() == 2 and page.locator('.solution-wide details[open]').count() == 1
    # Probability: the run buttons add experiments to one series; the seeded series is the same after a reload of the mission.
    page.goto(BASE+'/#lab/probability/run'); page.locator('.lab2-canvas').wait_for()
    run = page.locator('[data-control="run"] button')
    assert run.count() == 5
    run.nth(2).click(); run.nth(3).click()
    page.wait_for_function("() => document.querySelector('.lab2-readout dd').textContent === '1100'")
    page.evaluate("() => document.querySelector('.lab2').__lab.setState({p: 0})")
    page.wait_for_function("() => document.querySelectorAll('.lab2-readout dd')[1].textContent === '0'")   # p = 0: no success in any experiment
    run.nth(4).click()
    page.wait_for_function("() => document.querySelector('.lab2-readout dd').textContent === '0'")        # a new series starts at zero
    page.goto(BASE+'/#lab/sequences/signs')
    page.locator('.lab2-formula').wait_for()
    assert '×' in page.locator('.lab2-formula').inner_text() and page.locator('.lab2-readout').inner_text(), 'the geometric formula multiplies'
    # Statistics: the readout follows the values; a value dragged to the edge of the line stays inside it.
    page.goto(BASE+'/#lab/statistics/mean'); page.locator('.lab2-canvas').wait_for()
    page.evaluate("() => document.querySelector('.lab2').__lab.setState({data: [20, 20, 20, 20, 0, 0, 0]})")
    page.wait_for_function("() => document.querySelector('.lab2-readout dd').textContent === '80/7 ≈ 11.43'")
    assert 'NaN' not in page.locator('.lab2').inner_text() and 'undefined' not in page.locator('.lab2').inner_text()
    page.reload()
    assert page.locator('html').get_attribute('lang') == 'en'
    assert page.evaluate("JSON.parse(localStorage.getItem('maths-explorer-v1')).completed.length") == len(EXPERIMENTS) + len(CHALLENGES)
    page.goto(BASE+'/#challenges')
    for kind,count in [('play',24),('olympiad',14),('all',38)]:
        page.locator('[data-filter="'+kind+'"]').click()
        assert page.locator('.challenge-card').count() == count
    # "Lire": three tabs, texts and curiosities, and the cross-links shown both ways (Hanoi challenge and its legend).
    page.goto(BASE+'/#biographies'); assert page.locator('.subnav a[href="#history"]').count() == 1 and page.locator('.read-card').count() == 4
    page.goto(BASE+'/#stories/gauss-sum'); page.locator('.read-also a[href="#challenges/gauss-sum"]').click(); page.wait_for_url('**/#challenges/gauss-sum')
    page.goto(BASE+'/#challenges/hanoi'); page.locator('.read-also a[href="#stories/hanoi-legend"]').click(); page.locator('.read-article h1').wait_for()
    assert page.locator('.read-also a[href="#challenges/hanoi"]').count() == 1
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    # Regression: skip navigation must focus the content without changing the route.
    page.goto(BASE+'/#lab/trig')
    page.locator('.lab2-canvas').wait_for()
    page.locator('.skip').focus()
    page.keyboard.press('Enter')
    assert page.evaluate('document.activeElement.id') == 'main'
    assert page.evaluate('location.hash') == '#lab/trig/open'
    page.goto(BASE+'/#lab/trig/quadrants'); page.locator('.lab2-canvas').wait_for()
    page.locator('.lab2-handle').first.focus()
    before = page.locator('.lab2-readout dd').first.inner_text()
    page.keyboard.press('ArrowRight')
    page.wait_for_function("b => document.querySelector('.lab2-readout dd').textContent !== b", arg=before)   # the next frame, not the key event
    for route in ['lab/unknown','challenges/unknown','unknown']:
        page.goto(BASE+'/#'+route)
        assert page.locator('#main h1').inner_text() == 'Page not found'
    # Derivative: approach from the left with the scrubber (position 10 of the list of |h| is 0.01).
    page.goto(BASE+'/#lab/derivative/sides')
    page.locator('.lab2-variant').nth(1).click()
    page.locator('#lab2-derivative-h').fill('10')
    page.wait_for_function("() => document.querySelector('.lab2-readout dd').textContent === '1.99'")
    assert page.locator('.lab2-readout dd').last.inner_text() == '\u22120.01', 'the gap to 2x is h, here negative'
    # Integral: n = 2 rectangles on [0 ; 1], right then midpoint heights.
    page.goto(BASE+'/#lab/integral/heights')
    page.locator('#lab2-integral-n').fill('2')
    page.locator('.lab2-variant').nth(1).click()
    page.wait_for_function("() => document.querySelector('.lab2-readout dd').textContent === '0.625'")
    page.evaluate("() => document.querySelector('.lab2').__lab.setState({method: 'mid'})")
    page.wait_for_function("() => document.querySelector('.lab2-readout dd').textContent === '0.3125'")
    # Vectors: u and v reduced to the zero vector give a flat parallelogram, collinear and without area.
    page.goto(BASE+'/#lab/vectors/collinear'); page.locator('.lab2-canvas').wait_for()
    page.evaluate("() => document.querySelector('.lab2').__lab.setState({ux: 0, uy: 0, vx: 0, vy: 0})")
    page.wait_for_function("() => /flat|aplati/.test(document.querySelectorAll('.lab2-readout dd')[2].textContent)")
    assert page.locator('.lab2-readout dd').first.inner_text() == '0', 'the determinant of two zero vectors is 0, not -0'
    # Complex: the multiplier z is dragged on a polar grid; the readout gives modulus and argument.
    page.goto(BASE+'/#lab/complex/scale'); page.locator('.lab2-canvas').wait_for()
    page.evaluate("() => document.querySelector('.lab2').__lab.setState({r: 2, theta: 90})")
    page.wait_for_function("() => document.querySelectorAll('.lab2-readout dd')[0].textContent.includes('2') && document.querySelectorAll('.lab2-readout dd')[0].textContent.includes('90')")
    page.locator('[data-lang="en"]').click()
    page.goto(BASE+'/#pathways')
    # programmes and the note are folded (details): read the text content, not only what is rendered
    assert '2027–2028' in page.locator('#main').text_content()
    assert 'AI SL' in page.locator('#main').text_content()
    assert 'Removed' in page.locator('#main').text_content()
    # The app never sends answers or notes through fetch/XHR.
    submissions = []
    page.on('request', lambda req: submissions.append(req.url) if req.resource_type in ['xhr','fetch'] else None)
    page.goto(BASE+'/#lab/probability/open'); page.locator('.lab2-option').first.click()
    page.goto(BASE+'/#lab/vectors/read'); page.locator('.lab2-check input').fill('7'); page.locator('.lab2-check button[type=submit]').click()
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
        extra.goto(BASE+'/#lab/probability/open')
        extra.locator('.lab2-canvas').first.wait_for()
        extra.locator('[data-lang="en"]').click()
        extra.locator('.lab2-option').first.click()
        extra.wait_for_function("() => document.querySelector('.lab2-card').classList.contains('is-done')")
        if 'denied' in script or 'quota' in script: assert 'unavailable' in extra.locator('footer').inner_text()
        assert not extra_errors, extra_errors
        context.close()
    for width in [1440,768,390,320]:
        page.set_viewport_size({'width':width,'height':900})
        for route in ['lab']+['lab/'+x for x in EXPERIMENTS]+['challenges','challenges/doors','pathways']:
            page.goto(BASE+'/#'+route)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width,route)
    page.set_viewport_size({'width':768,'height':900})
    for route in ['lab']+['lab/'+x for x in EXPERIMENTS]+['challenges','challenges/doors','pathways']:
        page.goto(BASE+'/#'+route)
        page.add_style_tag(content='html{font-size:200%}')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), ('200% text',route)
    # Each challenge has a hands-on activity that works without reading the solution.
    page.set_viewport_size({'width':1366,'height':1100})
    page.goto(BASE+'/#challenges/doors')
    page.locator('.variation > summary').click()
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
    # The sum stays folded until the learner asks for it, then follows the slider.
    page.locator('#sq-n').fill('12'); assert not page.locator('#sq-read').is_visible(), 'the sum is hidden until asked for'
    page.locator('details:has(#sq-read) > summary').click(); assert '144' in page.locator('#sq-read strong').inner_text()
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
    page.locator('details.variation > summary').click()   # the settings are folded until asked for
    page.locator('input[data-var="n"]').fill('50')
    page.locator('input[data-var="n"]').dispatch_event('change')
    assert '50' in page.locator('#problem').inner_text() and page.locator('.door').count() == 50
    page.locator('#challenge-answer').fill('7'); page.locator('#challenge-form button').click()
    assert 'success' in page.locator('#challenge-feedback').get_attribute('class')   # floor(sqrt(50)) = 7
    page.locator('#var-reset').click()
    assert page.locator('.door').count() == 100
    for challenge in CHALLENGES:
        page.goto(BASE+'/#challenges/'+challenge)
        if not page.evaluate("document.querySelector('.variation').open"): page.locator('.variation > summary').click()   # same hash: no re-render, panel may be open
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
        if page.locator('#var-reset').count():   # the reset button sits in the folded settings panel
            if not page.evaluate("document.querySelector('.variation').open"): page.locator('.variation > summary').click()
            page.locator('#var-reset').click()
            if page.evaluate("document.querySelector('.variation')?.open"): page.locator('.variation > summary').click()
    def reveal(sel):   # measurements and sums are folded until the learner asks for them
        page.locator(sel).evaluate("e => { const d = e.closest('details'); if (d && !d.open) d.querySelector('summary').click(); }")
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
    go('lunes'); reveal('#ln-read'); assert '24' in page.locator('#ln-read').inner_text()
    go('star'); reveal('#st-read'); page.locator('#st-rand').click(); assert '180' in page.locator('#st-read').inner_text()
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
    go('pegs'); page.locator('.toy-handle[data-i="0"]').click(); page.locator('.toy-handle[data-i="1"]').click(); page.wait_for_timeout(700)
    assert ('Sauts : 1' in page.locator('#pg-read').inner_text()) or ('Jumps : 1' in page.locator('#pg-read').inner_text())
    page.locator('.toy-handle[data-i="0"]').click(); page.locator('.toy-handle[data-i="1"]').click(); page.wait_for_timeout(700)   # A jumps back over B to (0, 0)
    assert ('Sauts : 2' in page.locator('#pg-read').inner_text()) or ('Jumps : 2' in page.locator('#pg-read').inner_text())
    hint(2, 'classes'); assert page.locator('#pg-read').inner_text() != ''
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
    # Direct actions and compact settings on desktop and phone widths, including real captured mouse taps/drags.
    os.makedirs('test-results', exist_ok=True)
    for width in [1280,390]:
        page.set_viewport_size({'width':width,'height':950})
        go('jugs')   # from the original data: the variation loop above left random values
        assert page.locator('.variation').evaluate('(el) => !el.open')
        assert page.locator('.jg-moves').count() == 0
        page.locator('[data-jug="0"]').click();page.locator('[data-destination="tap"]').click()
        page.wait_for_function("s => document.querySelector('.jg-svg').dataset.state === s", arg='3,0', timeout=5000)   # pouring is animated
        page.locator('[data-jug="0"]').click();page.locator('[data-jug="1"]').click()
        page.wait_for_function("s => document.querySelector('.jg-svg').dataset.state === s", arg='0,3', timeout=5000)   # pouring is animated
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        page.screenshot(path='test-results/direct-jugs-'+str(width)+'.png',full_page=True)
        page.goto(BASE+'/#challenges/fly')
        race=page.locator('#activity svg').first
        race.click();page.wait_for_timeout(450);race.click()
        assert float(race.get_attribute('data-time')) > 0
        page.locator('.variation > summary').click()
        for i,value in enumerate(['137','31','47','250']):page.locator('[data-custom="trip"]').nth(i).fill(value)
        page.locator('[data-apply="trip"]').click()
        assert '137' in page.locator('#problem').inner_text()
        assert page.locator('[data-var="trip"]').input_value() == 'custom'
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        page.locator('.variation > summary').click()
        page.screenshot(path='test-results/direct-fly-'+str(width)+'.png',full_page=True)
    # New gallery exhibits: real Chromium rendering on desktop and phones, with their actual input events.
    os.makedirs('test-results', exist_ok=True)
    discoveries = ['voronoi','fastest-slide','soap-films','knots','einstein']
    for width in [1280,390]:
        page.set_viewport_size({'width':width,'height':950})
        for exhibit in discoveries:
            page.goto(BASE+'/#gallery/'+exhibit)
            canvas=page.locator('#object-stage canvas'); canvas.wait_for()
            assert page.locator('.exhibit-readout').inner_text().strip(), exhibit
            assert page.locator('#quiz-preset').count() == 0, 'no empty preset action'
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width,exhibit)
            if exhibit == 'voronoi':
                canvas.focus();canvas.press('Enter')
                assert page.locator('#vo-seed').get_attribute('max') == '7'
                canvas.press('ArrowRight')
            elif exhibit == 'fastest-slide':
                page.locator('#bs-show-1').uncheck()
                page.locator('#bs-race').click();page.wait_for_timeout(150)
                assert float(page.locator('#bs-time-out').inner_text()) > 0
            elif exhibit == 'soap-films':
                assert page.locator('#sf-frame option').count() == 14
                for frame in ['helicoid','catenoid','tetrahedron']:
                    page.locator('#sf-frame').select_option(frame)
                    page.locator('#sf-step').click()
                    assert 'NaN' not in page.locator('.exhibit-readout').inner_text()
            elif exhibit == 'knots':
                assert page.locator('#kn-knot option').count() == 44
                assert page.locator('#kn-mode').count() == 0
                page.locator('#kn-knot').select_option('3_1')
                page.locator('#kn-projection').click()
                page.locator('#kn-find').click()
                assert '9' in page.locator('.exhibit-readout').inner_text()
                page.locator('#kn-example').select_option('unknot')
                page.locator('#kn-end').click()
                assert '100 %' in page.locator('.exhibit-readout').inner_text()
                page.locator('#kn-space').click()
                page.locator('#kn-knot').select_option('3_1')
                canvas.focus();canvas.press('ArrowRight')
                assert int(canvas.get_attribute('data-crossings')) > 0
            else:
                page.locator('#hat-p5000').click()
                assert 'Exception' in page.locator('.exhibit-readout').inner_text()
            page.screenshot(path='test-results/gallery-'+exhibit+'-'+str(width)+'.png',full_page=True)
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
    page.goto(BASE+'/#gallery/platonic')
    assert page.locator('[data-case]').count() == 5, 'exactly five (p, q) pairs make a solid'
    page.locator('#pl-open').click(); assert page.locator('#pl-fold').input_value() == '0'
    page.locator('#pl-fold').fill('100'); assert page.locator('#pl-fold-out').inner_text() == '100 %'
    page.locator('#pl-p').fill('4'); page.locator('#pl-q').fill('4')
    assert page.locator('#pl-build-case').is_disabled()
    os.makedirs('test-results',exist_ok=True)
    page.set_viewport_size({'width':1440,'height':1100})
    page.goto(BASE+'/#lab/integral')
    page.wait_for_selector('.lab2-canvas')
    page.screenshot(path='test-results/'+engine+'-desktop.png',full_page=True,animations='disabled')
    page.set_viewport_size({'width':390,'height':844})
    page.goto(BASE+'/#lab/probability/mean')
    page.wait_for_selector('.lab2-canvas')
    page.screenshot(path='test-results/'+engine+'-mobile.png',full_page=True,animations='disabled')
    # Arithmetic is readable content, and mission text always scrolls with the document.
    page.set_viewport_size({'width':390,'height':844})
    for experiment in ['fermat','euler-primes']:
        page.goto(BASE+'/#lab/'+experiment)
        page.locator('.lab2-calculation').wait_for()
        assert page.locator('.lab2-canvas').count() == 0
        assert page.locator('.lab2-calculation math msup').count() > 0
        assert page.locator('.lab2-card').evaluate("el => getComputedStyle(el).overflowY") == 'visible'
        page.screenshot(path='test-results/arithmetic-'+experiment+'.png',full_page=True)
    go('cookies')   # from the original data: the variation loop above left random values
    page.locator('[data-cookie="0"]').click();page.locator('[data-child="0"]').click()
    assert page.locator('.ck-sharing').get_attribute('data-parts') == '1,0,0,0,0'
    source=page.locator('[data-cookie="1"]');target=page.locator('[data-child="1"]')
    source.drag_to(target)
    assert page.locator('.ck-sharing').get_attribute('data-parts') == '1,1,0,0,0'
    page.screenshot(path='test-results/cookies-sharing.png',full_page=True)
    for experiment in ['buffon','bertrand']:
        page.goto(BASE+'/#lab/'+experiment)
        page.locator('.lab2-stream-toggle').click()
        page.wait_for_function("() => document.querySelector('.lab2').__lab.getState().runs >= 3")
        speed=page.locator('.lab2-stream-speed input');speed.fill('60');speed.dispatch_event('input')
        page.locator('.lab2-stream-toggle').click()
        count=page.evaluate("() => document.querySelector('.lab2').__lab.getState().runs")
        page.wait_for_timeout(250)
        assert page.evaluate("() => document.querySelector('.lab2').__lab.getState().runs") == count
    assert not errors, errors
    browser.close()
    print('PASS ('+engine+'): bilingual labs and challenges; every experiment walked mission by mission, two-sided secants, quadratures, keyboard/skip focus, routes, storage failures, privacy, 4 viewport widths and all surfaces at 200% text.')
