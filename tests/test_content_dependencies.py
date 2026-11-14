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
    def test_engine_and_course_metadata_invalidate_slides(self):
        with tempfile.TemporaryDirectory() as tmp,patch.object(refresh,'ROOT',Path(tmp)),patch.object(catalog,'load',return_value=self.manifest):
            p=Path(tmp)/'site/js/canvas-navigation.js';p.parent.mkdir(parents=True);p.write_text('before')
            before=refresh.inputs();p.write_text('after');after=refresh.inputs()
            self.assertIn('slide-exports',refresh.changed_jobs(before,after))
            self.manifest['catalog']['courses'][0]['title'][0]='Renommé'
            newer=refresh.inputs();self.assertIn('slides',refresh.changed_jobs(after,newer))
    def test_shared_models_and_inference_labels_invalidate_slide_exports(self):
        with tempfile.TemporaryDirectory() as tmp,patch.object(refresh,'ROOT',Path(tmp)),patch.object(catalog,'load',return_value=self.manifest):
            for name in ['fourier-model.js','gallery/gallery-math.js','inference-content.js']:
                p=Path(tmp)/'site/js'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('before')
                before=refresh.inputs();p.write_text('after');after=refresh.inputs()
                self.assertIn('slide-exports',refresh.changed_jobs(before,after))
    def test_player_import_map_versions_shared_engine(self):
        text=site.versioned_player()
        self.assertIn('../js/canvas-navigation.js?v=',text)
        self.assertIn('./player.css?v=',text)
        self.assertIn('./widgets.js?v=',text)
        self.assertIn('../js/fourier-model.js?v=',text)
        self.assertIn('../js/gallery/gallery-math.js?v=',text)

if __name__=='__main__':unittest.main()
