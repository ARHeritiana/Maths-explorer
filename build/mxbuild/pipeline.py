"""Course builds and the check suite.

`tex`: run a course builder (cached on a hash of its inputs), then style the PDFs it changed, regenerate the catalogue
and republish the sources. `check`: every pre-push check from the brief, in one command.
"""
import subprocess, sys, time
from . import ROOT, tex

PY = sys.executable
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
    out = subprocess.run(['git', 'status', '--porcelain', '--', 'dist/resources'], cwd=ROOT, capture_output=True, text=True).stdout
    return [line[3:] for line in out.splitlines() if line.endswith('.pdf')]


def build_tex(courses, force=False):
    for course in courses:
        script = COURSES[course]
        digest = tex.inputs_hash(course, extra=[script[0], 'scripts/style-resource-pdfs.py'])
        if not force and tex.cache_get(course) == digest:
            print(f'{course}: unchanged since the last build (cache), skipped'); continue
        t0 = time.time()
        if run([PY, *script]).returncode: return 1
        tex.cache_put(course, digest)
        print(f'{course}: built in {time.time() - t0:.0f} s')
    pdfs = changed_pdfs()
    if pdfs and run([PY, 'scripts/style-resource-pdfs.py', *pdfs]).returncode: return 1
    if run([PY, 'scripts/finalize-resources.py']).returncode: return 1
    return run([PY, 'scripts/publish-sources.py']).returncode


CHECKS = [
    ('npm test', ['npm', 'test']),
    ('npm run check', ['npm', 'run', 'check']),
    ('catalogue up to date', [PY, '-m', 'mxbuild', 'catalog', '--check']),
    ('dist/ matches site/', [PY, '-m', 'mxbuild', 'site', '--check']),
    ('banned content', [PY, 'tests/banned.py']),
    ('STMG twins', [PY, 'scripts/check-stmg-twins.py']),
    ('twin tool unit tests', [PY, 'tests/test_twin.py']),
    ('English units up to date', [PY, '-m', 'mxbuild', 'twin', 'check']),
    ('TeX unit lint', [PY, 'tests/tex_lint.py']),
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
