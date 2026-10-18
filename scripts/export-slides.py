"""Export every slide deck as one self-contained HTML file: dist/slides/export/<deck id>.html.

Each file holds the player engine (site/slides/*.js bundled in one scope), the player style, the deck (French and
English) and its figures as data URIs. Formulas use MathJax tex-svg and the prose font STIX Two Text, both loaded from
the CDNs the interactive-slides skill allows (internet needed, like the reference slide). The page has no link to the
site, so it can be saved, shared and projected on its own.

Run after build-slides.py (`make slides` does both). `--check` fails if an export is stale.
"""
import base64, json, posixpath, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'site/slides'
JS = ROOT / 'site/js'
DATA = ROOT / 'dist/slides/data'
FIG = ROOT / 'dist/slides/fig'
OUT = ROOT / 'dist/slides/export'
MATHJAX = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js'
FONTS = 'https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap'
MODULES = ['../js/canvas-navigation.js', 'widgets.js', 'widgets-2d.js', 'widgets-3d.js', 'player.js']   # widgets.js first: it defines what the others import


LAB_ENTRY = 'lab/mount.js'   # what a `type: 'lab'` widget loads (site/slides/widgets.js `loadLab`)
REGISTRY = '''var __defs = {}, __cache = {};
function __d(key, fn) { __defs[key] = fn; }
function __r(key) {
  if (!__cache[key]) { if (!__defs[key]) throw new Error("module " + key); const e = {}; __cache[key] = e; __defs[key](e, __r); }
  return __cache[key];
}
'''


def lab_module(key, text):
    """One ES module of site/js as a function of a tiny module registry: imports become `__r(key)` reads, exports are collected
    on `__e`, dynamic imports (the lab templates) become resolved promises. Line-based, for the plain forms the lab code uses."""
    base = posixpath.dirname(key)
    res = lambda spec: posixpath.normpath(posixpath.join(base, spec))
    tail = []
    def alias(parts): return ', '.join(p.strip().replace(' as ', ': ') for p in parts.split(',') if p.strip())
    def imp(m):
        kind, spec = m.group(1).strip(), res(m.group(2))
        if kind.startswith('*'): return f'const {kind.split()[-1]} = __r("{spec}");'
        if kind.startswith('{'): return f'const {{ {alias(kind[1:-1])} }} = __r("{spec}");'
        return f'const {kind} = __r("{spec}").default;'
    text = re.sub(r'^import\s+(.+?)\s+from\s+["\']([^"\']+)["\'];?[ \t]*$', imp, text, flags=re.M)
    def reexport(m):
        spec, out = res(m.group(2)), []
        for part in m.group(1).split(','):
            if not part.strip(): continue
            src, _, dst = part.strip().partition(' as ')
            out.append(f'__e.{(dst or src).strip()} = __r("{spec}").{src.strip()};')
        return ' '.join(out)
    text = re.sub(r'^export\s+\{([^}]*)\}\s+from\s+["\']([^"\']+)["\'];?[ \t]*$', reexport, text, flags=re.M)
    def local(m):
        for part in m.group(1).split(','):
            if not part.strip(): continue
            src, _, dst = part.strip().partition(' as ')
            tail.append(f'__e.{(dst or src).strip()} = {src.strip()};')
        return ''
    text = re.sub(r'^export\s+\{([^}]*)\};?[ \t]*$', local, text, flags=re.M)
    text = re.sub(r'^export\s+default\s+', '__e.default = ', text, flags=re.M)
    def decl(m):
        tail.append(f'__e.{m.group(3)} = {m.group(3)};')
        return m.group(2) + m.group(3)
    text = re.sub(r'^(export\s+)((?:async\s+)?function\s*\*?\s*|const\s+|let\s+|var\s+|class\s+)([A-Za-z_$][\w$]*)', decl, text, flags=re.M)
    text = re.sub(r'import\(\s*["\']([^"\']+)["\']\s*\)', lambda m: f'Promise.resolve(__r("{res(m.group(1))}"))', text)
    if re.search(r'^\s*(import|export)\b', text, flags=re.M): raise SystemExit(f'export-slides: unsupported import or export form in {key}')
    return f'__d("{key}", function (__e, __r) {{\n{text}\n{chr(10).join(tail)}\n}});\n'


def lab_modules():
    """The modules reachable from the lab entry (static imports, re-exports and the dynamic imports of the templates)."""
    seen, todo, out = set(), [LAB_ENTRY], []
    while todo:
        key = todo.pop()
        if key in seen or key == 'canvas-navigation.js': continue
        seen.add(key)
        text = (JS / key).read_text(encoding='utf8')
        base = posixpath.dirname(key)
        for m in re.finditer(r'(?:^import\s[^;\n]*?from\s+|^export\s[^;\n]*?from\s+|import\(\s*)["\']([^"\']+)["\']', text, flags=re.M):
            todo.append(posixpath.normpath(posixpath.join(base, m.group(1))))
        out.append((key, text))
    return sorted(out)


def bundle(lab=False):
    """Concatenate the ES modules in one function scope: drop imports, drop `export`. widgets.js and player.js share the
    outer scope (duplicate names are refused); the two widget libraries keep their private helpers in a block and
    publish only their exported `const` (W2, W3) as a hoisted `var`. With `lab` the laboratory modules that a `type: 'lab'`
    widget loads travel along, behind a small module registry (`__d` defines, `__r` requires); only the decks that use a lab
    widget carry them."""
    parts, seen = ['/* ---- module registry ---- */\n' + REGISTRY], {}
    for name in MODULES:
        text = (SRC / name).read_text(encoding='utf8')
        text = re.sub(r'^import\s[^;]*?from\s+["\'][^"\']+["\'];?[ \t]*\n', '', text, flags=re.M)
        text = re.sub(r'import\(\s*["\']\.\./js/([^"\']+)["\']\s*\)', lambda m: f'Promise.resolve(__r("{m.group(1)}"))', text)
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
        if name == '../js/canvas-navigation.js': parts.append('__d("canvas-navigation.js", function (__e) { __e.canvasNavigation = canvasNavigation; });\n')
    if lab: parts.append('/* ---- laboratory ---- */\n' + ''.join(lab_module(k, t) for k, t in lab_modules()))
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
    engines = {False: bundle(), True: bundle(lab=True)}
    css, mj = player_css(), mathjax_config()
    files = {}
    for f in sorted(DATA.glob('*.json')):
        if f.name == 'index.json': continue
        deck = json.loads(f.read_text(encoding='utf8'))
        uses_lab = any((x.get('w') or {}).get('type') == 'lab' for x in deck['slides'])
        files[OUT / f'{deck["id"]}.html'] = page(deck, engines[uses_lab], css, mj)
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
