"""Independent language editions use measured assets, without filename or page parity assumptions."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import pymupdf
from mxbuild import catalog


class ResourceEditions(unittest.TestCase):
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
