"""Independent slide language fixtures exercise actual producers without TeX compilation."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild.slide_editions import languages, combine_sequences, normalise_deck, for_language


def script(name):
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), ROOT / 'scripts' / (name + '.py'))
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


class SlideEditions(unittest.TestCase):
    def test_independent_sequences_do_not_require_identical_counts_or_kinds(self):
        fr = [{'k': 'concept', 't': 'Une idée', 'b': 'Texte français.'}]
        en = [{'k': 'concept', 't': 'An idea', 'b': 'English prose.'}, {'k': 'proof', 't': 'Proof', 'b': 'A proof.'}]
        for selected in ({'fr': fr}, {'en': en}, {'fr': fr, 'en': en}):
            deck = normalise_deck({'id': 'fixture', 'title': ['Cours', 'Course'], **combine_sequences(selected)})
            self.assertEqual(languages(deck), list(selected))
            for lang, source in selected.items():
                effective = for_language(deck, lang)
                self.assertEqual(len(effective['slides']), len(source))
                i = 0 if lang == 'fr' else 1
                self.assertEqual([s['b'][i] for s in effective['slides']], [s['b'] for s in source])
            for lang in set(('fr', 'en')) - set(selected):
                with self.assertRaises(ValueError): for_language(deck, lang)

    def test_source_extraction_measures_only_actual_language_sources(self):
        build = script('build-slides')
        for available in (('fr',), ('en',), ('fr', 'en')):
            with self.subTest(available=available), tempfile.TemporaryDirectory() as directory:
                root = Path(directory); src = root / 'content/tex/courses'; source = src / 'fixture'; source.mkdir(parents=True)
                out = root / 'dist/slides/data'
                for lang in available: (source / ('unit.' + lang + '.tex')).write_text(lang)
                chapter = {'id': 'fixture-01', 'course': 'fixture', 'number': 1, 'title': ['Leçon', 'Lesson']}
                catalog = {'chapters': [chapter], 'courses': [{'id': 'fixture', 'title': ['Collection', 'Collection']}]}
                def parse(text, n):
                    rows = [{'k': 'concept', 't': text, 'b': 'text ' + text}]
                    if text == 'en': rows.append({'k': 'proof', 't': 'Proof', 'b': 'Independent extra slide.'})
                    return rows
                entries = [('fixture-01', 'fixture', 1, source / 'unit.fr.tex', source / 'unit.en.tex', parse)]
                with patch.multiple(build, ROOT=root, SRC=src, OUT=out, CATALOG=catalog, CH={'fixture-01': chapter}, WIDGETS={}), patch.object(build, 'files', return_value=entries):
                    build.main()
                index = json.loads((out / 'index.json').read_text())[0]
                deck = json.loads((out / 'fixture-01.json').read_text())
                data = (out / 'fixture-01.json').read_bytes()
                self.assertEqual(set(index['editions']), set(available))
                for lang in available:
                    self.assertEqual(index['editions'][lang]['bytes'], len(data))
                    self.assertEqual(index['editions'][lang]['sha256'], hashlib.sha256(data).hexdigest())
                    self.assertEqual(index['editions'][lang]['slides'], 1 if lang == 'fr' else 2)
                self.assertEqual(set(languages(deck)), set(available))

    def test_export_and_lecture_select_only_declared_figures_and_text(self):
        export = script('export-slides'); lecture = script('build-lecture-slides')
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); fig = root / 'fig'; fig.mkdir()
            (fig / 'fixture-1-en.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>')
            deck = normalise_deck({'id': 'fixture', 'title': ['', 'English only'], 'editions': {'en': {}},
                                   'slides': [{'k': 'concept', 't': ['', 'English idea'], 'b': ['', 'English proof.'], 'f': [[None, 1]]}]})
            with patch.object(export, 'FIG', fig):
                self.assertEqual(set(export.figures(deck)), {'fixture-1-en.svg'})
                self.assertIn('<html lang="en">', export.page(deck, '', '', ''))
            no_fig = copy.deepcopy(deck); no_fig['slides'][0].pop('f')
            text = lecture.tex_for(no_fig, 'en', root)
            self.assertIn('English proof.', text)
            with self.assertRaises(ValueError): lecture.tex_for(no_fig, 'fr', root)

    def test_authored_declarations_can_hold_independent_plain_string_sequences(self):
        source = {'id': 'one', 'title': ['Cours', 'Course'], 'editions': {
            'fr': {'slides': [{'k': 'concept', 't': 'Idée', 'b': 'Texte.'}]},
            'en': {'slides': [{'k': 'concept', 't': 'Idea', 'b': 'Text.'}, {'k': 'proof', 't': 'Proof', 'b': 'Proof.'}]}}}
        deck = normalise_deck(source)
        self.assertEqual(len(for_language(deck, 'fr')['slides']), 1)
        self.assertEqual(len(for_language(deck, 'en')['slides']), 2)
        self.assertNotIn('slides', source, 'normalisation leaves the authored input unchanged')
        with self.assertRaises(ValueError): normalise_deck({'slides': [], 'title': ['Fr', 'En']})


if __name__ == '__main__': unittest.main()
