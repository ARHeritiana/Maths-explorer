"""Enrichment workshops: TeX units generated from content/data/enrichment.json, compiled on the shared class.

The JSON (both languages authored) stays the single source of the workshops: it also feeds the HTML reading editions
and the site data (scripts/build-enrichment.py). For each workshop and each kind (notes, exercises, problems,
solutions) this module writes the French unit <id>-<kind>.fr.tex, aligns the English text into the table
<id>-<kind>.en.json and generates <id>-<kind>.en.tex with the twin tool, so French and English carry the same maths
(the alignment fails otherwise). Maths written in Unicode in the JSON (x², u₁, √, ≤ ...) becomes TeX maths.

The units, with the hand-written unit quadratic-presentation, form the book "enrichment" (sheet layout, one unit per
page block). French and English are compiled together (page balance per unit) and split along the level-1 bookmarks
into dist/resources/enrichment/<id>-<kind>[-en].pdf and dist/resources/quadratic-presentation[-en].pdf.
"""
import json, re, sys
from . import ROOT, DIST, books, catalog, notation, pdf, tex, twin

SRC = ROOT / 'content/tex/courses/enrichment'
DATA = ROOT / 'content/data/enrichment.json'
BUILD = ROOT / 'build/out/tex/enrichment'
KINDS = {'notes': ['Leçon et méthode', 'Lesson and method'], 'exercises': ['Exercices progressifs', 'Progressive exercises'],
         'problems': ['Problème de synthèse', 'Synthesis problem'], 'solutions': ['Solutions détaillées', 'Worked solutions']}
EXTRA = ['quadratic-presentation']   # hand-written units of the book, published at dist/resources/<stem>.pdf


# ---- Unicode maths to TeX ----------------------------------------------------------------------------------------
SPECIAL = {'\\': r'\textbackslash{}', '&': r'\&', '%': r'\%', '$': r'\$', '#': r'\#', '_': r'\_', '{': r'\{', '}': r'\}'}
SUP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏᵐᵃᵇ⁺⁻', '0123456789nkmab+-')
SUB = str.maketrans('₀₁₂₃₄₅₆₇₈₉ₙₖ₊₋', '0123456789nk+-')
SYMBOLS = {'−': '-', '×': r'\times ', '·': r'\cdot ', '≤': r'\leq ', '≥': r'\geq ', '≠': r'\neq ', '≡': r'\equiv ',
           'ℝ': r'\R ', 'ℤ': r'\Z ', 'α': r'\alpha ', 'β': r'\beta ', 'Δ': r'\Delta ', 'Σ': r'\sum ', '∩': r'\cap ', '⌈': r'\lceil ', '⌉': r'\rceil ', '…': r'\ldots '}
WORD = r'(?<![a-zA-ZÀ-ž])(?:rouges?|red|bleue|blue|non|not|chess|puzzles|échecs|énigmes)(?![a-zA-ZÀ-ž])'   # words inside maths, translated


def text(s):
    return ''.join(SPECIAL.get(c, c) for c in s).replace('–', '--').replace('—', '---')


def _group(s, i, step):
    """Index past the bracketed group that starts (step=1) or ends (step=-1) at s[i]."""
    pairs = {'(': ')', '[': ']', '{': '}'} if step > 0 else {')': '(', ']': '[', '}': '{'}
    open_, close, depth = s[i], pairs[s[i]], 1; i += step
    while 0 <= i < len(s) and depth:
        depth += (s[i] == open_) - (s[i] == close); i += step
    return i


