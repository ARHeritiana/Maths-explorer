"""Extract classroom slide decks (French + English) from the bilingual LaTeX sources.

Premiere (C01-C10), Seconde (S01-S15) and STMG (chapitres/01-08) are parsed from content/latex;
decks are written to dist/slides/data/<chapter id>.json and indexed in dist/slides/data/index.json.
Teacher-only material (solutions boxes, \\enseignant, \\prof, fluency drills) is never included.
Hand-authored decks (content/slides/*.json) are merged into the index unchanged.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'content/latex'
OUT = ROOT / 'dist/slides/data'
CATALOG = json.loads((ROOT / 'dist/resources/catalog.json').read_text())
CH = {c['id']: c for c in CATALOG['chapters']}


# ---------------------------------------------------------------- LaTeX helpers
def group(s, i):
    """s[i] == '{': return (content, index after the closing brace)."""
    assert s[i] == '{', s[i:i + 30]
    d = 0; j = i
    while j < len(s):
        c = s[j]
        if c == '\\': j += 2; continue
        if c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return s[i + 1:j], j + 1
        j += 1
    raise ValueError('unbalanced group near ' + s[i:i + 40])


def skip_ws(s, i):
    while i < len(s) and s[i] in ' \t\n': i += 1
    return i


def opt(s, i):
    i2 = skip_ws(s, i)
    if i2 < len(s) and s[i2] == '[':
        j = s.index(']', i2); return s[i2 + 1:j], j + 1
    return None, i


def args(s, i, n):
    out = []
    for _ in range(n):
        i = skip_ws(s, i); g, i = group(s, i); out.append(g)
    return out, i


def env_end(s, i, name):
    """index of the matching \\end{name} for a \\begin{name} whose body starts at i."""
    d = 1; pat = re.compile(r'\\(begin|end)\{%s\}' % re.escape(name))
    for m in pat.finditer(s, i):
        d += 1 if m.group(1) == 'begin' else -1
        if d == 0: return m.start(), m.end()
    raise ValueError('missing \\end{%s}' % name)


def strip_comments(s): return re.sub(r'(?<!\\)%.*', '', s)


MATH = re.compile(r'\$\$.*?\$\$|\\\[.*?\\\]|\$[^$]*\$|\\begin\{(?:align\*?|equation\*?|gather\*?)\}.*?\\end\{(?:align\*?|equation\*?|gather\*?)\}', re.S)


def esc(t): return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def text2html(t):
    """LaTeX fragment -> small HTML subset; maths is passed to MathJax as \\( \\) / \\[ \\]."""
    t = re.sub(r'\\figtok\{(\d+)\}', r'@@FIG\1@@', strip_comments(t))
    parts = []; last = 0
    for m in MATH.finditer(t):
        parts.append(('t', t[last:m.start()])); m_ = m.group(0)
        if m_.startswith('$$'): parts.append(('m', '\\[' + m_[2:-2] + '\\]'))
        elif m_.startswith('$'): parts.append(('m', '\\(' + m_[1:-1] + '\\)'))
        elif m_.startswith('\\['): parts.append(('m', m_))
        else:
            body = re.sub(r'\\begin\{(align|gather|equation)\*?\}|\\end\{(align|gather|equation)\*?\}', '', m_)
            parts.append(('m', '\\[\\begin{aligned}' + body.replace('&', '&') + '\\end{aligned}\\]' if 'align' in m_ else '\\[' + body + '\\]'))
        last = m.end()
    parts.append(('t', t[last:]))
    out = []
    for kind, s in parts:
        out.append(esc(s) if kind == 'm' else prose(s))
    h = ''.join(out)
    return re.sub(r'(<br>\s*){3,}', '<br><br>', h).strip()


def prose(s):
    s = re.sub(r'\\begin\{(itemize|enumerate)\}(\[[^\]]*\])?', lambda m: '<ul>' if m[1] == 'itemize' else '<ol>', s)
    s = re.sub(r'\\end\{(itemize|enumerate)\}', lambda m: '</ul>' if m[1] == 'itemize' else '</ol>', s)
    s = re.sub(r'\\item(\[[^\]]*\])?\s*', '<li>', s)
    s = s.replace('\\\\', '<br>').replace('\\par', '<br><br>').replace('\n\n', '<br><br>')
    for _ in range(3):
        s = re.sub(r'\\(?:textbf|boldsymbol)\{([^{}]*)\}', r'<b>\1</b>', s)
        s = re.sub(r'\\(?:emph|textit|textsl)\{([^{}]*)\}', r'<i>\1</i>', s)
        s = re.sub(r'\\(?:texttt|code)\{([^{}]*)\}', r'<code>\1</code>', s)
        s = re.sub(r'\\underline\{([^{}]*)\}', r'<u>\1</u>', s)
        s = re.sub(r'\\textsuperscript\{([^{}]*)\}', r'<sup>\1</sup>', s)
    s = re.sub(r'\\(?:label|index|vspace\*?|hspace\*?|Needspace\*?|needspace|phantomsection|medskip|smallskip|bigskip|noindent|clearpage|newpage|centering|small|footnotesize|large|Large|normalsize|raggedright|hfill|dotfill|quad|qquad)(\{[^{}]*\})?', ' ', s)
    s = re.sub(r'\\(?:paragraph|subsubsection|subsection)\*?\{([^{}]*)\}', r'<b>\1</b> ', s)
    s = re.sub(r'\\url\{([^{}]*)\}', r'\1', s)
    s = s.replace('``', '“').replace("''", '”').replace('---', '—').replace('--', '–').replace('\\%', '%').replace('\\&', '&amp;').replace('\\_', '_').replace('\\#', '#')
    s = s.replace('~', '\u00a0').replace('\\ ', ' ').replace('\\,', '\u202f').replace('\\;', ' ').replace('\\ldots', '…').replace('\\dots', '…')
    s = s.replace('\\og', '«\u00a0').replace('\\fg', '\u00a0»').replace('\\textbackslash', '\\')
    s = re.sub(r'\\(?:textrm|mbox)\{([^{}]*)\}', r'\1', s)
    s = re.sub(r'\\[a-zA-Z]+\*?\{([^{}]*)\}', r'\1', s)       # unknown one-argument macros: keep the text
    s = re.sub(r'\\[a-zA-Z]+\*?', '', s)
    s = s.replace('{', '').replace('}', '').replace('&', '&amp;') if False else s.replace('{', '').replace('}', '')
    s = s.replace('<br>\u00a0', '<br>')
    return esc_keep(s)


def esc_keep(s):
    # escape bare < > & that are not part of our tags
    s = re.sub(r'&(?!amp;|lt;|gt;)', '&amp;', s)
    s = re.sub(r'<(?!/?(?:b|i|u|code|sup|br|ul|ol|li)>)', '&lt;', s)
    s = re.sub(r'(?<!<br)(?<!<b)(?<!<i)(?<!<u)(?<!<li)(?<!<ul)(?<!<ol)(?<!</b)(?<!</i)(?<!</u)(?<!</sup)(?<!<sup)(?<!<code)(?<!</code)(?<!</ul)(?<!</ol)>', '&gt;', s)
    return s


def clean_residue(h):
    """Drop figure code (TikZ/pgfplots) that leaked into prose when a figure sat inside the notes."""
    h = re.sub(r'(?:<br><br>\s*)?center\s*tikzpicture.*?tikzpicture(?:<br><br>)?', ' ', h, flags=re.S)
    h = re.sub(r'center(?:<br><br>)?\s*$', '', h)
    return re.sub(r'(<br>\s*){3,}', '<br><br>', h).strip()


def attach(out, n):
    """A figure outside any box belongs to the slide just produced."""
    if out: out[-1]['b'] = out[-1]['b'] + ' @@FIG%s@@' % n


def code_html(body): return esc(body.strip('\n'))


# ---------------------------------------------------------------- walkers
TEACHER_ENVS = {'correction', 'prerequis', 'automatismes', 'sortie', 'dm', 'manuel', 'exercice', 'exercicecal', 'probleme'}


def walk(s, handlers):
    """Yield events in order: ('cmd', name, args, opt) or ('env', name, body, opt)."""
    s = strip_comments(s); i = 0; ev = []
    while True:
        j = s.find('\\', i)
        if j < 0: break
        m = re.match(r'\\([a-zA-Z]+)\*?', s[j:])
        if not m: i = j + 2; continue
        name = m.group(1); k = j + m.end()
        if name == 'begin':
            ename, k2 = group(s, k); o, k3 = opt(s, k2)
            if ename == 'lstlisting':
                e0 = s.index('\\end{lstlisting}', k3); ev.append(('code', ename, s[k3:e0], None)); i = e0 + len('\\end{lstlisting}'); continue
            e0, e1 = env_end(s, k3 if o is None else k3, ename)
            if ename in handlers: ev.append(('env', ename, s[k3:e0], o))
            i = e1 if (ename in handlers or ename in TEACHER_ENVS or ename in ('tikzpicture', 'axis', 'tabular', 'center', 'itemize', 'enumerate', 'multicols')) else k3
            if ename in ('center', 'multicols'): i = k3
            continue
        n = handlers.get(name)
        if n is None: i = k; continue
        o, k2 = opt(s, k)
        try: a, k3 = args(s, k2, n)
        except Exception: i = k; continue
        ev.append(('cmd', name, a, o)); i = k3
    return ev


def clean_title(t):
    t = text2html(t); return re.sub(r'<[^>]+>', '', t).replace('&amp;', '&').strip()


def slide(kind, title, body, ans=None, h=None): return {'k': kind, 't': title, 'b': body, 'a': ans, 'h': h}



# ---------------------------------------------------------------- figures
FIGRE = re.compile(r'(?:\\begin\{center\}\s*)?\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}(?:\s*\\end\{center\})?|\\input\{figures/[^}]+\}', re.S)


def extract_figs(src):
    """Replace every figure (TikZ/pgfplots picture or \\input of a figure file) by \\figtok{n}; return (source, [code])."""
    figs = []
    def rep(m): figs.append(m.group(0)); return '\\figtok{%d}' % len(figs)
    return FIGRE.sub(rep, strip_comments(src)), figs


def fig_tokens(h):
    """Pull @@FIGn@@ markers out of an HTML body: returns (html without markers, [n...])."""
    nums = [int(x) for x in re.findall(r'@@FIG(\d+)@@', h)]
    return re.sub(r'(?:<br>\s*)*@@FIG\d+@@(?:\s*<br>)*', ' ', h).strip(), nums


PREAMBLE = {  # course -> (main file for language, flags prepended before \documentclass)
    'seconde': ({'fr': 'livret.tex', 'en': 'livret-en.tex'}, '\\def\\VERSIONPROF{1}'),
    'premiere': ({'fr': 'main.tex', 'en': 'main-en.tex'}, '\\def\\versionprof{1}'),
    'stmg': ({'fr': 'livret-tstmg.tex', 'en': 'livret-tstmg-en.tex'}, '\\def\\EditionProf{true}'),
    'terminale': ({'fr': 'livret.tex', 'en': 'livret-en.tex'}, ''),
}


def compile_figs(course, lang, jobs):
    """jobs: [(deck, n, code)] -> writes dist/slides/fig/<deck>-<n>[-en].svg; returns the set of (deck, n) that rendered."""
    import subprocess, pymupdf
    if not jobs: return set()
    base = SRC / course; main, flags = PREAMBLE[course]; head = (base / main[lang]).read_text(encoding='utf8').split('\\begin{document}')[0]
    build = ROOT / 'build/tex/figs'; build.mkdir(parents=True, exist_ok=True)
    figdir = OUT.parent / 'fig'; figdir.mkdir(parents=True, exist_ok=True)
    done = set()
    def run(items, job):
        body = '\n'.join('\\begin{preview}%s\\end{preview}' % code for _, _, code in items)
        tex = flags + head + '\\usepackage[active,tightpage]{preview}\\setlength\\PreviewBorder{5pt}\\pagestyle{empty}\\begin{document}\n' + body + '\n\\end{document}\n'
        (base / (job + '.tex')).write_text(tex, encoding='utf8')
        r = subprocess.run(['pdflatex', '-no-shell-escape', '-interaction=nonstopmode', '-output-directory=' + str(build), job + '.tex'], cwd=base, capture_output=True, text=True, errors='replace')
        (base / (job + '.tex')).unlink()
        pdf = build / (job + '.pdf')
        return pdf if pdf.exists() else None
    pdf = run(jobs, f'_figs_{lang}')
    d = pymupdf.open(pdf) if pdf else None
    ok = d is not None and len(d) == len(jobs)
    if not ok:    # isolate failing figures: compile one by one
        print(f'  {course} {lang}: batch failed, compiling figures one by one')
        pages = []
        for it in jobs:
            p1 = run([it], f'_fig1_{lang}')
            pages.append((it, pymupdf.open(p1) if p1 else None))
    else: pages = [(it, None) for it in jobs]
    for k, (it, one) in enumerate(pages):
        deck, n, _ = it
        try:
            page = (one[0] if one is not None and len(one) else None) if not ok else d[k]
            if page is None: print('  figure failed:', deck, n); continue
            svg = page.get_svg_image(text_as_path=True)
            (figdir / f'{deck}-{n}{"-en" if lang == "en" else ""}.svg').write_text(svg, encoding='utf8'); done.add((deck, n))
        except Exception as e: print('  figure failed:', deck, n, e)
    return done


# ---------------------------------------------------------------- per-course extractors (return list of slides, flat)
def premiere(src, number):
    H = {'chapter': 1, 'section': 1, 'exemple': 1, 'application': 1, 'repere': 0, 'erreur': 0, 'preuve': 1}
    ev = walk(src, {'chapter': 1, 'section': 1, 'exemple': 1, 'application': 1, 'preuve': 1, 'repere': 0, 'erreur': 0, 'figtok': 1})
    out = []; unit = None; skip = False
    for kind, name, a, o in ev:
        if name == 'figtok': attach(out, a[0]); continue
        if name == 'chapter': out.append(slide('title', clean_title(a[0]), '', None))
        elif name == 'section': unit = clean_title(a[0]); skip = bool(re.match(r'(MCQ|QCM|Diagnostic)', unit))
        elif skip and kind != 'cmd' or skip and name in ('exemple', 'application', 'preuve'): continue
        elif kind == 'env' and name == 'repere':
            body = a.lstrip()
            rt = ''
            if body.startswith('{'): rt, k = group(body, 0); body = body[k:]
            if unit is None: out.append(slide('goals', clean_title(rt), text2html(body)))
            else: out.append(slide('concept', unit, text2html(body)))
        elif name == 'exemple' and unit: out.append(slide('example', unit, text2html(a[0])))
        elif kind == 'env' and name == 'erreur' and unit: out.append(slide('error', unit, text2html(a)))
        elif name == 'application' and unit: out.append(slide('try', unit, text2html(a[0])))
        elif name == 'preuve' and unit: out.append(slide('proof', unit, text2html(a[0])))
    return out


def seconde(src, number):
    ev = walk(src, {'sequence': 3, 'section': 1, 'fiche': 1, 'cours': 0, 'methode': 0, 'ex': 1, 'reponse': 1, 'preuve': 1, 'vigilance': 1, 'figtok': 1})
    out = []; unit = ''
    pending = None
    for kind, name, a, o in ev:
        if name == 'figtok': attach(out, a[0]); continue
        if name == 'sequence': out.append(slide('title', clean_title(a[0]), ''))
        elif name in ('section', 'fiche'): unit = clean_title(a[0])
        elif kind == 'env' and name == 'cours': out.append(slide('concept', unit, text2html(a), None, clean_title(o) if o else None))
        elif kind == 'env' and name == 'methode': out.append(slide('method', unit, text2html(a), None, clean_title(o) if o else None))
        elif kind == 'code': out.append(slide('code', 'Python', esc(a.strip('\n'))))
        elif name == 'ex':
            pending = slide('example', unit, text2html(a[0])); out.append(pending)
        elif name == 'preuve':
            pending = slide('proof', unit, text2html(a[0])); out.append(pending)
        elif name == 'reponse':
            if pending is not None and pending['a'] is None: pending['a'] = text2html(a[0])
        elif name == 'vigilance': out.append(slide('error', unit, text2html(a[0])))
    return out


def seconde_fix(src):
    # \ex[opt]{body}: the optional argument is a title; \ex takes 1 mandatory arg after the optional one
    return src


def stmg(src, number):
    ev = walk(src, {'chapter': 1, 'section': 1, 'sessionheader': 5, 'objectifs': 0, 'activite': 0, 'traceecrite': 0, 'methode': 0, 'exemple': 0, 'erreur': 0, 'retenir': 0, 'figtok': 1})
    out = []; unit = ''
    for kind, name, a, o in ev:
        if name == 'chapter': out.append(slide('title', clean_title(a[0]), ''))
        elif name == 'section': unit = clean_title(a[0])
        elif name == 'sessionheader': unit = clean_title(a[3])
        elif kind == 'env' and name == 'objectifs': out.append(slide('goals', unit, text2html(a)))
        elif kind == 'env' and name == 'activite': out.append(slide('activity', unit, text2html(a)))
        elif kind == 'env' and name == 'traceecrite': out.append(slide('concept', unit, text2html(a)))
        elif kind == 'env' and name == 'retenir': out.append(slide('concept', unit, text2html(a)))
        elif kind == 'env' and name == 'methode': out.append(slide('method', unit, text2html(a)))
        elif kind == 'env' and name == 'exemple': out.append(slide('example', unit, text2html(a)))
        elif kind == 'env' and name == 'erreur': out.append(slide('error', unit, text2html(a)))
    return out


# ---------------------------------------------------------------- driver
WTEXT = {
    'line': (['Droites : deux points', 'Lines from two points'], ['Déplacez A et B. Observez le vecteur directeur, la pente et les équations.', 'Drag A and B. Watch the direction vector, the slope and the equations.']),
    'quad': (['Trinôme : forme canonique', 'Quadratic: canonical form'], ['Déplacez le sommet S ; tirez le point orange pour changer a. Lisez f, Δ et les racines.', 'Drag the vertex S; pull the orange point to change a. Read f, Δ and the roots.']),
    'fn': (['Fonction à explorer', 'Function explorer'], ['Choisissez le modèle, puis déplacez les points pour lire paramètres et propriétés.', 'Pick the model, then drag the points to read parameters and properties.']),
    'seq': (['Suites : premiers termes', 'Sequences: first terms'], ['Déplacez u₀ et u₁ : la raison et la formule se mettent à jour.', 'Drag u₀ and u₁: the common difference or ratio and the formula update.']),
    'vec': (['Vecteurs : trois points', 'Vectors: three points'], ['Déplacez A, B, C. Testez colinéarité et orthogonalité.', 'Drag A, B, C. Test collinearity and orthogonality.']),
    'tangent': (['Sécante et tangente', 'Secant and tangent'], ['Déplacez M ; rapprochez N de M : la pente de la sécante tend vers f′(a).', 'Drag M; bring N close to M: the secant slope tends to f′(a).']),
    'circle': (['Cercle trigonométrique', 'The unit circle'], ['Déplacez M sur le cercle : cos, sin et la mesure en radians.', 'Drag M around the circle: cos, sin and the measure in radians.']),
    'scatter': (['Nuage et droite de régression', 'Scatter plot and regression line'], ['Déplacez les points : la droite et le coefficient r se recalculent.', 'Drag the points: the line and the coefficient r are recomputed.']),
    'tree': (['Arbre pondéré', 'Weighted tree'], ['Réglez P(A), P_A(B) et P_Ā(B) : les probabilités des chemins s’affichent.', 'Set P(A), P_A(B) and P_Ā(B): path probabilities appear.']),
    'binom': (['Loi binomiale', 'Binomial distribution'], ['Déplacez p, changez n : l’espérance et la variance suivent.', 'Drag p, change n: expectation and variance follow.']),
    'rv': (['Loi d’une variable aléatoire', 'Distribution of a random variable'], ['Modifiez la hauteur des barres : E(X) et V(X) se recalculent.', 'Change the bar heights: E(X) and V(X) are recomputed.']),
    'stats': (['Série statistique', 'A data set'], ['Déplacez les valeurs : moyenne, médiane et quartiles réagissent.', 'Drag the values: mean, median and quartiles react.']),
    'pct': (['Évolutions successives', 'Successive changes'], ['Réglez deux taux : le coefficient global n’est pas la somme.', 'Set two rates: the overall multiplier is not the sum.']),
    'ref': (['Fonctions de référence', 'Reference functions'], ['Choisissez une fonction, déplacez M : image et antécédents.', 'Choose a function, drag M: image and preimages.']),
    'interval': (['Intervalles', 'Intervals'], ['Déplacez les bornes de I et J : intersection et réunion.', 'Drag the ends of I and J: intersection and union.']),
    'plane3d': (['Plan et projeté orthogonal', 'A plane and an orthogonal projection'], ['Déplacez M (ombre au sol, hauteur) et réglez d. Faites tourner la vue.', 'Drag M (floor shadow, height) and set d. Rotate the view.']),
    'line3d': (['Droite de l’espace', 'A line in space'], ['Déplacez A et B ; réglez t : équations paramétriques.', 'Drag A and B; set t: parametric equations.']),
    'integral': (['Aire sous la courbe', 'Area under the curve'], ['Déplacez les bornes a et b, augmentez n : la somme de Riemann tend vers l’intégrale.', 'Drag the bounds a and b, increase n: the Riemann sum tends to the integral.']),
    'surface3d': (['Surface z = f(x ; y)', 'Surface z = f(x, y)'], ['Déplacez le point au sol ; faites tourner la surface.', 'Drag the floor point; rotate the surface.']),
}
# (deck id) -> [(regex on the unit title, widget spec)]: the widget slide is inserted after that unit
WIDGETS = {
    'premiere-01': [(r'Geometric sequences', {'type': 'seq'})], 'premiere-02': [(r'Three forms', {'type': 'quad'})],
    'premiere-03': [(r'Coordinates, norm', {'type': 'vec'})], 'premiere-04': [(r'Tangent and affine', {'type': 'tangent'})],
    'premiere-05': [(r'Trees, partitions', {'type': 'tree'})], 'premiere-07': [(r'Normal vector', {'type': 'vec'})],
    'premiere-08': [(r'Variable, event', {'type': 'rv'})], 'premiere-09': [(r'Defining a new function', {'type': 'fn', 'mode': 'exp', 'modes': ['exp']})],
    'premiere-10': [(r'Wrapping', {'type': 'circle'})],
    'seconde-02': [(r'Collinearity and determinant', {'type': 'vec', 'noDot': True})], 'seconde-03': [(r'Slope-intercept', {'type': 'line'})],
    'seconde-04': [(r'Intervals of the real line', {'type': 'interval'})], 'seconde-06': [(r'Square and inverse', {'type': 'ref'})],
    'seconde-07': [(r'Quartiles and box plot', {'type': 'stats'})], 'seconde-09': [(r'Successive changes', {'type': 'pct'})],
    'seconde-10': [(r'Variations of the square', {'type': 'ref'})], 'seconde-12': [(r'Comparing a vector', {'type': 'vec', 'noDot': True})],
    'seconde-14': [(r'Weighted trees', {'type': 'tree'})],
    'stmg-01': [(r'Geometric sequences: recognising', {'type': 'seq'})], 'stmg-02': [(r'Functions .*k a\^x|Definition and direction', {'type': 'fn', 'mode': 'exp', 'modes': ['exp']})],
    'stmg-03': [(r'Variations and graph', {'type': 'fn', 'mode': 'log', 'modes': ['log']})], 'stmg-04': [(r'Definition and graph of the reciprocal', {'type': 'fn', 'mode': 'inv', 'modes': ['inv']})],
    'stmg-05': [(r'Linear regression', {'type': 'scatter'})], 'stmg-06': [(r'Weighted trees', {'type': 'tree'})],
    'stmg-07': [(r'Binomial distribution: recognising', {'type': 'binom'})],
    'terminale-01': [(r'^Defining a sequence', {'type': 'seq'})], 'terminale-02': [(r'^Vector calculus', {'type': 'line3d'})],
    'terminale-03': [(r'^Course notes', {'type': 'seq'})], 'terminale-06': [(r'^Convexity', {'type': 'tangent'})],
    'terminale-07': [(r'^Reminders', {'type': 'tree'})], 'terminale-09': [(r'^Line, plane and normal', {'type': 'plane3d', 'normal': [1, 1, 2]})],
    'terminale-12': [(r'^Sums and transformations', {'type': 'rv'})], 'terminale-13': [(r'^Parametric lines', {'type': 'line3d'})],
    'terminale-14': [(r'^Circle and functions', {'type': 'circle'})], 'terminale-11': [(r'^Area and antiderivative', {'type': 'integral'})],
}


def add_widgets(cid, slides):
    for rx, spec in WIDGETS.get(cid, []):
        idx = [i for i, s in enumerate(slides) if re.search(rx, s['t'][1])]
        if not idx: print('  no unit for widget', cid, rx); continue
        j = idx[0]
        while j + 1 < len(slides) and slides[j + 1]['t'] == slides[idx[0]]['t']: j += 1
        t, b = WTEXT[spec['type']]
        slides.insert(j + 1, {'k': 'widget', 't': t, 'b': b, 'w': spec})
    return slides


def files():
    for n in range(1, 11):
        yield f'premiere-{n:02d}', 'premiere', n, SRC / f'premiere/chapitres/C{n:02d}.tex', SRC / f'premiere/chapitres/C{n:02d}-en.tex', premiere
    for n in range(1, 16):
        yield f'seconde-{n:02d}', 'seconde', n, SRC / f'seconde/sequences/S{n:02d}.tex', SRC / f'seconde/sequences/S{n:02d}-en.tex', seconde
    names = ['01-suites', '02-exponentielles', '03-logarithme', '04-inverse', '05-statistiques', '06-conditionnelles', '07-binomiale', '08-revisions']
    for n, nm in enumerate(names, 1):
        yield f'stmg-{n:02d}', 'stmg', n, SRC / f'stmg/chapitres/{nm}.tex', SRC / f'stmg/chapitres/{nm}-en.tex', stmg


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob('*.json'): old.unlink()
    index = []; problems = []; decks = {}; jobs = {}
    for cid, course, n, fr, en, fn in files():
        if not fr.exists() or not en.exists(): problems.append('missing ' + cid); continue
        sf, figs_f = extract_figs(fr.read_text(encoding='utf8')); se, figs_e = extract_figs(en.read_text(encoding='utf8'))
        a = fn(sf, n); b = fn(se, n)
        if [x['k'] for x in a] != [x['k'] for x in b]: problems.append(f'{cid}: slide structure differs ({len(a)} vs {len(b)})'); continue
        slides = []
        for x, y in zip(a, b):
            bf, nf = fig_tokens(x['b']); be, ne = fig_tokens(y['b'])
            if len(nf) != len(ne): problems.append(f'{cid}: figure count differs on a slide'); nf = ne = []
            x['b'], y['b'] = bf, be
            sl = {'k': x['k'], 't': [x['t'], y['t']], 'b': [x['b'], y['b']], **({'a': [x['a'], y['a']]} if x['a'] else {}), **({'h': [x['h'], y['h']]} if x['h'] else {})}
            if nf: sl['f'] = [[p_, q_] for p_, q_ in zip(nf, ne)]
            slides.append(sl)
        slides = add_widgets(cid, slides)
        decks[cid] = {'course': course, 'number': n, 'slides': slides, 'kind': 'extracted'}
        for lang, figs in (('fr', figs_f), ('en', figs_e)):
            for sl in slides:
                for pf, pe in sl.get('f', []):
                    k = pf if lang == 'fr' else pe; jobs.setdefault((course, lang), []).append((cid, k, figs[k - 1]))
    for p in sorted((ROOT / 'content/slides').glob('*.json')) if (ROOT / 'content/slides').exists() else []:
        d = json.loads(p.read_text(encoding='utf8')); d['slides'] = add_widgets(d['id'], d['slides']); d['kind'] = 'authored'; decks[d['id']] = d
        # figures of authored decks come from the French draft, aligned by slide index
        dr = ROOT / 'content/slides/draft' / (d['id'] + '.fr.json')
        if dr.exists():
            draft = json.loads(dr.read_text(encoding='utf8'))
            for sl, ds in zip([s for s in d['slides'] if s['k'] != 'widget'], draft['slides']):
                if ds.get('f'): sl['f'] = ds['f']
            for lang in ('fr', 'en'):
                for sl in d['slides']:
                    for pf, pe in sl.get('f', []):
                        k = pf if lang == 'fr' else pe; jobs.setdefault(('terminale', lang), []).append((d['id'], k, draft['figs' if lang == 'fr' else 'figs_en'][k - 1]))
    rendered = {}
    for (course, lang), js in jobs.items():
        print(f'figures {course} {lang}: {len(js)}'); rendered[(course, lang)] = compile_figs(course, lang, js)
    for cid, d in decks.items():
        course = d['course']
        for sl in d['slides']:
            if 'f' in sl:
                sl['f'] = [[pf, pe] for pf, pe in sl['f'] if (cid, pf) in rendered.get((course, 'fr'), set()) and (cid, pe) in rendered.get((course, 'en'), set())]
                if not sl['f']: del sl['f']
        title = CH[cid]['title'] if cid in CH else d['title']
        deck = {'id': cid, 'course': course, 'number': d['number'], 'title': title, 'slides': d['slides']}
        (OUT / (cid + '.json')).write_text(json.dumps(deck, ensure_ascii=False, separators=(',', ':')))
        index.append({'id': cid, 'course': course, 'number': d['number'], 'title': title, 'slides': len(d['slides']), 'kind': d['kind']})
    (OUT / 'index.json').write_text(json.dumps(index, ensure_ascii=False, indent=1))
    print(f'{len(index)} decks, {sum(i["slides"] for i in index)} slides, {sum(1 for d in decks.values() for s in d["slides"] if "f" in s)} slides with figures')
    if problems: print('PROBLEMS:\n' + '\n'.join(problems)); sys.exit(1)


if __name__ == '__main__': main()
