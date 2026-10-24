"""Catalogue generation from the manifest (single source of truth).

content/data/manifest.json holds the facts people decide: courses, chapters, resource records (ids, types, titles,
audience, French URLs, source page ranges, review status), the chapter companion used by chapter pages, and the list of
chapters compiled from TeX. Everything measurable from the files (page counts, byte sizes,
hashes) is computed here, never stored by hand. Generated, committed outputs:

  dist/resources/catalog.json     site catalogue (library, pack builder, slides index)
  dist/js/resources-data.js       chapter companion (chapter pages)
  content/data/RESOURCE_PROVENANCE.json   per-file provenance: source page range and SHA-256 of both editions

Builders change records through load()/save(); `python -m mxbuild catalog` regenerates the outputs and
`python -m mxbuild catalog --check` fails when a committed output is stale.
"""
import copy, hashlib, json
from . import ROOT, DIST, DATA

MANIFEST = DATA / 'manifest.json'
CATALOG = DIST / 'resources/catalog.json'
COMPANION = DIST / 'js/resources-data.js'
PROVENANCE = ROOT / 'content/data/RESOURCE_PROVENANCE.json'
COMPANION_HEADER = 'export const resourceCatalog = '
# Fields computed from the files; they never appear in the manifest.
MEASURED_RESOURCE = ('pages', 'bytes', 'englishBytes', 'englishPages', 'language', 'translation', 'languages')
MEASURED_FILE = ('pages', 'end', 'englishPath', 'bytes', 'englishBytes', 'englishPages')


def _dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2) + '\n'


def load():
    return json.loads(MANIFEST.read_text())


def normalise(manifest):
    """Remove measured fields that builders may have set while editing records (they are regenerated)."""
    for c in manifest['catalog']['courses']: c.pop('language', None)
    for r in manifest['catalog']['resources']:
        for edition in r.get('editions', {}).values():
            for key in ('bytes', 'pages', 'sha256'): edition.pop(key, None)
        for k in MEASURED_RESOURCE: r.pop(k, None)
        if 'editions' not in r:
            urls = r.get('url')
            if not isinstance(urls, list):
                raise ValueError('Resource needs explicit editions: '+r['id'])
            r['editions'] = {lang: {'path': url} for lang, url in zip(('fr', 'en'), urls) if url}
    comp = manifest['companion']
    for ch in comp['chapters'] + comp['supplements']:
        for f in ch['files']:
            for edition in f.get('editions', {}).values():
                for key in ('bytes', 'pages', 'sha256'): edition.pop(key, None)
            if 'editions' not in f:
                f['editions'] = {lang: {'path': path} for lang, path in (('fr', f.get('path')), ('en', f.get('englishPath'))) if path}
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
    layouts = {c['id']: c for c in comp['chapters']}
    primary = {c['course'] for c in comp['chapters']}
    canonical = [c for c in cat['chapters'] if c['course'] in primary and c.get('number',0)>0]
    missing = [c['id'] for c in canonical if c['id'] not in layouts]
    if missing: raise ValueError('Add companion file/layout records for new chapters: '+', '.join(missing))
    comp['chapters'] = [layouts[c['id']] for c in canonical]

    for c in comp['chapters'] + comp['supplements']:
        if c['id'] in chapters:
            for key in ('title', 'course', 'number', 'labs'):   # labs: lab references, authored once in the catalogue
                if key in chapters[c['id']]: c[key] = copy.deepcopy(chapters[c['id']][key])
    # Source records describe owner-supplied files: their URLs and storage ids must never reach the client.
    comp.pop('folder', None)
    for source in cat['sources'] + comp['sources']: source.pop('url', None); source.pop('id', None)
    def measure_editions(record):
        editions = record.get('editions')
        if not editions or any(lang not in ('fr', 'en') for lang in editions):
            raise ValueError('Explicit French/English editions required')
        for lang, edition in editions.items():
            relative = edition['path'].removeprefix('./')
            path = DIST / relative
            if not relative.startswith('resources/') or '..' in relative.split('/') or not path.is_file():
                raise FileNotFoundError('Missing or invalid edition: '+relative)
            edition.update(bytes=path.stat().st_size, sha256=hashlib.sha256(path.read_bytes()).hexdigest())
            if path.suffix.lower() == '.pdf': edition['pages'] = _pdf_pages(path, pages)
            if edition.get('htmlPath') and not (DIST / edition['htmlPath'].removeprefix('./')).is_file():
                raise FileNotFoundError('Missing web edition: '+edition['htmlPath'])
        return editions

    for r in cat['resources']:
        editions = measure_editions(r)
        r['languages'] = list(editions)
        r['language'] = 'bilingual' if len(editions) > 1 else next(iter(editions))
        # Compatibility fields for saved external consumers; the UI uses explicit editions.
        r['url'] = [editions.get(lang, {}).get('path') for lang in ('fr', 'en')]
        for lang, prefix in (('fr', ''), ('en', 'english')):
            edition = editions.get(lang)
            if not edition: continue
            for key in ('pages', 'bytes'):
                if key in edition: r[prefix + key.capitalize() if prefix else key] = edition[key]
        if r['format'] == 'PDF':
            r['translation'] = 'tex-source' if (r['chapter'] in converted or r.get('texBuilt')) else 'authored-bilingual'
    for course in cat['courses']:
        course['languages'] = sorted({lang for r in cat['resources'] if r['course'] == course['id'] for lang in r['editions']})
        course['language'] = 'bilingual' if len(course['languages']) > 1 else next(iter(course['languages']), None)
    provenance = []
    for ch in comp['chapters'] + comp['supplements']:
        for f in ch['files']:
            editions = measure_editions(f)
            for lang, edition in editions.items():
                edition['start'] = edition.get('start', f['start'])
                edition['end'] = edition['start'] + edition['pages'] - 1
            first = editions.get('fr') or editions.get('en')
            f.update(path=first['path'], pages=first['pages'], bytes=first['bytes'], end=first['end'])
            if 'en' in editions:
                f.update(englishPath=editions['en']['path'], englishPages=editions['en']['pages'], englishBytes=editions['en']['bytes'])
            legacy={'path':first['path'],'pages':[first['start'],first['end']],'sha256':first['sha256']}
            if 'en' in editions: legacy.update(englishPath=editions['en']['path'],englishSha256=editions['en']['sha256'])
            provenance.append({'source': f['source'], 'editions': copy.deepcopy(editions), **legacy})
    return {CATALOG: _dump(cat), COMPANION: COMPANION_HEADER + json.dumps(comp, ensure_ascii=False, indent=2) + ';\n',
            PROVENANCE: _dump(provenance)}


def write(check=False):
    stale = []
    for path, text in generate().items():
        if path.exists() and path.read_text() == text: continue
        stale.append(path.relative_to(ROOT))
        if not check: path.write_text(text)
    return stale
