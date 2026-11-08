"""Malagasy books (Mada-Boky T10 and T11 S; the T12 C and D book, class bokiko) as input of the slide decks: their LaTeX
rewritten into the vocabulary that scripts/build-slides.py `canonical` reads (mxunit, section, definition, theorem, method,
example, activity, proof, pitfall).

Pure text functions, no TeX run. What the decks keep: the lesson (definitions, properties, methods, examples, proofs, entry
activities). What they drop: teacher material (corrections, teacher notes, marks), figures (TikZ, plots), pseudo-code blocks,
the exercise sections and the self-tests (the booklets carry them), comments; for T12 also the in-lesson exercises, answers,
revision sheets and exam papers. Macros defined by the books (\\vv, \\norme, \\R...) are expanded from their .sty and .cls files
and from the chapter's own definitions (\\providecommand included), so the player's MathJax sees standard commands only. The
T12 boxes (\\mybox, \\thmbox, \\ansbox...) keep their content, \\vln becomes a bold lead-in, multiform, mitanisa and
IEEEeqnarray* become arrays and tables, description items keep their label in bold, \\tikznode keeps its text.
"""
import re
import unicodedata

# environments of the books -> environments of the canonical parser
RENAME = {'defn': 'definition', 'prop': 'theorem', 'propriete': 'theorem', 'theoreme': 'theorem', 'methode': 'method',
          'ex': 'example', 'exemple': 'example', 'objectifs': 'objectives', 'activite': 'activity', 'demonstration': 'proof',
          'avertissement': 'pitfall', 'remarque': 'keypoint',
          # T12 book (FotsySyMainty.sty); thm is also the theorem box of T10 (mdg-pedagogy.sty)
          'defi': 'definition', 'thm': 'theorem', 'prp': 'theorem', 'lem': 'theorem', 'cor': 'theorem', 'rmk': 'keypoint',
          'dem': 'proof'}
# environments dropped with their content
DROP = ('corrige', 'notepourlaclasse', 'figure', 'tikzpicture', 'axis', 'algorithm', 'algorithmic', 'exo', 'probleme', 'challenge',
        'automatismes', 'jemeteste', 'revision', 'anecdote', 'visualisation', 'prerequis', 'extensiont10box', 'multicols*',
        # T12 book: in-lesson exercises, answers, revision sheets, exam papers and problems
        'exe', 'valiny', 'sol', 'fiche', 'sujetC', 'sujetD', 'pbm', 'pbm*')
# commands dropped with their arguments (teacher-only or decorative)
DROP_CMDS = {'TeacherOnly': 1, 'enseignant': 1, 'diff': 1, 'label': 1, 'index': 1, 'horsprogramme': 1, 'bareme': 1, 'niveau': 1,
             'bmtsource': 1, 'input': 1, 'part': 1, 'vspace': 1, 'hspace': 1, 'needspace': 1, 'TCDtag': 1}
DROP_BARE = ('corrige', 'corrigeP', 'computer', 'logiq', 'algo', 'logicoalgo', 'centering', 'noindent', 'medskip', 'smallskip',
             'bigskip', 'newpage', 'clearpage', 'par', 'headingstyleko', 'TCDLessonStyleOn', 'TCDLessonStyleOff')
# T12 boxes: the frame goes, one argument stays (name -> (number of arguments, argument kept))
UNWRAP = {'mybox': (1, 1), 'thmbox': (1, 1), 'defbox': (1, 1), 'propbox': (1, 1), 'hypothesebox': (1, 1), 'invertbox': (1, 1),
          'ansbox': (1, 1), 'nota': (1, 1), 'smallnota': (1, 1), 'warning': (1, 1), 'TCDEmphasize': (2, 2)}
COMBINING = {'`': '̀', "'": '́', '^': '̂', '"': '̈'}
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


DEFINITION = re.compile(r'\\(?:re)?(new|provide)command\*?\{\\([A-Za-z]+)\}(?:\[(\d)\])?\{')


def macros(*texts, base=None):
    """Simple macros of the books: \\newcommand{\\x}[n]{body} on one definition, without TikZ, colour or conditionals.
    \\providecommand defines a name only when it is not defined yet, as TeX does; base: the definitions already known."""
    out = dict(base or {})
    for text in texts:
        for m in DEFINITION.finditer(text):
            end = _group(text, m.end() - 1); body = text[m.end():end - 1]; name = m.group(2)
            if m.group(1) == 'provide' and name in out: continue
            if re.search(r'\\(tikz|color|textcolor|ifcase|if[a-z]+|hyperref|marginpar|refstepcounter|begin|@)', body): continue
            # redefinitions of standard commands stay standard; the T12 boxes are unwrapped, not expanded
            if name in ('lim', 'item', 'section', 'chapter', 'vln', *UNWRAP) or 'orig' in body: continue
            out[name] = (int(m.group(3) or 0), body)
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


