"""Dependency-driven preparation of every linked publication product.

The tracked receipt is a build cache, not an editorial source. A normal checkout
already has one. --adopt is a one-time migration after validating retained
products, never a publication shortcut for changed mathematical sources.
"""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from . import ROOT, DIST, catalog, content_index, site

STATE = ROOT / 'content/data/build-state.json'
IGNORED = {'.aux', '.log', '.toc', '.out', '.pyc'}


def fingerprint(patterns, config=None):
    h = hashlib.sha256(json.dumps(config, sort_keys=True, ensure_ascii=False).encode())
    paths = {p for pattern in patterns for p in ROOT.glob(pattern)
             if p.is_file() and p.suffix not in IGNORED and '__pycache__' not in p.parts}
    for p in sorted(paths):
        h.update(p.relative_to(ROOT).as_posix().encode())
        h.update(p.read_bytes())
    return h.hexdigest()


def inputs():
    manifest = catalog.load()
    from .pipeline import COURSES
    result = {}
    for course, book in manifest['books'].items():
        result['course:' + course] = fingerprint(
            [f'content/tex/courses/{course}/**/*', 'content/tex/core/*',
             'content/data/glossary.json', COURSES.get(course, ['unsupported'])[0], 'build/mxbuild/tex.py',
             'build/mxbuild/twin.py', 'build/mxbuild/books.py'],
            {'book': book, 'chapters': [c for c in manifest['catalog']['chapters'] if c['course'] == course]})
    if 'annalsBank' in manifest:
        result['annals'] = fingerprint(['content/tex/annals/**/*', 'content/tex/core/*', 'scripts/build-annals.py', 'scripts/annals-code.py', 'scripts/build-annals-pdf.py'], manifest['annalsBank'])
    result['static-site'] = fingerprint(['site/**/*', 'content/data/edition.json'])
    result['slides'] = fingerprint(
        ['content/slides/**/*', 'content/tex/courses/**/*', 'content/tex/core/*',
         'scripts/build-slides.py','build/mxbuild/slide_editions.py'], {'chapters':manifest['catalog']['chapters'],'courses':manifest['catalog']['courses']})
    result['slide-exports']=fingerprint(['scripts/export-slides.py','site/js/live-curriculum.js','content/data/edition.json','build/mxbuild/refresh.py','build/mxbuild/slide_editions.py','site/slides/*','site/js/canvas-navigation.js','site/js/camera3d.js','site/js/lab/**/*','site/js/math.js','site/js/object-kit.js','site/js/fourier-model.js','site/js/gallery/gallery-math.js','site/js/inference-content.js','dist/slides/data/*.json','dist/slides/fig/*.svg'])
    result['lectures']=fingerprint(['scripts/build-lecture-slides.py','build/mxbuild/slide_editions.py','dist/slides/data/*.json','dist/slides/fig/*.svg'])
    result['sources'] = fingerprint(['content/tex/courses/**/*', 'content/tex/core/*',
                                     'scripts/publish-sources.py'],
                                    {'books': manifest['books'], 'courses': manifest['catalog']['courses']})
    return result


def changed_jobs(before, after):
    return [key for key, digest in after.items() if before.get(key) != digest]


def command(*args):
    subprocess.run(list(args), cwd=ROOT, check=True)


