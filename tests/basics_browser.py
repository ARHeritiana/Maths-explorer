"""Browser checks of the seven foundations lessons (#basics/<id>) in both languages (issue #24).
 - the shell and the embedded lesson use the site language: iframe src (.en.html or not), iframe lang and title,
   <html lang> inside the lesson, the lesson's own heading;
 - switching FR/EN on the route reloads the lesson in the other language (both directions);
 - the English edition shows no French word in its text or ARIA labels, also after clicking its controls;
 - no page error and no horizontal overflow at 390 px (dark) and 1440 px (light).
Run alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/basics_browser.py (needs a running server and Playwright)."""
import os
import re
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
IDS = ['place-value', 'addition', 'subtraction', 'multiplication', 'division', 'sets', 'fractions',
       'logic-propositions', 'logic-implication', 'logic-quantifiers', 'logic-reasoning']
FRENCH = re.compile(r"\b(jetons?|numération|retenues?|emprunts?|dizaines?|centaines?|unités|réinitialiser|vérifier|"
                    r"ensembles?|bravo|essaie|réponse|chiffres?|colonne|partage|suivant|précédent)\b", re.I)


def switch(page, lang):
    button = page.locator(f'[data-lang="{lang}"]').first
    if not button.is_visible():
        page.locator('.nav-toggle').click()
    page.locator(f'[data-lang="{lang}"]').first.click()
    page.wait_for_function(f"document.querySelector('#basics-frame')?.getAttribute('lang')==='{lang}'")


def check(page, lesson, lang, problems):
    frame_el = page.locator('#basics-frame')
    frame_el.wait_for()
    src, flang = frame_el.get_attribute('src'), frame_el.get_attribute('lang')
    if ('.en.html' in src) != (lang == 'en') or f'/{lesson}' not in src:
        problems.append(f'{lesson} {lang}: src {src}')
    if flang != lang:
        problems.append(f'{lesson} {lang}: iframe lang {flang}')
    frame = page.frame_locator('#basics-frame')
    frame.locator('h1').first.wait_for()
    inner = frame.locator('html').get_attribute('lang')
    if inner != lang:
        problems.append(f'{lesson} {lang}: lesson html lang {inner}')
    title = frame_el.get_attribute('title') or ''
    if lang == 'en' and FRENCH.search(title):
        problems.append(f'{lesson} en: French iframe title {title}')
    if lang == 'en':
        hit = FRENCH.search(frame.locator('body').inner_text())
        if hit:
            problems.append(f'{lesson} en: French word "{hit.group(0)}" in the lesson')
    if page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'):
        problems.append(f'{lesson} {lang}: horizontal overflow')


with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'):
        options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    problems, cases = [], 0
    for width, scheme in ((390, 'dark'), (1440, 'light')):
        for start in ('fr', 'en'):
            other = 'en' if start == 'fr' else 'fr'
            context = browser.new_context(viewport={'width': width, 'height': 900}, color_scheme=scheme)
            context.add_init_script("localStorage.setItem('maths-explorer-v1', JSON.stringify({lang:'%s'}))" % start)
            page = context.new_page()
            page.on('pageerror', lambda e: problems.append('pageerror ' + str(e)))
            for lesson in IDS:
                page.goto(f'{BASE}/#basics/{lesson}')
                check(page, lesson, start, problems)
                switch(page, other)
                check(page, lesson, other, problems)
                switch(page, start)
                cases += 2
            context.close()
    # dynamic feedback of the English editions, opened directly
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.on('pageerror', lambda e: problems.append('pageerror ' + str(e)))
    for lesson in IDS:
        page.goto(f'{BASE}/resources/basics/{lesson}.en.html')
        if page.locator('html').get_attribute('lang') != 'en':
            problems.append(f'{lesson}.en.html: html lang')
        buttons = page.locator('button:visible')
        for k in range(min(buttons.count(), 40)):
            try:
                buttons.nth(k).click(timeout=400)
            except Exception:
                pass
        text = page.locator('body').inner_text() + ' ' + ' '.join(
            page.eval_on_selector_all('[aria-label]', 'e => e.map(x => x.getAttribute("aria-label"))'))
        hit = FRENCH.search(text)
        if hit:
            problems.append(f'{lesson}.en.html after clicks: French word "{hit.group(0)}"')
        cases += 1
    browser.close()
    assert not problems, problems
    print(f'basics_browser: {cases} cases passed')