def _fractions(s):
    """a/b -> \\frac{a}{b}, taking the adjacent atom or bracketed group on each side, innermost first."""
    while '/' in s:
        i = s.index('/'); l = i - 1
        while l >= 0 and s[l] == ' ': l -= 1
        end = l + 1

        def left(pos):
            if pos >= 0 and s[pos] in ')]}':
                start = _group(s, pos, -1) + 1
                if start > 0 and s[start - 1] in '^_': return left(start - 2)
                return start - 1 if start > 0 and s[start - 1] in 'fPC' else start
            while pos >= 0 and (s[pos].isalnum() or s[pos] in '_!'): pos -= 1
            return pos + 1
        start = left(l); r = i + 1
        while r < len(s) and s[r] == ' ': r += 1
        ds = r
        if r < len(s) and s[r] in '([{': r = _group(s, r, 1)
        else:
            while r < len(s) and (s[r].isalnum() or s[r] == '_'): r += 1
            if r < len(s) and s[r] == '(': r = _group(s, r, 1)
            if r < len(s) and s[r] == '^':
                r += 1
                if r < len(s) and s[r] == '{': r = s.index('}', r) + 1
        if start == end or ds == r:
            s = s[:i] + r'\mathbin{/}' + s[i + 1:]; break
        a, b = s[start:end], s[ds:r]
        if a[:1] in '([' and a[-1:] in ')]': a = a[1:-1]
        if b[:1] in '([' and b[-1:] in ')]': b = b[1:-1]
        s = s[:start] + r'\frac{' + a + '}{' + b + '}' + s[r:]
    return s


TUPLE = re.compile(r'(?<![A-Za-z\\])([A-Z]?)\(([^()$;]+)\)')


def tuples(s, sep, protected=()):
    """Rewrite (a,b) and (a,b,c) inside one maths span. sep(parts) gives the replacement. A tuple is a point
    (A(2,1)) or a free-standing pair; a group after a digit, a subscript or superscript mark, a closing bracket or
    a membership sign is a product, an index or an interval and is left alone. Commas inside braces (\num{1,5})
    and the decimal tokens in protected belong to numbers, not to the tuple."""
    def one(m):
        point, inner = m[1], m[2]
        prev = s[:m.start()].rstrip()
        if not point and prev and (prev[-1].isdigit() or prev[-1] in '_^)]' or prev.endswith(('∈', '\\in'))): return m[0]
        hidden = inner
        for k, d in enumerate(sorted(protected, key=len, reverse=True)): hidden = re.sub(r'(?<![\d.,])' + re.escape(d) + r'(?![\d.,]?\d)', f'\x00{k}\x00', hidden)
        parts, depth, cur = [], 0, ''
        for c in hidden:
            depth += (c == '{') - (c == '}')
            if c == ',' and depth == 0: parts.append(cur); cur = ''
            else: cur += c
        parts.append(cur)
        if not 2 <= len(parts) <= 3 or not all(p.strip() for p in parts): return m[0]
        restore = lambda t: re.sub('\x00(\\d+)\x00', lambda r: sorted(protected, key=len, reverse=True)[int(r[1])], t)
        return point + sep([restore(p.strip()) for p in parts])
    return TUPLE.sub(one, s)


def web_tuples(fr, en):
    """The web editions print the JSON text: (a ; b) in French and (a, b) in English, decided exactly as for the
    PDFs (same tuple rule, decimals recognised by comparing the two languages)."""
    dec = decimals(fr, en)
    span = lambda text, sep: re.sub(r'\$[^$]*\$', lambda m: tuples(m[0], sep, dec), text)
    return span(fr, lambda p: '(' + ' ; '.join(p) + ')'), span(en, lambda p: '(' + ', '.join(p) + ')')


