"""Every downloadable resource exists in French and English with the same number of pages (dist/resources)."""
import sys
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
problems, n = [], 0
for fr in sorted((ROOT / 'dist/resources').rglob('*.pdf')):
    if fr.stem.endswith('-en'): continue
    en = fr.with_name(fr.stem + '-en.pdf'); n += 1
    if not en.exists(): problems.append(f'{fr.relative_to(ROOT)}: no English edition'); continue
    with pymupdf.open(fr) as a, pymupdf.open(en) as b:
        if len(a) != len(b): problems.append(f'{fr.relative_to(ROOT)}: {len(a)} pages, English {len(b)}')
print('\n'.join(problems) if problems else f'pdf parity: {n} FR/EN pairs with equal page counts')
sys.exit(1 if problems else 0)
