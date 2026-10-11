"""Build the Seconde fluency sheets (starter routines) from content/tex/courses/automatismes.

pdfLaTeX without shell escape compiles the four entries (student/teacher, French/English);
each level-1 bookmark (one per sequence) becomes seconde-NN/fluency-student[-en].pdf and
fluency-teacher[-en].pdf, where NN = bookmark index + 1. Run scripts/style-resource-pdfs.py
and scripts/finalize-resources.py afterwards.
"""
import json, re, subprocess, sys
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'content/tex/courses/automatismes'
BUILD = ROOT / 'build/tex/automatismes'
OUT = ROOT / 'dist/resources'


def compile_pdf(entry):
    BUILD.mkdir(parents=True, exist_ok=True)
    job = entry[:-4]
    cmd = ['pdflatex', '-no-shell-escape', '-interaction=nonstopmode', '-halt-on-error', '-jobname=' + job, '-output-directory=' + str(BUILD), entry]
    for _ in range(3):
        r = subprocess.run(cmd, cwd=SRC, capture_output=True, text=True, errors='replace')
        log = (BUILD / (job + '.log')).read_text(errors='replace')
        if r.returncode: sys.exit(f'LaTeX failed for {entry}; see {BUILD / (job + ".log")}')
        if 'Rerun to get' not in log and 'Label(s) may have changed' not in log: break
    over = len(re.findall(r'Overfull \\[hv]box', log)); und = re.findall(r'LaTeX Warning: Reference .*undefined', log)
    d = fitz.open(BUILD / (job + '.pdf'))
    print(f'  {job}: {len(d)} pages, {len(und)} undefined references, {over} overfull boxes')
    if und: sys.exit('Undefined references in ' + entry)
    return d


def main():
    catalog = json.loads((OUT / 'catalog.json').read_text())
    chapters = {c['number']: c for c in catalog['chapters'] if c['course'] == 'seconde'}
    counts = {}
    for lang, suf in (('fr', ''), ('en', '-en')):
        for kind, entry in (('student', 'eleve'), ('teacher', 'professeur')):
            d = compile_pdf(entry + suf + '.tex')
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
    bad = [k for k in range(14) for kind in ('student', 'teacher') if counts[('fr', kind, k)] != counts[('en', kind, k)]]
    if bad: sys.exit('Page-count mismatch for chapters ' + ', '.join(str(k + 2) for k in sorted(set(bad))))
    print('FR/EN page counts match for all 14 sheets')


main()
