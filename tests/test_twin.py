"""Unit tests for the French-to-English twin generator (build/mxbuild/twin.py). Run: python3 tests/test_twin.py"""
import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'build'))
from mxbuild import twin


def table(pairs, status='reviewed'):
    return {'segments': {twin.seg_id(f): {'fr': f, 'en': e, 'status': status} for f, e in pairs}}


def body(text):
    assert text.startswith(twin.GENERATED)
    return text[len(twin.GENERATED):]


class Twin(unittest.TestCase):
    def test_prose_with_placeholders_may_reorder(self):
        fr = r'Si $x>0$, alors $f(x)\geq0$.' + '\n'
        _, segs = twin.split(fr)
        self.assertEqual(segs[0]['text'], 'Si [[m1]], alors [[m2]].')
        en = twin.generate(fr, table([('Si [[m1]], alors [[m2]].', '[[m2]] holds whenever [[m1]].')]))
        self.assertEqual(body(en), r'$f(x)\geq0$ holds whenever $x>0$.' + '\n')

    def test_missing_translation_fails(self):
        with self.assertRaises(twin.TwinError):
            twin.generate('Bonjour.\n', table([]))

    def test_unreviewed_status_is_not_accepted(self):
        with self.assertRaises(twin.TwinError):
            twin.generate('Bonjour.\n', table([('Bonjour.', 'Hello.')], status='draft'))

    def test_dropped_placeholder_fails(self):
        with self.assertRaises(twin.TwinError):
            twin.generate('On pose $a=1$ et $b=2$.\n', table([('On pose [[m1]] et [[m2]].', 'Let [[m1]].')]))

    def test_translation_breaking_structure_fails(self):
        with self.assertRaises(twin.TwinError):
            twin.generate(r'\textbf{Note.} Texte.' + '\n', table([(r'\textbf{Note.} Texte.', r'\textbf{Note. Text.')]))

    def test_decimal_comma_and_french_spacing(self):
        fr = r'\item $0{,}5$\,; $1{,}25$' + '\n'
        self.assertEqual(body(twin.generate(fr, table([]))), r'\item $0.5$; $1.25$' + '\n')

    def test_words_inside_display_maths(self):
        fr = r'\[|x|=\begin{cases}x&\text{si }x\geq0\\-x&\text{sinon}\end{cases}\]' + '\n'
        en = twin.generate(fr, table([('si ', 'if '), ('sinon', 'otherwise')]))
        self.assertIn(r'\text{if }x\geq0', en); self.assertIn(r'\text{otherwise}', en)

    def test_figure_text_is_translated_and_code_locked(self):
        fr = r'\begin{tikzpicture}\draw (0,0)--(1,2) node[above]{sommet};\end{tikzpicture}' + '\n'
        en = twin.generate(fr, table([('sommet', 'vertex')]))
        self.assertEqual(body(en), r'\begin{tikzpicture}\draw (0,0)--(1,2) node[above]{vertex};\end{tikzpicture}' + '\n')

    def test_labels_and_inputs_are_locked(self):
        fr = r'\section{Suites}\label{sec:suites}\input{figures/f1}' + '\n'
        en = twin.generate(fr, table([('Suites', 'Sequences')]))
        self.assertEqual(body(en), r'\section{Sequences}\label{sec:suites}\input{figures/f1}' + '\n')

    def test_align_renumbers_placeholders(self):
        pairs = twin.align('Si $a$, alors $b$.\n', 'We get $b$ when $a$.\n')
        self.assertEqual(pairs, [('Si [[m1]], alors [[m2]].', 'We get [[m2]] when [[m1]].')])

    def test_align_refuses_changed_maths(self):
        with self.assertRaises(twin.TwinError):
            twin.align('On a $x=1{,}5$.\n', 'We have $x=1.6$.\n')

    def test_unclosed_inline_maths_raises(self):
        with self.assertRaises(twin.TwinError):
            twin.split('ab \\(x+1 sans fin\n')

    def test_words_in_every_display_environment_are_translatable(self):
        self.assertEqual(twin.translatable(r'\begin{flalign*}x&=1\text{ sinon}\end{flalign*}' + '\n'), [' sinon'])

    def test_table_column_spec_is_locked(self):
        self.assertEqual(twin.translatable(r'\begin{tabular}{|c|l|}Oui&Non\end{tabular}' + '\n'), ['Oui', 'Non'])

    def test_spacing_inside_maths_is_kept(self):
        fr = r'\item $\{x\,;\,x>0\}$\,; $1$' + '\n'
        self.assertEqual(body(twin.generate(fr, table([]))), r'\item $\{x\,;\,x>0\}$; $1$' + '\n')

    def test_code_listing_does_not_shift_maths(self):
        fr = '\\begin{lstlisting}\nx = a % 2  # un $ isolé\n\\end{lstlisting}\nValeurs $3,2,3$ et $0{,}5$.\n'
        en = twin.generate(fr, table([('Valeurs [[m1]] et [[m2]].', 'Values [[m1]] and [[m2]].')]))
        self.assertIn('Values $3,2,3$ and $0.5$.', en)


if __name__ == '__main__':
    unittest.main(verbosity=1)
