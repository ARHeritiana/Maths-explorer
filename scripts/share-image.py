"""Draw the share image (site/share.png, 1280 x 640): the picture GitHub and social sites show for a link to the site.

Design v7 "Bac à sable" (docs/DESIGN_V7.md): cream page, the mark and the wordmark, the line "Les maths, ça se touche.",
and three bright shapes outlined by nothing (a lilac disc, a sunflower Reuleaux triangle, a lagoon tile). Fonts are the
TeX copies of the site's fonts (content/tex/core/fonts, made by scripts/tex-fonts.py). Run: python3 scripts/share-image.py
The same image must also be uploaded by hand as the repository's social preview (GitHub, Settings, General).
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'content/tex/core/fonts'
K = 2                                   # drawn at twice the size, then reduced: smooth edges without anti-aliasing calls
W, H = 1280 * K, 640 * K
CREAM, INK, INK2 = '#FFF7EA', '#2B1E3F', '#4A3D5E'
TOMATO, TOMATO_TEXT, SUN, LAGOON, LILAC = '#E8492A', '#C8391B', '#FFBE2E', '#12867A', '#9C7BEA'


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size * K)


def reuleaux(cx, cy, height):
    """Points of a Reuleaux triangle of the given height (width = side), apex up, centred on (cx, cy)."""
    side = height / 0.866   # the triangle's side, from the height of its box
    a = (cx, cy - height * 0.55)
    b = (a[0] + side / 2, a[1] + side * 0.866)
    c = (a[0] - side / 2, a[1] + side * 0.866)
    pts = []
    for centre, start, end in ((c, 60, 0), (a, -60, -120), (b, 180, 120)):
        for i in range(41):
            t = math.radians(start + (end - start) * i / 40)
            pts.append((centre[0] + side * math.cos(t), centre[1] - side * math.sin(t)))
    return pts, (cx, a[1] + side * 0.577)   # outline and the centre of the dot


def main():
    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img)
    s = lambda v: v * K
    # shapes at the right, partly off the edges
    d.ellipse([s(1010), s(400), s(1010 + 520), s(400 + 520)], fill=LILAC)
    pts, _ = reuleaux(s(1000), s(250), s(380))
    d.polygon(pts, fill=SUN)
    tile = Image.new('RGBA', (s(150), s(150)), (0, 0, 0, 0))
    ImageDraw.Draw(tile).rounded_rectangle([0, 0, s(150), s(150)], radius=s(44), fill=LAGOON)
    tile = tile.rotate(-14, resample=Image.BICUBIC, expand=True)
    img.paste(tile, (s(790), s(430)), tile)
    # the mark and the wordmark
    pts, dot = reuleaux(s(108), s(112), s(78))
    d.polygon(pts, fill=TOMATO)
    d.ellipse([dot[0] - s(9), dot[1] - s(9), dot[0] + s(9), dot[1] + s(9)], fill=CREAM)
    word = font('BricolageGrotesque-ExtraBold.ttf', 48)
    d.text((s(166), s(84)), 'maths ', font=word, fill=INK)
    d.text((s(166) + d.textlength('maths ', font=word), s(84)), 'explorer', font=word, fill=TOMATO_TEXT)
    # the line and the subtitle
    head = font('BricolageGrotesque-ExtraBold.ttf', 104)
    for i, line in enumerate(('Les maths,', 'ça se touche.')):
        d.text((s(72), s(232) + i * s(104)), line, font=head, fill=INK)
    d.text((s(76), s(500)), 'Cours, labos et défis du lycée, gratuits', font=font('AtkinsonHyperlegible-Regular.ttf', 34), fill=INK2)
    out = ROOT / 'site/share.png'
    img.resize((1280, 640), Image.LANCZOS).save(out, optimize=True)
    print('wrote', out.relative_to(ROOT), out.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
