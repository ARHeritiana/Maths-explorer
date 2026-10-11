"""French-to-English twin generation (docs/ADR-0001-tex-i18n.md).

A French unit is split into a locked skeleton and prose segments. Locked: comments, display maths and maths
environments, TikZ/pgfplots code, listings, verbatim, \\includegraphics, labels, references, inputs, command names
and non-prose arguments. Prose segments may contain inline maths, which becomes a placeholder [[mN]] whose content
stays locked; words inside maths (\\text{...}, \\mathrm{word}) and the text of figure nodes, axis labels, titles and
legend entries are their own segments.

The English unit is rebuilt from the French skeleton, the reviewed translation of every segment (table
<unit>.en.json next to the unit), and fixed language rules: decimal comma {,} becomes a point, the French thin space
before ; : ! ? is dropped. Generation fails when a segment has no translation, when a translation does not use every
placeholder exactly once, or when the regenerated English unit does not split back into the French skeleton.

Commands (python -m mxbuild twin ...):
  align FR EN     build the table of FR from an existing hand-written English twin (status "aligned")
  gen FR...       write the English unit(s) next to the French one(s)
  check [FR...]   verify that committed English units are up to date (default: every *.fr.tex under content/tex)
  stub FR...      add every untranslated segment to the table with status "todo" (to be translated and reviewed)
"""
import hashlib, json, re, sys
from pathlib import Path
from . import ROOT

GENERATED = '% GENERATED, edit the French unit or the translation table\n'
LOCK_ENVS = (r'tikzpicture|axis|lstlisting|verbatim|equation\*?|align\*?|gather\*?|multline\*?|alignat\*?|'
             r'displaymath|flalign\*?|pgfpicture|tikzcd')
FIGURE_ENVS = {'tikzpicture', 'axis', 'pgfpicture'}
LOCK_ARGS = set('label ref eqref pageref input include includegraphics setcounter addtocounter stepcounter '
                'refstepcounter vspace hspace rule color textcolor colorbox definecolor needspace Needspace mxneed '
                'newpage clearpage hyperref url mxinclude mxunit_id usetikzlibrary tikzset pgfplotsset phantom '
                'hphantom vphantom cite linewidth setlength mxdate mxlabel mxref lstinputlisting mxlabelof mxfront'.split())
# Environments whose brace arguments are layout (column specs, widths, counts), never prose.
LAYOUT_ENVS = set('tabular tabular* tabularx array longtable minipage multicols multicols* wrapfigure tblr'.split())
# Inline atoms: kept inside the sentence like inline maths (a placeholder the translation must keep).
ATOM_CMDS = set('mxdate ref eqref mxref pageref cite code mxtag'.split())
# Commands whose listed argument positions (0-based, brace arguments only) are never prose.
LOCKED_ARG_POS = {'mxunit': {0}, 'href': {0}, 'mxfq': {1}, 'mxarraystretch': {0}, 'mxsession': {0}, 'mxtest': {0, 1},
                  'mxexdef': {0, 4}, 'mxexuse': {0}, 'mxpoints': {0}, 'mxlines': {0}, 'addcontentsline': {0, 1}}
INLINE_CMDS = set('textbf emph textit textsc textsf texttt underline og fg ldots dots enspace quad qquad '
                  'nobreakspace textsuperscript textsubscript mbox guillemotleft guillemotright S oe OE ae up '
                  'mxblank code'.split())
MATH_TEXT = re.compile(r'\\(text|textrm|textit|textbf|mbox|mathrm|operatorname)\{([^{}]*)\}')
FIG_SLOT = re.compile(r'(?:node\s*(?:\[[^\]]*\])?\s*(?:at\s*\([^)]*\))?\s*|(?:x|y|z)label\s*=\s*|title\s*=\s*|'
                      r'addlegendentry\s*)\{')
LETTER = re.compile(r'[A-Za-zÀ-ÿ]')
PLACEHOLDER = re.compile(r'\[\[m(\d+)\]\]')


class TwinError(Exception):
    pass


