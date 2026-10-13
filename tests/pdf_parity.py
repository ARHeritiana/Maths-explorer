"""Every PDF has an equal-length twin, a language label and sheet counters local to that downloadable file."""
import sys, re
from pathlib import Path
import pymupdf
import banned

ROOT = Path(__file__).resolve().parents[1]
problems, n = [], 0
for fr in sorted((ROOT / 'dist/resources').rglob('*.pdf')):
    if fr.stem.endswith('-en'): continue
    en = fr.with_name(fr.stem + '-en.pdf'); n += 1
    if not en.exists(): problems.append(f'{fr.relative_to(ROOT)}: no English edition'); continue
    with pymupdf.open(fr) as a, pymupdf.open(en) as b:
        if len(a) != len(b): problems.append(f'{fr.relative_to(ROOT)}: {len(a)} pages, English {len(b)}')
        for path, document, language in ((fr, a, 'FR'), (en, b, 'EN')):
            for index, page in enumerate(document):
                header = ''.join(page.get_text(clip=pymupdf.Rect(0, 0, page.rect.width, 40)).split())
                footer = page.get_text(clip=pymupdf.Rect(0, page.rect.height - 30, page.rect.width, page.rect.height))
                counters = re.findall(r'(\d+)\s*/\s*(\d+)', footer)
                if 'MATHSEXPLORER' not in header or language not in header:
                    problems.append(f'{path.relative_to(ROOT)}: missing native frame/language on sheet {index+1}')
                if counters != [(str(index+1), str(len(document)))]:
                    problems.append(f'{path.relative_to(ROOT)}: wrong local sheet counter on sheet {index+1}')
                if any(banned.PERSONAL.search(link.get('uri', '')) for link in page.get_links()):
                    problems.append(f'{path.relative_to(ROOT)}: prohibited PDF link on sheet {index+1}')
print('\n'.join(problems) if problems else f'pdf parity: {n} FR/EN pairs, equal page counts, local sheet counters and safe links')
sys.exit(1 if problems else 0)
