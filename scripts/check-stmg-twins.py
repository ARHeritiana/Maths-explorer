"""Compare the mathematics of the FR and EN STMG exercise files (manuel/exo-A..D).

Checks, per file pair: same \\DefExo sessions and answer-line counts, and, per exercise, the same set of
numbers inside maths (after decimal commas are normalised) and inside TikZ/pgfplots code. Prose and axis labels are
not compared, so a difference points to a changed figure or number. Exit status 1 on any difference.
"""
import re, sys
from pathlib import Path
D = Path(__file__).resolve().parents[1] / 'content/latex/stmg/manuel'

def nums(s):   # set of numbers: phrasing may repeat or drop a figure, but never change one
    s = re.sub(r'\{,\}', '.', s); s = re.sub(r'(?<=\d)\\,(?=\d)', '', s)   # decimal comma, thin-space thousands
    s = re.sub(r'(?<=\d) (?=\d{3}\b)', '', s)
    return sorted(set(re.findall(r'\d+(?:\.\d+)?', s)))

def maths(s):
    out = re.findall(r'\$(.+?)\$', s, re.S) + re.findall(r'\\\[(.+?)\\\]', s, re.S)
    out = [re.sub(r'\\text(?:rm)?\{[^{}]*\}|\\textsuperscript\{[^{}]*\}', '', x) for x in out]
    return nums(' | '.join(out))

def blocks(s):
    out = re.findall(r'\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}', s, re.S)
    return [nums(re.sub(r'(?:x|y)label=\{[^}]*\}(?:\{[^}]*\})?', '', b)) for b in out]

def calls(s):
    return [(m.group(1), m.group(2)) for m in re.finditer(r'^\\DefExo\{(\d+)\}.*?\}\{(\d+)\}\n', s, re.S | re.M)]

bad = 0
for k in 'ABCD':
    fr = (D / f'exo-{k}.tex').read_text(); en = (D / f'exo-{k}-en.tex').read_text()
    if calls(fr) != calls(en): print(k, 'DefExo sessions or answer lines differ'); bad += 1; continue
    # split per exercise so that a difference is located
    pf = re.split(r'(?=^\\DefExo\{\d+\})', fr, flags=re.M)[1:]; pe = re.split(r'(?=^\\DefExo\{\d+\})', en, flags=re.M)[1:]
    for a, b in zip(pf, pe):
        n = re.match(r'\\DefExo\{(\d+)\}', a).group(1)
        # target is prose; statement/solution are compared on maths only
        ma, mb = maths(a), maths(b)
        if ma != mb:
            bad += 1; print(f'exo {n}: numbers in maths differ ({len(ma)} vs {len(mb)})')
            for x, y in zip(ma, mb):
                if x != y: print('   FR', x, ' EN', y); break
        if blocks(a) != blocks(b): bad += 1; print(f'exo {n}: figure code differs')
print('twins OK' if not bad else f'{bad} problem(s)'); sys.exit(1 if bad else 0)
