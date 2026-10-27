"""Validate independent PDF editions, local counters and safe links without translation parity assumptions."""
import sys, re, json
from pathlib import Path
import pymupdf
import banned

ROOT = Path(__file__).resolve().parents[1]
problems, n = [], 0
manifest = json.loads((ROOT / 'content/data/manifest.json').read_text())
languages = {}
for resource in manifest['catalog']['resources']:
    for lang, edition in resource.get('editions', {}).items():
        path = ROOT / 'dist' / edition['path'].removeprefix('./')
        if path.suffix == '.pdf': languages[path] = lang.upper()
source_layout = set()
if 'university' in manifest:
    index = json.loads((ROOT / 'dist/resources/university/index.json').read_text())
    source_layout = {ROOT / 'dist' / f['path'] for f in index['files'].values() if f['path'].endswith('.pdf')}
# Hand-supplied standalone editions explicitly retain their source layout, like university imports.
source_layout |= {ROOT / 'dist' / edition['path'].removeprefix('./')
                  for resource in manifest['catalog']['resources']
                  for edition in resource.get('editions', {}).values() if edition.get('layout') == 'source'}
for path in sorted((ROOT / 'dist/resources').rglob('*.pdf')):
    n += 1
    with pymupdf.open(path) as document:
        for index, page in enumerate(document):
            if path not in source_layout:
                header = ''.join(page.get_text(clip=pymupdf.Rect(0, 0, page.rect.width, 40)).split())
                footer = page.get_text(clip=pymupdf.Rect(0, page.rect.height - 30, page.rect.width, page.rect.height))
                counters = re.findall(r'(\d+)\s*/\s*(\d+)', footer)
                if 'MATHSEXPLORER' not in header or (path in languages and languages[path] not in header):
                    problems.append(f'{path.relative_to(ROOT)}: missing native frame/language on sheet {index+1}')
                if counters != [(str(index+1), str(len(document)))]:
                    problems.append(f'{path.relative_to(ROOT)}: wrong local sheet counter on sheet {index+1}')
            if any(banned.PERSONAL.search(link.get('uri', '')) for link in page.get_links()):
                problems.append(f'{path.relative_to(ROOT)}: prohibited PDF link on sheet {index+1}')
print('\n'.join(problems) if problems else f'pdf checks: {n} independent PDF editions; local counters, declared languages and safe links')
sys.exit(1 if problems else 0)
