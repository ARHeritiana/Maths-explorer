"""One-off migration of a course to the canonical TeX system (docs/TEX_STYLE_GUIDE.md, docs/ADR-0001-tex-i18n.md).

For each unit: the French and the old English twin are rewritten with the same mechanical rules (vocabulary of the
course -> canonical names), the rewritten pair is aligned into the translation table <unit>.en.json, the French file
is moved (git mv) to <unit>.fr.tex and the English one is generated. A unit whose pair cannot be aligned is reported
and left untouched. Run: python -m mxbuild migrate <course> [--dry-run]
"""
import re, subprocess
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
CODE = re.compile(r'\\begin\{(lstlisting|verbatim)\}.*?\\end\{\1\}|\\(?:code|texttt)\{[^{}]*\}', re.S)
PAIR = re.compile(r'\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)')
DECIMAL = re.compile(r'(?<![\d{(,.-])(\d+),(\d+)(?![\d}]|,\d)')   # 0,5 is a decimal; 0,1,2 is a list


def _decimal_commas_outside_maths(s):
    """Text such as 60,7 becomes 60{,}7. Maths, figure code, program code and coordinate pairs (x,y) are left alone."""
    keep = sorted([m.span() for m in FIGURE.finditer(s)] + [m.span() for m in PAIR.finditer(s)] +
                  [m.span() for m in CODE.finditer(s)] + twin.locked_maths(s))
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


def _cmd_to_env(cmd, env, after=''):
    """\\cmd[opt]{body} -> \\begin{env}[opt]body<after>\\end{env} (balanced braces; the optional argument is kept)."""
    def f(s):
        out, pos = [], 0
        for m in re.finditer(r'\\' + cmd + r'(\[[^\]]*\])?\{', s):
            if m.start() < pos: continue
            k = _group_end(s, m.end() - 1)
            out += [s[pos:m.start()], '\\begin{%s}%s' % (env, m.group(1) or ''), s[m.end():k - 1], after, '\\end{%s}' % env]; pos = k
        return ''.join(out) + s[pos:]
    return f


def _two_args(cmd, fmt):
    """\\cmd{a}{b} -> fmt % (a, b) (balanced braces)."""
    def f(s):
        out, pos = [], 0
        for m in re.finditer(r'\\' + cmd + r'\{', s):
            if m.start() < pos: continue
            k1 = _group_end(s, m.end() - 1); k2 = _group_end(s, k1)
            out += [s[pos:m.start()], fmt % (s[m.end():k1 - 1], s[k1 + 1:k2 - 1])]; pos = k2
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

SECONDE_RULES = [
    # sequence banner -> unit heading (made \\mxunit by _section_to_unit) and its period
    lambda s: re.sub(r'\\sequence\{([^{}]*)\}\{[^{}]*\}\{([^{}]*)\}', r'\\chapter{\1}\\mxsubtitle{\2}', s),
    # teacher annex: whole file was wrapped in \\ifprof ... \\fi; it is now a teacher-only unit
    lambda s: re.sub(r'\A\\ifprof\n\\clearpage\\renewcommand\{\\titreseq\}\{[^{}]*\}\\addcontentsline\{toc\}\{section\}\{([^{}]*)\}\n',
                     r'\\chapter{\1}\n', s),
    lambda s: re.sub(r'\n\\fi\s*\Z', '\n', s) if s.startswith('\\chapter{Annexes') or s.startswith('\\chapter{Teacher') else s,
    _sub(r'\\clearpage\\section\*', r'\\section*'),
    _sub(r'\\fiche\{', r'\\mxsection{'),
    _cmd_to_env('ex', 'example'),
    _two_args('rituel', '\\begin{fluency}[5--10 min]%s\\mxanswer{%s}\\end{fluency}'),
    _cmd_to_env('prof', 'teachernote'), _cmd_to_env('vigilance', 'pitfall'),
    _sub(r'\\begin\{cours\}\[', r'\\begin{keypoint}['), _sub(r'\\begin\{cours\}', r'\\begin{theorem}'),
    lambda s: _fix_cours_ends(s),
    _sub(r'\\(begin|end)\{methode\}', r'\\\1{method}'),
    _sub(r'\\reponse\b', r'\\mxanswerspace'), _sub(r'\\preuve\b', r'\\mxwriteproof'), _sub(r'\\trou\b', r'\\mxblank'),
    _sub(r'\bcoursaxe\b', 'mxgridaxis'), _sub(r'\\coord\b', r'\\vc'), _sub(r'\\grille\b', r'\\mxgrid'), _sub(r'\\ifprof\b', r'\\ifmxteacher'),
    _sub(r'\\renewcommand\{\\arraystretch\}\{([\d.]+)\}', r'\\mxarraystretch{\1}'),
]


def _fix_cours_ends(s):
    """Close each former cours box with the environment it was opened as (keypoint or theorem)."""
    out, stack, pos = [], [], 0
    for m in re.finditer(r'\\begin\{(keypoint|theorem)\}|\\end\{cours\}', s):
        if m.group(1): stack.append(m.group(1)); continue
        out += [s[pos:m.start()], '\\end{%s}' % stack.pop()]; pos = m.end()
    return ''.join(out) + s[pos:]