def math(s, decimal):
    s = s.replace('{', r'\{').replace('}', r'\}')   # braces in the data are set braces
    s = re.sub(WORD + ' ?', lambda m: r'\text{' + m[0] + '}', s)   # a following space stays in the text
    s = re.sub(r'(\d)\s+m(?=[^a-zA-Z]|$)', lambda m: m[1] + r'\,\mathrm{m}', s)
    s = ''.join(SYMBOLS.get(c, c) for c in s.strip())
    s = re.sub(r'\b(?:PGCD|gcd)\(', r'\\pgcd(', s)   # printed PGCD or gcd by the class
    s = re.sub(r'[²³⁰¹⁴⁵⁶⁷⁸⁹ⁿᵏᵐᵃᵇ⁺⁻]+', lambda m: '^{' + m[0].translate(SUP) + '}', s)
    s = re.sub(r'[₀-₉ₙₖ₊₋]+', lambda m: '_{' + m[0].translate(SUB) + '}', s).replace('′', "'")
    s = re.sub(r'√\(([^()]*)\)', lambda m: r'\sqrt{' + m[1] + '}', s)
    s = re.sub(r'√([a-zA-Z]|\d+)', lambda m: r'\sqrt{' + m[1] + '}', s)
    s = re.sub(r'(?<!\d)(?<!\d[.,])(\d+)([.,])(\d+)(?![.,]?\d)', lambda m: r'\num{' + m[1] + ',' + m[3] + '}' if m[0] in decimal else m[0], s)
    # Once decimals are \num, a comma left between parentheses separates the entries of a pair or triple: C(n,k) is a
    # binomial coefficient, other tuples (a point, a solution pair) are written (a ; b) in French and (a, b) in English.
    s = re.sub(r'(?<![A-Za-z\\])C\(([^(),]+),([^(),]+)\)', r'\\binom{\1}{\2}', s)
    s = tuples(s, lambda p: r'\pt{' + ';'.join(p) + '}')
    return notation.rewrite_maths(_fractions(s), 'fr')   # intervals [a ; b], points (a;b), sets {a;b}: notation commands


def prose(s, decimal=()):
    """JSON text to TeX: spans marked $...$ (Unicode maths) become TeX maths, the rest is escaped text. decimal: number
    tokens to print as decimals ('0,5' in French and '0.5' in English both become \\num{0,5}, printed per language by the
    class, mx-notation.sty); decimals and percentages in text become \\num and \\pc too."""
    parts = s.split('$')
    if len(parts) % 2 == 0: raise ValueError(f'unbalanced $ in {s!r}')
    dec = lambda t: notation.PCT.sub(lambda m: r'\pc{' + (m.group(1) or m.group(2)) + '}', re.sub(
        r'(?<!\d)(?<!\d[.,])(\d+)[.,](\d+)(?![.,]?\d)', lambda m: r'\num{' + m[1] + ',' + m[2] + '}' if m[0] in decimal else m[0], t))
    return ''.join('$' + math(x, decimal) + '$' if i % 2 else dec(text(x)) for i, x in enumerate(parts))


def decimals(fr, en):
    """Number tokens that are decimals: 'a,b' in French whose English twin writes 'a.b' (a pair such as (1,1) is
    written the same way in both languages and stays a pair)."""
    en_dec = set(re.findall(r'(?<!\d)(?<!\d[.,])\d+\.\d+(?![.,]?\d)', en))
    fr_dec = {x for x in re.findall(r'(?<!\d)(?<!\d[.,])\d+,\d+(?![.,]?\d)', fr) if x.replace(',', '.') in en_dec}
    return fr_dec | {x.replace(',', '.') for x in fr_dec}


# ---- units -------------------------------------------------------------------------------------------------------
FIGURES = {   # figure code is shared by both languages; words go in maths or node texts
    'complex-rotations': r'\begin{tikzpicture}[scale=.85]\draw[mxaxisline](-.5,0)--(3,0) node[right]{$x$};\draw[mxaxisline](0,-.5)--(0,3) node[above]{$y$};\draw[mxcurve](2,0)--(2,2)--(0,2)--(0,0)--cycle;\fill[mxink](1,1)circle(2pt)node[right]{$a=1+i$};\foreach \x/\y/\z in {2/0/2,2/2/2+2i,0/2/2i,0/0/0}{\fill[mxmint](\x,\y)circle(2pt)node[below left]{$\z$};}\end{tikzpicture}',
    'lattice-paths': r'\begin{tikzpicture}[scale=.85]\draw[mxline](0,0)grid(3,2);\draw[mxmint,very thick,->](0,0)--(1,0)--(1,1)--(2,1)--(3,1)--(3,2);\fill[mxink](1,1)circle(3pt)node[above left]{$\pt{1;1}$};\node[below]at(0,0){$\pt{0;0}$};\node[above]at(3,2){$\pt{3;2}$};\end{tikzpicture}',
    'bayes': r'\begin{tikzpicture}[x=1.6cm,y=.8cm]\draw[mxmint,thick](0,0)--(1,1)node[midway,above]{$\frac13$};\draw[mxmint,thick](0,0)--(1,-1)node[midway,below]{$\frac23$};\node at(1.2,1){$A$};\node at(1.2,-1){$B$};\draw[mxink,thick](1.5,1)--(3,1.5)node[midway,above]{$\frac34$};\draw[mxink,thick](1.5,-1)--(3,-.5)node[midway,above]{$\frac14$};\node[right]at(3,1.5){$A\cap R:\ \frac14$};\node[right]at(3,-.5){$B\cap R:\ \frac16$};\end{tikzpicture}',
    'euler-trails': r'\begin{tikzpicture}[scale=1.1]\draw[mxmint,thick](0,0)--(2,0)--(2,2)--(0,2)--cycle;\draw[mxink,thick](0,0)--(2,2);\foreach \x/\y/\z in {0/0/A,2/0/B,2/2/C,0/2/D}{\fill[mxmint](\x,\y)circle(2pt)node[above right]{$\z$};}\end{tikzpicture}',
}
CAPTIONS = {'bayes': ['Seules les branches conduisant à une boule rouge sont représentées.', 'Only branches leading to a red ball are shown.']}
HEADINGS = {'context': ['Données', 'Given information'], 'lesson': ['Idées et méthode', 'Ideas and method'],
            'activity': ['À explorer', 'Explore'], 'problem': ['Chercher, justifier, conclure', 'Investigate, justify, conclude']}


