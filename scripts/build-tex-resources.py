"""Build the course resource PDFs from the owner-supplied LaTeX sources.

Usage:
  python3 scripts/build-tex-resources.py premiere --chapters 5            # pilot chapter, both languages
  python3 scripts/build-tex-resources.py premiere --chapters 5 --lang fr   # French only

Sources live in content/latex/<course>/. French entries are eleve.tex and
professeur.tex; English twins are eleve-en.tex and professeur-en.tex (babel
english, translated prose, untouched mathematics and figures). While a course is
being converted chapter by chapter, --pilot-entry names a reduced twin entry
(pilot-05.tex / pilot-05-en.tex) that contains only the converted chapters.

pdfLaTeX runs without shell escape. Build products and logs go to build/tex,
never to dist. Each compiled book is split like the previous imports: complete
chapter, teacher chapter, and excerpts (activities, notes, exercises,
assessment, corrections). Run scripts/style-resource-pdfs.py afterwards, then
scripts/finalize-resources.py.
"""
import argparse, json, re, subprocess, sys
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'content/latex'
BUILD = ROOT / 'build/tex'
OUT = ROOT / 'dist/resources'

# Excerpt markers: first line of each excerpt, per language. Order matters.
MARKERS = {
    'premiere': {
        'fr': [('activities', r'^Diagnostic :'), ('notes', r'^\d+\.1 '), ('exercises', r'^Parcours d.exercices$'), ('assessment', r'^QCM 1 :')],
        'en': [('activities', r'^Diagnostic:'), ('notes', r'^\d+\.1 '), ('exercises', r'^Exercise path$'), ('assessment', r'^MCQ 1:')],
    }}
MARKERS['terminale'] = {
    'fr': [('notes', r'^Notes de cours$'), ('activities', r'^Activité de recherche$'), ('exercises', r'^Exercices progressifs$'), ('problems', r'^Devoir à la maison$')],
    'en': [('notes', r'^Course notes$'), ('activities', r'^Research activity$'), ('exercises', r'^Progressive exercises$'), ('problems', r'^Homework$')],
}
MARKERS['seconde'] = {'fr': [], 'en': []}
CORRECTIONS = {'seconde': {'fr': None, 'en': None}, 'premiere': {'fr': r'^Corrigés et conduite du chapitre', 'en': r'^Solutions and teaching notes for chapter'},
               'terminale': {'fr': r'^Conduite et corrigés', 'en': r'^Teaching notes and solutions'}}
SEQUENCE = {'fr': r'^S[ée]quence \d+ : ', 'en': r'^Sequence \d+ ?: '}   # seconde: one level-1 bookmark per sequence
# Level-1 bookmarks before chapter 1 in the (student, teacher) books: booklet notes, framework (terminale teacher: + preparation guide)
FIRST_CHAPTER_ENTRY = {'premiere': (2, 2), 'terminale': (3, 4)}
# Appendices after the chapters: (supplement id, student bookmark range, teacher bookmark range, bank resource id suffix or None).
# Ranges are [first, end) indices into the level-1 bookmarks; the end may be several bookmarks on (assessments).
APPENDICES = {'premiere': [('methods', (12, 13), (12, 13), 'bank-0'), ('fluency', (13, 14), (13, 14), 'bank-1'), ('assessments', (14, 15), (14, 15), 'bank-2')],
              'terminale': [('algorithms', (17, 18), (18, 19), None), ('proofs', (18, 19), (19, 20), None), ('oral', (19, 20), (20, 21), None),
                            ('assessments', (20, 39), (21, 58), 'bank-2')]}
# Terminale only: resources that do not exist yet in the catalogue (id suffix -> titles) and the title of those that do.
TERMINALE_TITLES = {
    'activities': (['Activité de recherche', 'Research activity'], 'student'),
    'notes': (['Notes de cours', 'Course notes'], 'student'),
    'exercises': (['Exercices progressifs', 'Progressive exercises'], 'student'),
    'problems': (['Devoir à la maison', 'Homework'], 'student'),
    'corrections': (['Conduite et corrigés', 'Teaching notes and solutions'], 'teacher'),
}
KIND_ORDER = ['chapter', 'teacher', 'activities', 'notes', 'practice', 'exercises', 'problems', 'assessment', 'corrections']


