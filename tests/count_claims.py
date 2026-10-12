"""Counts written in prose must match the content they describe.

Counts inside one paper or list are printed by TeX (\\mxcount, \\mxCount, \\mxTallied); this check covers the
remaining claims that span a whole book (front matter, covers, introductions) and the point totals of every paper.
A claim is read from the French source, so rewording it without updating this check fails loudly.
"""
import re, sys
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'content/tex/courses'
WORDS = {w: i for i, w in enumerate('zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze'.split())}
WORDS['une'] = 1
problems = []


def number(token):
    return int(token) if token.isdigit() else WORDS[token.lower()]


def read(rel):
    return (ROOT / rel).read_text()


def claim(rel, pattern):
    m = re.search(pattern, read(rel))
    if not m:
        problems.append(f'{rel}: expected claim not found ({pattern}); update tests/count_claims.py with the new wording')
    return m


def expect(what, stated, actual):
    if stated != actual:
        problems.append(f'{what}: the text says {stated}, the content has {actual}')


def items(block):
    """Number of top-level items of the first list in block."""
    depth = n = 0
    for tok in re.finditer(r'\\begin\{(?:enumerate|itemize)\}|\\end\{(?:enumerate|itemize)\}|\\item\b', block):
        t = tok.group(0)
        if t.startswith('\\begin'): depth += 1
        elif t.startswith('\\end'):
            depth -= 1
            if depth == 0: return n
        elif depth == 1: n += 1
    return n


def points(text):
    return Fraction(text.replace('\\num{', '').replace('}', '').replace(',', '.'))


# Terminale: front matter, chapter structure, the 36 papers and their points.
m = claim('terminale/front.fr.tex', r'Les (\d+) chapitres comprennent chacun une activité, (\w+) exercices et un DM, tous corrigés\. '
                                    r'Le répertoire d\'évaluations comporte (\d+) échéances, chacune avec Zéro 1, Zéro 2, A et B, soit (\d+) sujets de (\w+) exercices')
chapters = sorted((ROOT / 'terminale/chapitres').glob('C*.fr.tex'))
papers = []
for f in sorted((ROOT / 'terminale/evaluations').glob('E[0-9].fr.tex')):
    parts = re.split(r'\\label\{sujet:([^}]+)\}', f.read_text())
    papers += [(key, body.split('\\ifmxteacher')[0]) for key, body in zip(parts[1::2], parts[2::2])]
if m:
    expect('Terminale chapters', int(m.group(1)), len(chapters))
    expect('Terminale papers', int(m.group(4)), len(papers))
    expect('Terminale deadlines', int(m.group(3)), len({k.split('-')[0] for k, _ in papers}))
    expect('Terminale papers per deadline x deadlines', int(m.group(4)), 4 * int(m.group(3)))
    for f in chapters:
        student, _, teacher = f.read_text().partition('\\ifmxteacher')
        expect(f'{f.name} activities', 1, student.count('\\section{Activité de recherche}'))
        expect(f'{f.name} homework', 1, student.count('\\section{Devoir à la maison}'))
        i = student.find('\\section{Exercices progressifs}'); j = student.find('\\section', i + 1)
        expect(f'{f.name} exercises', number(m.group(2)), student[i:j].count('\\mxexerciseitem{') if i >= 0 else 0)
    for key, body in papers:
        expect(f'Terminale paper {key} exercises', number(m.group(5)), len(re.findall(r'\\subsection\*\{Exercice', body)))
for key, body in papers:
    total = int(re.search(r'Note sur (\d+)', body).group(1)); found = 0
    for k, ex in enumerate(re.split(r'\\subsection\*\{Exercice', body)[1:], 1):
        stated = points(re.search(r'\\hfill ((?:\\num\{)?\d+(?:,\d+)?\}?) points?\}', ex).group(1)); found += stated
        expect(f'Terminale paper {key} exercise {k} points', stated,
               sum(points(p) for p in re.findall(r'\\textit\{\(((?:\\num\{)?\d+(?:,\d+)?\}?) pts?\)\}', ex)))
    expect(f'Terminale paper {key} total', total, found)

# Première: the yearly papers (twelve questions at 0.5 point, then three exercises worth 14 points).
m = claim('premiere/front.fr.tex', r'Chaque chapitre contient (\w+) QCM de (\w+) questions\. Les sujets annuels utilisent (\w+) questions à '
                                   r'\\num\{([\d,]+)\} point, suivies de (\w+) exercices totalisant (\d+) points')
