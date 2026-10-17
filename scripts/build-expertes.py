"""Build the Maths expertes resource PDFs from content/tex/courses/expertes (French units and English twins).

The four mains are generated from the manifest (mxbuild.books); French and English editions are compiled together
and balanced block by block (mxbuild.tex.compile_pair). Level-1 bookmarks give the eleven chapters. Inside a chapter
every section after the fluency drill starts a page (\\mxnewpage), so the excerpts are whole pages found from the
section headings: goals and fluency, introductory activity, course notes, exercises, problem; the teacher excerpt
"corrections" runs from the exercises to the end of the chapter. The builder also writes the resource records, the
chapter companion layout and the two source-book records. Run scripts/finalize-resources.py afterwards.

Entry point: `make tex COURSE=expertes`. The pipeline skips the build when no input changed (cache), puts back every
rebuilt PDF that differs from the committed copy only in its random /ID, then finalises and republishes the sources.
Running this script directly rebuilds every excerpt and rewrites the source-book records (hash, date) even when nothing
changed, leaving a dirty tree; use it directly only while debugging the builder.
"""
import datetime, hashlib, re, sys
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild import books, catalog as manifest_io, tex, pdf   # content/data/manifest.json is the source of truth
COURSE = 'expertes'
SRC = ROOT / 'content/tex/courses' / COURSE
BUILD = ROOT / 'build/out/tex' / COURSE
OUT = ROOT / 'dist/resources'
CHAPTERS = 11
# Section headings as printed (13.2 pt), per language, in book order.
HEADINGS = {'fr': {'activities': 'Activité d’introduction', 'notes': 'Notes de cours', 'exercises': 'Exercices', 'problems': 'Problème'},
            'en': {'activities': 'Introductory activity', 'notes': 'Course notes', 'exercises': 'Exercises', 'problems': 'Problem'}}
# Resource id suffix -> (type, audience, titles). Order is the library order (KIND_ORDER of the other builders).
KINDS = {
    'chapter': ('booklet', 'student', ['Chapitre complet · élève', 'Complete chapter · student']),
    'teacher': ('solutions', 'teacher', ['Chapitre complet · professeur (cours et corrigés)', 'Complete chapter · teacher (notes and solutions)']),
    'fluency': ('fluency', 'student', ['Objectifs et automatismes', 'Goals and fluency']),
    'activities': ('activities', 'student', ['Activité d’introduction', 'Introductory activity']),
    'notes': ('notes', 'student', ['Notes de cours', 'Course notes']),
    'exercises': ('exercises', 'student', ['Exercices', 'Exercises']),
    'problems': ('problems', 'student', ['Problème', 'Problem']),
    'corrections': ('solutions', 'teacher', ['Exercices et problème corrigés', 'Exercises and problem with solutions']),
}
BOOKS = {'student': ('eleve', 'expertes-eleve.pdf'), 'teacher': ('professeur', 'expertes-prof.pdf')}

MAINS = books.write_mains(COURSE, BUILD / 'mains', str(ROOT / 'content/tex/core'))
_DONE = {}


def compile_pdf(entry):
    """entry: eleve, professeur, eleve-en or professeur-en; both languages of an edition are compiled together."""
    if entry not in _DONE:
        base = entry.removesuffix('-en')
        pair = tex.compile_pair(SRC, {'fr': str(MAINS[base]), 'en': str(MAINS[base + '-en'])},
                                {'fr': base, 'en': base + '-en'}, BUILD, max_runs=4)
        for r in (pair['fr'], pair['en']): _DONE[r.pdf.stem] = r.report(r.pdf.stem)
    return _DONE[entry].pdf


def headings(doc, a, b, lang):
    """{kind: page index} of the section headings printed in pages [a, b)."""
    wanted = {v: k for k, v in HEADINGS[lang].items()}; found = {}
    for i in range(a, b):
        for block in doc[i].get_text('dict')['blocks']:
            for line in block.get('lines', []):
                text = re.sub(r'\s+', ' ', ''.join(s['text'] for s in line['spans'])).strip()
                size = max(s['size'] for s in line['spans'])
                if text in wanted and 13 < size < 13.5 and wanted[text] not in found: found[wanted[text]] = i
    missing = [k for k in HEADINGS[lang] if k not in found]
    if missing: sys.exit(f'{lang} pages {a + 1}-{b}: section headings not found: {missing}')
    order = [found[k] for k in HEADINGS[lang]]
    if order != sorted(order) or len(set(order)) != len(order): sys.exit(f'{lang} pages {a + 1}-{b}: sections out of order')
    return found


def save(doc, a, b, target, title, lang):
    out = pdf.excerpt(doc, a, b, lang)
    out.set_metadata({'title': title, 'author': 'Maths Explorer'}); out.subset_fonts()
    target.parent.mkdir(parents=True, exist_ok=True); out.save(target, garbage=4, deflate=True)
    n = len(out); out.close()
    if any(not p.get_text().strip() for p in pymupdf.open(target)): sys.exit('Empty page in ' + str(target))
    return n


def chapter_starts(doc):
    top = [p - 1 for l, t, p in doc.get_toc() if l == 1]
    starts = top[-CHAPTERS:]   # front matter bookmarks come first (one in the student book, two in the teacher book)
    if len(top) < CHAPTERS + 1: sys.exit(f'Expected the front matter and {CHAPTERS} chapter bookmarks, found {len(top)}')
    return starts + [len(doc)]


