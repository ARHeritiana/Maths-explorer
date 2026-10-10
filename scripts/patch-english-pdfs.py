"""Apply reviewed English corrections to the existing English PDF editions.

Usage: python scripts/patch-english-pdfs.py [path ...]

The English editions overlay translated prose on the original French layout
(see translate-resources.py); styling later wrapped each page in a form
XObject ("fullpage"). This script edits only those overlay text blocks in
place: equations, figures and every other drawing command are untouched.

Each overlay sits on the baseline of the French span it replaces, so its
French source is identified from the French edition's text at the same
position. The replacement is then, in order of precedence:
  1. docs/translation-context-corrections.json  "<paragraph>:<index>" ->
     {french, english}, for a segment whose wording depends on its neighbours
     (word order across segments, a shorter wording where space is tight);
     <paragraph> hashes the French sources of the paragraph's segments;
  2. docs/translation-corrections.json          French -> reviewed English.
A block whose source cannot be located falls back to its machine English, when
that output is unambiguous. A replacement may use the width of the French
text it covers and is condensed horizontally only beyond that, so it never
covers adjacent mathematics. The excerpt running header is rewritten from the
file name.
"""
import json, re, sys, hashlib, unicodedata
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
cache = json.loads((ROOT / 'docs/translation-cache.json').read_text())
corrections = json.loads((ROOT / 'docs/translation-corrections.json').read_text())
CONTEXT_FILE = ROOT / 'docs/translation-context-corrections.json'
context = json.loads(CONTEXT_FILE.read_text()) if CONTEXT_FILE.exists() else {}
BLOCK = re.compile(rb'q\nBT\n([-\d.]+) 0 0 1 ([-\d.]+) 0 cm\n1 0 0 1 ([-\d.]+) ([-\d.]+) Tm\n/(ti\w\w) ([\d.]+) Tf ([^\[]*)\[<([0-9a-f]*)>\]TJ\nET\nQ')
HEADER = re.compile(r'^Maths Explore')
LATIN = str.maketrans({'’': "'", '‘': "'", '“': '"', '”': '"',
                       '–': '-', '—': '-', '…': '...', ' ': ' ', '\xa0': ' ', '−': '-', '×': 'x', '•': '\xb7'})

def latin(text):
    text = re.sub(r'«[\s\u202f]*|[\s\u202f]*»', '"', text)
    text = unicodedata.normalize('NFC', text.translate(LATIN))
    return text.encode('latin-1', 'replace').decode('latin-1')

def norm(text):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', text).translate(LATIN))

def reviewed(source):
    return corrections.get(source, cache[source])

# Machine output -> French sources, for locating a block's source and for the
# fallback when position does not identify it.
by_output = {}
for source, english in cache.items():
    by_output.setdefault(latin(english).strip(), set()).add(source)
by_prefix = {}
for source in cache:
    by_prefix.setdefault(norm(source)[:6], []).append(source)

context_outputs = {}
for entry in context.values():
    context_outputs.setdefault(entry['french'], set()).add(latin(entry['english']).strip())

def header_for(path):
    kind = path.stem.removesuffix('-en')
    return f'Maths Explorer | {kind} | {path.parent.name}'

def outer_matrix(doc, page):
    for xref, name, *_ in page.get_xobjects():
        if name == 'fzFrm0':
            m = re.search(r'/Matrix \[ ([^\]]+) \]', doc.xref_object(xref))
            return [float(v) for v in m[1].split()]
    return [1, 0, 0, 1, 0, 0]

def french_spans(doc, number):
    """French spans as (x, y, text) in the coordinates of the overlay stream."""
    page = doc[number]
    a, _, _, d, e, f = outer_matrix(doc, page)
    height = page.rect.height
    return [((s['origin'][0] - e) / a, (height - s['origin'][1] - f) / d, s['text'])
            for b in page.get_text('dict')['blocks'] for l in b.get('lines', []) for s in l['spans']]

def candidates(spans, x, y):
    """French sources whose text starts at (x, y) in the French edition."""
    line = norm(''.join(t for _, t in sorted((sx, t) for sx, sy, t in spans if abs(sy - y) < 1.2 and sx >= x - 3)))
    return [s for n in range(1, 7) for s in by_prefix.get(line[:n], []) if line.startswith(norm(s))]

def locate(found, current):
    """The candidate whose machine, reviewed or contextual English is on the block."""
    found = [s for s in found if current in {latin(cache[s]).strip(), latin(reviewed(s)).strip()}
             or current in context_outputs.get(s, ())]
    return max(found, key=len) if found else None

def fallback(current):
    sources = by_output.get(current, set())
    texts = {reviewed(s) for s in sources}
    return (next(iter(sources)), texts.pop()) if len(texts) == 1 else (None, None)

def paragraphs(blocks):
    """Group consecutive overlay blocks into paragraphs: same line, or the next
    line within two font sizes below."""
    groups = []
    for b in blocks:
        last = groups[-1][-1] if groups else None
        if last and (abs(last['y'] - b['y']) < 1.5 or 0 < last['y'] - b['y'] < 2 * max(last['size'], b['size'])):
            groups[-1].append(b)
        else:
            groups.append([b])
    return groups

def signature(group):
    """Stable key of a paragraph from the French edition alone: the longest
    French source starting at each block's position, in order."""
    joined = '\u2016'.join(b['position'] or '' for b in group)
    return hashlib.sha1(joined.encode()).hexdigest()[:16]

