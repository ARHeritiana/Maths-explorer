"""Prototype of the twin tool (ADR-0001): split a LaTeX unit into locked material and prose segments.

A unit becomes a skeleton (locked text with prose holes) plus an ordered list of prose segments.
Inside a segment, inline maths is replaced by placeholders [[m1]], [[m2]]..., whose content is locked.
Two twins align when their skeletons are identical and each segment pair carries the same maths.
"""
import hashlib, re, sys
from pathlib import Path

LOCK_ENVS = r'tikzpicture|axis|lstlisting|verbatim|equation\*?|align\*?|gather\*?|multline\*?|alignat\*?|displaymath|flalign\*?|pgfpicture|tikzcd'
# Commands whose brace arguments are never prose.
LOCK_ARGS = set('label ref eqref pageref input include includegraphics setcounter addtocounter stepcounter refstepcounter '
                'vspace hspace rule color textcolor colorbox definecolor needspace Needspace newpage clearpage hyperref url '
                'mxinclude usetikzlibrary tikzset pgfplotsset fichehead_date phantom hphantom vphantom cite linewidth setlength mxdate '
                'small footnotesize'.split())
INLINE_CMDS = set('textbf emph textit textsc textsf texttt underline og fg ldots dots enspace quad qquad nobreakspace '
                  'textsuperscript textsubscript mbox guillemotleft guillemotright S oe OE ae dots up'.split())
MATH_TEXT = re.compile(r'\\(text|textrm|textit|textbf|mbox|mathrm|operatorname)\{([^{}]*)\}')


def norm_math(m, lang):
    """Normalise a maths chunk for comparison: decimal separator, spaces; prose inside \\text is masked."""
    m = MATH_TEXT.sub(lambda x: '\\' + x.group(1) + '{' + ('#' if re.search(r'[A-Za-zÀ-ÿ]{2,}', x.group(2)) else x.group(2)) + '}', m)
    m = m.replace('{,}', '.')
    m = re.sub(r'(?<=\d),(?=\d)', '.', m)
    return re.sub(r'\s+', '', m)


class Tok:
    """Linear scan producing a list of ('L', text) locked chunks and ('P', text) prose chunks."""
    def __init__(self, s):
        self.s, self.i, self.out = s, 0, []

    def lock(self, t):
        if self.out and self.out[-1][0] == 'L': self.out[-1] = ('L', self.out[-1][1] + t)
        else: self.out.append(('L', t))

    def prose(self, t):
        if self.out and self.out[-1][0] == 'P': self.out[-1] = ('P', self.out[-1][1] + t)
        else: self.out.append(('P', t))

    def group(self, i, open_='{', close='}'):
        """Return index after the matching close brace of the group starting at i."""
        depth, j, s = 0, i, self.s
        while j < len(s):
            c = s[j]
            if c == '\\': j += 2; continue
            if c == open_: depth += 1
            elif c == close:
                depth -= 1
                if depth == 0: return j + 1
            j += 1
        raise ValueError('unbalanced group at %d' % i)


FIG_SLOT = re.compile(r'(?:node\s*(?:\[[^\]]*\])?\s*(?:at\s*\([^)]*\))?\s*|(?:x|y|z)label\s*=\s*|title\s*=\s*|addlegendentry\s*)\{')


def figure_slots(t, body):
    """Lock figure code; node texts, axis labels, titles and legend entries become prose slots."""
    pos = 0
    for m in FIG_SLOT.finditer(body):
        if m.start() < pos: continue
        k = Tok(body).group(m.end() - 1)
        inner = body[m.end():k - 1]
        t.lock('\x02' + body[pos:m.end()] + '\x03')
        if re.search(r'[A-Za-zÀ-ÿ]', re.sub(r'\$.*?\$|\\[A-Za-z]+', '', inner)):
            t.out += tokenize(inner)
        else:
            t.lock('\x02' + inner + '\x03')
        pos = k - 1
    t.lock('\x02' + body[pos:] + '\x03')


