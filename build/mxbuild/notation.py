"""Notation shared by French and English: the web side of content/tex/core/mx-notation.sty.

The class prints \\num, \\pc, \\intff/\\intoo/\\intfo/\\intof, \\ent, \\pt, \\ens, \\pgcd and \\ppcm in the convention of
the edition's language. This module
  - expand(tex, lang): renders the same commands as plain TeX for MathJax (slides), with the same conventions;
    tests/test_notation.py compiles every command with the class and compares;
  - rewrite(text, lang): turns hand-written notation in a unit (0{,}5, 12\\,500, 50\\,\\%, ]0;+\\infty[, A(1;2),
    \\{1;2\\}) into those commands (`python -m mxbuild notation --migrate`); the English rewrite reads the generated
    English unit (0.5) so that both sides align again;
  - mathjax(): the slide player's MathJax macro table, generated from the \\mxmathmacro lines of mx-math.sty and
    written into site/slides/player.html (`python -m mxbuild notation`, `--check` in make check).
"""
import json, re, sys
from . import ROOT, twin

CORE = ROOT / 'content/tex/core'
PLAYER = ROOT / 'site/slides/player.html'
SEP = {'fr': ';', 'en': ','}


# ---- rendering for MathJax (mirror of mx-notation.sty) ------------------------------------------------------------
def _group(n, sep):
    return re.sub(r'(?<=\d)(?=(\d{3})+$)', sep, n) if len(n) >= 4 else n


def number(arg, lang):
    """\\num{arg} as TeX: integer part grouped by three from 4 digits, decimal marker of the language."""
    m = re.fullmatch(r'\s*([+-]?)\s*(\d*)(?:[.,](\d+))?\s*', arg)
    if not m: return arg
    sign, ip, dp = m.groups()
    ip = _group(ip, r'\,' if lang == 'fr' else '{,}')
    return sign + ip + ((('{,}' if lang == 'fr' else '.') + dp) if dp is not None else '')


def _arg(s, i):
    """(content, end) of the braced argument starting at s[i] == '{'."""
    j = twin._group_end(s, i)
    return s[i + 1:j - 1], j


def _split(s):
    """Top-level ';'-separated items of s."""
    out, depth, cur = [], 0, ''
    for c in s:
        depth += (c in '{(') - (c in '})')
        if c == ';' and depth == 0: out.append(cur); cur = ''
        else: cur += c
    return out + [cur]


def expand(tex, lang):
    """Replace the notation commands by plain TeX in the convention of lang (innermost first)."""
    sep = SEP[lang]
    def one(name, args):
        if name == 'num': return number(args[0], lang)
        if name == 'pc': return number(args[0], lang) + (r'\,\%' if lang == 'fr' else r'\%')
        if name == 'pt': return '(' + sep.join(_split(args[0])) + ')'
        if name == 'ens': return r'\{' + sep.join(_split(args[0])) + r'\}'
        if name == 'ent': return (r'\llbracket ' + args[0] + ';' + args[1] + r'\rrbracket') if lang == 'fr' else (r'\{' + args[0] + r',\ldots,' + args[1] + r'\}')
        left, right = name[3], name[4]   # intXY: X, Y in f (closed) / o (open)
        lo = '[' if left == 'f' else (']' if lang == 'fr' else '(')
        ro = ']' if right == 'f' else ('[' if lang == 'fr' else ')')
        return lo + args[0] + sep + args[1] + ro
    nargs = {'num': 1, 'pc': 1, 'pt': 1, 'ens': 1, 'ent': 2, 'intff': 2, 'intoo': 2, 'intfo': 2, 'intof': 2}
    pat = re.compile(r'\\(' + '|'.join(nargs) + r')(?![A-Za-z])\s*\{')
    while True:
        found = None
        for m in pat.finditer(tex):   # innermost: a command whose arguments hold no other notation command
            i, args = m.end() - 1, []
            for _ in range(nargs[m.group(1)]):
                while tex[i] == ' ': i += 1
                a, i = _arg(tex, i); args.append(a)
            if not any(pat.search(a) for a in args): found = (m.start(), i, one(m.group(1), args)); break
        if not found: break
        tex = tex[:found[0]] + found[2] + tex[found[1]:]
    tex = re.sub(r'\\pgcd(?![A-Za-z])', r'\\operatorname{PGCD}' if lang == 'fr' else r'\\operatorname{gcd}', tex)
    return re.sub(r'\\ppcm(?![A-Za-z])', r'\\operatorname{PPCM}' if lang == 'fr' else r'\\operatorname{lcm}', tex)