def tidy(s): return re.sub(r'\s+', ' ', s).strip()


def compile_pdf(course, entry, jobname, prof, defs=''):
    """Two or three pdfLaTeX passes in the source directory; returns the PDF path."""
    out = BUILD / course; out.mkdir(parents=True, exist_ok=True)
    cmd = ['pdflatex', '-no-shell-escape', '-interaction=nonstopmode', '-halt-on-error', '-jobname=' + jobname, '-output-directory=' + str(out),
           ((r'\def\versionprof{1}' if prof else '') + defs + r'\input{%s}' % entry) if (prof or defs) else entry]
    for n in range(3):
        r = subprocess.run(cmd, cwd=SRC / course, capture_output=True, text=True, errors='replace')
        log = (out / (jobname + '.log')).read_text(errors='replace') if (out / (jobname + '.log')).exists() else r.stdout
        if r.returncode:
            sys.exit(f'LaTeX failed for {entry} ({jobname}); see {out / (jobname + ".log")}')
        if 'Rerun to get' not in log and 'Label(s) may have changed' not in log: break
    bad = re.findall(r'(?m)^(?:LaTeX Warning: (?:Reference|Citation) .*undefined.*)$', log)
    over = len(re.findall(r'Overfull \\[hv]box', log))
    print(f'  {jobname}: {len(fitz.open(out / (jobname + ".pdf")))} pages, {len(bad)} undefined references, {over} overfull boxes')
    if bad: sys.exit('Undefined references:\n' + '\n'.join(bad))
    return out / (jobname + '.pdf')


def chapter_ranges(course, sd, td, lang, count):
    """[(s0, s1, t0, t1)] for chapters 1..count, in zero-based page indices."""
    def starts(d, pred):
        toc = [(tidy(t), p - 1) for l, t, p in d.get_toc() if l == 1]
        return toc
    out = []
    if course == 'seconde':
        for d_i, d in enumerate((sd, td)):
            toc = [(tidy(t), p - 1) for l, t, p in d.get_toc() if l == 1]
            seq = [p for t, p in toc if re.match(SEQUENCE[lang], t)]
            annex = [p for t, p in toc if re.match(r'^(Annexes professeur|Teacher annexes)', t)]
            ends = seq[1:] + [annex[0] if annex else len(d)]
            out.append(list(zip(seq, ends)))
        return [(a[0], a[1], b[0], b[1]) for a, b in zip(*out)][:count]
    st = [p - 1 for l, t, p in sd.get_toc() if l == 1] + [len(sd)]; tt = [p - 1 for l, t, p in td.get_toc() if l == 1] + [len(td)]
    fs, ft = FIRST_CHAPTER_ENTRY[course]
    return [(st[fs + k], st[fs + k + 1], tt[ft + k], tt[ft + k + 1]) for k in range(count)]


def find(doc, start, end, pattern):
    for i in range(start, end):
        for block in doc[i].get_text('dict')['blocks']:
            for line in block.get('lines', []):
                if re.search(pattern, tidy(''.join(s['text'] for s in line['spans']))):
                    return (i, max(0, line['bbox'][1] - 4))
    return None