# ---- tokenizer ------------------------------------------------------------------------------------------------------
def _group_end(s, i, open_='{', close='}'):
    """Index just after the group that opens at s[i]."""
    depth, j = 0, i
    while j < len(s):
        c = s[j]
        if c == '\\': j += 2; continue
        if c == open_: depth += 1
        elif c == close:
            depth -= 1
            if depth == 0: return j + 1
        j += 1
    raise TwinError(f'unbalanced {open_}{close} at offset {i}')


class _Out:
    def __init__(self): self.items = []

    def add(self, kind, text):
        if self.items and self.items[-1][0] == kind: self.items[-1] = (kind, self.items[-1][1] + text)
        else: self.items.append((kind, text))

    def extend(self, other):
        for k, t in other.items: self.add(k, t)


def _figure(out, body):
    """Figure code is locked; node texts, axis labels, titles and legend entries are prose slots."""
    pos = 0
    for m in FIG_SLOT.finditer(body):
        if m.start() < pos: continue
        k = _group_end(body, m.end() - 1)
        inner = body[m.end():k - 1]
        out.add('L', body[pos:m.end()])
        if LETTER.search(re.sub(r'\$.*?\$|\\[A-Za-z]+', '', inner)): out.extend(tokenize(inner))
        else: out.add('L', inner)
        pos = k - 1
    out.add('L', body[pos:])


def tokenize(s):
    """Return an _Out with ('L', locked) and ('P', prose) chunks. Inline maths sits inside prose as \\x00...\\x01."""
    out = _Out(); n = len(s); i = 0
    while i < n:
        c = s[i]
        if c == '%':
            j = s.find('\n', i); j = n if j < 0 else j
            out.add('L', s[i:j]); i = j; continue
        m = re.match(r'\\begin\{(' + LOCK_ENVS + r')\}', s[i:])
        if m:
            end = '\\end{' + m.group(1) + '}'; j = s.find(end, i)
            if j < 0: raise TwinError(f'missing {end}')
            j += len(end)
            if m.group(1) in FIGURE_ENVS: _figure(out, s[i:j])
            else: out.add('L', s[i:j])
            i = j; continue
        if s.startswith('\\[', i) or s.startswith('$$', i):
            close = '\\]' if s[i + 1] == '[' else '$$'
            j = s.find(close, i + 2)
            if j < 0: raise TwinError('unclosed display maths')
            out.add('L', s[i:j + 2]); i = j + 2; continue
        if c == '$' or s.startswith('\\(', i):
            if c == '$':
                j = i + 1
                while j < n and not (s[j] == '$' and s[j - 1] != '\\'): j += 1
                j += 1
            else:
                j = s.find('\\)', i)
                if j < 0: raise TwinError(f'unclosed \\( at offset {i}')
                j += 2
            out.add('P', '\x00' + s[i:j] + '\x01'); i = j; continue
        if c == '\\':
            m = re.match(r'\\([A-Za-z@]+\*?|.)', s[i:]); name = m.group(1); j = i + len(m.group(0))
            if name in ('begin', 'end'):
                k = _group_end(s, j); env = s[j + 1:k - 1]; out.add('L', s[i:k]); i = k
                if name == 'begin' and env in LAYOUT_ENVS:   # column specs, widths, column counts
                    while i < n and s[i] == '{':
                        k = _group_end(s, i); out.add('L', s[i:k]); i = k
                if name == 'begin' and i < n and s[i] == '[':   # optional title of a box: its own segment
                    k = _group_end(s, i, '[', ']'); inner = s[i + 1:k - 1]
                    if '=' in inner or not LETTER.search(inner): out.add('L', s[i:k])
                    else: out.add('L', '['); out.extend(tokenize(inner)); out.add('L', ']')
                    i = k
                continue
            if name.rstrip('*') in ATOM_CMDS:
                k = j
                while k < n and s[k] in '[{': k = _group_end(s, k, s[k], ']' if s[k] == '[' else '}')
                out.add('P', '\x00' + s[i:k] + '\x01'); i = k; continue
            if name in INLINE_CMDS or not name[0].isalpha():
                k = j
                while k < n and s[k] == '{': k = _group_end(s, k)
                out.add('P', s[i:k]); i = k; continue
            if name == 'item':
                out.add('L', s[i:j]); i = j
                if i < n and s[i] == '[':
                    k = _group_end(s, i, '[', ']'); out.add('L', '['); out.extend(tokenize(s[i + 1:k - 1]))
                    out.add('L', ']'); i = k
                continue
            out.add('L', s[i:j]); i = j; argpos = 0
            while i < n and s[i] in '[{*':
                if s[i] == '*': out.add('L', '*'); i += 1; continue
                o, cl = s[i], (']' if s[i] == '[' else '}')
                k = _group_end(s, i, o, cl); inner = s[i + 1:k - 1]
                locked_pos = o == '{' and argpos in LOCKED_ARG_POS.get(name, ())
                if o == '{': argpos += 1
                if name in LOCK_ARGS or locked_pos or (o == '[' and ('=' in inner or not re.search(r'[A-Za-zÀ-ÿ]{3,}', inner))):
                    out.add('L', s[i:k])
                else:
                    out.add('L', o); out.extend(tokenize(inner)); out.add('L', cl)
                i = k
            continue
        if s.startswith('{,}', i):
            out.add('P', '{,}'); i += 3; continue
        if c in '{}&':
            out.add('L', c); i += 1; continue
        if c == '\n' and s.startswith('\n\n', i):
            j = i
            while j < n and s[j] in '\n \t': j += 1
            out.add('L', s[i:j]); i = j; continue
        out.add('P', c); i += 1
    return out


