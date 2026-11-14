// The illustrated starters (site/js/exercises/starter-visual.js): every answer checked by ok() over 200 seeds,
// deterministic, figures as SVG and TikZ, open parabola branches, programme placement, a share of figures in a series
// under the class, chapter and topic filters, and the figure carried by the three exports (print, LaTeX, projection page).
import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../dist/js/exercises/engine.js';
import { VISUAL_STARTERS, starterFigureHtml, starterFigureTex } from '../dist/js/exercises/starter-visual.js';
import { buildStarter } from '../dist/js/exercises/bank.js';
import { starterHtml, starterTex, projectionHtml } from '../dist/js/exercises/export.js';

const CLASSES = [...new Set(VISUAL_STARTERS.map((t) => t.cls))];
test('illustrated starters are mathematically checked and deterministic for 200 seeds each', () => {
  assert.equal(VISUAL_STARTERS.length,20);
  for(const t of VISUAL_STARTERS)for(let s=0;s<200;s++) {
    const a=t.make(rng(`visual-${s}`),1), b=t.make(rng(`visual-${s}`),1);
    assert.equal(a.q,b.q,`${t.id} seed ${s}`);
    assert.equal(a.a,b.a,`${t.id} seed ${s}`);
    assert.deepEqual(a.figure,b.figure,`${t.id} seed ${s}`);
    assert.ok(a.ok(),`${t.id} seed ${s} has incorrect solution`);
    const html=starterFigureHtml(a.figure), tex=starterFigureTex(a.figure);
    assert.match(html,/^<svg[\s\S]+<\/svg>$/);
    assert.match(html,/role="img"/);
    assert.match(tex,/\\begin\{tikzpicture\}/);
    assert.match(tex,/\\end\{tikzpicture\}/);
    assert.ok(t.skill && t.chapter && t.domain && t.fast && t.visual);
    assert.doesNotMatch(a.q, /justifi|démontr|prouv/i, 'automatismes ne demandent aucune justification');
  }
});
test('the illustrated starters appear regularly in a mixed series, including under chapter filtering', () => {
  for(const cls of CLASSES) {
    const a=buildStarter({ cls, count:10, minutes:5, seed:'graphical-series' });
    const b=buildStarter({ cls, count:10, minutes:5, seed:'graphical-series' });
    assert.deepEqual(a,b);
    assert.ok(a.items.filter(x=>x.figure).length>=2,`${cls}: graphical content must be represented`);
    assert.equal(a.items.length,10);
    assert.equal(new Set(a.items.map(x=>x.q+JSON.stringify(x.figure||null))).size,10);
  }
  const geometry=buildStarter({cls:'seconde',domains:['geometrie'],count:10,seed:'lines'});
  assert.ok(geometry.items.every(x=>x.domain==='geometrie'));
  const lines=buildStarter({cls:'seconde',chapters:['seconde-03'],count:10,seed:'lines'});
  assert.ok(lines.items.every(x=>x.chapter==='seconde-03'));
});
test('figures survive all three starter export paths', () => {
  const d=buildStarter({cls:'premiere',chapters:['premiere-02'],count:10,seed:'visual-exports'});
  assert.ok(d.items.some(x=>x.figure));
  const html=starterHtml(d),tex=starterTex(d), standalone=projectionHtml(d);
  assert.match(html,/<svg/);
  assert.match(tex,/\\usepackage\{tikz\}/);
  assert.match(tex,/\\begin\{tikzpicture\}/);
  assert.match(standalone,/\\u003csvg/);
  assert.match(starterHtml(d,{teacher:true}),/<svg/);
  const json=JSON.parse(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/.exec(standalone)[1].replace(/\\u003c/g,'<'));
  assert.ok(json.items.some(x=>x.fig.includes('<svg')));
});

// Regression: a parabola path must not be closed with Z. Closing a path joins the
// two separate arms with a false horizontal segment at the viewport boundary.
test('parabolas have open branches, and ask about coefficients or roots rather than counting visible crossings', () => {
  const curveTemplates=VISUAL_STARTERS.filter(t => /parabola|derivative/.test(t.id));
  assert.ok(curveTemplates.length>=8);
  for(const t of curveTemplates) for(let s=0;s<200;s++) {
    const x=t.make(rng(`curve-${s}`),1);
    const fig=starterFigureHtml(x.figure);
    const path=fig.match(/class="mx-curve" d="([^"]+)"/);
    assert.ok(path,`${t.id} must have a path`);
    assert.ok(!/[Zz]/.test(path[1]),`${t.id}: SVG must never join the arms`);
    assert.ok(!/NaN|Infinity/.test(path[1]),`${t.id}: SVG coordinates must be finite`);
    assert.ok(x.ok());
  }
  const sign=VISUAL_STARTERS.find(t=>t.id==='v-s-parabola-shape').make(rng('coefficient-a'),1);
  assert.match(sign.q,/ax\^\{2\}\+bx\+c/);
  assert.match(sign.q,/signe de/);
  assert.doesNotMatch(sign.q,/Combien|points communs|intersection/);
  const roots=VISUAL_STARTERS.find(t=>t.id==='v-p-parabola-roots').make(rng('roots'),1);
  assert.match(roots.q,/Résoudre graphiquement/);
  assert.doesNotMatch(roots.q,/Combien/);
});


test('correct programme placement and representations per class', () => {
  const byId = Object.fromEntries(VISUAL_STARTERS.map(t => [t.id, t]));
  const get = (id) => byId[id].make(rng('curriculum'), 1);
  assert.equal(byId['v-s-parabola-shape'].chapter, 'seconde-15');
  assert.equal(byId['v-p-parabola-signs'].chapter, 'premiere-02');
  assert.match(get('v-p-parabola-signs').q, /signes de/);
  assert.doesNotMatch(get('v-p-parabola-signs').q, /\\Delta|discriminant|intersection/i);
  for (const id of ['v-m-line-equation','v-m-line-slope','v-m-line-image']) {
    assert.equal(byId[id].chapter, 'stmg-05');
    const item=get(id);
    assert.equal(item.figure.kind, 'adjustment');
    assert.ok(item.figure.samples.length >= 4);
    assert.match(starterFigureHtml(item.figure), /Nuage de points/);
  }
  assert.equal(byId['v-t-derivative'].chapter, 'terminale-06', 'reading f from the graph of f\' is a differentiation item');
  for (const id of ['v-e-complex-vector','v-e-complex-equal']) {
    assert.equal(byId[id].chapter, 'expertes-05');
    assert.match(starterFigureHtml(get(id).figure), /Plan complexe/);
  }
});
test('no figure without its kind: a class without illustrated starters gets plain series', () => {
  const d=buildStarter({ cls:'seconde', chapters:['seconde-01'], count:10, seed:'plain' });
  assert.ok(d.items.every(x=>!x.figure));
  assert.doesNotMatch(starterTex(d),/tikz/);
});

test('every illustrated starter names a chapter of its own course in the manifest', async () => {
  const { readFile } = await import('node:fs/promises');
  const manifest = JSON.parse(await readFile(new URL('../content/data/manifest.json', import.meta.url), 'utf8'));
  const course = Object.fromEntries(manifest.catalog.chapters.map((c) => [c.id, c.course]));
  for (const t of VISUAL_STARTERS) assert.equal(course[t.chapter], t.cls, t.id);
  assert.equal(new Set(VISUAL_STARTERS.map((t) => t.id)).size, VISUAL_STARTERS.length);
});