# ---- migration of hand-written notation ---------------------------------------------------------------------------
THOU = r'(?:\\,|\\ |~|\\;|\\!|\{\\,\})'
NUM_FR = re.compile(r'(?<![\d.\\])(\d{1,3}(?:' + THOU + r'\d{3})+|\d+)(?:\{,\}(\d+))?(?![\d])')
UNIT = r'(?!\d|\s*(?:em|ex|pt|cm|mm|in|bp|sp)\b|\s*\\(?:line|text|column)width)'   # 1.5em, 0.5\linewidth: lengths
NUM_EN = re.compile(r'(?<![\d.\\])(\d{1,3}(?:' + THOU + r'\d{3})+|\d+)(?:\.(\d+))?' + UNIT)
PCT = re.compile(r'(?:\\num\{([^{}]*)\}|(?<![\d.\\])(\d+))\s*(?:\\,|~|\\ |\\;|\{\\,\})?\s*\\%')


def _numbers(s, lang, decimals):
    """Numbers with a decimal part or a thousands separator become \\num{...}; percentages become \\pc{...}.
    decimals: the French decimals converted so far ('0,5'); French adds to it, English converts 0.5 only when the
    French twin had 0{,}5 (an English 1.5 elsewhere is a length or a coordinate, not a decimal of the text)."""
    rx = NUM_FR if lang == 'fr' else NUM_EN
    def num(m):
        if m.group(2) is None and not re.search(THOU, m.group(1)): return m.group(0)
        n = re.sub(THOU, '', m.group(1)) + (',' + m.group(2) if m.group(2) is not None else '')
        if m.group(2) is not None:
            if lang == 'fr': decimals.add(n)
            elif n not in decimals: return m.group(0)
        return r'\num{' + n + '}'
    s = rx.sub(num, s)
    return PCT.sub(lambda m: r'\pc{' + (m.group(1) or m.group(2)) + '}', s)


OPEN = {'{': '}', '(': ')'}


def _scan(s, i, stops):
    """From s[i], skip balanced {...} and (...) and \\{...\\}; return the index of the first top-level char in stops."""
    depth = 0
    while i < len(s):
        c = s[i]
        if c == '\\' and i + 1 < len(s):
            if s[i + 1] in '{}': i += 2; continue
            if s.startswith('left', i + 1) or s.startswith('right', i + 1): return -1   # sized delimiters: by hand
            i += 2; continue
        if c in '{(': depth += 1
        elif c in '})': depth -= 1
        elif depth == 0 and c in stops: return i
        if depth < 0 or c == '$': return -1
        i += 1
    return -1


def _intervals(s):
    out, i = [], 0
    while i < len(s):
        c = s[i]
        if c in '[]' and (i == 0 or s[i - 1] != '\\') and not SIZED.search(s[:i]) and not re.search(r'\\(?:sqrt|item|\\)\s*$', s[max(0, i - 6):i]):
            j = _scan(s, i + 1, '[];')
            if j > 0 and s[j] == ';':
                k = _scan(s, j + 1, '[];')
                if k > 0 and s[k] in '[]':
                    a, b = s[i + 1:j].strip(), s[j + 1:k].strip()
                    a = re.sub(r'^(?:\\,|~)+|(?:\\,|~)+$', '', a).strip(); b = re.sub(r'^(?:\\,|~)+|(?:\\,|~)+$', '', b).strip()
                    if a and b:
                        out.append(r'\int%s%s{%s}{%s}' % ('f' if c == '[' else 'o', 'f' if s[k] == ']' else 'o', a, b))
                        i = k + 1; continue
        out.append(c); i += 1
    return ''.join(out)