def unit(pack, kind, number):
    """(French unit, English text) of one workshop resource."""
    out = []
    for j in (0, 1):
        def P(field):   # one field of the pack in language j, with maths
            v = pack[field] if isinstance(field, str) else field
            return prose(v[j], decimals(v[0], v[1]))
        L = [r'\mxunit{enrichment-%s-%s}{%s}' % (pack['id'], kind, text(pack['title'][j])),
             r'\mxsubtitle{%s \textperiodcentered{} %s \textperiodcentered{} %02d}' % (text(pack['level'][j]), text(KINDS[kind][j]), number), '']
        box = lambda env, body, title=None: L.extend([r'\begin{%s}%s' % (env, '[' + title + ']' if title else ''), body, r'\end{%s}' % env, ''])
        if kind == 'notes':
            box('prerequisites', P('prerequisites'))
            box('keypoint', '\n\n'.join(P(x) for x in pack['lesson']), text(HEADINGS['lesson'][j]))
            box('example', P('worked'))
            if pack['id'] in FIGURES:
                L.extend([r'\begin{figurebox}%s' % ('[' + text(CAPTIONS[pack['id']][j]) + ']' if pack['id'] in CAPTIONS else ''),
                          FIGURES[pack['id']], r'\end{figurebox}', ''])
            box('activity', P('activity'), text(HEADINGS['activity'][j]))
            out.append('\n'.join(L)); continue
        if kind in ('exercises', 'solutions') and pack.get('exerciseContext'):
            box('note', r'\textbf{%s.} ' % text(HEADINGS['context'][j]) + P('exerciseContext'))
        if kind in ('exercises', 'solutions'):
            for x in pack['exercises']:
                box('exercise', P(x['q']))
                if kind == 'solutions': L[-1:-1] = [r'\begin{solution}', P(x['a']), r'\end{solution}']
        if kind in ('problems', 'solutions'):
            if pack.get('problemContext'): box('note', r'\textbf{%s.} ' % text(HEADINGS['context'][j]) + P('problemContext'))
            box('problem', P('problem'), text(HEADINGS['problem'][j]))
            if kind == 'solutions': L[-1:-1] = [r'\begin{solution}', P('solution'), r'\end{solution}']
        out.append('\n'.join(L))
    return out


def stems():
    packs = json.loads(DATA.read_text())
    return packs, [f"{p['id']}-{k}" for p in packs for k in KINDS]


HEADER = '% GENERATED from content/data/enrichment.json by mxbuild.enrichment; do not edit.\n'


