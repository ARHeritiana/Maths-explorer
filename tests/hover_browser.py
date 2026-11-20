"""Hover contrast (owner report, 20 November 2026): a button or link must stay readable while the mouse rests on it, in both
themes. For every button, link and summary of the main pages, the text colour is measured against the background actually
painted behind it (ancestors blended), at rest and hovered; a hovered state under 3:1 that is also worse than the resting
state fails. Elements whose own background is transparent and drawn by a child (timeline bars) are skipped.
Also checks the hover menus: the Library flyout opens when the mouse rests on it and closes when it leaves; the profile
menu opens on hover and a click keeps it open.
Run through tests/run_browser.py, or alone: MATHS_EXPLORER_URL=http://localhost:4173 python tests/hover_browser.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173')
ROUTES = ['home', 'lab', 'lab/quadratic', 'gallery', 'gallery/life', 'challenges', 'resources', 'bank', 'teacher', 'stories',
          'intuition', 'automatismes', 'sheets', 'search']
CONTRAST = """(el)=>{
 const parse=c=>{const m=c.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(/[ ,\\/]+/).map(Number);return {r:p[0],g:p[1],b:p[2],a:p[3]===undefined?1:p[3]}};
 const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
 const over=(t,b)=>({r:t.r*t.a+b.r*(1-t.a),g:t.g*t.a+b.g*(1-t.a),b:t.b*t.a+b.b*(1-t.a),a:1});
 const own=parse(getComputedStyle(el).backgroundColor);
 if(!own||own.a===0){ if(el.querySelector('[class*=line],canvas,img,svg'))return null; }
 let layers=[],e=el;while(e){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0){layers.push(c);if(c.a>=1)break}e=e.parentElement}
 let bg={r:255,g:255,b:255,a:1};for(const l of layers.reverse())bg=over(l,bg);
 const fg=over(parse(getComputedStyle(el).color),bg),a=lum(fg),b=lum(bg);
 return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}"""

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    bad = []
    for theme in ['jour', 'nuit']:
        for route in ROUTES:
            page.goto(f'{BASE}/#{route}'); page.wait_for_timeout(900)
            page.evaluate("(t)=>{document.documentElement.dataset.theme=t}", theme)
            for el in page.locator('main a, main button, header a, header button, footer a, summary').all()[:80]:
                try:
                    if not el.is_visible(): continue
                    before = el.evaluate(CONTRAST)
                    if before is None: continue
                    el.scroll_into_view_if_needed(timeout=500); el.hover(timeout=800, force=True); page.wait_for_timeout(220)
                    after = el.evaluate(CONTRAST)
                    if after is not None and after < 3 and after < before - 0.3:
                        bad.append((theme, route, (el.inner_text() or '')[:25].replace('\n', ' '), round(before, 1), round(after, 1)))
                except Exception:
                    pass
    assert not bad, f'hover makes text unreadable: {bad}'
    # menus that show their content on hover
    page.goto(f'{BASE}/#home'); page.wait_for_timeout(900)
    flyout = page.locator('.nav-flyout[data-for="read"]')
    assert not flyout.is_visible()
    page.locator('.mainnav a[data-section="read"]').hover(); page.wait_for_timeout(500)
    assert flyout.is_visible() and flyout.locator('a').count() >= 3, 'Library flyout opens on hover'
    page.mouse.move(900, 600); page.wait_for_timeout(700)
    assert not flyout.is_visible(), 'flyout closes when the mouse leaves'
    summary = page.locator('.audience-menu summary'); summary.hover(); page.wait_for_timeout(300)
    assert page.evaluate("document.querySelector('.audience-menu').open"), 'profile menu opens on hover'
    summary.click(); page.mouse.move(600, 650); page.wait_for_timeout(600)
    assert page.evaluate("document.querySelector('.audience-menu').open"), 'a click keeps the menu open'
    assert not errors, errors
    browser.close()
print(f'hover browser checks passed ({len(ROUTES)} pages, both themes, flyout and hover menus)')
