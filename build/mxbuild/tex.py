"""TeX compilation: one driver for every builder, and the per-course cache used by `mxbuild tex`.

compile() runs pdfLaTeX (or another engine) without shell escape and with -halt-on-error, reruns while LaTeX asks for
it, and reports pages, undefined references and overfull boxes. Builders decide what to do with the result.
"""
import hashlib, json, re, subprocess, time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path
from . import ROOT, OUT

RERUN = re.compile(r'Rerun to get|Label\(s\) may have changed|Table widths have changed\. Rerun')
UNDEFINED = re.compile(r'(?m)^LaTeX Warning: (?:Reference|Citation) .*undefined.*$')
OVERFULL = re.compile(r'Overfull \\[hv]box')


class CompileError(SystemExit):
    pass


@dataclass
class Result:
    pdf: Path
    log: str
    runs: int
    seconds: float

    @property
    def undefined(self): return UNDEFINED.findall(self.log)

    @property
    def overfull(self): return len(OVERFULL.findall(self.log))

    def report(self, name):
        """Print the usual one-line summary and stop the build on undefined references; returns self."""
        und = self.undefined
        print(f'  {name}: {self.pages()} pages, {len(und)} undefined references, {self.overfull} overfull boxes')
        if und: raise CompileError('Undefined references in ' + name + ':\n' + '\n'.join(und))
        return self

    def pages(self):
        import pymupdf
        with pymupdf.open(self.pdf) as d: return len(d)


AUX = ('.aux', '.toc', '.lof', '.lot', '.out')


def _aux_state(outdir, jobname):
    h = hashlib.sha256()
    for ext in AUX:
        f = outdir / (jobname + ext)
        if f.exists(): h.update(f.read_bytes())
    return h.hexdigest()


def compile(src_dir, tex_input, jobname, outdir, engine='pdflatex', max_runs=4):
    """Compile `tex_input` (a file name, or TeX code such as \\def\\x{1}\\input{main}) from `src_dir` into `outdir`.
    Reruns while LaTeX asks for it or while the auxiliary files (.aux, .toc, ...) still change: a table of contents
    changes without any "Rerun" warning, so the warning alone leaves stale page numbers."""
    outdir = Path(outdir); outdir.mkdir(parents=True, exist_ok=True)
    cmd = [engine, '-no-shell-escape', '-interaction=nonstopmode', '-halt-on-error', '-jobname=' + jobname,
           '-output-directory=' + str(outdir), tex_input]
    logf = outdir / (jobname + '.log'); t0 = time.time()
    state = _aux_state(outdir, jobname)
    for run in range(1, max_runs + 1):
        r = subprocess.run(cmd, cwd=src_dir, capture_output=True, text=True, errors='replace')
        log = logf.read_text(errors='replace') if logf.exists() else r.stdout
        if r.returncode:
            raise CompileError(f'LaTeX failed for {tex_input} ({jobname}); see {logf}')
        new = _aux_state(outdir, jobname)
        if not RERUN.search(log) and new == state: break
        state = new
    else:
        print(f'  warning: {jobname} still changing after {max_runs} runs')
    return Result(outdir / (jobname + '.pdf'), log, run, time.time() - t0)


# ---- French/English page balance -------------------------------------------------------------------------------------
def _blocks(outdir, job):
    """Block lengths in pages from <job>.mxb (lines 'block first-page'; the last line marks the end)."""
    f = Path(outdir) / (job + '.mxb')
    rows = [tuple(map(int, l.split())) for l in f.read_text().split('\n') if l.strip()] if f.exists() else []
    return {rows[i][0]: rows[i + 1][1] - rows[i][1] for i in range(len(rows) - 1)}


def _pads(outdir, job):
    f = Path(outdir) / (job + '.mxpad')
    return {int(a): int(b) for a, b in re.findall(r'\\mxsetpad\{(\d+)\}\{(\d+)\}', f.read_text())} if f.exists() else {}


def compile_pair(src_dir, inputs, jobs, outdir, max_rounds=3, **kw):
    """Compile a French and an English main (inputs/jobs: {'fr': ..., 'en': ...}) so that every block (unit or
    session) has the same number of pages in both: the shorter side of a block gets lined notes pages
    (\\mxsetpad in <job>.mxpad, read by mxbook.cls). Returns {'fr': Result, 'en': Result}."""
    outdir = Path(outdir)
    for _ in range(max_rounds):
        with ThreadPoolExecutor(2) as pool:   # the two languages are independent LaTeX processes
            res = dict(zip(('fr', 'en'), pool.map(lambda lang: compile(src_dir, inputs[lang], jobs[lang], outdir, **kw), ('fr', 'en'))))
        raw = {lang: {k: v - _pads(outdir, jobs[lang]).get(k, 0) for k, v in _blocks(outdir, jobs[lang]).items()} for lang in res}
        if set(raw['fr']) != set(raw['en']):
            raise CompileError(f'{jobs["fr"]}/{jobs["en"]}: different block structure in French and English')
        want = {lang: {k: max(raw['fr'][k], raw['en'][k]) - raw[lang][k] for k in raw[lang]} for lang in res}
        want = {lang: {k: v for k, v in w.items() if v} for lang, w in want.items()}
        if all(want[lang] == _pads(outdir, jobs[lang]) for lang in res):
            if any(want.values()):
                print(f'  balanced: {sum(want["fr"].values())} notes page(s) in French, {sum(want["en"].values())} in English')
            return res
        for lang in res:
            (outdir / (jobs[lang] + '.mxpad')).write_text(''.join('\\mxsetpad{%d}{%d}\n' % kv for kv in sorted(want[lang].items())))
    raise CompileError(f'{jobs["fr"]}/{jobs["en"]}: page balance did not settle after {max_rounds} rounds')


# ---- cache -------------------------------------------------------------------------------------------------------
CACHE = OUT / 'tex-cache.json'


def inputs_hash(course, extra=()):
    """Hash of everything a course build reads: its sources, the shared core, the builder scripts and this driver."""
    h = hashlib.sha256()
    roots = [ROOT / 'content/tex/courses' / course, ROOT / 'content/tex/core']
    files = [p for r in roots if r.exists() for p in sorted(r.rglob('*')) if p.is_file()]
    files += [Path(__file__)] + [ROOT / e for e in extra]
    for p in files:
        h.update(str(p.relative_to(ROOT)).encode()); h.update(p.read_bytes())
    return h.hexdigest()


def cache_get(course):
    return json.loads(CACHE.read_text()).get(course) if CACHE.exists() else None


def cache_put(course, digest):
    data = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    data[course] = digest; CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(json.dumps(data, indent=1, sort_keys=True) + '\n')
