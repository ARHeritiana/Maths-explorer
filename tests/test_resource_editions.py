"""Independent language editions use measured assets, without filename or page parity assumptions."""
import argparse
import ast
import contextlib
import copy
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
import re
import sys
from types import SimpleNamespace
from unittest.mock import patch
import pymupdf
from mxbuild import books, catalog, tex


class ResourceEditions(unittest.TestCase):
    def test_stmg_builder_accepts_either_language_order_and_rejects_page_drift(self):
        source = Path(__file__).resolve().parents[1] / 'scripts/build-stmg.py'
        main = next(n for n in ast.parse(source.read_text()).body if isinstance(n, ast.FunctionDef) and n.name == 'main')
        unit = ast.Module(body=[main], type_ignores=[])
        chapters = [{'number':k, 'id':f'stmg-{k:02}', 'course':'stmg', 'title':['FR','EN']} for k in range(1,9)]
        resources = [{'id':f'stmg-{k:02}-{kind}', 'course':'stmg', 'title':['FR','EN']}
                     for k in range(1,9) for kind in ('activities','chapter','teacher')]
        resources += [{'id':identifier, 'course':'stmg', 'title':['FR','EN']}
                      for identifier in ('stmg-revision-bank-0','stmg-revision-bank-1')]
        class Document:
            def __init__(self, pages): self.pages = pages
            def __len__(self): return self.pages
            def get_toc(self):
                return [[1,f'Chapter {k}',k*7+1] for k in range(13)] + [[2,f'Session {k}',k*7+2] for k in range(1,9)]
        for mismatch in (False, True):
            for langs in (['fr'], ['en'], ['fr','en'], ['en','fr']):
                with self.subTest(languages=langs, mismatch=mismatch):
                    manifest = {'catalog':{'chapters':chapters, 'resources':resources}, 'texConverted':[]}
                    namespace = {'argparse':argparse, 'books':books, 'sys':sys, 're':re, 'OUT':Path('/unused'),
                                 'manifest_io':SimpleNamespace(load=lambda:manifest, save=lambda m:None),
                                 'compile_pdf':lambda entry, languages:Document(101 if mismatch and '-en' in entry else 100),
                                 'save':lambda doc,a,b,*args:b-a}
                    exec(compile(unit,str(source),'exec'),namespace)
                    with patch.object(sys,'argv',['build-stmg.py','--lang',*langs]), contextlib.redirect_stdout(io.StringIO()):
                        if mismatch and len(langs)==2:
                            with self.assertRaises(SystemExit): namespace['main']()
                        else: namespace['main']()

    def test_build_languages_are_independent_of_published_editions(self):
        with patch.object(books, 'spec', return_value={'buildLanguages': ['fr']}):
            self.assertEqual(books.build_languages('fixture'), ['fr'])
            self.assertEqual(books.build_languages('fixture', ['en']), ['en'])
        with patch.object(books, 'spec', return_value={}):
            self.assertEqual(books.build_languages('fixture'), ['fr', 'en'])
        for invalid in [[], ['fr', 'fr'], ['de'], 'fr']:
            with patch.object(books, 'spec', return_value={'buildLanguages': invalid}):
                with self.assertRaises(ValueError): books.build_languages('fixture')

    def test_french_only_build_does_not_compile_or_pad_retained_english(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp); (out/'fr.mxpad').write_text('old French padding')
            (out/'en.mxpad').write_text('retained English padding')
            (out/'en.pdf').write_bytes(b'retained English PDF')
            with patch.object(tex, 'compile', return_value='compiled-fr') as compile_one, patch.object(tex, 'compile_pair') as compile_pair:
                result = tex.compile_editions(out, {'fr': 'f.tex', 'en': 'e.tex'}, {'fr': 'fr', 'en': 'en'}, out, ['fr'])
            self.assertEqual(result, {'fr': 'compiled-fr'})
            compile_one.assert_called_once_with(out, 'f.tex', 'fr', out)
            compile_pair.assert_not_called()
            self.assertFalse((out/'fr.mxpad').exists())
            self.assertEqual((out/'en.mxpad').read_text(), 'retained English padding')
            self.assertEqual((out/'en.pdf').read_bytes(), b'retained English PDF')

    def test_two_selected_languages_keep_the_paired_build(self):
        with patch.object(tex, 'compile_pair', return_value='pair') as pair:
            self.assertEqual(tex.compile_editions('src', 'inputs', 'jobs', 'out'), 'pair')
            pair.assert_called_once_with('src', 'inputs', 'jobs', 'out')

    def fixture(self, dist, languages):
        editions = {}
        for index, language in enumerate(languages, 1):
            path = dist / ('resources/manual-'+language+'.pdf')
            path.parent.mkdir(parents=True, exist_ok=True)
            with pymupdf.open() as pdf:
                for _ in range(index): pdf.new_page()
                pdf.save(path)
            editions[language] = {'path': './'+path.relative_to(dist).as_posix()}
        resource = {'id':'one-notes','chapter':'one','course':'course','format':'PDF','editions':editions}
        file = {'kind':'chapter','source':'source','start':4,'editions':copy.deepcopy(editions)}
        return {'texConverted':[], 'catalog':{'courses':[{'id':'course'}],
                'chapters':[{'id':'one','course':'course','number':1}], 'resources':[resource], 'sources':[]},
                'companion':{'chapters':[{'id':'one','course':'course','files':[file]}], 'supplements':[], 'sources':[]}}

    def test_independent_editions_measured_in_catalogue_companion_and_provenance(self):
        for languages in (['fr'], ['en'], ['fr','en']):
            with self.subTest(languages=languages), tempfile.TemporaryDirectory() as tmp:
                dist=Path(tmp)
                m=self.fixture(dist,languages)
                with patch.object(catalog,'DIST',dist): outputs=catalog.generate(m)
                resource=json.loads(outputs[catalog.CATALOG])['resources'][0]
                companion=json.loads(outputs[catalog.COMPANION].removeprefix(catalog.COMPANION_HEADER).removesuffix(';\n'))['chapters'][0]['files'][0]
                provenance=json.loads(outputs[catalog.PROVENANCE])[0]
                self.assertEqual(resource['languages'],languages)
                self.assertEqual(set(companion['editions']),set(languages))
                self.assertEqual(set(provenance['editions']),set(languages))
                for index,lang in enumerate(languages,1):
                    record=resource['editions'][lang]; data=(dist/record['path'].removeprefix('./')).read_bytes()
                    self.assertEqual(record['pages'],index)
                    self.assertEqual(record['bytes'],len(data))
                    self.assertEqual(record['sha256'],hashlib.sha256(data).hexdigest())
                self.assertNotIn('bytes',m['catalog']['resources'][0]['editions'][languages[0]])

    def test_missing_explicit_edition_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            dist=Path(tmp); m=self.fixture(dist,['fr'])
            m['catalog']['resources'][0]['editions']['fr']['path']='./resources/missing.pdf'
            with patch.object(catalog,'DIST',dist),self.assertRaises(FileNotFoundError): catalog.generate(m)

    def test_normalisation_preserves_explicit_single_edition(self):
        with tempfile.TemporaryDirectory() as tmp:
            m=self.fixture(Path(tmp),['en']);before=copy.deepcopy(m)
            self.assertEqual(catalog.normalise(m),before)

if __name__=='__main__': unittest.main()
