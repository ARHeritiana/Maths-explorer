"""Replace the few French glyphs left visible in the English PDF editions.

Usage: python scripts/fix-french-glyphs.py [path ...]

translate-resources.py overlays only spans containing a word of two letters or
more, so some French survived in the original fonts: guillemets « », the
preposition "à" set between formulas (−2 à +∞), "et" inside italic maths lines
and the verb "a" in two formulas. This script:
  * covers each such glyph with the sampled background colour (the original
    font programs embed their own encoding, so it cannot be hidden reliably at
    font level) and draws the English equivalent in the overlay font: a
    straight quotation mark hugging the quoted text, "to" or "at" for "à",
    "and" for "et", ":" or nothing for the verb "a";
  * maps the codes of « » à to a space in each font's ToUnicode map, so text
    copied from the page no longer contains them.
Only visible text is considered (clipped excerpt text is ignored). Applied
fixes are recorded in docs/FRENCH_GLYPH_FIXES.json, which makes reruns no-ops.
"""
import json, re, sys, collections
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / 'docs/FRENCH_GLYPH_FIXES.json'
FLAGS = pymupdf.TEXTFLAGS_RAWDICT | pymupdf.TEXT_CLIP
GLYPHS = {'«': 'guillemotleft', '»': 'guillemotright', 'à': 'agrave'}
# Context-dependent words drawn over a background patch: (font part, line regex, word, English).
COVER = [('Ital', r'(?<![\wÀ-ÿ])et(?![\wÀ-ÿ])', 'et', 'and'),
         ('Roma', r'\bH a x', 'a', ':'),
         ('Roma', r'M\s*n\s*a$', 'a', '')]

def rgb(colour):
    return ((colour >> 16) / 255, ((colour >> 8) & 255) / 255, (colour & 255) / 255)

def lines(page):
    for b in page.get_text('rawdict', flags=FLAGS)['blocks']:
        for l in b.get('lines', []):
            chars = [dict(ch, font=s['font'], size=s['size'], color=s['color']) for s in l['spans'] for ch in s['chars']]
            yield chars, ''.join(c['c'] for c in chars)

def neighbour(chars, i, step):
    j = i + step
    while 0 <= j < len(chars) and chars[j]['c'].isspace():
        j += step
    return chars[j] if 0 <= j < len(chars) and abs(chars[j]['origin'][1] - chars[i]['origin'][1]) < 2 else None

def background(page, rect):
    """Most frequent colour on a ring just outside rect."""
    pix = page.get_pixmap(clip=rect + (-1.5, -1.5, 1.5, 1.5), dpi=200)
    count = collections.Counter()
    for y in range(pix.height):
        for x in range(pix.width):
            if x in (0, pix.width - 1) or y in (0, pix.height - 1):
                count[pix.pixel(x, y)[:3]] += 1
    return tuple(v / 255 for v in count.most_common(1)[0][0])

def write(page, x, y, text, ch, width=None):
    size = ch['size']
    natural = pymupdf.get_text_length(text, fontname='tiro', fontsize=size)
    scale = min(1.0, width / natural) if width and natural else 1.0
    page.insert_text((x, y), text, fontname='tiro', fontsize=size, color=rgb(ch['color']),
                     morph=(pymupdf.Point(x, y), pymupdf.Matrix(scale, 1)))

def clean_text(doc, fonts):
    """Map the codes of « » à to a space in ToUnicode, so copied text is clean."""
    encodings = {}  # encoding xref -> codes of the hidden glyphs (encodings are shared)
    for xref in range(1, doc.xref_length()):
        obj = doc.xref_object(xref)
        name = re.search(r'/BaseFont /(?:\w+\+)?(\S+)', obj)
        if '/Type /Font' not in obj or not name or name[1] not in fonts:
            continue
        enc = re.search(r'/Encoding (\d+) 0 R', obj)
        codes = []
        if enc and int(enc[1]) in encodings:
            codes = encodings[int(enc[1])]
        elif enc:
            e = doc.xref_object(int(enc[1]))
            diff = re.search(r'/Differences \[(.*?)\]', e, re.S)
            if diff:
                code, items = 0, re.findall(r'\d+|/[^\s/\[\]]+', diff[1])
                for item in items:
                    if item[0] != '/':
                        code = int(item); continue
                    if item[1:] in GLYPHS.values():
                        codes.append(code)
                    code += 1
            encodings[int(enc[1])] = codes
        tu = re.search(r'/ToUnicode (\d+) 0 R', obj)
        if tu and codes:
            cmap = doc.xref_stream(int(tu[1])).decode('latin-1')
            doc.update_stream(int(tu[1]), retarget(cmap, set(codes)).encode('latin-1'))

