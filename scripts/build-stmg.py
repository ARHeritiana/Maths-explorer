"""Build the Terminale STMG resource PDFs from content/tex/courses/stmg (French and English twins).

pdfLaTeX without shell escape compiles livret-eleve / livret-prof and their -en twins. Level-1
bookmarks give the eight chapters, the tests and the formula sheet; the first 'Séance'/'Session'
bookmark of a chapter starts its activities excerpt. The shared TeX class supplies the native frame;
run scripts/finalize-resources.py afterwards.
"""
import re, sys
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild import books, catalog as manifest_io, tex, pdf   # content/data/manifest.json is the source of truth
SRC = ROOT / 'content/tex/courses/stmg'
BUILD = ROOT / 'build/out/tex/stmg'
OUT = ROOT / 'dist/resources'


MAINS = books.write_mains('stmg', BUILD / 'mains', str(ROOT / 'content/tex/core'))
ENTRY = {'livret-eleve': 'eleve', 'livret-prof': 'professeur', 'livret-eleve-en': 'eleve-en', 'livret-prof-en': 'professeur-en'}


_DONE = {}


def compile_pdf(entry):
    """French and English of an edition are compiled together and balanced block by block (mxbuild.tex.compile_pair)."""
    job = entry[:-4]
    if job not in _DONE:
        base = job.removesuffix('-en')
        pair = tex.compile_pair(SRC, {'fr': str(MAINS[ENTRY[base]]), 'en': str(MAINS[ENTRY[base + '-en']])},
                                {'fr': base, 'en': base + '-en'}, BUILD, max_runs=4)
        for r in (pair['fr'], pair['en']): _DONE[r.pdf.stem] = r.report(r.pdf.stem)
    return fitz.open(_DONE[job].pdf)


def save(d, a, b, target, title):
    out = pdf.excerpt(d, a, b, 'en' if target.stem.endswith('-en') else 'fr')
    out.set_metadata({'title': title, 'author': 'Maths Explorer'}); out.subset_fonts()
    target.parent.mkdir(parents=True, exist_ok=True); out.save(target, garbage=4, deflate=True)
    n = len(out); out.close(); return n


def main():
    manifest = manifest_io.load(); catalog = manifest['catalog']
    chapters = {c['number']: c for c in catalog['chapters'] if c['course'] == 'stmg'}
    res = {r['id']: r for r in catalog['resources'] if r['course'] == 'stmg'}
    counts = {}; book = {}
    for lang, suf in (('fr', ''), ('en', '-en')):
        L = 0 if lang == 'fr' else 1
        for kind, entry, role in (('student', 'livret-eleve', 'eleve'), ('teacher', 'livret-prof', 'prof')):
            d = compile_pdf(entry + suf + '.tex'); book[(lang, kind)] = len(d)
            if lang == 'en' and book[('fr', kind)] != len(d): sys.exit(f'{entry}: {book[("fr", kind)]} French pages, {len(d)} English')
            toc = d.get_toc()
            top = [(t, p - 1) for l, t, p in toc if l == 1]
            if len(top) != 13: sys.exit(f'{entry}{suf}: expected 13 level-1 bookmarks, found {len(top)}')
            bounds = [p for _, p in top] + [len(d)]
            for k in range(1, 9):
                ch = chapters[k]; a, b = bounds[k], bounds[k + 1]
                if kind == 'student':
                    sess = [p - 1 for l, t, p in toc if l == 2 and re.match(r'^(S[ée]ance|Session) \d+', t.strip()) and a <= p - 1 < b]
                    counts[(lang, ch['id'], 'activities')] = save(d, sess[0], b, OUT / ch['id'] / f'activities{suf}.pdf', f"{ch['title'][L]} — {res[ch['id'] + '-activities']['title'][L]}")
                    name = 'chapter'
                else: name = 'teacher'
                counts[(lang, ch['id'], name + ('' if kind == 'student' else ''))] = save(d, a, b, OUT / ch['id'] / f'{name}{suf}.pdf', f"{ch['title'][L]} — {res[ch['id'] + '-' + name]['title'][L]}")
            ta, tb, fa, fb = bounds[9], bounds[10], bounds[10], bounds[11]
            if kind == 'student':
                counts[(lang, 'bank-0')] = save(d, ta, tb, OUT / 'stmg-revision' / f'bank-0{suf}.pdf', res['stmg-revision-bank-0']['title'][L])
                counts[(lang, 'bank-1')] = save(d, fa, fb, OUT / 'stmg-revision' / f'bank-1{suf}.pdf', res['stmg-revision-bank-1']['title'][L])
            counts[(lang, 'assess', role)] = save(d, ta, tb, OUT / f'stmg-assessments-{role}{suf}.pdf', 'Maths Explorer — ' + ('Devoirs surveillés' if lang == 'fr' else 'Supervised tests'))
            counts[(lang, 'formulas', role)] = save(d, fa, fb, OUT / f'stmg-formulas-{role}{suf}.pdf', 'Maths Explorer — ' + ('Formulaire raisonné' if lang == 'fr' else 'Annotated formula sheet'))
    # Books and excerpts have equal page counts in both languages (every session is a balanced block).
    drift = sorted(k[1:] for k in counts if k[0] == 'fr' and counts[k] != counts[('en',) + k[1:]])
    if drift: sys.exit('French and English excerpts differ: ' + ', '.join(map(str, drift)))
    manifest['texConverted'] = sorted(set(manifest['texConverted']) | {c['id'] for c in chapters.values()} | {'stmg-revision'})
    manifest_io.save(manifest)
    print('FR/EN books and excerpts have equal page counts')


main()