def strip_definitions(s):
    """Remove the \\newcommand, \\renewcommand, \\providecommand and \\DeclareMathOperator statements (macros() reads them)."""
    out, pos = [], 0
    for m in re.finditer(r'\\(?:(?:re)?new|provide)command\*?\{?\\[A-Za-z]+\}?|\\DeclareMathOperator\*?\{\\[A-Za-z]+\}', s):
        if m.start() < pos: continue
        i = m.end()
        while i < len(s) and s[i] in ' \t': i += 1
        while i < len(s) and s[i] == '[': i = _group(s, i)
        if i >= len(s) or s[i] != '{': continue
        out.append(s[pos:m.start()]); pos = _group(s, i)
    return ''.join(out) + s[pos:]


def unwrap(s, name, n, keep):
    """\\name{a1}...{an} -> argument number keep (an argument may be a single token)."""
    pat = re.compile(r'\\' + name + r'(?![A-Za-z])')
    while True:
        m = pat.search(s)
        if not m: return s
        i, args = m.end(), []
        for _ in range(n):
            while i < len(s) and s[i] in ' \n': i += 1
            if i < len(s) and s[i] == '{': j = _group(s, i); args.append(s[i + 1:j - 1]); i = j
            elif i < len(s): args.append(s[i]); i += 1
            else: args.append('')
        s = s[:m.start()] + args[keep - 1] + s[i:]


def lead_ins(s):
    """\\vln{text} (T12: a bold lead-in ending the line) -> \\textbf{text} and a line break."""
    while True:
        m = re.search(r'\\vln(?![A-Za-z])\s*', s)
        if not m: return s
        i = m.end()
        if i < len(s) and s[i] == '{': j = _group(s, i); s = s[:m.start()] + '\\textbf{' + s[i + 1:j - 1] + '}\\\\ ' + s[j:]
        else: s = s[:m.start()] + s[i:]


def tikz_nodes(s):
    """\\tikznode{name}{text} (a named TikZ node inside a formula, T12) -> its text as maths: colour and inner $ removed, and
    the ; that the sources put after it."""
    while True:
        m = re.search(r'\\tikznode(?![A-Za-z])\s*', s)
        if not m: return s
        i = m.end(); args = []
        for _ in range(2):
            while i < len(s) and s[i] in ' \n': i += 1
            if i < len(s) and s[i] == '{': j = _group(s, i); args.append(s[i + 1:j - 1]); i = j
            else: args.append('')
        text = args[1]
        for _ in range(3): text = unwrap(text, 'textcolor', 2, 2)
        text = text.replace('$', '')
        if s[i:i + 1] == ';': i += 1
        s = s[:m.start()] + text + s[i:]


def descriptions(s):
    """description lists -> itemize, each \\item[label] -> \\item \\textbf{label}; the innermost list first."""
    while True:
        b = s.rfind('\\begin{description}')
        e = s.find('\\end{description}', b)
        if b < 0 or e < 0: return s
        body, out, pos = s[b + len('\\begin{description}'):e], [], 0
        for m in re.finditer(r'\\item(?![A-Za-z])\s*\[', body):
            if m.start() < pos: continue
            j = _group(body, m.end() - 1)
            label = body[m.end():j - 1].strip()   # bold, unless it holds maths (bold would cut the formula)
            out.append(body[pos:m.start()] + ('\\item ' + label + ' ' if '$' in label else '\\item \\textbf{' + label + '} ')); pos = j
        s = s[:b] + '\\begin{itemize}' + ''.join(out) + body[pos:] + '\\end{itemize}' + s[e + len('\\end{description}'):]


def accents(s):
    """ASCII accents not in ACCENTS (\\`E, \\'{a}, \\"o, \\c{C}...) -> the accented letter."""
    s = re.sub(r'\\c\s*\{?([cC])\}?', lambda m: 'ç' if m[1] == 'c' else 'Ç', s)
    s = re.sub(r'\\([`\'^"])\s*\{?\\i(?![A-Za-z])\s*\}?', lambda m: unicodedata.normalize('NFC', 'i' + COMBINING[m[1]]), s)
    return re.sub(r'\\([`\'^"])\s*\{?([A-Za-z])\}?', lambda m: unicodedata.normalize('NFC', m[2] + COMBINING[m[1]]), s)


def tabularx(s):
    """tabularx{width}{spec} -> tabular{spec} with X columns as l; the spec may hold braces (@{}X X@{})."""
    while True:
        m = re.search(r'\\begin\{tabularx\}\s*\{', s)
        if not m: return s.replace('\\end{tabularx}', '\\end{tabular}')
        i = _group(s, m.end() - 1)
        while i < len(s) and s[i] in ' \n': i += 1
        if i >= len(s) or s[i] != '{': s = s[:m.start()] + '\\begin{tabular}' + s[m.end() - 1:]; continue
        j = _group(s, i)
        s = s[:m.start()] + '\\begin{tabular}{' + s[i + 1:j - 1].replace('X', 'l') + '}' + s[j:]


