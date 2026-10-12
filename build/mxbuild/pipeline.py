"""Course builds and the check suite.

`tex`: run a course builder (cached on a hash of its inputs), regenerate the catalogue
and republish the sources. `check`: every pre-push check from the brief, in one command.
"""
import re, subprocess, sys, time
from pathlib import Path
from . import ROOT, tex

PY = sys.executable
# Extra inputs per course beyond its TeX tree and the core (paths relative to the repository root).
INPUTS = {
    'enrichment': ['content/data/enrichment.json', 'scripts/enrichment_sections.py', 'build/mxbuild/enrichment.py'],
}
COMMON_INPUTS = ['content/data/manifest.json', 'build/mxbuild/pdf.py']
# Course -> builder command (relative to the repository root). The builders still live in scripts/ until phase B.
COURSES = {
    'automatismes': ['scripts/build-automatismes.py'],
    'stmg': ['scripts/build-stmg.py'],
    'seconde': ['scripts/build-tex-resources.py', 'seconde', '--chapters', *map(str, range(1, 16))],
    'premiere': ['scripts/build-tex-resources.py', 'premiere', '--chapters', *map(str, range(1, 11)), '--appendices'],
    'terminale': ['scripts/build-tex-resources.py', 'terminale', '--chapters', *map(str, range(1, 15)), '--appendices'],
    'enrichment': ['scripts/build-enrichment.py'],
}


def run(cmd, **kw):
    print('$', ' '.join(cmd), flush=True)
    return subprocess.run(cmd, cwd=ROOT, **kw)


def changed_pdfs():
    """Modified or new PDFs under dist/resources (every untracked file listed, paths unquoted)."""
    out = subprocess.run(['git', 'status', '--porcelain', '-z', '-uall', '--', 'dist/resources'], cwd=ROOT,
                         capture_output=True, text=True).stdout
    return [e[3:] for e in out.split('\0') if e.endswith('.pdf') and e[:2] != ' D']


PDF_ID = re.compile(rb'/ID\s*\[.*?\]>>', re.S)   # /ID pair (hex or literal strings) at the end of the trailer


def _without_id(pdf):
    """PDF bytes without the trailer's /ID and the startxref offset (the only bytes a rebuild changes by itself)."""
    body, _, trailer = pdf.rpartition(b'\ntrailer')
    return body + PDF_ID.sub(b'>>', trailer.split(b'startxref')[0])


def restore_unchanged(pdfs):
    """Put back the committed copy of every rebuilt PDF that differs from it only in its random /ID (rebuilding a
    course after a core change must not rewrite every binary in the repository); returns the PDFs still changed."""
    kept = []
    for p in pdfs:
        old = subprocess.run(['git', 'show', f'HEAD:{p}'], cwd=ROOT, capture_output=True).stdout
        new = (ROOT / p).read_bytes()
        if old and _without_id(old) == _without_id(new):
            (ROOT / p).write_bytes(old)
        else: kept.append(p)
    if len(kept) < len(pdfs):
        print(f'{len(pdfs) - len(kept)} rebuilt PDF(s) identical to the committed ones apart from /ID: committed copies kept')
    return kept


def build_tex(courses, force=False):
    for course in courses:
        script = COURSES[course]
        extra = [script[0], *INPUTS.get(course, []), *COMMON_INPUTS]
        if not force and tex.cache_get(course) == tex.inputs_hash(course, extra):
            print(f'{course}: unchanged since the last build (cache), skipped'); continue
        t0 = time.time()
        if run([PY, *script]).returncode: return 1
        # taken after the build: builders may write generated sources (enrichment) or the manifest
        tex.cache_put(course, tex.inputs_hash(course, extra))
        print(f'{course}: built in {time.time() - t0:.0f} s')
    restore_unchanged(changed_pdfs())
    if run([PY, 'scripts/finalize-resources.py']).returncode: return 1
    return run([PY, 'scripts/publish-sources.py']).returncode


CHECKS = [
    ('npm test', ['npm', 'test']),
    ('npm run check', ['npm', 'run', 'check']),
    ('catalogue up to date', [PY, '-m', 'mxbuild', 'catalog', '--check']),
    ('dist/ matches site/', [PY, '-m', 'mxbuild', 'site', '--check']),
    ('banned content', [PY, 'tests/banned.py']),
    ('FR/EN twin parity (maths and figures)', [PY, 'tests/twin_parity.py']),
    ('FR/EN PDFs: parity, local frames and safe links', [PY, 'tests/pdf_parity.py']),
    ('twin tool unit tests', [PY, 'tests/test_twin.py']),
    ('English units up to date', [PY, '-m', 'mxbuild', 'twin', 'check']),
    ('TeX unit lint', [PY, 'tests/tex_lint.py']),
    ('enrichment units match the JSON', [PY, '-m', 'mxbuild', 'enrichment', '--check']),
    ('enrichment converter tests', [PY, 'tests/test_enrichment.py']),
    ('notation: class and web agree, rewrite', [PY, 'tests/test_notation.py']),
    ('slide MathJax table from mx-math', [PY, '-m', 'mxbuild', 'notation', '--check']),
    ('slides check', [PY, 'tests/slides_check.py']),
    ('browser', [PY, 'tests/run_browser.py']),
    ('slides smoke', [PY, 'tests/slides_smoke.py']),
]


def check(fast=False):
    import os
    env = dict(os.environ, PYTHONPATH=str(ROOT / 'build'))
    failed = []
    for name, cmd in CHECKS:
        if fast and name in ('browser', 'slides smoke'): continue
        t0 = time.time()
        r = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True)
        ok = r.returncode == 0
        print(f"{'ok  ' if ok else 'FAIL'} {name} ({time.time() - t0:.0f} s)", flush=True)
        if not ok: failed.append(name); print((r.stdout + r.stderr)[-3000:])
    hits = subprocess.run(['git', 'grep', '-nE', r'drive\.google|docs\.google'], cwd=ROOT, capture_output=True, text=True).stdout
    print(f"{'ok  ' if not hits else 'FAIL'} no Drive links in tracked files")
    if hits: failed.append('drive grep')
    return 1 if failed else 0