def run_job(key):
    if key.startswith('course:'):
        from . import pipeline
        course = key.split(':', 1)[1]
        if course not in pipeline.COURSES:
            raise ValueError(f'No PDF builder configured for {course}; configure it before publication')
        if pipeline.build_tex([course], force=True):
            raise RuntimeError('Course build failed: ' + course)
    elif key == 'annals':
        for script in ('build-annals.py', 'build-annals-pdf.py'):
            if subprocess.run([sys.executable, 'scripts/' + script, '--check'], cwd=ROOT, capture_output=True).returncode:
                command(sys.executable, 'scripts/' + script)
    elif key == 'static-site':
        # site.write() below copies source and updates linked catalogue metadata.
        return
    elif key in ('slides','slide-exports','lectures'):
        # Reuse verified lecture assets when only interactive widgets changed.
        # The checker compares every generated TeX source, source archive and PDF hash.
        if key == 'lectures' and subprocess.run([sys.executable,'scripts/build-lecture-slides.py','--check'],cwd=ROOT,capture_output=True).returncode == 0:
            print('Lecture sources and retained editions already match.',flush=True)
            return
        script={'slides':'build-slides.py','slide-exports':'export-slides.py','lectures':'build-lecture-slides.py'}[key]
        command(sys.executable,'scripts/'+script)
    elif key == 'sources':
        command(sys.executable, 'scripts/publish-sources.py')


def output_hashes():
    outputs = {}
    for folder in ('resources', 'slides', 'sources'):
        for p in sorted((DIST / folder).rglob('*')):
            if p.is_file():
                outputs[p.relative_to(ROOT).as_posix()] = hashlib.sha256(p.read_bytes()).hexdigest()
    outputs[content_index.MODEL.relative_to(ROOT).as_posix()] = hashlib.sha256(content_index.MODEL.read_bytes()).hexdigest()
    return outputs


def prepare(check=False, adopt=False):
    saved = json.loads(STATE.read_text()) if STATE.exists() else {}
    now = inputs()
    removed=set(saved.get('inputs',{}))-set(now)
    if removed:raise ValueError('Removed build targets need an explicit asset migration: '+', '.join(sorted(removed)))
    dirty = changed_jobs(saved.get('inputs', {}), now)
    if check:
        if dirty:
            raise ValueError('Content dependencies changed; run make site: ' + ', '.join(dirty))
        stale = content_index.write(check=True)
        if stale:
            generated = content_index.generate()
            detail = []
            for path in stale:
                expected = generated[ROOT / path]
                actual = (ROOT / path).read_text() if (ROOT / path).exists() else ''
                at = next((i for i, (a, b) in enumerate(zip(actual, expected)) if a != b),
                          min(len(actual), len(expected)))
                detail.append(str(path) + ' at character ' + str(at) +
                              ': actual=' + repr(actual[at:at + 110]) +
                              ', expected=' + repr(expected[at:at + 110]))
            raise ValueError('Linked catalogue metadata is stale; run make site. ' + '; '.join(detail))
        if saved.get('outputs') != output_hashes():
            raise ValueError('Generated products changed or are missing; run make site and review the rebuilt outputs')
        from . import offline
        if offline.write(check=True):
            raise ValueError('Offline manifest is stale (dist/sw.js does not match the shell files of dist/); run make site')
        print('Content dependencies, catalogue views and published products match.')
        return
    if not saved and not adopt:
        raise ValueError('Build receipt missing. Restore it from main; adopt only after validating retained products.')
    if saved and not dirty and saved.get('outputs') != output_hashes():
        raise ValueError('Published outputs changed without source changes; restore or rebuild their source before updating the receipt')
    if not adopt:
        pending = set(dirty)
        for key in now:
            if key not in pending:
                continue
            print('Refreshing content dependency:', key, flush=True)
            run_job(key)
            # Builders may update shared inputs and other outputs. Recheck later jobs.
            pending.update(changed_jobs(saved.get('inputs', {}), inputs()))
    # Exports embed generated figures and must follow every producer.
    if not adopt and ('slides' in pending or 'slide-exports' in pending):
        run_job('slide-exports')
    catalog.write()
    site.write()
    content_index.write()
    site.write()
    receipt = {'schema': 1, 'inputs': inputs(), 'outputs': output_hashes()}
    STATE.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    print('Content prepared: derived catalogues, source copies, downloads and cache versions.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--adopt', action='store_true')
    args = parser.parse_args()
    prepare(check=args.check, adopt=args.adopt)


if __name__ == '__main__':
    main()