SIZED = re.compile(r'\\(?:left|right|bigl|bigr|Bigl|Bigr|big|Big)\s*$')


def _close(s, i, close):
    """Index of the top-level `close` after s[i] (braces and parentheses balanced), or -1."""
    depth, k = 0, i
    while k < len(s):
        if depth == 0 and s.startswith(close, k): return k
        if s[k] == '\\': k += 2; continue
        if s[k] in '{(': depth += 1
        elif s[k] in '})': depth -= 1
        if depth < 0 or s[k] == '$': return -1
        k += 1
    return -1


def _lists(s):
    """(a;b) and (a;b;c) become \\pt{a;b}; \\{a;b\\} becomes \\ens{a;b} (sized delimiters stay as written)."""
    trim = lambda x: re.sub(r'^(?:\\,|~|\s)+|(?:\\,|~|\s)+$', '', x)
    out, i = [], 0
    while i < len(s):
        opener = r'\{' if s.startswith(r'\{', i) else '(' if s[i] == '(' and (i == 0 or s[i - 1] != '\\') else None
        if opener and not SIZED.search(s[:i]):
            start = i + len(opener); k = _close(s, start, r'\}' if opener == r'\{' else ')')
            items = _split(s[start:k]) if k > 0 else []
            if 2 <= len(items) <= (3 if opener == '(' else 20) and '\\left' not in s[start:k]:
                out.append((r'\pt{' if opener == '(' else r'\ens{') + ';'.join(trim(x) for x in items) + '}')
                i = k + len(r'\}' if opener == r'\{' else ')'); continue
        out.append(s[i]); i += 1
    return ''.join(out)


def rewrite_maths(m, lang, decimals=None):
    """One maths chunk ($...$, \\[...\\], an align environment ...)."""
    return _lists(_intervals(_numbers(m, lang, set() if decimals is None else decimals)))


PROSE_SKIP = re.compile(r'\\begin\{(tikzpicture|axis|pgfpicture|lstlisting|verbatim)\}.*?\\end\{\1\}|(?<!\\)%[^\n]*|'
                        r'\\(?:mxdate\*?|label|ref|eqref|href|url|code|texttt|mxlabel|mxunit|mxexdef|mxexuse|input|mxinclude|'
                        r'mxarraystretch)\{[^{}]*\}|\\(?:mxanswerspace|mxwriteproof)\[[^\]]*\]|'
                        r'\b(?:Exercice|Exercise|Exemple|Example|Activité|Activity|Problème|Problem|Corrigé|Solution|'
                        r'Méthode|Method|Partie|Part|Question|Section|Chapitre|Chapter)s?(?:~|\s|\\,)*\d+(?:\.\d+)+', re.S)


def rewrite(text, lang, decimals=None):
    """Hand-written notation of a whole unit to the notation commands: maths chunks fully (figure labels included),
    prose for numbers only and never inside figure code, listings, comments or reference arguments. Rewrite the
    French unit first and pass the same `decimals` set to the English rewrite."""
    decimals = set() if decimals is None else decimals
    protected = [(m.start(), m.end()) for m in PROSE_SKIP.finditer(text)]
    def prose(a, b):
        o, p = [], a
        for x, y in protected:
            if y <= p or x >= b: continue
            o += [_numbers(text[p:max(p, x)], lang, decimals), text[max(p, x):min(b, y)]]; p = min(b, y)
        return ''.join(o) + _numbers(text[p:b], lang, decimals)
    out, pos = [], 0
    for a, b in twin.locked_maths(text):
        out += [prose(pos, a), rewrite_maths(text[a:b], lang, decimals)]; pos = b
    return ''.join(out) + prose(pos, len(text))


# ---- MathJax macro table for the slide player ---------------------------------------------------------------------
MJ_BEGIN, MJ_END = 'macros:{/*mx-math*/', '/*end mx-math*/}'


