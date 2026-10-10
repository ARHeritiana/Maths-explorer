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
CORRECTIONS = {'premiere': {'fr': r'^Corrigés et conduite du chapitre', 'en': r'^Solutions and teaching notes for chapter'}}
FIRST_CHAPTER_ENTRY = {'premiere': 2}   # level-1 bookmarks before chapter 1 (booklet notes, framework)
# Appendices after the chapters: (supplement id, level-1 bookmark index, bank resource id suffix)
APPENDICES = {'premiere': [('methods', 12, 'bank-0'), ('fluency', 13, 'bank-1'), ('assessments', 14, 'bank-2')]}


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
    results = {}
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
        for number in wanted:
            ch = chapters[number]
            j = wanted.index(number) if reduced else FIRST_CHAPTER_ENTRY[course] + number - 1
            s0, s1, t0, t1 = st[j], st[j + 1], tt[j], tt[j + 1]
            offs = offt = 0
            if reduced:   # page labels follow the full booklet
                offs = next(r['sourcePages'][0] for r in catalog['resources'] if r['id'] == ch['id'] + '-chapter') - 1 - s0
                offt = next(r['sourcePages'][0] for r in catalog['resources'] if r['id'] == ch['id'] + '-teacher') - 1 - t0
            res = {r['id'].split('-', 2)[2]: r for r in catalog['resources'] if r['chapter'] == ch['id']}
            def title(name): return (ch['title'][0] + ' — ' + res[name]['title'][0]) if lang == 'fr' else (ch['title'][1] + ' — ' + res[name]['title'][1])
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
            c = find(td, t0, t1, CORRECTIONS[course][lang])
            if c: pages['corrections'] = emit(path('corrections'), ch, 'solutions', title('corrections'), lang, td, c[0], t1, bounds=(c, (t1, 0)), offset=offt)
            results[(lang, number)] = pages
        if a.appendices and not reduced:
            for name, idx, bank in APPENDICES[course]:
                bk = next(r for r in catalog['resources'] if r['id'] == f'{course}-revision-{bank}')
                ttl = bk['title'][1 if lang == 'en' else 0]
                pre = 'Cross-chapter resources' if lang == 'en' else 'Ressources transversales'
                emit(OUT / f'{course}-{name}-eleve{suffix}.pdf', {'id': course + '-' + name}, 'booklet', f'{ttl} · ' + ('student' if lang == 'en' else 'élève'), lang, sd, st[idx], st[idx + 1])
                emit(OUT / f'{course}-{name}-prof{suffix}.pdf', {'id': course + '-' + name}, 'solutions', f'{ttl} · ' + ('teacher' if lang == 'en' else 'professeur'), lang, td, tt[idx], tt[idx + 1])
                emit(OUT / f'{course}-revision' / f'{bank}{suffix}.pdf', {'id': course + '-revision'}, 'booklet', f'{pre}: {ttl}', lang, sd, st[idx], st[idx + 1])
    if {'fr', 'en'} <= set(a.lang):   # record chapters built from TeX in both languages
        ledger = ROOT / 'docs/TEX_CONVERSION.json'
        done = set(json.loads(ledger.read_text())['converted']) if ledger.exists() else set()
        done |= {chapters[n]['id'] for n in a.chapters}
        ledger.write_text(json.dumps({'note': 'Chapters whose French and English PDFs are compiled from content/latex.', 'converted': sorted(done)}, indent=2) + '\n')
    for (lang, number), pages in results.items():
        print(lang, number, pages)
    for number in wanted:
        if {'fr', 'en'} <= set(a.lang) and results[('fr', number)] != results[('en', number)]:
            sys.exit(f'Page-count mismatch between editions for chapter {number}')


main()