def bokiko(s):
    """Constructs of the T12 book (class bokiko, FotsySyMainty.sty) rewritten for the slide parser."""
    s = re.sub(r'\\begin\{chapter\}', lambda _: '\\chapter', s).replace('\\end{chapter}', '')
    for name, (n, keep) in UNWRAP.items(): s = unwrap(s, name, n, keep)
    s = lead_ins(s); s = tikz_nodes(s)
    s = s.replace('\\begin{multiform}', '\\left\\{\\begin{array}{l}').replace('\\end{multiform}', '\\end{array}\\right.')
    s = s.replace('\\begin{mitanisa}', '\\begin{tabular}{l}').replace('\\end{mitanisa}', '\\end{tabular}')
    s = re.sub(r'\\begin\{IEEEeqnarray\*\}\{([^}]*)\}(.*?)\\end\{IEEEeqnarray\*\}',   # C (displaystyle c) of tcd-compat.sty -> c
               lambda m: '\\[\\begin{array}{' + m[1].replace('C', 'c') + '}' + m[2] + '\\end{array}\\]', s, flags=re.S)
    s = re.sub(r'\\\\\[[^\]]*\\baselineskip\]', lambda _: '\\\\', s)   # \\[-1\baselineskip]: MathJax knows no \baselineskip
    s = re.sub(r'\\boldmath(?![A-Za-z])', '', s)
    s = unwrap_intertext(s)
    return descriptions(s)


def unwrap_intertext(s):
    """\\intertext{words} inside align (MathJax has none) -> a text line of the alignment."""
    while True:
        m = re.search(r'\\intertext\s*\{', s)
        if not m: return s
        j = _group(s, m.end() - 1)
        s = s[:m.start()] + '\\\\ \\text{' + s[m.end():j - 1] + '} \\\\' + s[j:]


def hoist_proofs(s):
    """A proof written inside its theorem box (T12: \\begin{prp} ... \\begin{proof} ... \\end{proof} \\end{prp}) moves just after
    the box: the slide parser reads one level of boxes, so a nested proof gave no proof slide and leaked into the theorem's text."""
    out, pos = [], 0
    for m in re.finditer(r'\\begin\{(theorem|definition|keypoint)\}', s):
        if m.start() < pos: continue
        name = m.group(1); depth, j = 0, m.start()
        for e in re.finditer(r'\\(begin|end)\{' + name + r'\}', s[m.start():]):
            depth += 1 if e.group(1) == 'begin' else -1
            if depth == 0: j = m.start() + e.end(); break
        else: continue
        box = s[m.start():j]
        proofs = re.findall(r'\\begin\{proof\}.*?\\end\{proof\}', box, flags=re.S)
        if proofs: box = re.sub(r'\\begin\{proof\}.*?\\end\{proof\}', '', box, flags=re.S) + '\n' + '\n'.join(proofs) + '\n'
        out.append(s[pos:m.start()] + box); pos = j
    return ''.join(out) + s[pos:]


def prepare(src, defs, number, title):
    """One chapter of a book -> canonical TeX: a title unit, then its sections."""
    s = re.sub(r'(?<!\\)%.*', '', src)                          # comments
    defs = macros(s, base=defs); s = strip_definitions(s)      # the chapter's own definitions
    for a, b in ACCENTS.items(): s = s.replace(a, b)
    s = accents(s)
    s = bokiko(s)
    s = re.sub(r'\\(begin|end)\{exercice\}', r'\\\1{exo}', s)
    s = drop_envs(s, DROP)
    s = re.sub(r'\\begin\{center\}\s*\\end\{center\}', '', s)
    # T11 S: \bmtchapitre{title}{goals}{part}; T10: \chapter{title}
    m = re.search(r'\\bmtchapitre\{', s)
    if m:
        j1 = _group(s, m.end() - 1); j2 = _group(s, j1); j3 = _group(s, j2)
        goals = s[j1 + 1:j2 - 1]
        s = s[:m.start()] + f'\\mxunit{{{number}}}{{{title}}}\n\\begin{{objectives}}{goals}\\end{{objectives}}\n' + s[j3:]
    m = re.search(r'\\chapter\{', s)   # the title may hold braces (dans $\mathbb{R}^3$)
    if m: s = s[:m.start()] + f'\\mxunit{{{number}}}{{{title}}}' + s[_group(s, m.end() - 1):]
    if '\\mxunit' not in s: s = f'\\mxunit{{{number}}}{{{title}}}\n' + s
    s = re.sub(r'\\(section|subsection)\*', r'\\\1', s)
    # \begin{methode}{title} (T11 S, mandatory title) -> optional title
    s = re.sub(r'\\begin\{methode\}\{([^}]*)\}', r'\\begin{methode}[\1]', s)
    for a, b in RENAME.items(): s = re.sub(r'\\(begin|end)\{' + a + r'\}', r'\\\1{' + b + '}', s)
    s = hoist_proofs(s)
    s = safe_titles(s)
    # tabularx (width, X columns) -> tabular, the only table the slide builder converts
    s = tabularx(s)
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