if m:
    for f in sorted((ROOT / 'premiere/chapitres').glob('C*.fr.tex')):
        s = f.read_text(); qcm = [items(s[q.end():]) for q in re.finditer(r'\\section\*\{QCM[^}]*\}', s)]
        expect(f'{f.name} QCM count', number(m.group(1)), len(qcm))
        for n in qcm: expect(f'{f.name} QCM questions', number(m.group(2)), n)
    for f in sorted((ROOT / 'premiere/evaluations').glob('EV*.fr.tex')):
        s = f.read_text().split('\\ifmxteacher')[0]
        part1 = re.search(r'\\subsection\*\{Partie 1 -- Automatismes \((\d+) points\)\}', s)
        part2 = re.search(r'\\subsection\*\{Partie 2 -- Exercices indépendants \((\d+) points\)\}', s)
        if not (part1 and part2): problems.append(f'{f.name}: parts 1 and 2 not found'); continue
        q = items(s[part1.end():]); expect(f'{f.name} automatism questions', number(m.group(3)), q)
        expect(f'{f.name} part 1 points', int(part1.group(1)), q * points(m.group(4)))
        exercises = re.findall(r'\\subsection\*\{Exercice \d+ -- [^}]*\((\d+(?:,\d+)?) points?\)\}', s[part2.end():])
        expect(f'{f.name} exercises', number(m.group(5)), len(exercises))
        expect(f'{f.name} part 2 points', int(m.group(6)), sum(points(p) for p in exercises))
        expect(f'{f.name} part 2 heading', int(part2.group(1)), sum(points(p) for p in exercises))
        for k, ex in enumerate(re.split(r'\\subsection\*\{Exercice \d+ -- ', s[part2.end():])[1:], 1):
            stated = points(re.search(r'\((\d+(?:,\d+)?) points?\)\}', ex).group(1))
            qp = re.findall(r'\\hfill\s*\(((?:\\num\{)?\d+(?:,\d+)?\}?) pts?\)', ex)
            if qp: expect(f'{f.name} exercise {k} points', stated, sum(points(p) for p in qp))
m = claim('premiere/automatismes.fr.tex', r'(?m)^(\w+) questions par séance')
if m:
    for block in re.findall(r'\\textbf\{Rituel :\}([^\\]*)', read('premiere/progression.fr.tex')):
        ids = re.findall(r'R\d{3}', block)
        if ids: expect('Première session ritual questions', number(m.group(1)), len(ids))

# STMG: cover, tests and the final self-check.
m = claim('stmg/front.fr.tex', r'\{(\d+) séances structurées • (\d+) sujets de DS\}')
stmg = ''.join(f.read_text() for f in sorted((ROOT / 'stmg').glob('c0*.fr.tex')))
tests = read('stmg/tests.fr.tex')
if m:
    expect('STMG sessions', int(m.group(1)), len(re.findall(r'\\mxsession\b', stmg)))
    expect('STMG tests', int(m.group(2)), len(re.findall(r'\\mxtest\{', tests)))
for block in re.split(r'(?=\\mxtest\{)', tests)[1:]:
    head = re.match(r'\\mxtest\{(\d+)\}\{(\w)\}', block).groups()
    expect(f'STMG test {head[0]}{head[1]} points', 20, sum(int(p) for p in re.findall(r'\\mxpoints\{(\d+)\}', block.split('\\ifmxteacher')[0])))
m = claim('stmg/c08.fr.tex', r'Répondre sans cours aux \\mxcount\{bilan\} questions suivantes, (\w+) par chapitre')
if m:   # the number of questions is printed by \mxcount; check the "two per chapter" part
    s = read('stmg/c08.fr.tex'); i = s.find(m.group(0))
    expect('STMG self-check questions (two per chapter x chapters)', number(m.group(1)) * len(re.findall(r'\\section\*\{Chapitre', tests)), items(s[i:]))

# Automatismes (seconde): every sheet has the announced number of questions.
m = claim('automatismes/intro.fr.tex', r'Chaque fiche comprend (\w+) questions')
if m:
    for f in sorted((ROOT / 'automatismes').glob('ch*.fr.tex')):
        for sheet in re.findall(r'\\begin\{fluencysheet\}(.*?)\\end\{fluencysheet\}', f.read_text(), re.S):
            expect(f'{f.name} sheet questions', number(m.group(1)), sheet.count('\\mxfq'))

print('\n'.join(problems) if problems else 'count claims: every stated count matches the content')
sys.exit(1 if problems else 0)
