"""Assemble the served folder: copy the hand-written site (site/) into dist/.

dist/ is what the host serves and is committed (the host has no build step). It holds two kinds of files:
  - copies of site/ (index.html, styles/, fonts/, js/, slides/ player and widgets, vendor/, resources/document-theme.css);
  - generated products (resources/ PDFs and catalogue, sources/, slides/data and slides/fig, js/resources-data.js,
    js/enrichment-data.js), written by the other pipeline steps.
Edit site/, never the dist/ copies; `python -m mxbuild site --check` fails when a copy differs from its source.
"""
import hashlib, re, shutil
from . import ROOT, DIST

SITE = ROOT / 'site'
AGENT_NOTES = {'CLAUDE.md', 'AGENTS.md'}   # folder indexes for coding agents (MAP.md), never served


def pairs():
    for src in sorted(SITE.rglob('*')):
        if src.is_file() and '__pycache__' not in src.parts and src.name not in AGENT_NOTES:
            yield src, DIST / src.relative_to(SITE)


# dist/ paths that are copies of site/ (anything else in them is an orphan); generated files are listed apart.
MANAGED = ['index.html', 'styles/*', 'fonts/*', 'vendor/*', 'js/**/*', 'slides/*.html', 'slides/*.css', 'slides/*.js',
           'resources/document-theme.css']
GENERATED = {'js/resources-data.js', 'js/enrichment-data.js'}


def orphans():
    """dist/ copies whose source no longer exists in site/ (deleted or renamed there)."""
    found = {str(p.relative_to(DIST)) for g in MANAGED for p in DIST.glob(g) if p.is_file()}
    return sorted(DIST / f for f in found - GENERATED if not (SITE / f).exists())


# Cache busting without a build step on the host: index.html carries an import map that gives every script a URL with the
# hash of its content, so a changed script is fetched again and an unchanged one stays cached. Browsers that cached an old
# lab-objects.js beside a new app.js would otherwise show a mix of old and new pages. The block is regenerated here.
MAP_START, MAP_END = '<!-- importmap:start -->', '<!-- importmap:end -->'


def _hash(path):
    return hashlib.sha1(path.read_bytes()).hexdigest()[:10]


def versioned_index():
    """index.html with its import map, script and style versions brought up to date from the files of dist/ (and site/)."""
    text = (SITE / 'index.html').read_text(encoding='utf-8')
    def current(rel):   # the dist copy once written, else the source: they are byte-identical after `make site`
        return DIST / rel if (DIST / rel).exists() and not (SITE / rel).exists() else SITE / rel
    files = sorted({p.relative_to(SITE).as_posix() for p in (SITE / 'js').rglob('*.js')} | {p.relative_to(DIST).as_posix() for p in (DIST / 'js').glob('*.js')})
    imports = {f'./{f}': f'./{f}?v={_hash(current(f))}' for f in files}
    import json
    block = (MAP_START + '\n    <script type="importmap">\n' + json.dumps({'imports': imports}, indent=2).replace('\n', '\n    ') + '\n    </script>\n    '
             + f'<script type="module" src="{imports["./js/app.js"]}"></script>\n    ' + MAP_END)
    text = re.sub(re.escape(MAP_START) + r'.*?' + re.escape(MAP_END), lambda m: block, text, flags=re.S) if MAP_START in text else \
        text.replace('<script type="module" src="./js/app.js"></script>', block)
    text = re.sub(r'href="\./(styles/[\w-]+\.css)(?:\?v=\w+)?"', lambda m: f'href="./{m.group(1)}?v={_hash(SITE / m.group(1))}"', text)
    return text


def write(check=False):
    stale = []
    player=SITE/'slides/player.html'
    player_text=versioned_player()
    if not check: player.write_text(player_text)
    elif player.read_text()!=player_text: stale.append(player.relative_to(ROOT))
    if not check: (SITE / 'index.html').write_text(versioned_index(), encoding='utf-8')
    elif versioned_index() != (SITE / 'index.html').read_text(encoding='utf-8'): stale.append((SITE / 'index.html').relative_to(ROOT))
    for src, dst in pairs():
        if dst.exists() and dst.read_bytes() == src.read_bytes(): continue
        stale.append(dst.relative_to(ROOT))
        if not check:
            dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst)
    for o in orphans():
        stale.append(o.relative_to(ROOT))
        if not check: o.unlink()
    return stale


def versioned_player():
    import json
    player=SITE/'slides/player.html'
    text=player.read_text()
    paths=['./'+p.name for p in sorted((SITE/'slides').glob('*.js'))]+['../js/canvas-navigation.js']
    imports={path:path+'?v='+_hash(player.parent/path) for path in paths}
    block=MAP_START+'\n<script type="importmap">'+json.dumps({'imports':imports})+'</script>\n<script type="module" src="'+imports['./player.js']+'"></script>\n'+MAP_END
    if MAP_START in text:text=re.sub(re.escape(MAP_START)+r'.*?'+re.escape(MAP_END),lambda m:block,text,flags=re.S)
    else:text=text.replace('<script type="module" src="./player.js"></script>',block)
    return re.sub(r'href="\./player.css(?:\?v=\w+)?"',lambda m:'href="./player.css?v='+_hash(SITE/'slides/player.css')+'"',text)
