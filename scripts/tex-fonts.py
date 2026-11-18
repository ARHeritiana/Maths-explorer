"""Make the OpenType files the TeX core loads (content/tex/core/fonts/) from the web fonts of the site (site/fonts/).

XeTeX cannot read WOFF2 and uses only the default instance of a variable font, so each face listed in
content/tex/core/fonts/fonts.json is decompressed, fixed at its axis values (weight, width) and its latin and latin-ext
subsets merged into one TrueType file. A face with "fallback" also receives, from that font (STIX Two Text, shipped in
fonts/), every character it lacks (U+00A0 to U+2FFF: symbols such as ℃, Greek in prose, rare Latin letters), so the PDFs
never miss a glyph whatever the macro around it. The list is brand data (which faces, which weights); this script is
the same in every repository. Run after changing a site font or the list: python3 scripts/tex-fonts.py
"""
import json, sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.merge import Merger
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parents[1]
SITE, OUT = ROOT / 'site/fonts', ROOT / 'content/tex/core/fonts'


def face(sources, axes, family, style):
    parts = []
    for i, name in enumerate(sources):
        font = TTFont(SITE / name)
        font.flavor = None
        if 'fvar' in font:
            font = instantiateVariableFont(font, {k: v for k, v in axes.items() if k in {a.axisTag for a in font['fvar'].axes}})
        tmp = OUT / f'.part{i}.ttf'
        font.save(tmp)
        parts.append(tmp)
    merged = Merger().merge([str(p) for p in parts]) if len(parts) > 1 else TTFont(parts[0])
    for p in parts: p.unlink()
    # one family name per face, so fontspec finds it by file name and never confuses two instances
    names = merged['name']
    for rec in list(names.names):
        if rec.nameID in (1, 2, 4, 6, 16, 17): names.removeNames(nameID=rec.nameID)
    # no contact addresses in shipped files (tests/banned.py): a designer's e-mail in the name table goes
    for rec in list(names.names):
        if '@' in rec.toUnicode(): names.removeNames(nameID=rec.nameID, platformID=rec.platformID, platEncID=rec.platEncID, langID=rec.langID)
    # fixed dates, so the same sources always give the same bytes (no change in git, no rebuild of every PDF)
    merged.recalcTimestamp = False
    merged['head'].created = merged['head'].modified = 0x7C259DC0   # 2000-01-01
    full = f'{family} {style}'
    for nid, value in ((1, family), (2, 'Regular'), (4, full), (6, full.replace(' ', '-'))):
        names.setName(value, nid, 3, 1, 0x409)
    return merged


def add_fallback(font, donor_file):
    """Copy into font the glyphs of donor_file (cubic outlines) for the characters font lacks; returns their number."""
    donor = TTFont(OUT / donor_file)
    glyphs, have = donor.getGlyphSet(), font.getBestCmap()
    scale = font['head'].unitsPerEm / donor['head'].unitsPerEm
    glyf, hmtx, order, added = font['glyf'], font['hmtx'], font.getGlyphOrder(), {}
    for cp, name in sorted(donor.getBestCmap().items()):
        if not 0xA0 <= cp < 0x3000 or cp in have: continue
        pen = TTGlyphPen(None)
        glyphs[name].draw(TransformPen(Cu2QuPen(pen, max_err=1, reverse_direction=True), (scale, 0, 0, scale, 0, 0)))
        new = f'fallback{cp:04X}'
        glyph = pen.glyph()
        order.append(new)
        font.setGlyphOrder(order)
        glyf[new] = glyph
        glyph.recalcBounds(glyf)
        hmtx[new] = (round(glyphs[name].width * scale), getattr(glyph, 'xMin', 0))
        added[cp] = new
    for table in font['cmap'].tables:
        if table.isUnicode(): table.cmap.update(added)
    return len(added)


def main():
    spec = json.loads((OUT / 'fonts.json').read_text())
    for out, d in spec['faces'].items():
        font = face(d['sources'], d.get('axes', {}), d['family'], d['style'])
        extra = add_fallback(font, d['fallback']) if 'fallback' in d else 0
        font.save(OUT / out)
        print('wrote', (OUT / out).relative_to(ROOT), f"{(OUT / out).stat().st_size // 1024} KB", f'(+{extra} from {d["fallback"]})' if extra else '')


if __name__ == '__main__':
    sys.exit(main())
