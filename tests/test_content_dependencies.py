"""Mutation checks for shared publication data and dependency invalidation."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from mxbuild import catalog, content_index, refresh, site

class Dependencies(unittest.TestCase):
    def setUp(self):
        self.manifest=catalog.load()
    def measure(self,p):
        return {'path':p.relative_to(content_index.DIST).as_posix(),'bytes':1,'sha256':'test'}
    def test_sequence_add_rename_reorder_remove(self):
        m=copy.deepcopy(self.manifest);sec=m['university']['sections'][0]
        new=copy.deepcopy(sec['sequences'][0]);new.update(id='mutation-new',slide='new.html',title=['Nouveau','New'])
        sec['sequences'].insert(0,new)
        result=content_index.university_index(m,{},self.measure)
        self.assertEqual(result['sections'][0]['sequences'][0]['number'],1)
        self.assertIn('mutation-new',result['files'])
        original=sec['sequences'][1];source=original['sourceDeck'];chapter=original['pdfChapter']
        sec['sequences'].reverse();original['title']=['Renommé','Renamed']
        result=content_index.university_index(m,result,self.measure)
        found=next(q for q in result['sections'][0]['sequences'] if q['id']==original['id'])
        self.assertEqual((found['sourceDeck'],found['pdfChapter']),(source,chapter))
        sec['sequences']=[q for q in sec['sequences'] if q['id']!='mutation-new']
        result=content_index.university_index(m,result,self.measure)
        self.assertNotIn('mutation-new',result['files'])
    def test_duplicate_ids_fail(self):
        m=copy.deepcopy(self.manifest);sec=m['university']['sections'][0]
        sec['sequences'].append(copy.deepcopy(sec['sequences'][0]))
        with self.assertRaisesRegex(ValueError,'Duplicate sequence'):content_index.university_index(m,{},self.measure)
    def test_engine_and_course_metadata_invalidate_slides(self):
        with tempfile.TemporaryDirectory() as tmp,patch.object(refresh,'ROOT',Path(tmp)),patch.object(catalog,'load',return_value=self.manifest):
            p=Path(tmp)/'site/js/canvas-navigation.js';p.parent.mkdir(parents=True);p.write_text('before')
            before=refresh.inputs();p.write_text('after');after=refresh.inputs()
            self.assertIn('slide-exports',refresh.changed_jobs(before,after))
            self.manifest['catalog']['courses'][0]['title'][0]='Renommé'
            newer=refresh.inputs();self.assertIn('slides',refresh.changed_jobs(after,newer))
    def test_fourier_shared_models_invalidate_slide_exports(self):
        with tempfile.TemporaryDirectory() as tmp,patch.object(refresh,'ROOT',Path(tmp)),patch.object(catalog,'load',return_value=self.manifest):
            for name in ['fourier-model.js','gallery-math.js']:
                p=Path(tmp)/'site/js'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('before')
                before=refresh.inputs();p.write_text('after');after=refresh.inputs()
                self.assertIn('slide-exports',refresh.changed_jobs(before,after))
    def test_player_import_map_versions_shared_engine(self):
        text=site.versioned_player()
        self.assertIn('../js/canvas-navigation.js?v=',text)
        self.assertIn('./player.css?v=',text)
        self.assertIn('./widgets.js?v=',text)
        self.assertIn('../js/fourier-model.js?v=',text)
        self.assertIn('../js/gallery-math.js?v=',text)

if __name__=='__main__':unittest.main()