def generate(check=False):
    """Write the units, tables and English units from the JSON (check: only report the files that would change);
    returns the list of problems (empty when all align and, with check, all files are current)."""
    packs, _ = stems(); problems = []
    for n, p in enumerate(packs, 1):
        for kind in KINDS:
            stem = f"{p['id']}-{kind}"; fr = SRC / f'{stem}.fr.tex'
            fr_text, en_text = (HEADER + t + '\n' for t in unit(p, kind, n))
            try:
                pairs = twin.align(fr_text, en_text)
            except twin.TwinError as e:
                problems.append(f'{stem}: {e}'); continue
            # the JSON holds the translation: the table is rebuilt from the aligned pairs
            table = {'unit': fr.name, 'segments': {}}
            for order, (f, e) in enumerate(pairs):
                table['segments'].setdefault(twin.seg_id(f), {'fr': f, 'en': e, 'status': 'aligned', 'order': order})
            table_text = json.dumps(table, ensure_ascii=False, indent=1) + '\n'
            if check:
                if not fr.exists() or fr.read_text() != fr_text or twin.table_path(fr).read_text() != table_text:
                    problems.append(f'{stem}: stale (run `python -m mxbuild enrichment`)')
                continue
            fr.write_text(fr_text); twin.table_path(fr).write_text(table_text)
            twin.en_path(fr).write_text(twin.generate(fr_text, table))
    return problems


def book():
    """Write the book spec into the manifest when it changed: solutions are teacher units (teacher edition only)."""
    _, units = stems(); m = catalog.load()
    spec = {'layout': 'sheet', 'sections': 'unnumbered', 'units': [u for u in units if not u.endswith('-solutions')] + EXTRA,
            'teacherUnits': [u for u in units if u.endswith('-solutions')]}
    if m.get('books', {}).get('enrichment') != spec:
        m.setdefault('books', {})['enrichment'] = spec; catalog.save(m)
    return spec


def build():
    """Compile both editions in both languages and split them into one PDF per unit (student edition for the
    student units, teacher edition for the solutions); returns {stem: [fr pages, en pages]}."""
    import pymupdf
    spec = book(); pages = {}
    mains = books.write_mains('enrichment', BUILD / 'mains', str(ROOT / 'content/tex/core'))
    for entry, wanted in (('eleve', spec['units']), ('professeur', spec['teacherUnits'])):
        pair = tex.compile_pair(SRC, {'fr': str(mains[entry]), 'en': str(mains[entry + '-en'])},
                                {'fr': f'enrichment-{entry}', 'en': f'enrichment-{entry}-en'}, BUILD)
        for lang, suffix in (('fr', ''), ('en', '-en')):
            r = pair[lang].report(f'enrichment-{entry}{suffix}')
            d = pymupdf.open(r.pdf); toc = [(t, p - 1) for l, t, p in d.get_toc() if l == 1]
            stems_ = spec['units'] + (spec['teacherUnits'] if entry == 'professeur' else [])
            if len(toc) != len(stems_): sys.exit(f'{r.pdf.name}: {len(toc)} units in the bookmarks, {len(stems_)} expected')
            starts = [p for _, p in toc] + [len(d)]
            for k, stem in enumerate(stems_):
                if stem not in wanted: continue
                # Book pages carry the book's sheet counter; the native excerpt frame restarts it at 1 / N.
                out = pdf.excerpt(d, starts[k], starts[k + 1], lang)
                out.set_metadata({'title': toc[k][0], 'author': 'Maths Explorer'}); out.subset_fonts()
                target = (DIST / 'resources' if stem in EXTRA else DIST / 'resources/enrichment') / f'{stem}{suffix}.pdf'
                target.parent.mkdir(parents=True, exist_ok=True); out.save(target, garbage=4, deflate=True)
                pages.setdefault(stem, []).append(len(out))
    unequal = {s: p for s, p in pages.items() if p[0] != p[1]}
    if unequal: sys.exit(f'French and English page counts differ: {unequal}')
    return pages


def main(argv):
    problems = generate(check='--check' in argv)
    if problems: print('\n'.join(problems)); return 1
    if '--check' in argv: print('enrichment: units up to date'); return 0
    if '--no-pdf' not in argv:
        pages = build(); print(f'enrichment: {len(pages)} units, {sum(p[0] for p in pages.values())} pages per language')
    return 0