def tokenize(s):
    """Flat token list. Inline maths and inline commands stay inside prose ('P'), marked with \x00..\x01 for maths."""
    t = Tok(s); n = len(s); i = 0
    while i < n:
        c = s[i]
        if c == '%':
            j = s.find('\n', i); j = n if j < 0 else j
            t.lock(s[i:j]); i = j; continue
        m = re.match(r'\\begin\{(' + LOCK_ENVS + r')\}', s[i:])
        if m:
            end = '\\end{' + m.group(1) + '}'; j = s.find(end, i) + len(end)
            body = s[i:j]
            if m.group(1) in ('tikzpicture', 'axis', 'pgfpicture'):
                figure_slots(t, body)
            else:
                t.lock('\x02' + body + '\x03')
            i = j; continue
        if s.startswith('\\[', i):
            j = s.find('\\]', i) + 2; t.lock('\x02' + s[i:j] + '\x03'); i = j; continue
        if s.startswith('$$', i):
            j = s.find('$$', i + 2) + 2; t.lock('\x02' + s[i:j] + '\x03'); i = j; continue
        if c == '$' or s.startswith('\\(', i):
            if c == '$':
                j = i + 1
                while j < n and not (s[j] == '$' and s[j - 1] != '\\'): j += 1
                j += 1
            else:
                j = s.find('\\)', i) + 2
            t.prose('\x00' + s[i:j] + '\x01'); i = j; continue
        if c == '\\':
            m = re.match(r'\\([A-Za-z@]+\*?|.)', s[i:]); name = m.group(1); j = i + len(m.group(0))
            if name in ('begin', 'end'):
                k = t.group(j); envname = s[j + 1:k - 1]; j = k
                t.lock(s[i:j]); i = j
                continue
            if name in INLINE_CMDS or not name[0].isalpha():
                # inline: keep inside the prose, arguments included (they are prose too)
                k = j
                while k < n and s[k] == '{': k = t.group(k)
                t.prose(s[i:k]); i = k; continue
            if name == 'item':
                t.lock(s[i:j]); i = j
                if i < n and s[i] == '[':
                    k = t.group(i, '[', ']'); t.lock('['); sub = tokenize(s[i + 1:k - 1]); t.out += sub; t.lock(']'); i = k
                continue
            t.lock(s[i:j]); i = j
            # arguments
            while i < n and s[i] in '[{' or (i < n and s[i] == '*'):
                if s[i] == '*': t.lock('*'); i += 1; continue
                o, cl = (s[i], ']' if s[i] == '[' else '}')
                k = t.group(i, o, cl); inner = s[i + 1:k - 1]
                if name in LOCK_ARGS or o == '[' and ('=' in inner or not re.search(r'[A-Za-zÀ-ÿ]{3,}', inner)):
                    t.lock(s[i:k])
                else:
                    t.lock(o); t.out += tokenize(inner); t.lock(cl)
                i = k
            continue
        if s.startswith('{,}', i):
            t.prose('{,}'); i += 3; continue
        if c in '{}':
            t.lock(c); i += 1; continue
        if c == '\n' and s.startswith('\n\n', i):
            j = i
            while j < n and s[j] in '\n \t': j += 1
            t.lock(s[i:j]); i = j; continue
        if c == '&' or s.startswith('\\\\', i):
            t.lock(c); i += 1; continue
        t.prose(c); i += 1
    # merge adjacent same-kind chunks
    out = []
    for k, v in t.out:
        if out and out[-1][0] == k: out[-1] = (k, out[-1][1] + v)
        else: out.append((k, v))
    return out


def split(s):
    """Return (skeleton string with \x04 holes, [segments]). A segment is prose with maths as [[mN]] placeholders."""
    toks = tokenize(s)
    skel, segs = [], []
    for k, v in toks:
        core = v.strip()
        has_words = re.search(r'[A-Za-zÀ-ÿ]', re.sub('\x00.*?\x01', '', v, flags=re.S))
        if k == 'L' or not has_words:
            skel.append(v); continue
        lead = v[:len(v) - len(v.lstrip())]; trail = v[len(v.rstrip()):]
        maths = re.findall('\x00(.*?)\x01', core, re.S)
        k_ = iter(range(1, 999))
        text = re.sub('\x00.*?\x01', lambda m: '[[m%d]]' % next(k_), core, flags=re.S)
        segs.append({'text': text, 'maths': maths})
        skel.append(lead + '\x04' + trail)
    return ''.join(skel), segs


def seg_id(text):
    return hashlib.sha1(re.sub(r'\s+', ' ', text).strip().encode()).hexdigest()[:10]


def skeleton_key(skel):
    sk = re.sub(r'(?<!\\)%[^\n]*', '', skel)
    sk = re.sub('\x02(.*?)\x03', lambda m: norm_math(m.group(1), ''), sk, flags=re.S)
    sk = re.sub('\x00(.*?)\x01', lambda m: norm_math(m.group(1), ''), sk, flags=re.S)
    sk = re.sub(r'\\,(?=[;:!?])|~(?=[;:!?])', '', sk)        # French thin space before high punctuation
    sk = re.sub(r'(?<=\d)\{,\}(?=\d)', '.', sk)
    return re.sub(r'\s+', '', sk)


def align(fr_text, en_text):
    """Return (ok, reason, pairs)."""
    sf, segf = split(fr_text); se, sege = split(en_text)
    if skeleton_key(sf) != skeleton_key(se):
        a, b = skeleton_key(sf), skeleton_key(se)
        k = next((i for i, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))
        return False, 'skeleton differs near: FR %r | EN %r' % (a[max(0, k - 40):k + 40], b[max(0, k - 40):k + 40]), []
    if len(segf) != len(sege):
        return False, 'segment count %d vs %d' % (len(segf), len(sege)), []
    pairs = []
    for a, b in zip(segf, sege):
        ma = sorted(norm_math(x, 'fr') for x in a['maths']); mb = sorted(norm_math(x, 'en') for x in b['maths'])
        if ma != mb:
            return False, 'maths differ in segment %r | %r' % (a['text'][:80], b['text'][:80]), []
        pairs.append((a, b))
    return True, '', pairs


if __name__ == '__main__':
    src = Path(sys.argv[1])
    stats = {'ok': 0, 'bad': 0}; bad = []; nseg = 0
    for fr in sorted(src.rglob('*.tex')):
        if fr.stem.endswith('-en'): continue
        en = fr.with_name(fr.stem + '-en.tex')
        if not en.exists(): continue
        try:
            ok, why, pairs = align(fr.read_text(), en.read_text())
        except Exception as e:
            ok, why, pairs = False, 'tokenizer: %s' % e, []
        stats['ok' if ok else 'bad'] += 1; nseg += len(pairs)
        if not ok: bad.append((str(fr.relative_to(src)), why))
    print(stats, 'segments aligned:', nseg)
    for b in bad: print(' ', b[0], '::', b[1][:300].replace('\n', ' '))
