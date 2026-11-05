"""Regression cases for source-program whitespace, escaping and layout wrappers."""
import runpy
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
code = runpy.run_path(str(ROOT/'scripts/annals-code.py'))

class CodeLayout(unittest.TestCase):
    def test_literal_listing_preserves_source_bytes_and_escapes_html(self):
        source = '    x = "<tag>&"\n    if x != "":\n        print(x)'
        for env in ['lstlisting','verbatim','Verbatim','python']:
            text, blocks = code['protect_code']('\\begin{'+env+'}[language=Python]\n'+source+'\n\\end{'+env+'}')
            self.assertEqual(len(blocks),1)
            self.assertIn('    x = &quot;&lt;tag&gt;&amp;&quot;\n    if',next(iter(blocks.values())))
            self.assertIn('        print(x)',next(iter(blocks.values())))
            self.assertNotIn('language=Python',next(iter(blocks.values())))

    def test_numbered_latex_table_retains_indents_operators_and_blanks(self):
        source = r'''\begin{tabularx}{8cm}{c|X|}\cline{2-2}
1&\textbf{def} seuil(n):\\
2&\quad x = 0\\
3&\quad \textbf{while} x $<$ n:\\
4&\quad\quad x = x + 1\\
5&\\
6&\quad \textbf{return} x\\ \cline{2-2}
\end{tabularx}'''
        text, blocks = code['protect_code'](source)
        block = next(iter(blocks.values()))
        self.assertIn('data-line="4">        x = x + 1',block)
        self.assertIn('data-line="5"></span>',block)
        self.assertIn('data-line="3">    while x &lt; n:',block)
        self.assertNotIn('cline',block)
        self.assertNotIn('\\quad',block)

    def test_parallel_programs_remain_distinct_from_their_layout_table(self):
        source = r'''\begin{ttfamily}\begin{tabular}{cc}
Programme 1 & Programme 2 \\
\begin{tabular}{l}def f():\\\quad return 1\end{tabular}&
\begin{tabular}{l}def f():\\\quad return 2\end{tabular}
\end{tabular}\end{ttfamily}'''
        text, blocks = code['protect_code'](source)
        self.assertEqual(len(blocks),2)
        self.assertIn('Programme 1 & Programme 2',text)
        self.assertIn('return 1',''.join(blocks.values()))
        self.assertIn('return 2',''.join(blocks.values()))

    def test_data_table_is_untouched(self):
        source = r'\begin{tabular}{ccc}n & u_n & v_n\\0 & 1 & 2\end{tabular}'
        text, blocks = code['protect_code'](source)
        self.assertEqual(text,source)
        self.assertEqual(blocks,{})

    def test_explanatory_prose_quoting_a_loop_is_not_flattened(self):
        source = r'\begin{tabular}{l}La valeur contenue dans s après exécution de for i in range(51) vaut $\frac{50\times51}{2}$.\end{tabular}'
        text, blocks = code['protect_code'](source)
        self.assertEqual(text,source)
        self.assertEqual(blocks,{})

    def test_minipage_answer_candidates_keep_their_labels(self):
        source = r'\begin{tabular}{cc}\begin{minipage}{3cm}a. def f():\\\quad return 1\end{minipage}&\begin{minipage}{3cm}b. def f():\\\quad return 2\end{minipage}\end{tabular}'
        _, blocks = code['protect_code'](source)
        self.assertEqual(len(blocks),2)
        self.assertIn('a. def f()', ''.join(blocks.values()))
        self.assertIn('b. def f()', ''.join(blocks.values()))

    def test_tex_styling_is_decoded_without_changing_the_program(self):
        self.assertEqual(code['plain_code'](r'\quad\qquad {\blue x\_n} = x$**$2 \# test'), '            x_n = x**2 # test')
        self.assertEqual(code['plain_code'](r'\textcolor{red}{print("\{x\}")}'), 'print("{x}")')

if __name__=='__main__':
    unittest.main()