def retarget(cmap, codes):
    """Map the given single-byte codes to U+0020, splitting bfranges as needed."""
    def bfchar(m):
        return re.sub(r'<([0-9A-Fa-f]{2})>\s*<([0-9A-Fa-f]+)>',
                      lambda c: f'<{c[1]}> <0020>' if int(c[1], 16) in codes else c[0], m[0])
    cmap = re.sub(r'beginbfchar.*?endbfchar', bfchar, cmap, flags=re.S)
    extra = []
    def bfrange(m):
        out = []
        for lo, hi, dst in re.findall(r'<([0-9A-Fa-f]{2})>\s*<([0-9A-Fa-f]{2})>\s*(<[0-9A-Fa-f]+>|\[[^\]]*\])', m[0]):
            lo, hi = int(lo, 16), int(hi, 16)
            if not any(lo <= c <= hi for c in codes):
                out.append(f'<{lo:02X}> <{hi:02X}> {dst}'); continue
            for c in range(lo, hi + 1):
                if c in codes:
                    extra.append(f'<{c:02X}> <0020>')
                elif dst.startswith('<'):
                    extra.append(f'<{c:02X}> <{int(dst[1:-1], 16) + c - lo:04X}>')
                else:
                    extra.append(f'<{c:02X}> {re.findall(r"<[0-9A-Fa-f]+>", dst)[c - lo]}')
        return f'{len(out)} beginbfrange\n' + '\n'.join(out) + '\nendbfrange'
    cmap = re.sub(r'\d+\s+beginbfrange.*?endbfrange', bfrange, cmap, flags=re.S)
    if extra:
        cmap = cmap.replace('endcmap', f'{len(extra)} beginbfchar\n' + '\n'.join(extra) + '\nendbfchar\nendcmap', 1)
    return cmap

def fix(path, ledger, stats):
    rel = str(path.relative_to(ROOT))
    done = set(ledger.get(rel, []))
    doc = pymupdf.open(path)
    fonts, todo = set(), []
    for number, page in enumerate(doc):
        for chars, line in lines(page):
            for i, ch in enumerate(chars):
                if ch['font'].startswith('Times') or ch['c'] not in GLYPHS:
                    continue
                fonts.add(re.sub(r'^\w+\+', '', ch['font']))
                todo.append((number, 'glyph', i, chars, line))
            for part, pattern, word, english in COVER:
                for m in re.finditer(pattern, line):
                    start = line.find(word, m.start())
                    span = chars[start:start + len(word)]
                    # A real word: same size and baseline throughout (not e^t), spaces around.
                    word_like = span and all(abs(c['size'] - span[0]['size']) < 0.1 and abs(c['origin'][1] - span[0]['origin'][1]) < 0.3 for c in span)
                    before = chars[start - 1]['c'] if start > 0 else ' '
                    after = chars[start + len(word)]['c'] if start + len(word) < len(chars) else ' '
                    if word_like and before.isspace() and after.isspace() and part in span[0]['font'] and not span[0]['font'].startswith('Times'):
                        todo.append((number, 'cover', (span, english), chars, line))
    changed = False
    for number, kind, item, chars, line in todo:
        page = doc[number]
        if kind == 'glyph':
            ch = chars[item]
            key = f"{number + 1}|{ch['c']}|{ch['origin'][0]:.1f}|{ch['origin'][1]:.1f}"
            if key in done:
                continue
            x, y = ch['origin']
            rect = pymupdf.Rect(ch['bbox'])
            page.draw_rect(rect + (0.15, 0.2, -0.15, -0.2), color=None, fill=background(page, rect), overlay=True)
            if ch['c'] == '«':
                nxt = neighbour(chars, item, 1)
                text = '"'
                if nxt:
                    x = nxt['bbox'][0] - pymupdf.get_text_length(text, fontname='tiro', fontsize=ch['size'])
                write(page, x, y, text, ch)
            elif ch['c'] == '»':
                prev = neighbour(chars, item, -1)
                write(page, prev['bbox'][2] if prev else x, y, '"', ch)
            else:
                text = 'at' if re.search(r'à\s*(\d+\s*h\b|t\s*=)', line) else 'to'
                nxt = neighbour(chars, item, 1)
                write(page, x, y, text, ch, (nxt['bbox'][0] - x - 0.2 * ch['size']) if nxt else None)
        else:
            span, english = item
            ch = span[0]
            key = f"{number + 1}|cover|{ch['origin'][0]:.1f}|{ch['origin'][1]:.1f}"
            if key in done:
                continue
            rect = pymupdf.Rect(span[0]['bbox']) | pymupdf.Rect(span[-1]['bbox'])
            page.draw_rect(rect + (0.1, 0.4, -0.1, -0.4), color=None, fill=background(page, rect), overlay=True)
            if english:
                nxt = neighbour(chars, chars.index(span[-1]), 1)
                width = (nxt['bbox'][0] - ch['origin'][0] - 0.2 * ch['size']) if nxt else None
                write(page, ch['origin'][0], ch['origin'][1], english, ch, width)
        done.add(key); stats[kind] += 1; changed = True
    if fonts and changed:
        clean_text(doc, fonts)
    if changed:
        tmp = path.with_suffix('.glyphs.pdf')
        doc.save(tmp, garbage=4, deflate=True)
        doc.close()
        tmp.replace(path)
        ledger[rel] = sorted(done)
        stats['files'] += 1
    else:
        doc.close()

if __name__ == '__main__':
    targets = [Path(p).resolve() for p in sys.argv[1:]] or sorted((ROOT / 'dist/resources').rglob('*-en.pdf'))
    targets = [p for p in targets if 'enrichment' not in p.parts]
    ledger = json.loads(LEDGER.read_text()) if LEDGER.exists() else {}
    stats = collections.Counter()
    for path in targets:
        fix(path, ledger, stats)
    LEDGER.write_text(json.dumps(dict(sorted(ledger.items())), ensure_ascii=False, indent=1) + '\n')
    print(f"{stats['files']} files changed; {stats['glyph']} glyphs replaced; {stats['cover']} words covered.")
