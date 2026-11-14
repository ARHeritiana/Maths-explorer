"""Assemble the served folder: copy the hand-written site (site/) into dist/.

dist/ is what the host serves and is committed (the host has no build step). It holds two kinds of files:
  - copies of site/ (index.html, styles/, fonts/, js/, slides/ player and widgets, vendor/, resources/document-theme.css);
  - generated products (resources/ PDFs and catalogue, sources/, slides/data and slides/fig, js/resources-data.js,
    js/enrichment-data.js), written by the other pipeline steps.
Edit site/, never the dist/ copies; `python -m mxbuild site --check` fails when a copy differs from its source.
"""
import hashlib, json, os, re, shutil
from . import ROOT, DIST

SITE = ROOT / 'site'
AGENT_NOTES = {'CLAUDE.md', 'AGENTS.md'}   # folder indexes for coding agents (MAP.md), never served
WORKER = SITE / 'sw.js'   # service worker source: dist/sw.js is generated from it by offline.py (manifest inlined)

# Two editions of one source: FULL_EDITION in site/js/live-curriculum.js chooses (false: Maths Explorer, the French lycée
# site; true: Matematika, the complete site). Their names and search descriptions live in content/data/edition.json; the
# source is written with the limited edition's, and the full build rewrites the served copies of the named pages (and
# offline.py the service worker, scripts/export-slides.py the standalone decks). Scripts read the name back from
# <meta name="application-name">.
EDITION = json.loads((ROOT / 'content' / 'data' / 'edition.json').read_text(encoding='utf-8'))
NAMES = {False: EDITION['name']['limited'], True: EDITION['name']['full']}
NAMED_PAGES = {'index.html', 'slides/player.html', 'resources/basics/fractions.html', 'resources/basics/fractions.en.html',
               'resources/history/mathematicians-timeline.html'}


def full_edition():
    m = re.search(r'^export const FULL_EDITION = (true|false);', (SITE / 'js' / 'live-curriculum.js').read_text(encoding='utf-8'), re.M)
    return m.group(1) == 'true'


# The Mikajy Atlas link of the full edition names an account that must never be written in this repository (banned
# phrase, tests/banned.py). Its value is kept by the Matematika repository in .github/edition.env (MX_ATLAS_URL), read
# from there unless the environment sets MX_ATLAS_URL; the build writes it into the served copy of js/config.js, before
# any hash is taken.
ATLAS_PLACEHOLDER = 'export const MIKAJY_ATLAS_DOWNLOAD_URL = "";'


def edition_env():
    """Values of .github/edition.env (Matematika keeps the Atlas URL there); empty when the file is absent."""
    f = ROOT / '.github' / 'edition.env'
    if not f.is_file():
        return {}
    pairs = (line.split('=', 1) for line in f.read_text(encoding='utf-8').splitlines() if '=' in line and not line.lstrip().startswith('#'))
    return {k.strip(): v.strip() for k, v in pairs}


def edition_name():
    return NAMES[full_edition()]


def edition_text(text):
    """Text of a named page or generated file as the current edition serves it (unchanged in the limited edition)."""
    if not full_edition():
        return text
    return text.replace(EDITION['description']['limited'], EDITION['description']['full']).replace(NAMES[False], NAMES[True])


def atlas_url():
    url = os.environ.get('MX_ATLAS_URL', '').strip() or edition_env().get('MX_ATLAS_URL', '')
    if not re.fullmatch(r'https://github\.com/[\w.-]+/[\w.-]+/releases/latest', url):
        raise SystemExit('The full edition needs MX_ATLAS_URL (the Mikajy Atlas releases page, kept in the Matematika repository).')
    return url


def served(src):
    """The bytes dist/ must hold for a file of site/: a plain copy, except, in the full edition, the edition name in the
    named pages and the Atlas link in js/config.js."""
    data = src.read_bytes()
    rel = src.relative_to(SITE).as_posix()
    if full_edition() and rel in NAMED_PAGES:
        data = edition_text(data.decode('utf-8')).encode('utf-8')
    elif full_edition() and rel == 'js/config.js':
        text = data.decode('utf-8')
        assert text.count(ATLAS_PLACEHOLDER) == 1, 'site/js/config.js must keep the Atlas placeholder line'
        data = text.replace(ATLAS_PLACEHOLDER, f'export const MIKAJY_ATLAS_DOWNLOAD_URL = "{atlas_url()}";').encode('utf-8')
    return data


def pairs():
    for src in sorted(SITE.rglob('*')):
        if src.is_file() and '__pycache__' not in src.parts and src.name not in AGENT_NOTES and src != WORKER:
            yield src, DIST / src.relative_to(SITE)


# dist/ paths that are copies of site/ (anything else in them is an orphan); generated files are listed apart.
MANAGED = ['index.html', 'styles/*', 'fonts/*', 'vendor/*', 'js/**/*', 'slides/*.html', 'slides/*.css', 'slides/*.js',
           'resources/document-theme.css', 'data/**/*']
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
    def digest(f):   # a file of site/ is hashed as served (the full edition rewrites js/config.js)
        p = current(f)
        return hashlib.sha1(served(p) if p.is_relative_to(SITE) else p.read_bytes()).hexdigest()[:10]
    imports = {f'./{f}': f'./{f}?v={digest(f)}' for f in files}
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
        data = served(src)
        if dst.exists() and dst.read_bytes() == data: continue
        stale.append(dst.relative_to(ROOT))
        if not check:
            dst.parent.mkdir(parents=True, exist_ok=True); dst.write_bytes(data); shutil.copystat(src, dst)
    for o in orphans():
        stale.append(o.relative_to(ROOT))
        if not check: o.unlink()
    # Last: the service worker carries the hashes of the shell files written above (offline.py).
    from . import offline
    stale += offline.write(check=check)
    return stale


def versioned_player():
    import json
    player=SITE/'slides/player.html'
    text=player.read_text()
    # the laboratory modules a `type: 'lab'` widget loads (../js/lab/**, and the two helpers they import), same URLs as index.html
    lab=['../js/'+p.relative_to(SITE/'js').as_posix() for p in sorted((SITE/'js/lab').rglob('*.js'))]+['../js/math.js','../js/object-kit.js','../js/fourier-model.js','../js/gallery/gallery-math.js']
    paths=['./'+p.name for p in sorted((SITE/'slides').glob('*.js'))]+['../js/canvas-navigation.js','../js/camera3d.js']+lab
    imports={path:path+'?v='+_hash(player.parent/path) for path in paths}
    block=MAP_START+'\n<script type="importmap">'+json.dumps({'imports':imports})+'</script>\n<script type="module" src="'+imports['./player.js']+'"></script>\n'+MAP_END
    if MAP_START in text:text=re.sub(re.escape(MAP_START)+r'.*?'+re.escape(MAP_END),lambda m:block,text,flags=re.S)
    else:text=text.replace('<script type="module" src="./player.js"></script>',block)
    return re.sub(r'href="\./player.css(?:\?v=\w+)?"',lambda m:'href="./player.css?v='+_hash(SITE/'slides/player.css')+'"',text)