def read_blocks(raw, path, spans):
    blocks = []
    for m in BLOCK.finditer(raw):
        a, e, x, y, font, size, colour, hexa = m.groups()
        old = bytes.fromhex(hexa.decode()).decode('latin-1')
        core = old.strip()
        current = latin(core).strip()
        b = {'m': m, 'old': old, 'core': core, 'x': float(x), 'y': float(y), 'size': float(size), 'font': font.decode(), 'a': float(a)}
        b['header'] = bool(HEADER.match(core)) and b['size'] <= 9.5
        if b['header']:
            b['source'], b['position'], b['new'] = None, None, header_for(path)
        else:
            found = candidates(spans, b['x'], b['y'])
            b['position'] = max(found, key=len) if found else None
            b['source'] = locate(found, current)
            b['located'] = b['source'] is not None
            if b['located']:
                b['new'] = reviewed(b['source'])
            else:
                b['source'], b['new'] = fallback(current)
                if b['source'] is None and ' \xb7 ' in core:
                    # Headings were typeset with a middle dot where the cache has a dash.
                    b['source'], b['new'] = fallback(current.replace(' \xb7 ', ' - '))
                    b['new'] = b['new'] and b['new'].replace(' – ', ' · ').replace(' - ', ' · ')
        blocks.append(b)
    for group in paragraphs(blocks):
        key = signature(group)
        # Without any located French text the key would be shared by unrelated
        # paragraphs (running headers, labels), so no context applies.
        anchored = any(b['position'] for b in group)
        for i, b in enumerate(group):
            b['context'] = f'{key}:{i}'
            if anchored and not b['header'] and b['context'] in context:
                b['new'] = context[b['context']]['english']
    return blocks

def patch_stream(raw, path, number, spans, stats):
    where = f'{path.relative_to(ROOT / "dist/resources")}|{number + 1}'
    blocks = read_blocks(raw, path, spans)
    out, last = [], 0
    for b in blocks:
        m, old, core, new, source = b['m'], b['old'], b['core'], b['new'], b['source']
        out.append(raw[last:m.start()]); last = m.end()
        if not b['header'] and not b.get('located'):
            stats['unlocated'] += 1
        if new is None or latin(new).strip() == core:
            if b['a'] < 0.6 and not b['header']:
                stats['tight'].append({'file': where, 'context': b['context'], 'source': source, 'text': core, 'scale': round(b['a'], 2)})
            out.append(m[0])
            continue
        lead = ' ' if old.startswith(' ') else ''
        trail = ' ' if old.endswith(' ') else ''
        new = lead + latin(new).strip() + trail
        length = lambda t: pymupdf.get_text_length(t, fontname=b['font'], fontsize=b['size'])
        # The French text this overlay replaces is free space for the English.
        available = max(length(old) * b['a'], length(latin(source)) if source else 0)
        scale = 1.0 if b['header'] else min(1.0, available / max(length(new), 0.01))
        stats['spans'] += 1
        if scale < 0.6 and not b['header']:
            stats['tight'].append({'file': where, 'context': b['context'], 'source': source, 'text': new.strip(), 'scale': round(scale, 2)})
        x = b['x']
        out.append((f'q\nBT\n{scale:.5f} 0 0 1 {x * (1 - scale):.5f} 0 cm\n1 0 0 1 {m[3].decode()} {m[4].decode()} Tm\n'
                    f'/{b["font"]} {m[6].decode()} Tf {m[7].decode()}[<{new.encode("latin-1").hex()}>]TJ\nET\nQ').encode('latin-1'))
    out.append(raw[last:])
    return b''.join(out)

def patch(path, stats):
    doc = pymupdf.open(path)
    french = pymupdf.open(path.with_name(path.name.removesuffix('-en.pdf') + '.pdf'))
    changed = False
    for number, page in enumerate(doc):
        spans = None
        for xref, name, *_ in page.get_xobjects():
            if name != 'fullpage':
                continue
            raw = doc.xref_stream(xref)
            if not BLOCK.search(raw):
                continue
            spans = spans if spans is not None else french_spans(french, number)
            new = patch_stream(raw, path, number, spans, stats)
            if new != raw:
                doc.update_stream(xref, new)
                changed = True
    french.close()
    if changed:
        tmp = path.with_suffix('.patch.pdf')
        doc.save(tmp, garbage=4, deflate=True)
        doc.close()
        tmp.replace(path)
        stats['files'] += 1
    else:
        doc.close()

if __name__ == '__main__':
    targets = [Path(p).resolve() for p in sys.argv[1:]] or sorted((ROOT / 'dist/resources').rglob('*-en.pdf'))
    targets = [p for p in targets if 'enrichment' not in p.parts]
    stats = {'files': 0, 'spans': 0, 'unlocated': 0, 'tight': []}
    for path in targets:
        patch(path, stats)
    report = ROOT / 'docs/TRANSLATION_CORRECTIONS_LEDGER.json'
    report.write_text(json.dumps({
        'method': 'Reviewed corrections applied to overlay text blocks located by the French text at the same position; mathematics and figures untouched.',
        'corrections': len(corrections), 'contextCorrections': len(context),
        'filesChangedLastRun': stats['files'], 'spansReplacedLastRun': stats['spans'], 'blocksNotLocatedLastRun': stats['unlocated'],
        'condensedBelow60Percent': stats['tight'],
        'sha256': {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in targets},
    }, ensure_ascii=False, indent=2) + '\n')
    print(f"{stats['files']} files changed; {stats['spans']} spans replaced; {stats['unlocated']} blocks not located; {len(stats['tight'])} condensed below 60%.")