def main():
    if 'MX_PIPELINE' not in __import__('os').environ:
        print('note: run `make tex COURSE=expertes`; a direct run rewrites every PDF and the source records (see the docstring)', file=sys.stderr)
    manifest = manifest_io.load(); catalog = manifest['catalog']
    chapters = {c['number']: c for c in catalog['chapters'] if c['course'] == COURSE and c['number'] > 0}
    if sorted(chapters) != list(range(1, CHAPTERS + 1)): sys.exit('The manifest must list the eleven Maths expertes chapters')
    placed = {}; counts = {}
    for lang, suf in (('fr', ''), ('en', '-en')):
        L = 0 if lang == 'fr' else 1
        sd = pymupdf.open(compile_pdf('eleve' + suf)); td = pymupdf.open(compile_pdf('professeur' + suf))
        ss, ts = chapter_starts(sd), chapter_starts(td)
        for n in range(1, CHAPTERS + 1):
            ch = chapters[n]; d = OUT / ch['id']
            def title(kind): return f"{ch['title'][L]} · {KINDS[kind][2][L]}"
            a, b, ta, tb = ss[n - 1], ss[n], ts[n - 1], ts[n]
            h, th = headings(sd, a, b, lang), headings(td, ta, tb, lang)
            parts = {'chapter': ('student', a, b), 'teacher': ('teacher', ta, tb), 'fluency': ('student', a, h['activities']),
                     'activities': ('student', h['activities'], h['notes']), 'notes': ('student', h['notes'], h['exercises']),
                     'exercises': ('student', h['exercises'], h['problems']), 'problems': ('student', h['problems'], b),
                     'corrections': ('teacher', th['exercises'], tb)}
            for kind, (book, x, y) in parts.items():
                counts[(lang, ch['id'], kind)] = save(sd if book == 'student' else td, x, y, d / f'{kind}{suf}.pdf', title(kind), lang)
            if lang == 'fr':
                placed[n] = {kind: (book, x + 1, y) for kind, (book, x, y) in parts.items()}
                placed[n]['sections'] = {'lesson': 1, 'practice': h['exercises'] - a + 1, 'problem': h['problems'] - a + 1}
    drift = sorted(f'{k[1]} {k[2]}' for k in counts if k[0] == 'fr' and counts[k] != counts[('en',) + k[1:]])
    if drift: sys.exit('French and English excerpts differ: ' + ', '.join(drift))
    register(manifest, chapters, placed)
    print('FR/EN books and excerpts have equal page counts')


def register(manifest, chapters, placed):
    """Resource records, companion layout and source-book records, in place of the previous expertes entries."""
    catalog, comp = manifest['catalog'], manifest['companion']
    now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    records = []
    for n, ch in sorted(chapters.items()):
        for kind, (rtype, audience, titles) in KINDS.items():
            book, a, b = placed[n][kind]
            records.append({'id': f"{ch['id']}-{kind}", 'chapter': ch['id'], 'course': COURSE, 'type': rtype, 'title': titles,
                            'audience': audience, 'format': 'PDF', 'url': f"./resources/{ch['id']}/{kind}.pdf",
                            'source': f'{COURSE}-{book}', 'sourcePages': [a, max(a, b)], 'review': 'source-unverified'})
    res = catalog['resources']
    at = next((i for i, r in enumerate(res) if r['course'] == COURSE), None)
    if at is None: at = max(i for i, r in enumerate(res) if r['course'] == 'terminale') + 1
    catalog['resources'] = [r for r in res[:at] if r['course'] != COURSE] + records + [r for r in res[at:] if r['course'] != COURSE]
    layout = []
    for n, ch in sorted(chapters.items()):
        p = placed[n]
        layout.append({'id': ch['id'], 'course': COURSE, 'number': n, 'title': ch['title'], 'topic': ch['topic'], 'files': [
            {'kind': 'chapter', 'source': BOOKS['student'][1], 'start': p['chapter'][1], 'path': f"resources/{ch['id']}/chapter.pdf", 'sections': p['sections']},
            {'kind': 'teacher', 'source': BOOKS['teacher'][1], 'start': p['teacher'][1], 'path': f"resources/{ch['id']}/teacher.pdf"}]})
    old = {c['id']: c for c in comp['chapters'] if c['course'] == COURSE}
    for c in layout:   # the companion topic picks the chapter page's guide; keep an authored choice
        if c['id'] in old: c['topic'] = old[c['id']].get('topic', c['topic'])
    at = next((i for i, c in enumerate(comp['chapters']) if c['course'] == COURSE), None)
    if at is None: at = max(i for i, c in enumerate(comp['chapters']) if c['course'] == 'terminale') + 1
    comp['chapters'] = [c for c in comp['chapters'][:at] if c['course'] != COURSE] + layout + [c for c in comp['chapters'][at:] if c['course'] != COURSE]
    for book, (entry, name) in BOOKS.items():
        path = _DONE[entry].pdf; data = path.read_bytes()
        rec = {'name': f'{COURSE}-{book}', 'title': name, 'modified': now, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
        i = next((i for i, s in enumerate(catalog['sources']) if s['name'] == rec['name']), None)
        if i is None: catalog['sources'].append(rec)
        else: catalog['sources'][i] = rec
        crec = {'name': name, 'title': name, 'modified': now}
        i = next((i for i, s in enumerate(comp['sources']) if s['name'] == name), None)
        if i is None: comp['sources'].append(crec)
        else: comp['sources'][i] = crec
    manifest['texConverted'] = sorted(set(manifest['texConverted']) | {c['id'] for c in chapters.values()})
    manifest_io.save(manifest)


main()
