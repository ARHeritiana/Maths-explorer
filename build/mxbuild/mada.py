"""Malagasy books (Mada-Boky T10 and T11 S) as input of the slide decks: their LaTeX rewritten into the vocabulary that
scripts/build-slides.py `canonical` reads (mxunit, section, definition, theorem, method, example, activity, proof, pitfall).

Pure text functions, no TeX run. What the decks keep: the lesson (definitions, properties, methods, examples, proofs, entry
activities). What they drop: teacher material (corrections, teacher notes, marks), figures (TikZ, plots), pseudo-code blocks,
the exercise sections and the self-tests (the booklets carry them), comments. Macros defined by the books (\\vv, \\norme, \\R...)
are expanded from their .sty and .cls files, so the player's MathJax sees standard commands only.
"""
import re

# environments of the books -> environments of the canonical parser
RENAME = {'defn': 'definition', 'prop': 'theorem', 'propriete': 'theorem', 'theoreme': 'theorem', 'methode': 'method',
          'ex': 'example', 'exemple': 'example', 'objectifs': 'objectives', 'activite': 'activity', 'demonstration': 'proof',
          'avertissement': 'pitfall', 'remarque': 'keypoint'}
# environments dropped with their content
DROP = ('corrige', 'notepourlaclasse', 'figure', 'tikzpicture', 'axis', 'algorithm', 'algorithmic', 'exo', 'probleme', 'challenge',
        'automatismes', 'jemeteste', 'revision', 'anecdote', 'visualisation', 'prerequis', 'extensiont10box', 'multicols*')
# commands dropped with their arguments (teacher-only or decorative)
DROP_CMDS = {'TeacherOnly': 1, 'enseignant': 1, 'diff': 1, 'label': 1, 'index': 1, 'horsprogramme': 1, 'bareme': 1, 'niveau': 1,
             'bmtsource': 1, 'input': 1, 'part': 1, 'vspace': 1, 'hspace': 1, 'needspace': 1}
DROP_BARE = ('corrige', 'corrigeP', 'computer', 'logiq', 'algo', 'logicoalgo', 'centering', 'noindent', 'medskip', 'smallskip',
             'bigskip', 'newpage', 'clearpage', 'par')
ACCENTS = {"\\'e": 'é', "\\'E": 'É', '\\`e': 'è', '\\`a': 'à', '\\`u': 'ù', '\\^e': 'ê', '\\^a': 'â', '\\^i': 'î', '\\^o': 'ô',
           '\\^u': 'û', '\\"e': 'ë', '\\"i': 'ï', '\\"u': 'ü', '\\c c': 'ç', '\\c{c}': 'ç', '\\oe ': 'œ', '\\oe': 'œ', '\\OE': 'Œ',
           "\\'{e}": 'é', '\\`{e}': 'è', '\\^{e}': 'ê', '\\^{i}': 'î', '\\^{o}': 'ô', '\\^{\\i}': 'î', '\\`{a}': 'à', '\\^{a}': 'â',
           '\\`A': 'À', "\\'{E}": 'É', '\\^{u}': 'û', '\\textemdash': '-', '\\textendash': '-', '---': ', ', '--': '-'}
# MathJax has no \mathscr; the books use it for a curve's name
MATHJAX = {'\\mathscr': '\\mathcal', '\\lVert': '\\|', '\\rVert': '\\|', '\\og': '«\u00a0', '\\fg': '\u00a0»', '\\bigstar': '\\star'}


def _group(s, i):
    """Index after the balanced {...} or [...] group starting at s[i]."""
    open_, close = s[i], {'{': '}', '[': ']'}[s[i]]
    depth = 0
    for j in range(i, len(s)):
        if s[j] == '\\': continue
        if s[j] == open_ and (j == 0 or s[j - 1] != '\\'): depth += 1
        elif s[j] == close and s[j - 1] != '\\':
            depth -= 1
            if depth == 0: return j + 1
    return len(s)


def macros(*texts):
    """Simple macros of the books: \\newcommand{\\x}[n]{body} on one definition, without TikZ, colour or conditionals."""
    out = {}
    for text in texts:
        for m in re.finditer(r'\\(?:re)?newcommand\{\\([A-Za-z]+)\}(?:\[(\d)\])?\{', text):
            end = _group(text, m.end() - 1); body = text[m.end():end - 1]
            if re.search(r'\\(tikz|color|textcolor|ifcase|if[a-z]+|hyperref|marginpar|refstepcounter|begin|@)', body): continue
            if m.group(1) in ('lim', 'item', 'section', 'chapter') or 'orig' in body: continue   # redefinitions of standard commands stay standard
            out[m.group(1)] = (int(m.group(2) or 0), body)
        for m in re.finditer(r'\\DeclareMathOperator\{\\([A-Za-z]+)\}\{([^}]*)\}', text):
            out[m.group(1)] = (0, '\\operatorname{' + m.group(2) + '}')
    return out


def expand(s, defs, rounds=4):
    for _ in range(rounds):
        changed = False
        for name, (n, body) in defs.items():
            pat = re.compile(r'\\' + name + r'(?![A-Za-z])')
            pos = 0
            while True:
                m = pat.search(s, pos)
                if not m: break
                i, args = m.end(), []
                ok = True
                for _k in range(n):
                    while i < len(s) and s[i] == ' ': i += 1
                    if i < len(s) and s[i] == '{': j = _group(s, i); args.append(s[i + 1:j - 1]); i = j
                    elif i < len(s): args.append(s[i]); i += 1   # a single token argument (\vv u)
                    else: ok = False
                if not ok: break
                rep = body
                for k, a in enumerate(args, 1): rep = rep.replace('#' + str(k), a)
                if n == 0 and i < len(s) and s[i].isalpha(): rep += ' '   # \R x must not become \mathbb{R}x glued
                s = s[:m.start()] + rep + s[i:]; pos = m.start() + len(rep); changed = True
        if not changed: break
    return s


