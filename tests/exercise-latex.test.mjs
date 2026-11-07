// The exercise bank's LaTeX: every command a generator writes is a known one (a missing space such as
// "\leqslantx" becomes an unknown command), and, when pdflatex is installed, every generator at every level
// compiles inside the real preamble, as do starters and sheets in both versions. Without pdflatex the
// compile test is skipped (the cloud container has none).
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rng } from '../site/js/exercises/engine.js';
import { TEMPLATES, AUTHORED, CLASSES, templatesFor, authoredFor, instance, buildStarter, buildSheet, scalePoints } from '../site/js/exercises/bank.js';
import { sheetTex, starterTex } from '../site/js/exercises/export.js';

const KNOWN = new Set(('Delta Omega approx arg bar begin cap cdot circ cos cup dbinom det dfrac displaystyle dots ell end equiv '
  + 'geqslant hline iff in infty int left leqslant lim ln log mathbb mathcal mathrm mu neq omega overline overrightarrow pi pm '
  + 'right sim sin sqrt text theta times to varnothing vec frac tfrac binom quad qquad leq geq le ge ne cdots ldots mid nmid '
  + 'alpha beta gamma delta lambda sigma varepsilon epsilon rho tau phi varphi Rightarrow Leftrightarrow forall exists notin '
  + 'subset cap cup emptyset tan exp max min sum prod lfloor rfloor operatorname boxed underbrace overbrace hat widehat pmod bmod '
  + 'leftarrow mapsto mathbf mathit texttt ne not lvert rvert vert Vert big Big bigg Bigg displaystyle textstyle limits div nearrow searrow parallel').split(' '));
const texts = (it) => [it.q, it.a, it.s, it.intro, ...(it.parts || []).flatMap((p) => [p.q, p.a])].filter(Boolean);
const commands = (s) => [...String(s).replace(/\\\\/g, ' ').matchAll(/\\([A-Za-z]+)/g)].map((m) => m[1]);

test('every LaTeX command written by a generator, a problem or an authored exercise is a known command', () => {
  const unknown = new Map();
  const note = (s, who) => commands(s).forEach((c) => { if (!KNOWN.has(c)) unknown.set(c, who); });
  for (const t of TEMPLATES) for (const lv of t.levels || [1, 2, 3]) for (let s = 0; s < 120; s++) texts(instance(t, lv, `k${s}`)).forEach((x) => note(x, `${t.id}/${lv}`));
  for (const e of AUTHORED) for (let s = 0; s < (e.make ? 60 : 1); s++) texts(e.make ? e.make(rng(`k${s}`)) : e).forEach((x) => note(x, e.id));
  assert.deepEqual([...unknown], [], 'unknown commands (a missing space after a command?)');
});

let pdflatex = true;
try { execFileSync('pdflatex', ['--version'], { stdio: 'ignore' }); } catch { pdflatex = false; }

test('pdflatex compiles every generator at every level, every problem and authored exercise, starters and sheets', { skip: !pdflatex && 'pdflatex not installed', timeout: 600000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'mx-tex-'));
  const compile = (name, src) => {
    writeFileSync(join(dir, `${name}.tex`), src);
    try { execFileSync('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', `${name}.tex`], { cwd: dir, stdio: 'pipe', timeout: 300000, maxBuffer: 32 * 1024 * 1024 }); }
    catch (error) { const log = readFileSync(join(dir, `${name}.log`), 'latin1'); assert.fail(`${name}: ${(log.match(/^! [\s\S]*?\nl\.\d+.*$/m) || [`compiler status ${error.status}, code ${error.code}, signal ${error.signal}; ${log.slice(-400)}`])[0]}`); }
  };
  try {
    for (const c of CLASSES) {
      const exercises = [];
      for (const t of templatesFor(c.id)) for (const lv of t.levels || [1, 2, 3]) for (let s = 0; s < 6; s++) {
        const it = instance(t, lv, `c${s}`);
        exercises.push({ title: `${t.id} niveau ${lv}`, intro: '', minutes: 1, parts: [{ q: it.q, a: it.a, s: it.s, level: lv, w: 1 }] });
      }
      for (const e of authoredFor(c.id)) for (let s = 0; s < (e.make ? 6 : 1); s++) {
        const x = e.make ? e.make(rng(`c${s}`)) : e;
        exercises.push({ title: e.title, intro: x.intro, minutes: 1, parts: x.parts.map((p) => ({ q: p.q, a: p.a, s: '', level: 1, w: p.w || 1 })) });
      }
      const doc = scalePoints({ kind: 'sheet', cls: c.id, seed: 'c', levels: [1, 2, 3], total: 20, minutes: 1, exercises: exercises.map((e, i) => ({ ...e, n: i + 1 })) });
      compile(`all-${c.id}`, sheetTex(doc, { version: 'teacher', bareme: true }));
      const st = buildStarter({ cls: c.id, count: 20, seed: 'c' });
      compile(`starter-${c.id}-s`, starterTex(st, { version: 'student' }));
      compile(`starter-${c.id}-t`, starterTex(st, { version: 'teacher' }));
      for (const kind of ['sheet', 'interro', 'devoir']) {
        const d = buildSheet({ cls: c.id, kind, seed: 'c' });
        compile(`${kind}-${c.id}-s`, sheetTex(d, { version: 'student', bareme: true }));
        compile(`${kind}-${c.id}-t`, sheetTex(d, { version: 'teacher', bareme: true }));
      }
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
