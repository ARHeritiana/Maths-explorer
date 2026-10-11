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


def write(check=False):
    stale = []
    for src, dst in pairs():
        if dst.exists() and dst.read_bytes() == src.read_bytes(): continue
        stale.append(dst.relative_to(ROOT))
        if not check:
            dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst)
    return stale
