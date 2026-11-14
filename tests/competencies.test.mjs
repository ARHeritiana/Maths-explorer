// Competencies of the exercise generators (site/js/exercises/competencies.js): every generator has exactly one line,
// only known competencies, no generator claims "chercher" as its main competency, the filter of buildStarter keeps
// only the ticked main competencies and changes nothing when none is ticked, and the coverage table of
// docs/AUTOMATISMES_COMPETENCES.md is pinned (a new generator must update both).
import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, CLASSES, buildStarter, starterCompetencies } from '../dist/js/exercises/bank.js';
import { VISUAL_STARTERS } from '../dist/js/exercises/starter-visual.js';
import { COMPETENCIES, COMPETENCY_IDS, COMPETENCY_OF, mainCompetency, hasCompetency, coverage, competencyById } from '../dist/js/exercises/competencies.js';

test('one line per generator, known competencies only, no duplicate inside a line', () => {
  const ids = [...TEMPLATES, ...VISUAL_STARTERS].map((t) => t.id);
  assert.deepEqual(ids.filter((id) => !COMPETENCY_OF[id]), [], 'generators without a competency line');
  assert.deepEqual(Object.keys(COMPETENCY_OF).filter((id) => !ids.includes(id)), [], 'lines without a generator');
  for (const [id, list] of Object.entries(COMPETENCY_OF)) {
    assert.ok(Array.isArray(list) && list.length >= 1, id);
    for (const c of list) assert.ok(COMPETENCY_IDS.includes(c), `${id}: ${c}`);
    assert.equal(new Set(list).size, list.length, id);
  }
  assert.equal(COMPETENCY_IDS.length, 5);
  for (const c of COMPETENCIES) { assert.equal(c.label.length, 2); assert.equal(c.definition.length, 2); assert.equal(competencyById(c.id), c); }
  assert.equal(competencyById('communiquer'), null, 'communiquer is left out on purpose');
});

test('no generator has "chercher" as its main competency (a timed starter is not an investigation)', () => {
  assert.deepEqual([...TEMPLATES, ...VISUAL_STARTERS].filter((t) => mainCompetency(t.id) === 'chercher').map((t) => t.id), []);
});

test('the filter: none ticked changes nothing; ticked keeps only those main competencies', () => {
  for (const { id: cls } of CLASSES) {
    const base = { cls, chapters: [], domains: [], levels: [1, 2, 3], count: 12, minutes: 5, order: 'progressive', fastOnly: false, qcm: false, seed: 'c1' };
    assert.deepEqual(buildStarter({ ...base, competencies: [] }).items, buildStarter(base).items, cls);
    const have = starterCompetencies({ cls, chapters: [], domains: [], fastOnly: false });
    for (const c of COMPETENCY_IDS) {
      const doc = buildStarter({ ...base, competencies: [c] });
      for (const it of doc.items) assert.equal(it.competency, c, `${cls} ${c} ${it.id}`);
      assert.equal(doc.items.length > 0, !!have[c], `${cls} ${c}: available iff the pool has it`);
    }
  }
  assert.equal(hasCompetency('s-pgcd', []), true);
  assert.equal(hasCompetency('s-pgcd', ['raisonner']), false);
});

// Main competency per class: all generators / short (fast) ones. Order: chercher, modeliser, representer, raisonner, calculer.
const PINNED = {
  seconde: [[0, 0], [9, 4], [11, 5], [38, 3], [67, 43]],
  premiere: [[0, 0], [10, 2], [5, 2], [20, 10], [51, 24]],
  terminale: [[0, 0], [6, 2], [4, 2], [29, 14], [75, 25]],
  expertes: [[0, 0], [3, 1], [8, 3], [25, 3], [42, 19]],
  stmg: [[0, 0], [14, 2], [4, 2], [17, 1], [26, 19]],
};
test('coverage table pinned (update docs/AUTOMATISMES_COMPETENCES.md with it)', () => {
  const { byClass } = coverage(TEMPLATES);
  const got = Object.fromEntries(Object.entries(byClass).map(([cls, row]) => [cls, COMPETENCY_IDS.map((c) => [row[c].all, row[c].fast])]));
  assert.deepEqual(got, PINNED);
});
