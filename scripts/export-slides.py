"""Export every slide deck as one self-contained HTML file: dist/slides/export/<deck id>.html.

Each file holds the player engine (site/slides/*.js bundled in one scope), the player style, the deck (French and
English) and its figures as data URIs. Formulas use MathJax tex-svg and the prose font STIX Two Text, both loaded from
the CDNs the interactive-slides skill allows (internet needed, like the reference slide). The page has no link to the
site, so it can be saved, shared and projected on its own.

Run after build-slides.py (`make slides` does both). `--check` fails if an export is stale.
"""
import base64, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'site/slides'
DATA = ROOT / 'dist/slides/data'
FIG = ROOT / 'dist/slides/fig'
OUT = ROOT / 'dist/slides/export'
MATHJAX = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js'
FONTS = 'https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap'
MODULES = ['../js/canvas-navigation.js', 'widgets.js', 'widgets-2d.js', 'widgets-3d.js', 'player.js']   # widgets.js first: it defines what the others import


def bundle():
    """Concatenate the ES modules in one function scope: drop imports, drop `export`. widgets.js and player.js share the
    outer scope (duplicate names are refused); the two widget libraries keep their private helpers in a block and
    publish only their exported `const` (W2, W3) as a hoisted `var`."""
    parts, seen = [], {}
    for name in MODULES:
        text = (SRC / name).read_text(encoding='utf8')
        text = re.sub(r'^import\s[^;]*?from\s+["\'][^"\']+["\'];?[ \t]*\n', '', text, flags=re.M)
        private = name.startswith('widgets-')
        if private:
            if re.search(r'^export\s+(?:async\s+)?(?:function|class|let)\b', text, flags=re.M): raise SystemExit(f'export-slides: {name} may only export const')
            text = re.sub(r'^export\s+const\s+', 'var ', text, flags=re.M)
            text = '{\n' + text + '}\n'
        else:
            text = re.sub(r'^export\s+', '', text, flags=re.M)
            for m in re.finditer(r'^(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)', text, flags=re.M):
                if m.group(1) in seen: raise SystemExit(f'export-slides: top-level name {m.group(1)!r} is declared in {seen[m.group(1)]} and {name}')
                seen[m.group(1)] = name
        parts.append(f'/* ---- {name} ---- */\n{text}')
    return '(function(){\n"use strict";\n' + '\n'.join(parts) + '\n})();\n'


def player_css():
    css = (SRC / 'player.css').read_text(encoding='utf8')
    return re.sub(r'/\*mx-fonts\*/.*?/\*end mx-fonts\*/', '', css, flags=re.S).strip()


def mathjax_config():
    html = (SRC / 'player.html').read_text(encoding='utf8')
    m = re.search(r'<script>\s*(window\.MathJax=.*?)</script>', html, flags=re.S)
    if not m: raise SystemExit('export-slides: MathJax config not found in site/slides/player.html')
    return m.group(1).strip()


def figures(deck):
    out = {}
    for s in deck['slides']:
        for pair in s.get('f', []):
            for lang, suffix in ((0, ''), (1, '-en')):
                name = f'{deck["id"]}-{pair[lang]}{suffix}.svg'
                f = FIG / name
                if f.exists(): out[name] = 'data:image/svg+xml;base64,' + base64.b64encode(f.read_bytes()).decode()
    return out


def js_json(obj):
    # "</" would close the script element, U+2028/9 are line terminators in older engines
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


def page(deck, engine, css, mj):
    title = deck['title'][0].replace('&', '&amp;').replace('<', '&lt;')
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>{title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link href="{FONTS}" rel="stylesheet">
<script>{mj}</script>
<script src="{MATHJAX}"></script>
<style>
{css}
</style>
</head>
<body>
<div id="wrap"><main id="stage"></main></div>
<script>window.__MX_EXPORT__={js_json({'deck': deck, 'figs': figures(deck)})};</script>
<script>
{engine}</script>
</body>
</html>
'''


def build():
    engine, css, mj = bundle(), player_css(), mathjax_config()
    files = {}
    for f in sorted(DATA.glob('*.json')):
        if f.name == 'index.json': continue
        deck = json.loads(f.read_text(encoding='utf8'))
        files[OUT / f'{deck["id"]}.html'] = page(deck, engine, css, mj)
    return files


def main():
    check = '--check' in sys.argv
    files = build(); stale = []
    OUT.mkdir(parents=True, exist_ok=True)
    for path, html in files.items():
        if path.exists() and path.read_text(encoding='utf8') == html: continue
        stale.append(path.name)
        if not check: path.write_text(html, encoding='utf8')
    for old in OUT.glob('*.html'):
        if old not in files:
            stale.append(old.name)
            if not check: old.unlink()
    size = sum(p.stat().st_size for p in OUT.glob('*.html'))
    print(f'export-slides: {len(files)} decks, {size / 1e6:.1f} MB, {len(stale)} {"stale" if check else "written"}')
    if check and stale: print('stale: ' + ', '.join(stale[:10])); sys.exit(1)


if __name__ == '__main__': main()
