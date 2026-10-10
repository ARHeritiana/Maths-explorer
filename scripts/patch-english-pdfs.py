"""Apply reviewed English corrections to the existing English PDF editions.

Usage: python scripts/patch-english-pdfs.py [path ...]

The English editions overlay translated prose on the original French layout
(see translate-resources.py); styling later wrapped each page in a form
XObject. This script edits only those overlay text blocks in place: equations,
figures and every other drawing command are untouched. Corrections come from
docs/translation-corrections.json (French source span -> reviewed English).
A replacement wider than the original overlay is condensed horizontally into
the same width, as the translator itself does, so it never covers adjacent
mathematics. The excerpt running header is rewritten from the file name.
"""
import json, re, sys, hashlib, unicodedata
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
cache = json.loads((ROOT / 'docs/translation-cache.json').read_text())
corrections = json.loads((ROOT / 'docs/translation-corrections.json').read_text())
BLOCK = re.compile(rb'q\nBT\n([-\d.]+) 0 0 1 ([-\d.]+) 0 cm\n1 0 0 1 ([-\d.]+) ([-\d.]+) Tm\n/(ti\w\w) ([\d.]+) Tf ([^\[]*)\[<([0-9a-f]*)>\]TJ\nET\nQ')
HEADER = re.compile(r'^Maths Explore')
LATIN = str.maketrans({'’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', ' ': ' ', ' ': ' ', '−': '-', '×': 'x'})

def latin(text):
    text = unicodedata.normalize('NFC', text.translate(LATIN))
    return text.encode('latin-1', 'replace').decode('latin-1')

# Old English value -> new English value, kept only when every French source
# sharing that machine output receives the same reviewed text.
mapping, conflicts = {}, set()
for source, english in corrections.items():
    old = cache.get(source)
    if old is None or old.strip() == english.strip():
        continue
    key = latin(old).strip()
    if key in mapping and mapping[key] != english:
        conflicts.add(key)
    mapping[key] = english
for key in conflicts:
    mapping.pop(key)

def header_for(path):
    kind = path.stem.removesuffix('-en')
    return f'Maths Explorer | {kind} | {path.parent.name}'

def patch_stream(raw, path, stats):
    def replace(m):
        a, e, x, y, font, size, colour, hexa = m.groups()
        old = bytes.fromhex(hexa.decode()).decode('latin-1')
        core = old.strip()
        new = header_for(path) if HEADER.match(core) and float(size) <= 9.5 else mapping.get(core)
        if new is None or new == core:
            return m[0]
        lead = ' ' if old.startswith(' ') else ''
        trail = ' ' if old.endswith(' ') else ''
        new = lead + latin(new) + trail
        a, x, size = float(a), float(x), float(size)
        available = pymupdf.get_text_length(old, fontname=font.decode(), fontsize=size) * a
        width = pymupdf.get_text_length(new, fontname=font.decode(), fontsize=size)
        scale = min(1.0, available / max(width, 0.01)) if available > 0 else 1.0
        stats['spans'] += 1
        if scale < 0.6:
            stats['tight'].append({'file': str(path.relative_to(ROOT)), 'text': new.strip(), 'scale': round(scale, 2)})
        out = (f'q\nBT\n{scale:.5f} 0 0 1 {x * (1 - scale):.5f} 0 cm\n1 0 0 1 {m[3].decode()} {m[4].decode()} Tm\n'
               f'/{font.decode()} {m[6].decode()} Tf {colour.decode()}[<{new.encode("latin-1").hex()}>]TJ\nET\nQ')
        return out.encode('latin-1')
    return BLOCK.sub(replace, raw)

def patch(path, stats):
    doc = pymupdf.open(path)
    xrefs = set()
    for page in doc:
        xrefs.update(page.get_contents())
        xrefs.update(x[0] for x in page.get_xobjects())
    changed = False
    for xref in sorted(xrefs):
        if not doc.xref_is_stream(xref):
            continue
        raw = doc.xref_stream(xref)
        new = patch_stream(raw, path, stats)
        if new != raw:
            doc.update_stream(xref, new)
            changed = True
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
    stats = {'files': 0, 'spans': 0, 'tight': []}
    for path in targets:
        patch(path, stats)
    report = ROOT / 'docs/TRANSLATION_CORRECTIONS_LEDGER.json'
    report.write_text(json.dumps({
        'method': 'Reviewed corrections applied to overlay text blocks; mathematics and figures untouched.',
        'corrections': len(corrections), 'mappedOutputs': len(mapping), 'ambiguousOutputsSkipped': len(conflicts),
        'filesChanged': stats['files'], 'spansReplaced': stats['spans'], 'condensedBelow60Percent': stats['tight'],
        'sha256': {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in targets},
    }, ensure_ascii=False, indent=2) + '\n')
    print(f"{stats['files']} files changed; {stats['spans']} spans replaced; {len(conflicts)} ambiguous outputs skipped; {len(stats['tight'])} condensed below 60%.")
