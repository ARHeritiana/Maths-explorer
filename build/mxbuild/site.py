"""Assemble the served folder: copy the hand-written site (site/) into dist/.

dist/ is what the host serves and is committed (the host has no build step). It holds two kinds of files:
  - copies of site/ (index.html, styles/, js/, slides/ player and widgets, vendor/, resources/document-theme.css);
  - generated products (resources/ PDFs and catalogue, sources/, slides/data and slides/fig, js/resources-data.js,
    js/enrichment-data.js), written by the other pipeline steps.
Edit site/, never the dist/ copies; `python -m mxbuild site --check` fails when a copy differs from its source.
"""
import shutil
from . import ROOT, DIST

SITE = ROOT / 'site'


def pairs():
    for src in sorted(SITE.rglob('*')):
        if src.is_file() and '__pycache__' not in src.parts:
            yield src, DIST / src.relative_to(SITE)


# dist/ paths that are copies of site/ (anything else in them is an orphan); generated files are listed apart.
MANAGED = ['index.html', 'styles/*', 'vendor/*', 'js/*', 'slides/*.html', 'slides/*.css', 'slides/*.js',
           'resources/document-theme.css']
GENERATED = {'js/resources-data.js', 'js/enrichment-data.js'}


def orphans():
    """dist/ copies whose source no longer exists in site/ (deleted or renamed there)."""
    found = {str(p.relative_to(DIST)) for g in MANAGED for p in DIST.glob(g) if p.is_file()}
    return sorted(DIST / f for f in found - GENERATED if not (SITE / f).exists())


def write(check=False):
    stale = []
    for src, dst in pairs():
        if dst.exists() and dst.read_bytes() == src.read_bytes(): continue
        stale.append(dst.relative_to(ROOT))
        if not check:
            dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst)
    for o in orphans():
        stale.append(o.relative_to(ROOT))
        if not check: o.unlink()
    return stale
