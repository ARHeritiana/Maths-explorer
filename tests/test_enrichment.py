"""Unit tests for the enrichment converter (build/mxbuild/enrichment.py): JSON text with $...$ maths to TeX."""
import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'build'))
from mxbuild import enrichment as E, twin


class Prose(unittest.TestCase):
    def test_text_is_escaped_and_maths_converted(self):
        self.assertEqual(E.prose('50 % de $x²−1$'), r'50 \% de $x^{2}-1$')

    def test_fraction_and_factorial(self):
        self.assertEqual(E.prose('$n!/[k!(n−k)!]$'), r'$\frac{n!}{k!(n-k)!}$')

    def test_set_braces(self):
        self.assertEqual(E.prose('${1,…,10}$'), r'$\{1,\ldots ,10\}$')

    def test_gcd_by_the_class(self):
        self.assertEqual(E.prose('$PGCD(12,18) = 6$'), E.prose('$gcd(12,18) = 6$'))

    def test_decimals_follow_the_english_twin(self):
        fr, en = 'On a $P(A)=0,4$ et (1,1).', 'We have $P(A)=0.4$ and (1,1).'
        dec = E.decimals(fr, en)
        self.assertEqual(E.prose(fr, dec), r'On a $P(A)=0{,}4$ et (1,1).')
        self.assertEqual(E.prose(en, dec), r'We have $P(A)=0{,}4$ and (1,1).')

    def test_list_is_not_a_decimal(self):
        self.assertEqual(E.decimals('congru à 3,9,7,1', 'congruent to 3,9,7,1'), set())

    def test_words_in_maths_keep_their_space(self):
        self.assertEqual(E.prose('$P(non A)$'), r'$P(\text{non }A)$')

    def test_unbalanced_marks_fail(self):
        with self.assertRaises(ValueError): E.prose('$x')


class Units(unittest.TestCase):
    def test_every_workshop_aligns(self):
        """French and English of every resource carry the same maths (the twin tool would refuse the pair)."""
        packs, _ = E.stems()
        for n, p in enumerate(packs, 1):
            for kind in E.KINDS:
                fr, en = E.unit(p, kind, n)
                with self.subTest(unit=f"{p['id']}-{kind}"):
                    twin.align(fr, en)


if __name__ == '__main__':
    unittest.main()
