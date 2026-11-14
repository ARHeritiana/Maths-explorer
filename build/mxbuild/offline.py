"""Offline support: the precache manifest of the application shell, inlined into the served service worker.

site/sw.js is the hand-written worker with one placeholder line (`self.__MX_SHELL = null;`). The build writes
dist/sw.js = that source with the placeholder replaced by the manifest: the list of shell files of dist/ with the hash
of their content, and a version derived from that list. A changed shell file therefore changes dist/sw.js, which is
how a browser learns that a new version exists (docs/OFFLINE.md). Deterministic: sorted, no timestamps.
"""
import hashlib, json
from . import ROOT, DIST

SOURCE = ROOT / 'site' / 'sw.js'
OUTPUT = DIST / 'sw.js'
PLACEHOLDER = 'self.__MX_SHELL = null;'

# The application shell: what the first page needs to start and to draw any hash route. No PDF, no slide deck, no
# export, no portrait: those are cached when they are opened (runtime cache of the worker).
SHELL = ['index.html', 'styles/*.css', 'fonts/*.woff2', 'js/**/*.js', 'vendor/mathjax-tex-svg.js']
# Small indexes that pages fetch when they open (the dashboard and the slides page). Skipped above MAX_DATA bytes.
START_DATA = ['slides/data/index.json', 'slides/lectures/index.json']
MAX_DATA = 256 * 1024


def _hash(path):
    return hashlib.sha1(path.read_bytes()).hexdigest()[:10]   # same rule as the import map (site.py)


def shell_files(root=None):
    """Sorted relative paths of the files of `root` (default dist/) that the worker precaches."""
    root = root or DIST
    found = {p for pattern in SHELL for p in root.glob(pattern) if p.is_file()}
    found |= {root / f for f in START_DATA if (root / f).is_file() and (root / f).stat().st_size <= MAX_DATA}
    return sorted(p.relative_to(root).as_posix() for p in found)


def manifest(root=None):
    """{'version', 'bytes', 'files': [[path, hash], ...]} for the shell of `root` (default dist/)."""
    root = root or DIST
    files = [[f, _hash(root / f)] for f in shell_files(root)]
    version = hashlib.sha1(json.dumps(files, separators=(',', ':')).encode()).hexdigest()[:16]
    return {'version': version, 'bytes': sum((root / f).stat().st_size for f, _ in files), 'files': files}


def render(root=None, source=None):
    """The served worker: site/sw.js with the manifest in place of the placeholder."""
    from .site import edition_text   # the offline page of the worker names the site
    text = edition_text((source or SOURCE).read_text(encoding='utf-8'))
    if text.count(PLACEHOLDER) != 1:
        raise ValueError(f'site/sw.js must contain the line `{PLACEHOLDER}` exactly once')
    data = json.dumps(manifest(root), separators=(',', ':'), ensure_ascii=True)
    return text.replace(PLACEHOLDER, 'self.__MX_SHELL = ' + data + ';')


def write(check=False):
    """Write dist/sw.js; with check=True only report it when it is stale. Returns the stale paths."""
    text = render()
    if OUTPUT.exists() and OUTPUT.read_text(encoding='utf-8') == text:
        return []
    if not check:
        OUTPUT.write_text(text, encoding='utf-8')
    return [OUTPUT.relative_to(ROOT)]