def mathjax():
    """{name: body | [body, nargs]} from the language-neutral \\mxmathmacro lines of mx-math.sty."""
    src = (CORE / 'mx-math.sty').read_text()
    out = {}
    for m in re.finditer(r'^\\mx(?:mathmacro|mathoverride)\{\\(\w+)\}\{(\d)\}\{', src, re.M):
        body, _ = _arg(src, m.end() - 1)
        if '\\mxtr' in body: continue          # language-dependent: expanded at build time (expand)
        out[m.group(1)] = body if m.group(2) == '0' else [body, int(m.group(2))]
    return out


# stmaryrd brackets (French integer intervals, \\ent) have no MathJax command: drawn as two close square brackets.
# Renderers without stmaryrd (slide player, chapter pages, Beamer lectures) add these definitions.
BRACKETS = {'llbracket': r'\mathopen{[\mkern-3mu[}', 'rrbracket': r'\mathclose{]\mkern-3mu]}'}


def player_text():
    html = PLAYER.read_text()
    a, b = html.index(MJ_BEGIN) + len(MJ_BEGIN), html.index(MJ_END)
    js = json.dumps({**mathjax(), **BRACKETS}, ensure_ascii=False, separators=(',', ':'))[1:-1]
    return html[:a] + js + html[b:]


HEADER = re.compile(r'\A%[^\n]*GENERATED[^\n]*\n')


def migrate(units, write=False):
    """Rewrite hand-written notation in French units and their generated English twins, re-align them and check that
    the twin tool regenerates exactly the rewritten English. Returns the list of problems."""
    problems, changed = [], 0
    for fr in units:
        en = twin.en_path(fr)
        fr_text, en_text = fr.read_text(), HEADER.sub('', en.read_text())
        decimals = set(); fr_new = rewrite(fr_text, 'fr', decimals); en_new = rewrite(en_text, 'en', decimals)
        if (fr_new, en_new) == (fr_text, en_text): continue
        try:
            pairs = twin.align(fr_new, en_new)
        except twin.TwinError as e:
            problems.append(f'{fr.relative_to(ROOT)}: {e}'); continue
        old = twin.load_table(fr)['segments']; table = {'unit': fr.name, 'segments': {}}
        for order, (f, e) in enumerate(pairs):
            sid = twin.seg_id(f)
            prev = old.get(sid, {})
            status = 'reviewed' if prev.get('status') == 'reviewed' and prev.get('en') == e else 'aligned'
            table['segments'].setdefault(sid, {'fr': f, 'en': e, 'status': status, 'order': order})
        lost = [v['fr'][:60] for k, v in old.items() if v.get('status') == 'reviewed' and table['segments'].get(k, {}).get('status') != 'reviewed']
        if lost: problems.append(f'{fr.relative_to(ROOT)}: reviewed segment(s) changed, review again: {lost}')
        gen = twin.generate(fr_new, table)
        if HEADER.sub('', gen) != en_new:
            problems.append(f'{fr.relative_to(ROOT)}: regenerated English differs from the rewritten English'); continue
        changed += 1
        if write:
            fr.write_text(fr_new); twin.save_table(fr, table); en.write_text(gen)
    print(f'notation: {changed} unit(s) {"rewritten" if write else "to rewrite"}, {len(problems)} problem(s)')
    return problems


def main(argv):
    if '--migrate' in argv:
        units = [p for p in twin.all_units() if '/enrichment/' not in str(p) or p.name.startswith('quadratic')]
        problems = migrate(units, write='--write' in argv)
        print('\n'.join(problems)); return 1 if problems else 0
    if '--check' in argv:
        ok = PLAYER.read_text() == player_text()
        print('notation: MathJax table up to date' if ok else 'notation: site/slides/player.html MathJax table is stale (run `python -m mxbuild notation`)')
        return 0 if ok else 1
    PLAYER.write_text(player_text()); print('notation: MathJax table written to site/slides/player.html')
    return 0
