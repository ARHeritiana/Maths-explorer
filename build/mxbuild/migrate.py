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
    """The first \\chapter{...} or \\section{...} becomes \\mxunit{uid}{...}; a file without heading gets \\mxfront{uid}.
    Leading comment lines are dropped."""
    def f(s):
        s = re.sub(r'\A(?:%[^\n]*\n)+', '', s)
        m = re.search(r'\\(?:chapter|section)\{', s)
        return s[:m.start()] + '\\mxunit{%s}{' % uid + s[m.end():] if m else '\\mxfront{%s}\n' % uid + s
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

def _group_end(s, i):
    depth = 0
    for j in range(i, len(s)):
        c = s[j]
        if c == '\\': continue
        if s[j - 1] == '\\' and (j < 2 or s[j - 2] != '\\'): continue
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return j + 1
    raise ValueError('unbalanced braces')


def _cmd_to_env(cmd, env):
    """\\cmd{body} -> \\begin{env}body\\end{env} (balanced braces)."""
    def f(s):
        out, pos = [], 0
        for m in re.finditer(r'\\' + cmd + r'\{', s):
            if m.start() < pos: continue
            k = _group_end(s, m.end() - 1)
            out += [s[pos:m.start()], '\\begin{%s}' % env, s[m.end():k - 1], '\\end{%s}' % env]; pos = k
        return ''.join(out) + s[pos:]
    return f


MONTHS_EN = {m: i for i, m in enumerate('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(), 1)}


def _dates(s):
    """15/09/2026 and 15 Sep 2026 (session headers, schedules) -> \\mxdate*{2026-09-15}."""
    s = re.sub(r'\b(\d{2})/(\d{2})/(20\d\d)\b', r'\\mxdate*{\3-\2-\1}', s)
    return re.sub(r'\b(\d{1,2}) (%s) (20\d\d)\b' % '|'.join(MONTHS_EN),
                  lambda m: '\\mxdate*{%s-%02d-%02d}' % (m.group(3), MONTHS_EN[m.group(2)], int(m.group(1))), s)


STMG_COLOURS = [('Blue', 'mxteacher'), ('TeacherBlue', 'mxteacher'), ('Navy', 'mxink'), ('Ink', 'mxink'), ('Orange', 'mxwarn'),
                ('Red', 'mxwarn'), ('Gold', 'mxwarn'), ('Green', 'mxmint'), ('Mint', 'mxmintpale'), ('Sky', 'mxpaper'),
                ('Cream', 'mxpaper'), ('Rose', 'mxpaper'), ('Gray', 'mxpaper')]
STMG_RULES = [
    _cmd_to_env('enseignant', 'solution'),
    _sub(r'\\begin\{exercice\}\[-- ([^\]]*)\]', r'\\begin{exercise}[\1]'),
    _sub(r'\\begin\{exercice\}', r'\\begin{exercise}'), _sub(r'\\end\{exercice\}', r'\\end{exercise}'),
    *[_sub(r'\\(begin|end)\{%s\}' % a, r'\\\1{%s}' % b) for a, b in [
        ('objectifs', 'objectives'), ('prerequis', 'prerequisites'), ('activite', 'activity'), ('traceecrite', 'summary'),
        ('methode', 'method'), ('exemple', 'example'), ('exerciceapp', 'application'), ('probleme', 'problem'), ('dm', 'homework'),
        ('correction', 'solution'), ('erreur', 'pitfall'), ('retenir', 'keypoint')]],
    _sub(r'\\begin\{automatismes\}', r'\\begin{fluency}[6 à 8 minutes, sans calculatrice]'),   # French title of the old box
    _sub(r'\\end\{automatismes\}', r'\\end{fluency}'),
    _sub(r'\\begin\{sortie\}', r'\\begin{exitticket}[3 minutes]'), _sub(r'\\end\{sortie\}', r'\\end{exitticket}'),
    _sub(r'\\rep\b', r'\\mxblank'), _sub(r'\\zoneeleve\b', r'\\mxlines'), _sub(r'\\difficulte\b', r'\\mxdifficulty'),
    _sub(r'\\competences\b', r'\\mxskills'), _sub(r'\\points\b', r'\\mxpoints'), _sub(r'\\deuxcolonnes\b', r'\\mxtwocols'),
    _sub(r'\\manuelref\b', r'\\mxfurther'), _sub(r'\\DefExo\b', r'\\mxexdef'), _sub(r'\\ExoSession\b', r'\\mxexuse'),
    _sub(r'\\sessionheader\b', r'\\mxsession'), _sub(r'\\dsheader\b', r'\\mxtest'), _sub(r'\\ifprof\b', r'\\ifmxteacher'),
    _sub(r'\\renewcommand\{\\arraystretch\}\{([\d.]+)\}', r'\\mxarraystretch{\1}'),
    _dates,
    *[_sub(r'(?<=[{,=\[\s!])%s\b' % a, b) for a, b in STMG_COLOURS],
]

# course -> (unit map {old relative path (French): new stem}, rules)
PLANS = {
    'automatismes': ({**{f'sections/ch{n:02d}.tex': f'ch{n:02d}' for n in range(1, 15)},
                      'sections/guide.tex': 'guide', 'sections/annexe_diag.tex': 'annexe-diag'},
                     AUTOMATISMES_RULES),
    'stmg': ({'manuel/exo-A.tex': 'bank-a', 'manuel/exo-B.tex': 'bank-b', 'manuel/exo-C.tex': 'bank-c', 'manuel/exo-D.tex': 'bank-d',
              'chapitres/01-suites.tex': 'c01', 'chapitres/02-exponentielles.tex': 'c02', 'chapitres/03-logarithme.tex': 'c03',
              'chapitres/04-inverse.tex': 'c04', 'chapitres/05-statistiques.tex': 'c05', 'chapitres/06-conditionnelles.tex': 'c06',
              'chapitres/07-binomiale.tex': 'c07', 'chapitres/08-revisions.tex': 'c08', 'evaluations/devoirs.tex': 'tests',
              'annexes/formulaire.tex': 'formulas', 'annexes/programmation.tex': 'schedule', 'annexes/sources.tex': 'sources'},
             STMG_RULES),
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
