"""Home/chapter accessibility checks shared by the browser suite and focused runs.

Automates text enlargement, reflow, keyboard navigation, mathematical semantics
and palette contrast. Real device screen-reader acceptance remains manual.
"""
import os
from pathlib import Path

STEPS = ['prepare', 'experiment', 'understand', 'practice', 'review', 'documents']
ROUTES = ['home'] + ['chapter/premiere-02/' + step for step in STEPS]


def _open(page, base, route):
    page.goto(base + '/#' + route)
    page.locator('main').wait_for()
    page.evaluate("document.getElementById('a11y-text-zoom')?.remove()")
    if route.startswith('chapter/'):
        page.wait_for_function("document.querySelector('#chapter-sequence')?.getAttribute('aria-busy') === 'false'")


def _contrast(page):
    return page.evaluate("""() => {
      const css = getComputedStyle(document.documentElement);
      const lum = name => {
        const hex = css.getPropertyValue(name).trim().slice(1);
        const rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
          .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
        return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
      };
      return [
        ['body/page', '--ink', '--bg', 7],
        ['body/card', '--ink', '--surface', 7],
        ['secondary/card', '--ink-2', '--surface', 4.5],
        ['muted/card', '--muted', '--surface', 4.5],
        ['link/page', '--accent', '--bg', 4.5],
        ['active step', '--accent', '--accent-soft', 4.5],
        ['primary action', '--accent-ink', '--accent', 4.5],
        ['focus/page', '--accent', '--bg', 3]
      ].map(([label, foreground, background, minimum]) => {
        const a = lum(foreground), b = lum(background);
        return {label, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05), minimum};
      });
    }""")


def check_home_chapter(page, base, screenshot_dir=None):
    """Check all six pilot chapter steps at normal and doubled text in both themes."""
    cases = 0
    for theme in ['jour', 'nuit']:
        for width in [320, 390, 768, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            for route in ROUTES:
                _open(page, base, route)
                page.evaluate('(theme) => document.documentElement.dataset.theme = theme', theme)
                normal_font = page.locator('body').evaluate('el => parseFloat(getComputedStyle(el).fontSize)')
                for enlarged in [False, True]:
                    if enlarged:
                        style = page.add_style_tag(content='html { font-size: 200% !important; }')
                        style.evaluate("el => el.id = 'a11y-text-zoom'")
                        enlarged_font = page.locator('body').evaluate('el => parseFloat(getComputedStyle(el).fontSize)')
                        assert enlarged_font >= normal_font * 1.99, ('text actually doubled', route)
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (theme, width, route, enlarged)
                    assert page.locator('h1').is_visible(), route
                    if screenshot_dir and width in [390, 1440] and enlarged and route in ['home', 'chapter/premiere-02/prepare']:
                        Path(screenshot_dir).mkdir(parents=True, exist_ok=True)
                        page.screenshot(path=str(Path(screenshot_dir) / ('a11y-' + theme + '-' + str(width) + '-' + route.replace('/', '-') + '.png')), full_page=True)
                    cases += 1
                # Leaving an enlarged page must not enlarge the next baseline.
                page.evaluate("document.getElementById('a11y-text-zoom')?.remove()")
            for result in _contrast(page):
                assert result['ratio'] >= result['minimum'], (theme, result)

    # Keyboard actions use actual link activation, including focus after hash navigation.
    page.set_viewport_size({'width': 390, 'height': 844})
    _open(page, base, 'home')
    page.locator('.skip').focus()
    page.keyboard.press('Enter')
    assert page.evaluate('document.activeElement.id') == 'main'
    assert page.evaluate('location.hash') == '#home'
    action = page.locator('.entrance-actions a[href="#resources"]')
    action.focus()
    assert action.evaluate("el => getComputedStyle(el).outlineStyle !== 'none'"), 'keyboard focus is visible'
    page.keyboard.press('Enter')
    page.wait_for_url('**/#resources')
    page.wait_for_function("document.activeElement.id === 'main'")

    _open(page, base, 'chapter/premiere-02/prepare')
    page.locator('.skip').focus()
    page.keyboard.press('Enter')
    assert page.evaluate('document.activeElement.id') == 'main'
    next_step = page.locator('.sequence-nav a[href$="/experiment"]')
    next_step.focus()
    page.keyboard.press('Enter')
    page.wait_for_url('**/#chapter/premiere-02/experiment')
    page.wait_for_function("document.querySelector('#chapter-sequence')?.getAttribute('aria-busy') === 'false'")
    assert page.evaluate('document.activeElement.id') == 'main'
    assert page.locator('.sequence-nav [aria-current="step"]').get_attribute('href').endswith('/experiment')
    assert page.locator('#chapter-sequence > [role="status"]').inner_text().strip(), 'async content has a load announcement'
    host = page.locator('.chapter-lab-host')
    host.scroll_into_view_if_needed()
    handle = host.locator('.lab2-handle').first
    handle.wait_for(state='attached')
    handle.focus()
    before = host.locator('.lab2-readout').inner_text()
    page.keyboard.press('ArrowRight')
    page.wait_for_function("before => document.querySelector('.chapter-lab-host .lab2-readout').innerText !== before", arg=before)

    _open(page, base, 'chapter/premiere-02/understand')
    page.locator('mjx-assistive-mml math').first.wait_for(state='attached')
    assert page.locator('mjx-assistive-mml').first.evaluate("el => getComputedStyle(el).display !== 'none'"), 'semantic mathematics is available to assistive technology'
    for table in page.locator('.sequence-maths table').all():
        if table.evaluate('el => el.scrollWidth > el.clientWidth'):
            assert table.evaluate("el => ['auto', 'scroll'].includes(getComputedStyle(el).overflowX)"), 'wide maths tables scroll within the text'
    page.evaluate("document.documentElement.dataset.theme = 'jour'")
    page.set_viewport_size({'width': 1440, 'height': 1000})
    return cases


if __name__ == '__main__':
    from playwright.sync_api import sync_playwright
    with sync_playwright() as playwright:
        options = {'headless': True}
        if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'):
            options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
        browser = playwright.chromium.launch(**options)
        page = browser.new_page(reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        cases = check_home_chapter(page, os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173'), os.environ.get('MATHS_EXPLORER_SCREENSHOTS'))
        assert not errors, errors
        browser.close()
        print(f'PASS: {cases} home/chapter layout cases, keyboard, semantic maths and both theme contrast checks; real device screen-reader and owner review pending.')
