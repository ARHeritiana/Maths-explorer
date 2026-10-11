"""FR/EN twin parity on every pair (generalises the former STMG twin check).

For each French unit with an English twin (new system: x.fr.tex / x.en.tex; courses not yet migrated: x.tex / x-en.tex),
the set of numbers inside maths and, figure by figure, the numbers inside TikZ/pgfplots code must be identical (after
decimal commas are normalised). Prose, axis labels and node texts are not compared. Exit status 1 on any difference.
Run: python3 tests/twin_parity.py
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEX = ROOT / 'content/tex'


def nums(s):   # a set: phrasing may repeat or drop a figure, but never change one
    s = re.sub(r'\{,\}', '.', s); s = re.sub(r'(?<=\d)\\,(?=\d)', '', s)
    s = re.sub(r'(?<=\d) (?=\d{3}\b)', '', s); s = re.sub(r'\\allowbreak\s*', '', s)
    return sorted(set(re.findall(r'\d+(?:\.\d+)?', s)))


def maths(s):
    s = re.sub(r'(?<!\\)%.*', '', s)
    out = re.findall(r'\$(.+?)\$', s, re.S) + re.findall(r'\\\[(.+?)\\\]', s, re.S)
    out = [re.sub(r'\\(?:text|textrm|mathrm|mbox|textsuperscript)\{[^{}]*\}', '', x) for x in out]
    return nums(' | '.join(out))


TEXT_SLOT = re.compile(r'(?:node\s*(?:\[[^\]]*\])?\s*(?:at\s*\([^)]*\))?\s*|(?:x|y|z)label\s*=\s*|title\s*=\s*|addlegendentry\s*)\{')


def _drop_text_slots(code):
    """Remove the text of nodes, axis labels, titles and legend entries (balanced braces); coordinates stay."""
    out, pos = [], 0
    for m in TEXT_SLOT.finditer(code):
        if m.start() < pos: continue
        depth, j = 0, m.end() - 1
        while j < len(code):
            depth += {'{': 1, '}': -1}.get(code[j], 0)
            if depth == 0: break
            j += 1
        out.append(code[pos:m.end()]); pos = j
    return ''.join(out) + code[pos:]


def figures(s):
    out = re.findall(r'\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}', s, re.S)
    return [nums(_drop_text_slots(b)) for b in out]


def pairs():
    for fr in sorted(TEX.rglob('*.tex')):
        if fr.name.endswith('.fr.tex'): en = fr.with_name(fr.name[:-7] + '.en.tex')
        elif fr.name.endswith(('-en.tex', '.en.tex')): continue
        else: en = fr.with_name(fr.stem + '-en.tex')
        if en.exists(): yield fr, en


def main():
    bad = n = 0
    for fr, en in pairs():
        n += 1; a, b = fr.read_text(), en.read_text(); rel = fr.relative_to(ROOT)
        if maths(a) != maths(b):
            bad += 1; x = sorted(set(maths(a)) ^ set(maths(b)))
            print(f'{rel}: numbers in maths differ ({x[:6]})')
        if figures(a) != figures(b):
            bad += 1; print(f'{rel}: figure code differs')
    print(f'twin parity: {n - bad}/{n} pairs OK' if bad else f'twin parity: {n} pairs OK')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
