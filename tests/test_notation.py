"""Notation shared by French and English (content/tex/core/mx-notation.sty, build/mxbuild/notation.py).

The class prints every notation command in the convention of the edition's language; the slides render the same
commands through notation.expand. These tests compile both renderings in both languages and require the same text,
then check the rewrite that turns hand-written notation into the commands.
"""
import re, subprocess, sys, tempfile, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild import notation as N

PROBE = [r'\num{0,5}', r'\num{12500}', r'\num{1500,25}', r'\num{3}', r'\pc{12,5}', r'\pc{50}', r'$\num{-0,25}$',
         r'$\intff{0}{1}$', r'$\intoo{0}{+\infty}$', r'$\intfo{-1}{\num{2,5}}$', r'$\intof{-\infty}{0}$', r'$\ent{1}{n}$',
         r'$A\pt{1;-2}$', r'$\pt{1;2;3}$', r'$\ens{1;\frac{1}{2};3}$', r'$\pgcd(12,18)$', r'$\ppcm(4,6)$']


def compile_text(body, lang):
    tex = ('\\makeatletter\\def\\input@path{{%s/}}\\makeatother\\documentclass[lang=%s,edition=teacher]{mxbook}\n'
           '\\begin{document}\n%s\n\\end{document}\n') % (ROOT / 'content/tex/core', lang, body)
    with tempfile.TemporaryDirectory() as d:
        (Path(d) / 'p.tex').write_text(tex)
        r = subprocess.run(['pdflatex', '-interaction=nonstopmode', '-halt-on-error', 'p.tex'], cwd=d, capture_output=True, text=True)
        if r.returncode: raise AssertionError(r.stdout[-1500:])
        import pymupdf
        with pymupdf.open(Path(d) / 'p.pdf') as doc:
            return [re.sub(r'\s+', '', l) for l in doc[0].get_text().split('|')]


class ClassAndWebAgree(unittest.TestCase):
    def test_both_renderings_print_the_same(self):
        for lang in ('fr', 'en'):
            with self.subTest(lang=lang):
                body = ' | '.join(PROBE)
                self.assertEqual(compile_text(body, lang), compile_text(N.expand(body, lang), lang))

    def test_conventions(self):
        self.assertEqual(N.expand(r'\num{1234,5}', 'fr'), r'1\,234{,}5')
        self.assertEqual(N.expand(r'\num{1234,5}', 'en'), '1{,}234.5')
        self.assertEqual(N.expand(r'\intfo{0}{1}', 'fr'), '[0;1[')
        self.assertEqual(N.expand(r'\intfo{0}{1}', 'en'), '[0,1)')
        self.assertEqual(N.expand(r'\pt{1;\num{0,5}}', 'en'), '(1,0.5)')


class Rewrite(unittest.TestCase):
    def test_maths(self):
        fr = r'$x\in]0;+\infty[$, $[0;1]$, $A(1;-2)$, $\{1;2\}$, $u_{n+1}=0{,}8u_n$, $\sqrt[3]{x}$, $[AB]$'
        self.assertEqual(N.rewrite(fr, 'fr'), r'$x\in\intoo{0}{+\infty}$, $\intff{0}{1}$, $A\pt{1;-2}$, $\ens{1;2}$, '
                                               r'$u_{n+1}=\num{0,8}u_n$, $\sqrt[3]{x}$, $[AB]$')

    def test_prose_numbers_and_percentages(self):
        self.assertEqual(N.rewrite(r'soit 12\,500 € ou 12{,}5\,\% et 50~\%', 'fr'), r'soit \num{12500} € ou \pc{12,5} et \pc{50}')

    def test_english_converts_only_the_decimals_of_its_french_twin(self):
        dec = set(); N.rewrite(r'$x=0{,}5$ et \mxanswerspace[3.2]{}', 'fr', dec)
        self.assertEqual(N.rewrite(r'$x=0.5$ and \mxanswerspace[3.2]{} at 1.5em', 'en', dec),
                         r'$x=\num{0,5}$ and \mxanswerspace[3.2]{} at 1.5em')

    def test_figure_code_and_sized_delimiters_are_left_alone(self):
        s = r'\begin{tikzpicture}\draw (0,0)--(1.5,2) node{$0{,}5$};\end{tikzpicture} $\left]0;1\right[$'
        self.assertEqual(N.rewrite(s, 'fr'), s.replace('$0{,}5$', r'$\num{0,5}$'))

    def test_pairs_inside_a_set(self):
        self.assertEqual(N.rewrite(r'$\{(1;2),(1;4)\}$', 'fr'), r'$\{\pt{1;2},\pt{1;4}\}$')


if __name__ == '__main__':
    unittest.main()