PREMIERE_RULES = [
    _sub(r'\\input\{(figures|corriges|evaluations)/([\w-]+?)(?:-en)?(?:\.tex)?\}', r'\\mxinclude{\1/\2}'),
    _sub(r'\\corrsection\{(\d+)\}', r'\\mxcorrections{\1}'),
    _sub(r'\\clearpage\b', r'\\mxnewpage'),
    _sub(r'\\exercice\{', r'\\mxexercisehead{'),
    _cmd_to_env('exemple', 'example'), _cmd_to_env('application', 'application'), _cmd_to_env('preuve', 'proof'),
    _sub(r'\\begin\{repere\}\{((?:[^{}]|\{[^{}]*\})*)\}', r'\\begin{keypoint}[\1]'), _sub(r'\\end\{repere\}', r'\\end{keypoint}'),
    _sub(r'\\(begin|end)\{erreur\}', r'\\\1{pitfall}'),
    _sub(r'\\ligne\b', r'\\mxlines{1}'), _sub(r'\\ifprof\b', r'\\ifmxteacher'),
    _sub(r'\\Needspace\{(\d+)\\baselineskip\}', r'\\mxneed{\1}'),
    _sub(r'\\renewcommand\{\\arraystretch\}\{([\d.]+)\}', r'\\mxarraystretch{\1}'),
    *[_sub(r'(?<=[{,=\[\s!])%s\b' % a, b) for a, b in [('bleu', 'mxink'), ('vert', 'mxmint'), ('ocre', 'mxwarn')]],
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
    'seconde': ({**{f'sequences/S{n:02d}.tex': f's{n:02d}' for n in range(1, 16)}, 'annexes.tex': 'annexes'}, SECONDE_RULES),
    # Units keep their folders; ('part', stem) marks a file included by a unit (no heading of its own, not a block).
    'premiere': None,   # filled below from the folder contents
}


def _premiere_plan():
    base = COURSES / 'premiere'; units = {'front.tex': 'front'}
    units.update({f'chapitres/C{n:02d}.tex': f'chapitres/C{n:02d}' for n in range(1, 11)})
    for name in ('transversal', 'automatismes', 'matrice', 'progression'): units[f'{name}.tex'] = name
    units['evaluations/index.tex'] = 'evaluations/index'
    for folder in ('corriges', 'evaluations', 'figures'):
        for p in sorted((base / folder).glob('*.tex')):
            if p.stem.endswith('-en') or p.name == 'index.tex' or (folder == 'evaluations' and p.name == 'index.tex'): continue
            units.setdefault(f'{folder}/{p.name}', ('part', f'{folder}/{p.stem}'))
    return units, PREMIERE_RULES


def migrate(course, dry=False):
    units, rules = PLANS[course] or globals()['_%s_plan' % course]()
    base = COURSES / course; ok, refused = [], []
    # Pass 1, in memory: convert, align and generate every unit; nothing is written unless all succeed.
    for old, stem in units.items():
        part = isinstance(stem, tuple); stem = stem[1] if part else stem
        fr_old = base / old; en_old = fr_old.with_name(fr_old.stem + '-en.tex')
        uid = f'{course}-' + stem.split('/')[-1].lower()
        heading = (lambda s: re.sub(r'\A(?:%[^\n]*\n)+', '', s)) if part else _section_to_unit(uid)
        conv = lambda s: _decimal_commas_outside_maths(heading(__import__('functools').reduce(lambda acc, r: r(acc), rules, s)))
        fr, en = conv(fr_old.read_text()), conv(en_old.read_text())
        try:
            pairs = twin.align(fr, en)
            table = {'segments': {twin.seg_id(f): {'fr': f, 'en': e, 'status': 'aligned'} for f, e in pairs}}
            twin.generate(fr, table)
        except twin.TwinError as e:
            refused.append((old, str(e)[:300])); continue
        ok.append((old, stem, fr, en, len(pairs)))
    for o, s_, _, _, n in ok: print(f'  {o} -> {s_}.fr.tex: {n} segments')
    for o, e in refused: print(f'  REFUSED {o}: {e}')
    if refused or dry: return 1 if refused else 0
    # Pass 2: move, write, align into the table, generate the English unit.
    for old, stem, fr, en, _ in ok:
        fr_old = base / old; en_old = fr_old.with_name(fr_old.stem + '-en.tex'); new = base / f'{stem}.fr.tex'
        subprocess.run(['git', 'mv', str(fr_old), str(new)], cwd=ROOT, check=True)
        new.write_text(fr)
        tmp = new.with_name(new.name.replace('.fr.tex', '.old-en.tex')); tmp.write_text(en)
        twin.align_files(new, tmp); tmp.unlink()
        subprocess.run(['git', 'rm', '-q', '-f', str(en_old)], cwd=ROOT, check=True)   # replaced by the generated unit
        twin.en_path(new).write_text(twin.generate(fr, twin.load_table(new)))
    return 0


def main(argv):
    if not argv or argv[0] not in PLANS: print(__doc__); return 2
    return migrate(argv[0], dry='--dry-run' in argv)
