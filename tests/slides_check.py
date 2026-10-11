"""Validate hand-translated Terminale decks against their French drafts: same slide count/kinds, same mathematics,
same HTML structure, no TeX leftovers, no school/teacher/Drive identifiers."""
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tests'))
import banned
def norm(m): return re.sub(r'(\d),(\d)', r'\1.\2', m.replace('{,}', '.')).replace('\\,', '').replace('\\;', '').replace('~', '').replace(' ', '').replace('\n', '')
def strip_text(m): return re.sub(r'\\(?:text|mathrm|mbox|textrm)\{[^{}]*\}', '', m)
def math(h): return sorted(norm(strip_text(x)) for x in re.findall(r'\\\(.*?\\\)|\\\[.*?\\\]', h, re.S))
def tags(h): return re.findall(r'</?(?:b|i|u|code|sup|br|ul|ol|li)>', re.sub(r'\\\(.*?\\\)|\\\[.*?\\\]', '', h, flags=re.S))
bad = 0
for n in (int(a) for a in sys.argv[1:]) or range(1, 15):
    fr = json.loads((ROOT / f'content/slides/draft/terminale-{n:02d}.fr.json').read_text(encoding='utf8'))['slides']
    p = ROOT / f'content/slides/terminale-{n:02d}.json'
    if not p.exists(): print('missing', p.name); bad += 1; continue
    d = json.loads(p.read_text(encoding='utf8')); en = d['slides']
    if len(fr) != len(en): print(n, 'slide count', len(fr), len(en)); bad += 1; continue
    for i, (a, b) in enumerate(zip(fr, en)):
        if a['k'] != b['k']: print(n, i, 'kind differs'); bad += 1
        if a['b'] != b['b'][0]: print(n, i, 'French body changed'); bad += 1
        for key in ('b', 'a'):
            x, y = a.get(key) or '', (b.get(key) or ['', ''])[1]
            if bool(x) != bool(y): print(n, i, key, 'missing'); bad += 1; continue
            if math(x) != math(y): print(n, i, key, 'math differs\n  FR', math(x)[:3], '\n  EN', math(y)[:3]); bad += 1
            if tags(x) != tags(y): print(n, i, key, 'html structure differs'); bad += 1
            if re.search(r'\\[a-zA-Z]{3,}', re.sub(r'\\\(.*?\\\)|\\\[.*?\\\]', '', y, flags=re.S)): print(n, i, key, 'TeX leftover in prose'); bad += 1
            if banned.findings(y): print(n, i, 'identifier'); bad += 1
print('slides check:', 'OK' if not bad else f'{bad} problems'); sys.exit(1 if bad else 0)