# ---- segments -------------------------------------------------------------------------------------------------------
def seg_id(text):
    return hashlib.sha1(re.sub(r'\s+', ' ', text).strip().encode()).hexdigest()[:12]


def split(s):
    """(parts, segments). parts alternates locked text and segment indices; a segment is
    {'text': prose with [[mN]] placeholders, 'maths': [inline maths chunks]}."""
    parts, segs = [], []
    for kind, v in tokenize(s).items:
        bare = re.sub('\x00.*?\x01', '', v, flags=re.S)
        if kind == 'L' or not LETTER.search(bare):
            parts.append(v.replace('\x00', '').replace('\x01', '')); continue
        core = v.strip(); lead = v[:len(v) - len(v.lstrip())]; trail = v[len(v.rstrip()):]
        maths = re.findall('\x00(.*?)\x01', core, re.S)
        counter = iter(range(1, 10 ** 6))
        text = re.sub('\x00.*?\x01', lambda m: '[[m%d]]' % next(counter), core, flags=re.S)
        parts += [lead, len(segs), trail]
        segs.append({'text': text, 'maths': maths})
    return parts, segs


MATHS_IN_LOCKED = re.compile(r'(?<!\\)%[^\n]*|\$\$.*?\$\$|(?<!\\)\$(?:\\.|[^$\\])*\$|\\\(.*?\\\)|\\\[.*?\\\]|'
                             r'\\begin\{(equation|align|gather|multline|alignat|flalign|displaymath)\*?\}.*?\\end\{\1\*?\}', re.S)


def locked_maths(part):
    """Maths chunks inside locked text (comments skipped), as (start, end) spans."""
    return [(m.start(), m.end()) for m in MATHS_IN_LOCKED.finditer(part) if not m.group(0).startswith('%')]


def math_texts(m):
    """Words inside a maths chunk: (start, end, text) of each \\text{...}-like argument with letters."""
    return [(x.start(2), x.end(2), x.group(2)) for x in MATH_TEXT.finditer(m) if re.search(r'[A-Za-zÀ-ÿ]{2,}', x.group(2))]


# ---- language rules -------------------------------------------------------------------------------------------------
def english_math(t):
    """Language rule for maths: the decimal comma {,} becomes a point. Spacing inside maths is never touched."""
    return re.sub(r'(?<=\d)\{,\}(?=\d)', '.', t)


def english_locked(t):
    """Language rules for text outside maths: decimal comma, and no French thin space before ; : ! ?"""
    return re.sub(r'\\,(?=[;:!?])|~(?=[;:!?])', '', english_math(t))


def _mask_words(t):
    return MATH_TEXT.sub(lambda x: '\\' + x.group(1) + '{' + ('#' if re.search(r'[A-Za-zÀ-ÿ]{2,}', x.group(2)) else x.group(2)) + '}', t)