def drop_envs(s, names):
    for name in names:
        n = re.escape(name)
        s = re.sub(r'\\begin\{' + n + r'\}.*?\\end\{' + n + r'\}', '', s, flags=re.S)
    return s


def drop_commands(s):
    for name, n in DROP_CMDS.items():
        pat = re.compile(r'\\' + name + r'(?![A-Za-z])\*?')
        while True:
            m = pat.search(s)
            if not m: break
            i = m.end()
            while i < len(s) and s[i] == '[': i = _group(s, i)
            for _ in range(n):
                while i < len(s) and s[i] in ' \n': i += 1
                if i < len(s) and s[i] == '{': i = _group(s, i)
            s = s[:m.start()] + s[i:]
    for name in DROP_BARE: s = re.sub(r'\\' + name + r'(?![A-Za-z])', '', s)
    return s


def safe_titles(s):
    """An optional title may hold brackets inside braces ([Résoudre $\\cos x=a$ sur {$[0,2\\pi]$}]): the canonical parser ends it at
    the first ], so the inner brackets become \\lbrack and \\rbrack."""
    out, pos = [], 0
    for m in re.finditer(r'\\begin\{[A-Za-z]+\}\[', s):
        if m.start() < pos: continue
        i, depth = m.end(), 0
        while i < len(s):
            c = s[i]
            if c == '{' and s[i - 1] != '\\': depth += 1
            elif c == '}' and s[i - 1] != '\\': depth -= 1
            elif c == ']' and depth == 0: break
            i += 1
        inner = s[m.end():i]
        fixed = re.sub(r'\{(\$[^$]*\$)\}', r'\1', inner).replace('[', '\\lbrack ').replace(']', '\\rbrack ')
        out.append(s[pos:m.end()] + fixed); pos = i
    return ''.join(out) + s[pos:]


def prepare(src, defs, number, title):
    """One chapter of a book -> canonical TeX: a title unit, then its sections."""
    s = re.sub(r'(?<!\\)%.*', '', src)                          # comments
    for a, b in ACCENTS.items(): s = s.replace(a, b)
    s = re.sub(r'\\(begin|end)\{exercice\}', r'\\\1{exo}', s)
    s = drop_envs(s, DROP)
    s = re.sub(r'\\begin\{center\}\s*\\end\{center\}', '', s)
    # T11 S: \bmtchapitre{title}{goals}{part}; T10: \chapter{title}
    m = re.search(r'\\bmtchapitre\{', s)
    if m:
        j1 = _group(s, m.end() - 1); j2 = _group(s, j1); j3 = _group(s, j2)
        goals = s[j1 + 1:j2 - 1]
        s = s[:m.start()] + f'\\mxunit{{{number}}}{{{title}}}\n\\begin{{objectives}}{goals}\\end{{objectives}}\n' + s[j3:]
    s = re.sub(r'\\chapter\{[^}]*\}', lambda _: f'\\mxunit{{{number}}}{{{title}}}', s, count=1)
    if '\\mxunit' not in s: s = f'\\mxunit{{{number}}}{{{title}}}\n' + s
    s = re.sub(r'\\(section|subsection)\*', r'\\\1', s)
    # \begin{methode}{title} (T11 S, mandatory title) -> optional title
    s = re.sub(r'\\begin\{methode\}\{([^}]*)\}', r'\\begin{methode}[\1]', s)
    for a, b in RENAME.items(): s = re.sub(r'\\(begin|end)\{' + a + r'\}', r'\\\1{' + b + '}', s)
    s = safe_titles(s)
    # tabularx (width, X columns) -> tabular, the only table the slide builder converts
    s = re.sub(r'\\begin\{tabularx\}\{[^}]*\}\{([^}]*)\}', lambda m: '\\begin{tabular}{' + m.group(1).replace('X', 'l') + '}', s)
    s = s.replace('\\end{tabularx}', '\\end{tabular}')
    # table styling has no place in a slide: \renewcommand{\arraystretch}{1.5}, \rowcolor{BN!10}, \setlength{...}{...}
    s = re.sub(r'\\renewcommand\{\\arraystretch\}\{[^}]*\}|\\(row|cell)color\{[^}]*\}|\\setlength\{[^}]*\}\{[^}]*\}|\\rule\{[^}]*\}\{[^}]*\}', '', s)
    s = re.sub(r'(\\begin\{center\}\s*)?\\begin\{tabular\}', lambda m: '\n\n' + m.group(0), s)   # a table starts a paragraph: a long slide can be cut before it
    s = re.sub(r'\\end\{tabular\}(\s*\\end\{center\})?', lambda m: m.group(0) + '\n\n', s)
    s = re.sub(r'\\cline\{[^}]*\}', '', s)   # MathJax arrays have no \\cline
    s = drop_commands(s)
    s = expand(s, defs)
    for a, b in MATHJAX.items(): s = re.sub(re.escape(a) + r'(?![A-Za-z])', lambda _: b, s)
    s = re.sub(r'\$\$(.+?)\$\$', r'\\[\1\\]', s, flags=re.S)
    return s
