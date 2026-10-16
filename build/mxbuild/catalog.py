"""Catalogue generation from the manifest (single source of truth).

content/data/manifest.json holds the facts people decide: courses, chapters, resource records (ids, types, titles,
audience, French URLs, source page ranges, review status), the chapter companion used by chapter pages, and the list of
chapters compiled from TeX. Everything measurable from the files (page counts, byte sizes, English paths and sizes,
hashes) is computed here, never stored by hand. Generated, committed outputs:

  dist/resources/catalog.json     site catalogue (library, pack builder, slides index)
  dist/js/resources-data.js       chapter companion (chapter pages)
  docs/RESOURCE_PROVENANCE.json   per-file provenance: source page range and SHA-256 of both editions

Builders change records through load()/save(); `python -m mxbuild catalog` regenerates the outputs and
`python -m mxbuild catalog --check` fails when a committed output is stale.
"""
import copy, hashlib, json
from . import ROOT, DIST, DATA

MANIFEST = DATA / 'manifest.json'
CATALOG = DIST / 'resources/catalog.json'
COMPANION = DIST / 'js/resources-data.js'
PROVENANCE = ROOT / 'docs/RESOURCE_PROVENANCE.json'
COMPANION_HEADER = 'export const resourceCatalog = '
# Fields computed from the files; they never appear in the manifest.
MEASURED_RESOURCE = ('pages', 'bytes', 'englishBytes', 'englishPages', 'language', 'translation')
MEASURED_FILE = ('pages', 'end', 'englishPath', 'bytes', 'englishBytes', 'englishPages')


def _dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2) + '\n'


def load():
    return json.loads(MANIFEST.read_text())


def normalise(manifest):
    """Remove measured fields that builders may have set while editing records (they are regenerated)."""
    for c in manifest['catalog']['courses']: c.pop('language', None)
    for r in manifest['catalog']['resources']:
        if r['format'] != 'PDF': continue
        for k in MEASURED_RESOURCE: r.pop(k, None)
        if isinstance(r['url'], list): r['url'] = r['url'][0]
    comp = manifest['companion']
    for ch in comp['chapters'] + comp['supplements']:
        for f in ch['files']:
            for k in MEASURED_FILE: f.pop(k, None)
    return manifest


def save(manifest):
    MANIFEST.write_text(_dump(normalise(manifest)))


def _pdf_pages(path, cache):
    import pymupdf
    if path not in cache:
        with pymupdf.open(path) as d: cache[path] = len(d)
    return cache[path]


def generate(manifest=None):
    """Return {path: text} for the three generated outputs."""
    m = manifest or load()
    converted = set(m['texConverted'])
    pages = {}
    cat = copy.deepcopy(m['catalog'])
    comp = copy.deepcopy(m['companion'])
    # A chapter's identity and heading are authored once in the catalogue.
    chapters = {c['id']: c for c in cat['chapters']}
    if len(chapters) != len(cat['chapters']): raise ValueError('Duplicate chapter IDs')
    course_ids = [c['id'] for c in cat['courses']]
    if len(set(course_ids)) != len(course_ids): raise ValueError('Duplicate course IDs')
    for chapter in cat['chapters']:
        if chapter['course'] not in course_ids: raise ValueError('Unknown chapter course: '+chapter['id'])
    resource_ids=[r['id']for r in cat['resources']]
    if len(set(resource_ids))!=len(resource_ids):raise ValueError('Duplicate resource IDs')
    for resource in cat['resources']:
        if resource['chapter'] not in chapters:raise ValueError('Resource refers to removed/unknown chapter: '+resource['id'])
        for url in resource['url'] if isinstance(resource['url'],list) else [resource['url']]:
            if not (DIST/url.removeprefix('./')).is_file():raise FileNotFoundError('Missing catalogue resource: '+url)
    layouts = {c['id']: c for c in comp['chapters']}
    primary = {c['course'] for c in comp['chapters']}
    canonical = [c for c in cat['chapters'] if c['course'] in primary and c.get('number',0)>0]
    missing = [c['id'] for c in canonical if c['id'] not in layouts]
    if missing: raise ValueError('Add companion file/layout records for new chapters: '+', '.join(missing))
    comp['chapters'] = [layouts[c['id']] for c in canonical]

    for c in comp['chapters'] + comp['supplements']:
        if c['id'] in chapters:
            for key in ('title', 'course', 'number'):
                if key in chapters[c['id']]: c[key] = copy.deepcopy(chapters[c['id']][key])
    # Source records describe owner-supplied files: their URLs and storage ids must never reach the client.
    comp.pop('folder', None)
    for source in cat['sources'] + comp['sources']: source.pop('url', None); source.pop('id', None)
    for course in cat['courses']: course['language'] = 'bilingual'
    for r in cat['resources']:
        if r['format'] != 'PDF': continue
        fr = r['url']; en = fr[:-4] + '-en.pdf'
        pf, pe = DIST / fr.removeprefix('./'), DIST / en.removeprefix('./')
        if not pe.exists(): raise FileNotFoundError(en)
        r['pages'] = _pdf_pages(pf, pages)
        ep = _pdf_pages(pe, pages)
        if ep != r['pages']: r['englishPages'] = ep   # excerpts cut at section starts can differ by a page
        r.update(url=[fr, en], language='bilingual', bytes=pf.stat().st_size, englishBytes=pe.stat().st_size,
                 translation='tex-source' if (r['chapter'] in converted or r.get('texBuilt')) else 'authored-bilingual')
        # key order of the historical files: measured fields after the editorial ones
    provenance = []
    for ch in comp['chapters'] + comp['supplements']:
        for f in ch['files']:
            path = DIST / f['path']; en = path.with_name(path.stem + '-en.pdf')
            if not en.exists(): raise FileNotFoundError(en)
            f['pages'] = _pdf_pages(path, pages); f['end'] = f['start'] + f['pages'] - 1   # whole-page extracts
            f.update(englishPath=str(en.relative_to(DIST)), bytes=path.stat().st_size, englishBytes=en.stat().st_size)
            ep = _pdf_pages(en, pages)   # an excerpt may drift by one page between languages (books may not)
            if abs(ep - f['pages']) > 1: raise ValueError(f'English page count differs by more than one page: {en}')
            if ep != f['pages']: f['englishPages'] = ep
            provenance.append({'path': f['path'], 'source': f['source'], 'pages': [f['start'], f['end']],
                               'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'englishPath': f['englishPath'],
                               'englishSha256': hashlib.sha256(en.read_bytes()).hexdigest()})
    return {CATALOG: _dump(cat), COMPANION: COMPANION_HEADER + json.dumps(comp, ensure_ascii=False, indent=2) + ';\n',
            PROVENANCE: _dump(provenance)}


def write(check=False):
    stale = []
    for path, text in generate().items():
        if path.exists() and path.read_text() == text: continue
        stale.append(path.relative_to(ROOT))
        if not check: path.write_text(text)
    return stale
