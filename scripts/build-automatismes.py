"""Build the Seconde fluency sheets (starter routines) from content/tex/courses/automatismes.

pdfLaTeX without shell escape compiles the four mains generated from the manifest (mxbuild.books:
student/teacher, French/English; class mxbook, units *.fr.tex and generated *.en.tex);
each level-1 bookmark (one per sequence) becomes seconde-NN/fluency-student[-en].pdf and
fluency-teacher[-en].pdf, where NN = bookmark index + 1. Run scripts/style-resource-pdfs.py
and scripts/finalize-resources.py afterwards.
"""
import re, sys
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild import books, catalog as manifest_io, tex   # content/data/manifest.json is the source of truth
SRC = ROOT / 'content/tex/courses/automatismes'
BUILD = ROOT / 'build/out/tex/automatismes'
OUT = ROOT / 'dist/resources'


MAINS = books.write_mains('automatismes', BUILD / 'mains', str(ROOT / 'content/tex/core'))


def compile_pdf(entry):
    job = entry[:-4]
    return fitz.open(tex.compile(SRC, str(MAINS[job]), job, BUILD).report(job).pdf)


def main():
    catalog = manifest_io.load()['catalog']
    chapters = {c['number']: c for c in catalog['chapters'] if c['course'] == 'seconde'}
    counts = {}; book = {}
    for lang, suf in (('fr', ''), ('en', '-en')):
        for kind, entry in (('student', 'eleve'), ('teacher', 'professeur')):
            d = compile_pdf(entry + suf + '.tex'); book[(lang, kind)] = len(d)
            if lang == 'en' and book[('fr', kind)] != len(d): sys.exit(f'{entry}: {book[("fr", kind)]} French pages, {len(d)} English')
            toc = [(t, p - 1) for l, t, p in d.get_toc() if l == 1]
            guide = [i for i, (t, _) in enumerate(toc) if re.match(r'^(Guide d|Teacher guide|User guide)', t.strip())]
            n = (guide[0] if guide else len(toc))
            if n != 14: sys.exit(f'{entry}{suf}: expected 14 sequence bookmarks, found {n}')
            ends = [p for _, p in toc[1:n]] + [toc[guide[0]][1] if guide else len(d)]
            for k in range(14):
                ch = chapters[k + 2]
                res = next(r for r in catalog['resources'] if r['id'] == f"{ch['id']}-fluency-{kind}")
                title = res['title'][0 if lang == 'fr' else 1]
                out = fitz.open(); out.insert_pdf(d, from_page=toc[k][1], to_page=ends[k] - 1)
                out.set_metadata({'title': ch['title'][0 if lang == 'fr' else 1] + ' — ' + title, 'author': 'Maths Explorer'})
                out.subset_fonts()
                target = OUT / ch['id'] / f'fluency-{kind}{suf}.pdf'
                out.save(target, garbage=4, deflate=True)
                counts[(lang, kind, k)] = len(out)
    # Books must have equal page counts (checked in compile order below); an excerpt may drift by one page,
    # which the catalogue records as englishPages.
    drift = [(k + 2, kind) for k in range(14) for kind in ('student', 'teacher') if counts[('fr', kind, k)] != counts[('en', kind, k)]]
    bad = [d for d in drift if abs(counts[('fr', d[1], d[0] - 2)] - counts[('en', d[1], d[0] - 2)]) > 1]
    if bad: sys.exit('Page counts differ by more than one page for ' + ', '.join(f'chapter {n} ({k})' for n, k in bad))
    for n, k in drift: print(f'  note: chapter {n} {k} excerpt differs by one page between languages')
    print('FR/EN books have equal page counts; excerpts within one page')


main()
