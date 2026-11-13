"""Offline manifest (build/mxbuild/offline.py): deterministic, shell only, inlined into the served worker."""
import json
import tempfile
import unittest
from pathlib import Path
from mxbuild import DIST, offline


def tree(root):
    files = {'index.html': '<html>', 'js/app.js': 'a', 'js/lab/engine.js': 'b', 'styles/explorer.css': 'c',
             'fonts/x.woff2': 'd', 'fonts/LICENSE.txt': 'e', 'vendor/mathjax-tex-svg.js': 'f', 'vendor/pdf-lib.min.js': 'g',
             'resources/course.pdf': 'h', 'slides/data/index.json': '[]', 'slides/data/deck.json': '{}',
             'slides/export/deck.html': 'i', 'data/history/abel.webp': 'j', 'slides/player.html': 'k'}
    for name, text in files.items():
        (root / name).parent.mkdir(parents=True, exist_ok=True)
        (root / name).write_text(text)


class Manifest(unittest.TestCase):
    def test_shell_only_sorted_and_deterministic(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); tree(root)
            first = offline.manifest(root)
            names = [f for f, _ in first['files']]
            self.assertEqual(names, sorted(names))
            self.assertEqual(names, ['fonts/x.woff2', 'index.html', 'js/app.js', 'js/lab/engine.js', 'slides/data/index.json',
                                     'styles/explorer.css', 'vendor/mathjax-tex-svg.js'])
            self.assertEqual(first, offline.manifest(root))
            self.assertEqual(first['bytes'], 6 + 1 + 1 + 1 + 2 + 1 + 1)
            # one changed shell file changes its hash and the version; a changed PDF changes nothing
            (root / 'resources/course.pdf').write_text('other')
            self.assertEqual(first, offline.manifest(root))
            (root / 'js/app.js').write_text('changed')
            second = offline.manifest(root)
            self.assertNotEqual(first['version'], second['version'])
            self.assertEqual([f for f, h in second['files'] if dict(first['files'])[f] != h], ['js/app.js'])

    def test_large_start_data_is_left_out(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); tree(root)
            (root / 'slides/data/index.json').write_text(' ' * (offline.MAX_DATA + 1))
            self.assertNotIn('slides/data/index.json', [f for f, _ in offline.manifest(root)['files']])

    def test_render_inlines_the_manifest_once(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); tree(root)
            text = offline.render(root)
            self.assertNotIn(offline.PLACEHOLDER, text)
            line = next(l for l in text.splitlines() if l.startswith('self.__MX_SHELL = '))
            self.assertEqual(json.loads(line[len('self.__MX_SHELL = '):-1]), offline.manifest(root))
            self.assertEqual(text, offline.render(root))
            bad = root / 'sw.js'; bad.write_text('no placeholder')
            with self.assertRaises(ValueError): offline.render(root, bad)

    def test_published_shell(self):
        files = [f for f, _ in offline.manifest()['files']]
        self.assertIn('index.html', files)
        self.assertIn('js/app.js', files)
        self.assertIn('js/offline.js', files)
        self.assertIn('vendor/mathjax-tex-svg.js', files)
        self.assertFalse([f for f in files if f.endswith(('.pdf', '.zip', '.webp')) or f.startswith(('resources/', 'slides/export/', 'sources/'))])
        self.assertEqual(offline.write(check=True), [], 'dist/sw.js is stale: run make site')
        # every module of the import map is in the shell with the same hash: an offline page never misses a module
        index = (DIST / 'index.html').read_text(encoding='utf-8')
        block = index.split('<script type="importmap">')[1].split('</script>')[0]
        hashes = dict(offline.manifest()['files'])
        for name, url in json.loads(block)['imports'].items():
            self.assertEqual(url.split('?v=')[1], hashes[name[2:]], name)


if __name__ == '__main__':
    unittest.main()
