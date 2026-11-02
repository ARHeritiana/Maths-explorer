"""build/mxbuild/mada.py on synthetic snippets in the vocabulary of the T12 C/D book (class bokiko, FotsySyMainty.sty), then
through the slide parser of scripts/build-slides.py. No book text: every snippet below is written for the test."""
import importlib.util
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild import mada

STY = r"""
\newcommand{\expo}[1]{\mathrm{e}^{#1}}
\newcommand{\vln}[1]{{\bfseries #1} \newline}
\newcommand{\mybox}[1]{\colorbox{mycol}{#1}}
\newcommand{\ansbox}[1]{\fbox{#1}}
\providecommand{\Lim}{\displaystyle \lim}
\providecommand{\expo}[1]{WRONG}
"""
CHAPTER = r"""
\providecommand{\Courbe}{(\mathscr{C})}
\providecommand{\Lim}{WRONG}
\newcommand{\Zn}[1]{\mathbb{Z}/#1\mathbb{Z}}
\begin{chapter}{Ensemble des nombres complexes dans $\mathbb{R}^2$}
\section{G\'en\'eralit\'es}
\begin{defi}[Module]
Le module de $z$ est \mybox{$|z|=\sqrt{a^2+b^2}$} et $\Courbe$ est sa courbe, avec $\Zn{5}$.
\end{defi}
\begin{thm}
On a \thmbox{$\expo{x}>0$} et $\Lim_{x\to 0} x = 0$.
\end{thm}
\begin{prp}[Conjugu\'e]
$\overline{z+w}=\bar z+\bar w$.
\end{prp}
\begin{lem}Un lemme.\end{lem}
\begin{cor}Un corollaire.\end{cor}
\begin{rmk}Une remarque \`a retenir.\end{rmk}
\begin{dem}Une preuve courte.\end{dem}
\begin{exe}EXERCICE CACHE\end{exe}
\begin{valiny}REPONSE CACHEE\end{valiny}
\begin{sol}SOLUTION CACHEE\end{sol}
\begin{fiche}FICHE CACHEE\end{fiche}
\begin{sujetD}SUJET CACHE\end{sujetD}
\begin{ex}
\vln{R\'esolution :} on pose
\[\begin{multiform} x+y=1 \\ x-y=0 \end{multiform}\]
puis
\begin{IEEEeqnarray*}{rCl} a & = & b \end{IEEEeqnarray*}
\begin{description}
\item[Si $x = \bar{0}$ :] premier cas,
\item[Cas {$[0,1]$}] second cas,
\item[Sinon :] dernier cas.
\end{description}
\begin{mitanisa} ligne un \\ ligne deux \end{mitanisa}
\begin{tabularx}{\linewidth}{@{}X X@{}} gauche & droite \end{tabularx}
\begin{align*} u &= 1 \intertext{donc} v &= 2 \end{align*}
Fin de ligne\\[-1\baselineskip] {\boldmath $x$}
et $S = \tikznode{a}{\textcolor{red}{$u_0$}}; + 1$ puis \ansbox{$x=2$}. \TCDtag{E}
\end{ex}
\end{chapter}
"""


