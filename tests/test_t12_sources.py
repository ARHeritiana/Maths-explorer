"""The T12 C/D book in content/tex/mada/t12/ (owner decisions of 2 November 2026): anonymous, without the third-party exercises
and the type-D practice papers, Bac papers with their attribution line and only the checked solutions, a consistent chapter index.
Names are compared as SHA-256 hashes (tests/banned.py), never written here."""
import hashlib
import json
from pathlib import Path
import re
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
T12 = ROOT / 'content/tex/mada/t12'
sys.path.insert(0, str(ROOT / 'tests'))
import banned  # noqa: E402

# the named textbook of the removed exercises (third party, not banned site-wide)
THIRD_PARTY = {'554b7e46647ffe03eecc5dfcb2ff482a180f002fc0cf70f54ebb43a93cce8512'}
SOLUTIONS = {('C', 2003): False, ('C', 2004): False, ('C', 2005): True}


def files(): return sorted(p for p in T12.rglob('*') if p.is_file())


class T12Sources(unittest.TestCase):
    def test_no_owner_city_or_school_name(self):
        bad = [str(p.relative_to(ROOT)) for p in files() if banned.findings(p.read_text(encoding='utf8'))]
        self.assertEqual(bad, [])

    def test_no_third_party_source(self):
        for p in files():
            text = p.read_text(encoding='utf8')
            self.assertFalse(re.search(r'pr[eé]pa[ -]?bac|(?<![a-z])laur[eé]at|sujet ?type', text, re.I), p.name)
            self.assertFalse({hashlib.sha256(w.encode()).hexdigest() for w in banned.words(text)} & THIRD_PARTY, p.name)
            if p.suffix == '.tex': self.assertNotIn('\\begin{sujetD}', text, p.name)   # the styles still define the environment

    def test_author_and_front_matter_absent(self):
        cls = (T12 / 'preambule/bokiko.cls').read_text(encoding='utf8')
        self.assertRegex(cls, r'\\providecommand\{\\TCDAuthor\}\{\}')
        self.assertNotRegex(cls, r'\\fancyfoot\[[^\]]*\]\{[^\n]*\\TCDAuthor')
        livre = (T12 / 'preambule/t12-livre.sty').read_text(encoding='utf8')
        self.assertRegex(livre, r'pdfauthor=\{\}'); self.assertIn('\\renewcommand{\\TCDAuthor}{}', livre)
        for p in files():
            text = p.read_text(encoding='utf8')
            self.assertNotRegex(text, r'\\author\{|\\(?:make)?title(?:page)?\b|Fanolorana|TitlePage|Foniny|Spiral', p.name)

    def test_index(self):
        data = json.loads((T12 / 'chapitres.json').read_text(encoding='utf8'))
        numbers = [c['number'] for c in data['chapters']]
        self.assertEqual(numbers, list(range(1, len(numbers) + 1)))
        for c in data['chapters']:
            self.assertTrue((T12 / c['file']).exists(), c['file'])
            self.assertTrue(set(c['series']) <= {'C', 'D'} and c['series'])
            self.assertEqual(c['answers'], '\\begin{corrige}' in (T12 / c['file']).read_text(encoding='utf8'))
        for course, s in (('t12c', 'C'), ('t12d', 'D')):
            self.assertEqual(data['courses'][course], [c['number'] for c in data['chapters'] if s in c['series']])
        for f in data['supplements']: self.assertTrue((T12 / f).exists(), f)

    def test_bac_papers(self):
        data = json.loads((T12 / 'chapitres.json').read_text(encoding='utf8'))
        self.assertEqual(sorted((b['series'], b['year']) for b in data['bac']), [(s, y) for s in 'CD' for y in range(2003, 2019)])
        for b in data['bac']:
            text = (T12 / b['statement']).read_text(encoding='utf8')
            self.assertIn('\\TCDBacAttribution{%s}{%d}' % (b['series'], b['year']), text)
            key = (b['series'], b['year'])
            self.assertEqual('solution' in b, key in SOLUTIONS)
            if key in SOLUTIONS:
                sol = (T12 / b['solution']).read_text(encoding='utf8')
                self.assertEqual(b['partial'], SOLUTIONS[key]); self.assertEqual('\\TCDPartial' in sol, SOLUTIONS[key])
        on_disk = sorted(p.name for p in (T12 / 'bac').glob('*-corrige.tex'))
        self.assertEqual(on_disk, ['c-2003-corrige.tex', 'c-2004-corrige.tex', 'c-2005-corrige.tex'])


if __name__ == '__main__':
    unittest.main()
