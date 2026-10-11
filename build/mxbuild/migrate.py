"""One-off migration of a course to the canonical TeX system (docs/TEX_STYLE_GUIDE.md, docs/ADR-0001-tex-i18n.md).

For each unit: the French and the old English twin are rewritten with the same mechanical rules (vocabulary of the
course -> canonical names), the rewritten pair is aligned into the translation table <unit>.en.json, the French file
is moved (git mv) to <unit>.fr.tex and the English one is generated. A unit whose pair cannot be aligned is reported
and left untouched. Run: python -m mxbuild migrate <course> [--dry-run]
"""
import re, subprocess, sys
from pathlib import Path
from . import ROOT, twin

COURSES = ROOT / 'content/tex/courses'


def _sub(pattern, repl, flags=0):
    return lambda s: re.sub(pattern, repl, s, flags=flags)


def _section_to_unit(uid):
    """First \\section{...} of the file becomes \\mxunit{uid}{...}; header comments are dropped."""
    def f(s):
        s = re.sub(r'\A(?:%[^\n]*\n)+', '', s)
        return s.replace('\\section{', '\\mxunit{%s}{' % uid, 1)
    return f


FIGURE = re.compile(r'\\begin\{(tikzpicture|axis|pgfpicture)\}.*?\\end\{\1\}', re.S)
PAIR = re.compile(r'\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)')
DECIMAL = re.compile(r'(?<![\d{(,.-])(\d+),(\d+)(?![\d}])')


def _decimal_commas_outside_maths(s):
    """Text such as 60,7 becomes 60{,}7. Maths, figure code and coordinate pairs (x,y) are left alone."""
    keep = sorted([m.span() for m in FIGURE.finditer(s)] + [m.span() for m in PAIR.finditer(s)] + twin.locked_maths(s))
    out, pos = [], 0
    for a, b in keep:
        if a < pos: continue
        out += [DECIMAL.sub(r'\1{,}\2', s[pos:a]), s[a:b]]; pos = b
    return ''.join(out) + DECIMAL.sub(r'\1{,}\2', s[pos:])


AUTOMATISMES_RULES = [
    _sub(r'\\fichehead\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}\s*\n\\begin\{fiche\}', r'\\begin{fluencysheet}{\1}{\2}'),
    _sub(r'\\end\{fiche\}', r'\\end{fluencysheet}'),
    _sub(r'\\qitem\b', r'\\mxfq'),
    _sub(r'\\choix\b', r'\\mxchoices'),
    _sub(r'\\renewcommand\{\\arraystretch\}\{([\d.]+)\}', r'\\mxarraystretch{\1}'),
    _sub(r'\\tagdiag\b', r'\\mxtag'),
    _sub(r'\\norme\b', r'\\norm'),
    _sub(r'\\ifprof\b', r'\\ifmxteacher'),
    _sub(r'\\ifmxteacher\\else\\clearpage\\fi\n?', ''),
    # course colours -> shared palette (mx-figures.sty)
    _sub(r'(?<=[{,=\[\s])marine\b', 'mxink'), _sub(r'(?<=[{,=\[\s])(?:acier|ardoise)\b', 'mxmuted'),
    _sub(r'(?<=[{,=\[\s])fond\b', 'mxpaper'), _sub(r'(?<=[{,=\[\s])rep\b(?=[!},\]])', 'mxteacher'),   # English-only page-alignment hack (ch13), not needed any more
]

# course -> (unit map {old relative path (French): new stem}, rules)
PLANS = {
    'automatismes': ({**{f'sections/ch{n:02d}.tex': f'ch{n:02d}' for n in range(1, 15)},
                      'sections/guide.tex': 'guide', 'sections/annexe_diag.tex': 'annexe-diag'},
                     AUTOMATISMES_RULES),
}


def migrate(course, dry=False):
    units, rules = PLANS[course]
    base = COURSES / course; ok, refused = [], []
    for old, stem in units.items():
        fr_old = base / old; en_old = fr_old.with_name(fr_old.stem + '-en.tex')
        conv = lambda s: _decimal_commas_outside_maths(_section_to_unit(f'{course}-{stem}')(
            __import__('functools').reduce(lambda acc, r: r(acc), rules, s)))
        fr, en = conv(fr_old.read_text()), conv(en_old.read_text())
        try:
            pairs = twin.align(fr, en)
        except twin.TwinError as e:
            refused.append((old, str(e)[:300])); continue
        ok.append((old, stem, len(pairs)))
        if dry: continue
        new = base / f'{stem}.fr.tex'
        subprocess.run(['git', 'mv', str(fr_old), str(new)], cwd=ROOT, check=True)
        new.write_text(fr)
        tmp = base / f'{stem}.old-en.tex'; tmp.write_text(en)
        twin.align_files(new, tmp); tmp.unlink()
        subprocess.run(['git', 'rm', '-q', str(en_old)], cwd=ROOT, check=True)
        twin.en_path(new).write_text(twin.generate(fr, twin.load_table(new)))
    for o, s, n in ok: print(f'  {o} -> {s}.fr.tex: {n} segments')
    for o, e in refused: print(f'  REFUSED {o}: {e}')
    return 1 if refused else 0


def main(argv):
    if not argv or argv[0] not in PLANS: print(__doc__); return 2
    return migrate(argv[0], dry='--dry-run' in argv)