def emit(target, chapter, kind, title, lang, doc, start, end, bounds=None, offset=0):
    """Write pages [start,end) of doc, or the clipped region bounds=((page,y),(page,y))."""
    out = fitz.open()
    if bounds:
        a, b = bounds
        for i in range(a[0], b[0] + 1):
            if i >= len(doc): continue
            page = doc[i]; r = page.rect
            y0 = max(43, a[1]) if i == a[0] else 43
            y1 = min(b[1], r.height - 55) if i == b[0] else r.height - 55
            if y1 - y0 < 12: continue
            clip = fitz.Rect(30, y0, r.width - 30, y1)
            if not page.get_text(clip=clip).strip(): continue
            n = out.new_page(width=r.width, height=r.height)
            dest = fitz.Rect(30, 55, r.width - 30, 55 + clip.height)
            if dest.y1 > r.height - 30: dest.y1 = r.height - 30
            n.show_pdf_page(dest, doc, i, clip=clip)
            n.insert_text((30, 23), 'Maths Explorer | ' + kind + ' | ' + chapter['id'], fontsize=9, color=(.1, .25, .3))
            n.insert_text((30, r.height - 15), ('Page du livret ' if lang == 'fr' else 'Booklet page ') + str(offset + i + 1), fontsize=8)
        if not len(out): sys.exit('Empty excerpt ' + str(target))
    else:
        out.insert_pdf(doc, from_page=start, to_page=end - 1)
        toc = [[1, t, p - start] for l, t, p in doc.get_toc() if start < p <= end]
        if toc: out.set_toc(toc)
    out.set_metadata({'title': title, 'author': 'Maths Explorer'})
    out.subset_fonts(); target.parent.mkdir(parents=True, exist_ok=True)
    out.save(target, garbage=4, deflate=True)
    n = len(out); out.close()
    if any(not p.get_text().strip() for p in fitz.open(target)): sys.exit('Empty page in ' + str(target))
    return n


COMPANION = ROOT / 'dist/js/resources-data.js'


def read_companion(): return json.loads(COMPANION.read_text().split('=', 1)[1].rstrip().rstrip(';'))


def supplement_title(course, name):
    return next(x for x in read_companion()['supplements'] if x['id'] == f'{course}-{name}')['title']


def prepare_terminale(catalog, chapters):
    """Make sure every excerpt kind built from the TeX books has a catalogue entry (titles are read when naming the PDFs)."""
    for ch in chapters:
        have = {r['id'] for r in catalog['resources']}
        for kind, (titles, aud) in TERMINALE_TITLES.items():
            rid = f"{ch['id']}-{kind}"
            if rid not in have:
                catalog['resources'].append({'id': rid, 'chapter': ch['id'], 'course': 'terminale', 'type': 'solutions' if kind == 'corrections' else kind,
                                             'title': titles, 'language': 'bilingual', 'audience': aud, 'format': 'PDF',
                                             'url': [f"./resources/{ch['id']}/{kind}.pdf", f"./resources/{ch['id']}/{kind}-en.pdf"],
                                             'pages': 1, 'bytes': 0, 'source': 'terminale-' + aud, 'sourcePages': [1, 1], 'review': 'source-unverified'})
            else:
                next(r for r in catalog['resources'] if r['id'] == rid)['title'] = titles