def skeleton_key(parts):
    """Comparable form of a skeleton: comments dropped, words inside maths masked, language rules applied."""
    sk = ''.join('\x04' if isinstance(p, int) else p for p in parts)
    pos, buf = 0, []
    for a, b in locked_maths(sk):
        buf += [english_locked(sk[pos:a]), english_math(sk[a:b])]; pos = b
    sk = ''.join(buf) + english_locked(sk[pos:])
    sk = re.sub(r'(?<!\\)%[^\n]*', '', _mask_words(sk))
    return re.sub(r'\s+', '', sk)


def norm_math(m):
    m = english_math(_mask_words(m))
    return re.sub(r'\s+', '', m)


# ---- tables ---------------------------------------------------------------------------------------------------------
def table_path(fr):
    return Path(str(fr).replace('.fr.tex', '.en.json'))


def en_path(fr):
    return Path(str(fr).replace('.fr.tex', '.en.tex'))


def load_table(fr):
    p = table_path(fr)
    return json.loads(p.read_text()) if p.exists() else {'unit': fr.name, 'segments': {}}


def save_table(fr, table):
    table['segments'] = dict(sorted(table['segments'].items(), key=lambda kv: kv[1].get('order', 0)))
    table_path(fr).write_text(json.dumps(table, ensure_ascii=False, indent=1) + '\n')


def translatable(fr_text):
    """Every text to translate in a French unit, in order: prose segments, then words inside their maths and inside
    maths in locked text."""
    parts, segs = split(fr_text); out = []
    for sg in segs:
        out.append(sg['text'])
        for m in sg['maths']: out += [t for _, _, t in math_texts(m)]
    for p in parts:
        if isinstance(p, str):
            for a, b in locked_maths(p): out += [t for _, _, t in math_texts(p[a:b])]
    return list(dict.fromkeys(out))


def align(fr_text, en_text):
    """Pair the translatable units of two hand-written twins. Raises TwinError when they cannot be aligned."""
    pf, sf = split(fr_text); pe, se = split(en_text)
    if skeleton_key(pf) != skeleton_key(pe):
        a, b = skeleton_key(pf), skeleton_key(pe)
        k = next((i for i, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))
        raise TwinError('skeleton differs near FR %r / EN %r' % (a[max(0, k - 50):k + 50], b[max(0, k - 50):k + 50]))
    if len(sf) != len(se): raise TwinError(f'segment count {len(sf)} / {len(se)}')
    pairs = []
    for a, b in zip(sf, se):
        ma = [norm_math(x) for x in a['maths']]; mb = [norm_math(x) for x in b['maths']]
        if sorted(ma) != sorted(mb):
            raise TwinError('maths differ in %r / %r' % (a['text'][:70], b['text'][:70]))
        # renumber the English placeholders so that [[mK]] points at the K-th French maths chunk
        used = set(); mapping = {}
        for j, x in enumerate(mb, 1):
            k = next(i for i, y in enumerate(ma, 1) if y == x and i not in used); used.add(k); mapping[j] = k
        en = PLACEHOLDER.sub(lambda m: '[[m%d]]' % mapping[int(m.group(1))], b['text'])
        pairs.append((a['text'], en))
        for j, x in enumerate(b['maths'], 1):   # words inside maths, matched chunk by chunk
            fa = math_texts(a['maths'][mapping[j] - 1]); fb = math_texts(x)
            if len(fa) != len(fb): raise TwinError(f'words inside maths differ: {a["maths"][mapping[j] - 1]!r}')
            pairs += [(u[2], v[2]) for u, v in zip(fa, fb)]
    # words inside maths that sits in locked text (display maths, maths-only chunks, figure code), in order
    lm = lambda parts: [p[a:b] for p in parts if isinstance(p, str) for a, b in locked_maths(p)]
    xs, ys = lm(pf), lm(pe)
    if len(xs) != len(ys): raise TwinError('number of maths chunks in locked text differs')
    for x, y in zip(xs, ys):
        fa, fb = math_texts(x), math_texts(y)
        if len(fa) != len(fb): raise TwinError(f'words inside maths differ: {x[:60]!r}')
        pairs += [(u[2], v[2]) for u, v in zip(fa, fb)]
    return pairs


