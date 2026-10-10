"""Build the Terminale STMG resource PDFs from content/latex/stmg (French and English twins).

pdfLaTeX without shell escape compiles livret-eleve / livret-prof and their -en twins. Level-1
bookmarks give the eight chapters, the tests and the formula sheet; the first 'Séance'/'Session'
bookmark of a chapter starts its activities excerpt. Run scripts/style-resource-pdfs.py and
scripts/finalize-resources.py afterwards.
"""
import json, re, subprocess, sys
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'content/latex/stmg'
BUILD = ROOT / 'build/tex/stmg'
OUT = ROOT / 'dist/resources'


def compile_pdf(entry):
    BUILD.mkdir(parents=True, exist_ok=True)
    job = entry[:-4]
    cmd = ['pdflatex', '-no-shell-escape', '-interaction=nonstopmode', '-halt-on-error', '-output-directory=' + str(BUILD), entry]
    for _ in range(4):
        r = subprocess.run(cmd, cwd=SRC, capture_output=True, text=True, errors='replace')
        log = (BUILD / (job + '.log')).read_text(errors='replace')
        if r.returncode: sys.exit(f'LaTeX failed for {entry}; see {BUILD / (job + ".log")}')
        if 'Rerun to get' not in log and 'Label(s) may have changed' not in log: break
    und = re.findall(r'LaTeX Warning: Reference .*undefined', log)
    d = fitz.open(BUILD / (job + '.pdf'))
    print(f'  {job}: {len(d)} pages, {len(und)} undefined references, {len(re.findall(r"Overfull .hbox", log))} overfull boxes')
    if und: sys.exit('Undefined references in ' + entry)
    return d


def save(d, a, b, target, title):
    out = fitz.open(); out.insert_pdf(d, from_page=a, to_page=b - 1)
    out.set_metadata({'title': title, 'author': 'Maths Explorer'}); out.subset_fonts()
    target.parent.mkdir(parents=True, exist_ok=True); out.save(target, garbage=4, deflate=True)
    n = len(out); out.close(); return n


def main():
    catalog = json.loads((OUT / 'catalog.json').read_text())
    chapters = {c['number']: c for c in catalog['chapters'] if c['course'] == 'stmg'}
    res = {r['id']: r for r in catalog['resources'] if r['course'] == 'stmg'}
    counts = {}
    for lang, suf in (('fr', ''), ('en', '-en')):
        L = 0 if lang == 'fr' else 1
        for kind, entry, role in (('student', 'livret-eleve', 'eleve'), ('teacher', 'livret-prof', 'prof')):
            d = compile_pdf(entry + suf + '.tex')
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
    bad = sorted(str(k[1:]) for k in counts if k[0] == 'fr' and counts[k] != counts[('en',) + k[1:]])
    if bad: sys.exit('Page-count mismatch: ' + ', '.join(bad))
    done = ROOT / 'docs/TEX_CONVERSION.json'
    led = json.loads(done.read_text()); led['converted'] = sorted(set(led['converted']) | {c['id'] for c in chapters.values()} | {'stmg-revision'})
    done.write_text(json.dumps(led, indent=2) + '\n')
    print('FR/EN page counts match for all STMG resources')


main()