def build_slides():
    spec = importlib.util.spec_from_file_location('build_slides', ROOT / 'scripts' / 'build-slides.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


class Bokiko(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.defs = mada.macros(STY)
        cls.tex = mada.prepare(CHAPTER, cls.defs, 4, 'Nombres complexes')

    def test_providecommand_follows_tex(self):
        self.assertEqual(self.defs['Lim'][1], r'\displaystyle \lim')
        self.assertEqual(self.defs['expo'][1], r'\mathrm{e}^{#1}')   # \providecommand does not override \newcommand
        self.assertNotIn('mybox', self.defs); self.assertNotIn('vln', self.defs)   # boxes are unwrapped, not expanded

    def test_chapter_macros_read_and_definitions_removed(self):
        self.assertIn(r'(\mathcal{C})', self.tex)            # chapter \providecommand, then \mathscr for MathJax
        self.assertIn(r'\mathbb{Z}/5\mathbb{Z}', self.tex)
        self.assertNotIn('WRONG', self.tex)                    # the sty definition of \Lim wins over the chapter's \providecommand
        self.assertNotIn('providecommand', self.tex); self.assertNotIn('newcommand', self.tex)

    def test_chapter_environment_becomes_the_unit(self):
        self.assertTrue(self.tex.lstrip().startswith(r'\mxunit{4}{Nombres complexes}'))
        self.assertNotIn('chapter', self.tex); self.assertNotIn('mathbb{R}^2$}', self.tex)

    def test_environments_renamed_and_dropped(self):
        for env in ('definition', 'theorem', 'keypoint', 'proof', 'example'): self.assertIn(r'\begin{%s}' % env, self.tex)
        for env in ('defi', 'thm', 'prp', 'lem', 'cor', 'rmk', 'dem'): self.assertNotIn(r'\begin{%s}' % env, self.tex)
        for hidden in ('EXERCICE', 'REPONSE', 'SOLUTION', 'FICHE', 'SUJET'): self.assertNotIn(hidden, self.tex)

    def test_boxes_and_constructs(self):
        t = self.tex
        self.assertIn(r'$|z|=\sqrt{a^2+b^2}$', t); self.assertIn(r'$x=2$', t); self.assertIn(r'$\mathrm{e}^{x}>0$', t)
        self.assertIn(r'\textbf{Résolution :}\\', t)
        self.assertIn(r'\left\{\begin{array}{l} x+y=1 \\ x-y=0 \end{array}\right.', t)
        self.assertIn(r'\[\begin{array}{rcl} a & = & b \end{array}\]', t)
        self.assertIn(r'\item Si $x = \bar{0}$ :', t); self.assertIn(r'\item Cas {$[0,1]$}', t); self.assertIn(r'\item \textbf{Sinon :}', t)
        self.assertIn(r'\begin{itemize}', t); self.assertIn(r'\begin{tabular}{l}', t)
        self.assertIn('$S = u_0 + 1$', t)
        self.assertIn(r'\begin{tabular}{@{}l l@{}} gauche & droite \end{tabular}', t)
        self.assertIn(r'u &= 1 \\ \text{donc} \\ v &= 2', t)
        for gone in ('tabularx', 'intertext', 'baselineskip', 'boldmath', 'description', 'multiform', 'mitanisa', 'IEEEeqnarray', 'tikznode', 'TCDtag', 'mybox', 'thmbox', 'ansbox', 'vln'):
            self.assertNotIn(gone, t)

    def test_accents(self):
        self.assertEqual(mada.accents(r"\`E \'{a} \"o \c{C} \^\i"), 'È á ö Ç î')
        self.assertIn('Généralités', self.tex); self.assertIn('à retenir', self.tex)

    def test_slides(self):
        bs = build_slides()
        parse = lambda src, n: bs.canonical(src, n, extra={'proof': 'proof'}, skip_sections=r'(Exercices|Problèmes|Défis|Logique & Algorithmes)')
        slides = parse(bs.extract_figs(self.tex)[0], 4)
        kinds = [s['k'] for s in slides]
        self.assertEqual(kinds[0], 'title')
        self.assertEqual(kinds.count('concept'), 6)            # defi, thm, prp, lem, cor, rmk
        self.assertIn('proof', kinds); self.assertIn('example', kinds)
        example = next(s['b'] for s in slides if s['k'] == 'example')
        self.assertIn('<b>Sinon :</b>', example); self.assertIn('\\(S = u_0 + 1\\)', example); self.assertIn('<li>', example); self.assertIn('<table class="sg">', example)
        text = ' '.join(s['b'] for s in slides)
        for raw in ('\\mybox', '\\vln', 'multiform', 'CACHE'): self.assertNotIn(raw, text)


if __name__ == '__main__':
    unittest.main()
