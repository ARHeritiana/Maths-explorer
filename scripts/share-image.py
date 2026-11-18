"""Draw the share image (site/share.png, 1280 x 640): the picture GitHub and social sites show for a link to the site.

Design v8 "Bande dessinée" (docs/DESIGN_V8.md): halftone yellow page, a white panel outlined in ink with a solid shadow
holding the title "Les maths, ça se joue." in Anton capitals, the starburst mark with pi, and a red starburst breaking
out of the right edge. Fonts are the TeX copies of the site's fonts (content/tex/core/fonts, made by
scripts/tex-fonts.py). Run: python3 scripts/share-image.py
The same image must also be uploaded by hand as the repository's social preview (GitHub, Settings, General).
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'content/tex/core/fonts'
K = 2                                   # drawn at twice the size, then reduced: smooth edges without anti-aliasing calls
W, H = 1280 * K, 640 * K
YELLOW, INK, WHITE, RED, BLUE, DOT = '#FFE14D', '#111111', '#FFFFFF', '#E11D2E', '#1D4ED8', '#F2B53F'
JIT = [1, .88, 1.06, .93, 1.02, .86, 1.08, .95, .9, 1.04, .97, .87, 1.05, .92, 1.01, .89]


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size * K)


def burst(cx, cy, outer, inner, n=16):
    """A comic starburst: n outer points with the site's fixed irregularity (site/js/motion.js)."""
    pts = []
    for i in range(2 * n):
        a = -math.pi / 2 + i * math.pi / n
        r = inner if i % 2 else outer * JIT[(i // 2) % len(JIT)]
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def main():
    img = Image.new('RGB', (W, H), YELLOW)
    d = ImageDraw.Draw(img)
    s = lambda v: v * K
    for y in range(0, H, s(14)):            # the halftone
        for x in range(0, W, s(14)):
            d.ellipse([x + s(4), y + s(4), x + s(10), y + s(10)], fill=DOT)
    # a red starburst breaking out of the right edge
    d.polygon(burst(s(1150), s(330), s(300), s(205)), fill=RED, outline=INK, width=s(8))
    # the panel: solid shadow, then white with an ink outline
    d.rectangle([s(70), s(150), s(900), s(540)], fill=INK)
    d.rectangle([s(58), s(138), s(888), s(528)], fill=WHITE, outline=INK, width=s(6))
    # the mark and the wordmark
    d.polygon(burst(s(102), s(70), s(42), s(30), 12), fill=RED, outline=INK, width=s(5))
    d.text((s(102), s(72)), 'π', font=font('Anton-Regular.ttf', 40), fill=WHITE, anchor='mm', stroke_width=s(2), stroke_fill=INK)
    word = font('Anton-Regular.ttf', 44)
    d.text((s(160), s(44)), 'MATHS ', font=word, fill=INK)
    d.text((s(160) + d.textlength('MATHS ', font=word), s(44)), 'EXPLORER', font=word, fill=RED)
    # the line and the subtitle
    head = font('Anton-Regular.ttf', 108)
    for i, (line, colour) in enumerate((('LES MATHS,', INK), ('ÇA SE JOUE.', RED))):
        y = s(166) + i * s(124)
        if colour == RED:
            d.text((s(98) + s(5), y + s(5)), line, font=head, fill=INK)
        d.text((s(98), y), line, font=head, fill=colour)
    d.text((s(100), s(442)), 'Cours, labos et défis du lycée, gratuits', font=font('ComicNeue-Bold.ttf', 36), fill=BLUE)
    out = ROOT / 'site/share.png'
    img.resize((1280, 640), Image.LANCZOS).save(out, optimize=True)
    print('wrote', out.relative_to(ROOT), out.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