def register_terminale(catalog, chapters, placed, appendices):
    """Point the library catalogue and the companion data at the files just built. finalize-resources.py then fixes sizes and counts."""
    for number, rec in placed.items():
        if not isinstance(number, int): continue
        ch = chapters[number]
        for kind, (book, a0, a1) in rec.items():
            r = next(x for x in catalog['resources'] if x['id'] == f"{ch['id']}-{kind}")
            r['source'] = 'terminale-' + book; r['sourcePages'] = [a0, max(a0, a1)]; r.pop('sourceBounds', None)
            r['review'] = 'source-unverified'
    # Legacy overlay files (practice, assessment) stay; entries are only reordered within Terminale, in place.
    res = catalog['resources']; idx = [i for i, r in enumerate(res) if r['course'] == 'terminale']
    def order(r):
        k = r['id'].split('-', 2)[2] if r['id'].count('-') >= 2 else ''
        return (r['chapter'], KIND_ORDER.index(k) if k in KIND_ORDER else 99)
    first = idx[0]; mine = sorted((res[i] for i in idx), key=order)
    catalog['resources'] = [r for r in res if r['course'] != 'terminale']
    catalog['resources'][first:first] = mine
    for r in catalog['resources']:   # the year's assessments come from the TeX books; the other banks stay legacy overlay files
        if r['id'] == 'terminale-revision-bank-2':
            r['texBuilt'] = True
            if 'assessments' in placed: r['sourcePages'] = list(placed['assessments']['student']); r['source'] = 'terminale-student'; r['review'] = 'source-unverified'
    (OUT / 'catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    comp = read_companion()
    for number, rec in placed.items():
        if not isinstance(number, int):
            sup = next(x for x in comp['supplements'] if x['id'] == f'terminale-{number}')
            for f in sup['files']:
                book, key = ('terminale-eleve.pdf', 'student') if f['kind'] == 'chapter' else ('terminale-prof.pdf', 'teacher')
                f['source'] = book; f['start'], f['end'] = rec[key]
            continue
        ch = chapters[number]
        c = next(x for x in comp['chapters'] if x['id'] == ch['id'])
        sc = rec['chapter'][1]
        sections = {'lesson': 1}
        if 'exercises' in rec: sections['practice'] = rec['exercises'][1] - sc + 1
        if 'problems' in rec: sections['problem'] = rec['problems'][1] - sc + 1
        c['files'] = [
            {'kind': 'chapter', 'source': 'terminale-eleve.pdf', 'start': sc, 'end': rec['chapter'][2], 'path': f"resources/{ch['id']}/chapter.pdf", 'pages': 0, 'bytes': 0, 'sections': sections,
             'englishPath': f"resources/{ch['id']}/chapter-en.pdf", 'englishBytes': 0},
            {'kind': 'teacher', 'source': 'terminale-prof.pdf', 'start': rec['teacher'][1], 'end': rec['teacher'][2], 'path': f"resources/{ch['id']}/teacher.pdf", 'pages': 0, 'bytes': 0,
             'englishPath': f"resources/{ch['id']}/teacher-en.pdf", 'englishBytes': 0}]
    COMPANION.write_text('export const resourceCatalog = ' + json.dumps(comp, ensure_ascii=False, indent=2) + ';\n')


# Teacher-only documents that close the Première teacher book: (resource id suffix, titles, bookmark title start per language)
STANDALONE = [('matrix', ['Matrice de couverture du programme · professeur', 'Curriculum coverage matrix · teacher'], (r'^Matrice de couverture', r'^Curriculum coverage matrix')),
              ('schedule', ['Conduite annuelle et créneaux · professeur', 'Annual schedule and time slots · teacher'], (r'^Conduite annuelle', r'^Annual schedule'))]


def standalone_teacher(catalog, lang):
    """Cut the coverage matrix and the annual schedule out of the compiled teacher book and register them in the revision chapter."""
    suffix = '-en' if lang == 'en' else ''; L = 1 if lang == 'en' else 0
    td = fitz.open(BUILD / 'premiere' / f'premiere-teacher{suffix}.pdf')
    top = [(tidy(t), p - 1) for l, t, p in td.get_toc() if l == 1] + [('', len(td))]
    for k, (name, titles, pats) in enumerate(STANDALONE):
        i = next(i for i, (t, p) in enumerate(top) if re.match(pats[L], t))
        n = emit(OUT / 'premiere-revision' / f'{name}{suffix}.pdf', {'id': 'premiere-revision'}, 'solutions', titles[L], lang, td, top[i][1], top[i + 1][1])
        rid = f'premiere-revision-{name}'
        if lang == 'fr':
            r = next((x for x in catalog['resources'] if x['id'] == rid), None)
            if r is None:
                r = {'id': rid, 'chapter': 'premiere-revision', 'course': 'premiere', 'type': 'solutions', 'language': 'bilingual', 'audience': 'teacher', 'format': 'PDF',
                     'url': [f'./resources/premiere-revision/{name}.pdf', f'./resources/premiere-revision/{name}-en.pdf'], 'pages': n, 'bytes': 0,
                     'source': 'premiere-teacher', 'review': 'source-unverified'}
                catalog['resources'].append(r)
            r['title'] = titles; r['sourcePages'] = [top[i][1] + 1, top[i + 1][1]]
            comp = read_companion()   # teacher-only supplement for the resource library page
            sup = next((x for x in comp['supplements'] if x['id'] == f'premiere-{name}'), None)
            if sup is None:
                sup = {'id': f'premiere-{name}', 'course': 'premiere', 'kind': 'planning', 'title': titles, 'files': []}; comp['supplements'].append(sup)
            sup['title'] = titles
            sup['files'] = [{'kind': 'teacher', 'source': 'premiere-prof.pdf', 'start': top[i][1] + 1, 'end': top[i + 1][1], 'path': f'resources/premiere-revision/{name}.pdf',
                             'pages': n, 'bytes': 0, 'englishPath': f'resources/premiere-revision/{name}-en.pdf', 'englishBytes': 0}]
            COMPANION.write_text('export const resourceCatalog = ' + json.dumps(comp, ensure_ascii=False, indent=2) + ';\n')
    if lang == 'fr': (OUT / 'catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('course'); ap.add_argument('--chapters', type=int, nargs='+', required=True)
    ap.add_argument('--lang', nargs='+', default=['fr', 'en'])
    ap.add_argument('--appendices', action='store_true', help='also rebuild the appendix booklets (full books only)')
    ap.add_argument('--pilot-entry', default=None, help='reduced entry stem for the English twin, e.g. pilot')
    a = ap.parse_args()
    course = a.course
    catalog = json.loads((OUT / 'catalog.json').read_text())
    chapters = {c['number']: c for c in catalog['chapters'] if c['course'] == course}
    if course == 'terminale': prepare_terminale(catalog, [chapters[n] for n in a.chapters])
    results = {}; placed = {}
    wanted = sorted(a.chapters)
    for lang in a.lang:
        suffix = '-en' if lang == 'en' else ''
        reduced = a.pilot_entry if (lang == 'en' and a.pilot_entry) else None
        stem_s = stem_t = (reduced + suffix) if reduced else None
        if not reduced: stem_s, stem_t = 'eleve' + suffix, 'professeur' + suffix
        defs = (r'\def\pilotlist{%s}' % ','.join('%02d' % n for n in wanted)) if reduced else ''
        print(f'[{course} {lang}]')
        sd = fitz.open(compile_pdf(course, stem_s + '.tex', f'{course}-student{suffix}', False, defs))
        td = fitz.open(compile_pdf(course, stem_t + '.tex', f'{course}-teacher{suffix}', True, defs))
        st = [p - 1 for l, t, p in sd.get_toc() if l == 1] + [len(sd)]; tt = [p - 1 for l, t, p in td.get_toc() if l == 1] + [len(td)]
        rng = None if reduced else chapter_ranges(course, sd, td, lang, max(wanted))
        for number in wanted:
            ch = chapters[number]
            j = wanted.index(number) if reduced else number - 1
            s0, s1, t0, t1 = (st[j], st[j + 1], tt[j], tt[j + 1]) if reduced else rng[j]
            offs = offt = 0
            if reduced:   # page labels follow the full booklet
                offs = next(r['sourcePages'][0] for r in catalog['resources'] if r['id'] == ch['id'] + '-chapter') - 1 - s0
                offt = next(r['sourcePages'][0] for r in catalog['resources'] if r['id'] == ch['id'] + '-teacher') - 1 - t0
            res = {r['id'].split('-', 2)[2]: r for r in catalog['resources'] if r['chapter'] == ch['id']}
            def title(name): return ch['title'][0 if lang == 'fr' else 1] + ' — ' + res[name]['title'][0 if lang == 'fr' else 1]
            d = OUT / ch['id']
            def path(name): return d / (name + suffix + '.pdf')
            pages = {}
            pages['chapter'] = emit(path('chapter'), ch, 'booklet', title('chapter'), lang, sd, s0, s1, offset=offs)
            pages['teacher'] = emit(path('teacher'), ch, 'solutions', title('teacher'), lang, td, t0, t1, offset=offt)
            pts = [(k, find(sd, s0, s1, pat)) for k, pat in MARKERS[course][lang]]
            pts = [(k, p) for k, p in pts if p]
            for k, (kind, p) in enumerate(pts):
                b = pts[k + 1][1] if k + 1 < len(pts) else (s1, 0)
                pages[kind] = emit(path(kind), ch, kind, title(kind), lang, sd, p[0], min(s1, b[0] + 1), bounds=(p, b), offset=offs)
            c = find(td, t0, t1, CORRECTIONS[course][lang]) if CORRECTIONS[course][lang] else None
            if c: pages['corrections'] = emit(path('corrections'), ch, 'solutions', title('corrections'), lang, td, c[0], t1, bounds=(c, (t1, 0)), offset=offt)
            results[(lang, number)] = pages
            if lang == a.lang[0]:   # page ranges in the compiled books (1-based, inclusive), used to register the catalogue
                rec = {'chapter': ('student', s0 + 1, s1), 'teacher': ('teacher', t0 + 1, t1)}
                for k, (kind, p) in enumerate(pts):
                    b = pts[k + 1][1] if k + 1 < len(pts) else (s1, 0)
                    rec[kind] = ('student', p[0] + 1, min(s1, b[0] + 1 if b[1] > 60 else b[0]))
                if c: rec['corrections'] = ('teacher', c[0] + 1, t1)
                placed[number] = rec
        if a.appendices and not reduced:
            for name, (s_a, s_b), (t_a, t_b), bank in APPENDICES[course]:
                if bank:
                    bk = next(r for r in catalog['resources'] if r['id'] == f'{course}-revision-{bank}')
                    ttl = bk['title'][1 if lang == 'en' else 0]
                else:
                    ttl = supplement_title(course, name)[1 if lang == 'en' else 0]
                pre = 'Cross-chapter resources' if lang == 'en' else 'Ressources transversales'
                emit(OUT / f'{course}-{name}-eleve{suffix}.pdf', {'id': course + '-' + name}, 'booklet', f'{ttl} · ' + ('student' if lang == 'en' else 'élève'), lang, sd, st[s_a], st[s_b])
                emit(OUT / f'{course}-{name}-prof{suffix}.pdf', {'id': course + '-' + name}, 'solutions', f'{ttl} · ' + ('teacher' if lang == 'en' else 'professeur'), lang, td, tt[t_a], tt[t_b])
                if bank: emit(OUT / f'{course}-revision' / f'{bank}{suffix}.pdf', {'id': course + '-revision'}, 'booklet', f'{pre}: {ttl}', lang, sd, st[s_a], st[s_b])
                if lang == a.lang[0]: placed[name] = {'student': (st[s_a] + 1, st[s_b]), 'teacher': (tt[t_a] + 1, tt[t_b])}
    if a.appendices and course == 'premiere':
        for lang in a.lang: standalone_teacher(catalog, lang)
    if {'fr', 'en'} <= set(a.lang):   # record chapters built from TeX in both languages
        ledger = ROOT / 'docs/TEX_CONVERSION.json'
        done = set(json.loads(ledger.read_text())['converted']) if ledger.exists() else set()
        done |= {chapters[n]['id'] for n in a.chapters}
        ledger.write_text(json.dumps({'note': 'Chapters whose French and English PDFs are compiled from content/latex.', 'converted': sorted(done)}, indent=2) + '\n')
    if course == 'terminale' and {'fr', 'en'} <= set(a.lang):
        register_terminale(catalog, chapters, placed, a.appendices)
    for (lang, number), pages in results.items():
        print(lang, number, pages)
    for number in wanted:
        if {'fr', 'en'} <= set(a.lang) and results[('fr', number)] != results[('en', number)]:
            f, e = results[('fr', number)], results[('en', number)]
            if (f['chapter'], f['teacher']) != (e['chapter'], e['teacher']): sys.exit(f'Page-count mismatch between editions for chapter {number}')
            # Excerpts are cut at section starts; a line that wraps differently can move a section break. finalize-resources.py records englishPages.
            print(f"note: chapter {number} excerpts differ in length: " + ', '.join(f'{k} {f[k]}/{e[k]}' for k in f if f[k] != e.get(k)))


main()