def _translate_math(m, tr):
    out, pos = [], 0
    for a, b, t in math_texts(m):
        out += [m[pos:a], tr(t)]; pos = b
    return english_math(''.join(out) + m[pos:])


def generate(fr_text, table, statuses=('aligned', 'reviewed')):
    """Return the English unit text. Raises TwinError listing every missing or invalid translation."""
    seg = table['segments']; problems = []

    def tr(text):
        e = seg.get(seg_id(text))
        if not e or e.get('status') not in statuses or not e.get('en'):
            problems.append(f'missing translation [{seg_id(text)}]: {text[:90]!r}'); return text
        return e['en']

    parts, segs = split(fr_text)
    out = []
    for p in parts:
        if isinstance(p, int):
            s = segs[p]; missing = len(problems); en = tr(s['text']); missing = len(problems) > missing
            want = sorted(range(1, len(s['maths']) + 1)); got = sorted(int(x) for x in PLACEHOLDER.findall(en))
            if got != want and not missing:
                problems.append(f'placeholders {got} instead of {want} in [{seg_id(s["text"])}]')
            en = PLACEHOLDER.sub(lambda m: _translate_math(s['maths'][int(m.group(1)) - 1], tr) if int(m.group(1)) <= len(s['maths']) else m.group(0), en)
            out.append(en)
        else:
            pos, buf = 0, []
            for a, b in locked_maths(p):
                buf += [english_locked(p[pos:a]), _translate_math(p[a:b], tr)]; pos = b
            out.append(''.join(buf) + english_locked(p[pos:]))
    if problems: raise TwinError('\n'.join(problems))
    en_text = GENERATED + ''.join(out)
    # round trip: the English unit must split back into the French skeleton with the same maths
    pe, se = split(en_text[len(GENERATED):])
    if skeleton_key(pe) != skeleton_key(parts) or len(se) != len(segs):
        raise TwinError('generated English does not match the French skeleton (a translation breaks the TeX structure)')
    for a, b in zip(segs, se):
        if sorted(norm_math(x) for x in a['maths']) != sorted(norm_math(x) for x in b['maths']):
            raise TwinError(f'maths changed in [{seg_id(a["text"])}]')
    return en_text


def align_files(fr, en_old):
    pairs = align(fr.read_text(), en_old.read_text())
    table = load_table(fr); table['unit'] = fr.name
    for order, (f, e) in enumerate(pairs):
        sid = seg_id(f)
        old = table['segments'].get(sid)
        if old and old.get('status') == 'reviewed': continue
        table['segments'][sid] = {'fr': f, 'en': e, 'status': 'aligned', 'order': order}
    save_table(fr, table)
    return len(pairs)


def all_units():
    return sorted((ROOT / 'content/tex').rglob('*.fr.tex'))


def main(argv):
    if not argv: print(__doc__); return 2
    cmd, args = argv[0], [Path(a).resolve() for a in argv[1:]]
    if cmd == 'align':
        n = align_files(args[0], args[1]); print(f'{args[0].name}: {n} segments aligned'); return 0
    if cmd == 'stub':
        for fr in args:
            table = load_table(fr); table['unit'] = fr.name; seen = 0
            for order, text in enumerate(translatable(fr.read_text())):
                sid = seg_id(text)
                if sid not in table['segments']:
                    table['segments'][sid] = {'fr': text, 'en': '', 'status': 'todo', 'order': order}; seen += 1
                else: table['segments'][sid]['order'] = order
            save_table(fr, table); print(f'{fr.name}: {seen} new segment(s) to translate')
        return 0
    if cmd in ('gen', 'check'):
        units = args or all_units(); bad = 0
        for fr in units:
            try:
                text = generate(fr.read_text(), load_table(fr))
            except TwinError as e:
                bad += 1; print(f'{fr.relative_to(ROOT)}:\n  ' + str(e).replace('\n', '\n  ')); continue
            target = en_path(fr)
            if cmd == 'gen': target.write_text(text)
            elif not target.exists() or target.read_text() != text:
                bad += 1; print(f'{target.relative_to(ROOT)}: stale (run `python -m mxbuild twin gen`)')
        print(f'twin {cmd}: {len(units) - bad}/{len(units)} units OK'); return 1 if bad else 0
    print(__doc__); return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
