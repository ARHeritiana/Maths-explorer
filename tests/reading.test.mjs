// The "Lire" section: texts (bilingual, no dashes, every link resolves, links shown both ways) and the maths of its
// curiosities (Game of Life, square packing, Hanoi legend) and of the gauss-sum challenge, by independent methods.
import test from "node:test";
import assert from "node:assert/strict";
import { BIOGRAPHIES, STORIES } from "../dist/js/reading-content.js";
import { describe, relatedTo, readAlso, readingPage, isReading } from "../dist/js/reading.js";
import { labs } from "../dist/js/content.js";
import * as L from "../dist/js/gallery-life-model.js";
import * as S from "../dist/js/gallery-squares-model.js";
import { SERIES_PRESETS, parseSeries, seriesSum } from "../dist/js/challenges/gauss-sum/maths.js";
import { VARIANTS, defaults } from "../dist/js/challenges/registry.js";

const pairs = (x, out = []) => { if (Array.isArray(x) && x.length === 2 && x.every((s) => typeof s === "string")) out.push(x); else if (x && typeof x === "object") Object.values(x).forEach((v) => pairs(v, out)); return out; };
const curiosities = labs.filter((l) => ["life", "square-packing"].includes(l.id));

test("texts: bilingual, no em or en dash, sources over https, every link names a page", () => {
  assert.equal(curiosities.length, 2); assert.ok(!labs.some((l) => l.id === "hanoi-legend"), "the legend is a story, not a curiosity");
  for (const entry of [...BIOGRAPHIES, ...STORIES, ...curiosities]) {
    for (const [fr, en] of pairs(entry)) { assert.ok(fr && en, entry.id); assert.ok(!/[–—]/.test(fr + en), `${entry.id}: ${fr.slice(0, 40)}`); }
    for (const h of entry.links || []) assert.ok(describe(h), `${entry.id} links to ${h}`);
    for (const [url] of entry.sources || []) assert.equal(new URL(url).protocol, "https:");
  }
  for (const s of STORIES) assert.ok(BIOGRAPHIES.some((b) => b.id === s.who) || s.figure, s.id);
});

test("cross-links are written once and shown on both pages", () => {
  // the Hanoi challenge and its legend, the fly and von Neumann, the Gauss sum and its story
  assert.ok(relatedTo("#challenges/hanoi").includes("#stories/hanoi-legend"));
  assert.ok(relatedTo("#challenges/fly").includes("#stories/von-neumann-fly"));
  assert.ok(relatedTo("#challenges/gauss-sum").includes("#stories/gauss-sum"));
  assert.ok(relatedTo("#gallery/life").includes("#biographies/von-neumann"));
  const t = (p) => p[0];
  assert.match(readAlso("#challenges/hanoi", [], t), /#stories\/hanoi-legend/);
  assert.match(readAlso("#stories/hanoi-legend", ["#challenges/hanoi"], t), /#challenges\/hanoi/);
  assert.equal(readAlso("#nowhere", [], t), "");
  for (const b of BIOGRAPHIES) { assert.ok(isReading("biographies", b.id)); for (const j of [0, 1]) assert.match(readingPage("biographies", b.id, (p) => p[j]), /read-timeline/); }
  for (const s of STORIES) { assert.ok(isReading("stories", s.id)); for (const j of [0, 1]) assert.match(readingPage("stories", s.id, (p) => p[j]), /read-also/); }
  assert.ok(!isReading("stories", "unknown") && isReading("stories") && isReading("biographies"));
});

test("Game of Life: periods, displacements and lifetimes stated in the exhibit", () => {
  const period = (id) => { const s0 = L.presetSet(id), f = L.normalForm(s0); let s = s0; for (let i = 1; i <= 40; i++) { s = L.step(s); if (L.normalForm(s) === f) { const a = L.bounds(s0), b = L.bounds(s); return [i, b[0] - a[0], b[1] - a[1]]; } } return null; };
  assert.deepEqual(period("blinker"), [2, 0, 0]); assert.deepEqual(period("toad"), [2, 0, 0]); assert.deepEqual(period("beacon"), [2, 0, 0]);
  assert.deepEqual(period("pulsar"), [3, 0, 0]); assert.deepEqual(period("glider"), [4, 1, 1]); assert.deepEqual(period("lwss"), [4, -2, 0]);
  // a block is still life; a lone cell dies
  const block = L.fromCells([[0, 0], [1, 0], [0, 1], [1, 1]]); assert.equal(L.normalForm(L.step(block)), L.normalForm(block)); assert.equal(L.step(L.fromCells([[0, 0]])).size, 0);
  let s = L.presetSet("diehard"), g = 0; while (s.size && g < 200) { s = L.step(s); g++; } assert.equal(g, 130);
  // the gun takes its shape again after 30 generations, with one more glider (5 cells) outside it
  const gun = L.presetSet("gun"), b = L.bounds(gun), later = L.run(gun, 30), inside = new Set([...later].filter((k) => { const [x, y] = L.coords(k); return x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]; }));
  assert.equal(L.normalForm(inside), L.normalForm(gun)); assert.equal(later.size, gun.size + 5);
  // the R-pentomino settles at generation 1103 with 116 cells: from then on the population repeats with period 2
  const sizes = []; s = L.presetSet("rpent"); for (let i = 0; i <= 1110; i++) { sizes.push(s.size); s = L.step(s); }
  assert.equal(sizes[1110], 116); assert.ok(sizes.slice(1103).every((v, i, a) => i < 2 || v === a[i - 2])); assert.notEqual(sizes[1101], sizes[1103]);
  // a seeded soup is reproducible
  let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  assert.equal(L.soup(10, 10, 0.5, rnd).size, (seed = 1, L.soup(10, 10, 0.5, rnd).size));
});

test("square packing: the packings shown are valid and reach the stated sides; overlap test against sampling", () => {
  assert.equal(S.MAX_N, 28);
  for (let n = 1; n <= S.MAX_N; n++) {
    const p = S.bestPacking(n); assert.equal(p.length, n);
    assert.deepEqual(S.overlaps(p), [], `n = ${n}`);
    assert.ok(Math.abs(S.frame(p)[2] - S.RECORDS[n].side) < 1e-12, `n = ${n}`);
  }
  assert.ok(Math.abs(S.RECORDS[5].side - (2 + Math.SQRT2 / 2)) < 1e-12 && Math.abs(S.RECORDS[10].side - 3.7071067811865475) < 1e-12);
  assert.ok(Math.abs(S.RECORDS[18].side - 4.8229) < 1e-4 && Math.abs(S.RECORDS[19].side - 4.8856) < 1e-4);
  // the closed forms shown agree with the recorded sides; the exact constructions of 5 and 10 reach the same sides
  const forms = { 5: 2 + 1 / Math.SQRT2, 10: 3 + 1 / Math.SQRT2, 18: 3.5 + Math.sqrt(7) / 2, 19: 3 + (4 * Math.SQRT2) / 3, 26: 3.5 + 3 / Math.SQRT2, 27: 5 + 1 / Math.SQRT2 };
  for (const [n, v] of Object.entries(forms)) assert.ok(Math.abs(S.RECORDS[n].side - v) < 1e-9, n);
  assert.ok(Math.abs(S.frame(S.five())[2] - forms[5]) < 1e-12 && Math.abs(S.frame(S.ten())[2] - forms[10]) < 1e-12 && !S.overlaps(S.ten()).length);
  for (const n of [5, 6, 10, 13, 22]) assert.equal(S.RECORDS[n].status, "proved", n);
  for (const n of [17, 18, 19]) assert.equal(S.RECORDS[n].status, "open", n);
  // every recorded side is at least the area bound √n
  for (const [n, r] of Object.entries(S.RECORDS)) assert.ok(r.side >= Math.sqrt(n) - 1e-12, n);
  // independent check of the separating axis test: a point inside both squares exists exactly when they overlap
  const inside = (q, x, y) => { const c = Math.cos(q.a), s = Math.sin(q.a), dx = x - q.x, dy = y - q.y; return Math.abs(dx * c + dy * s) < 0.5 - 1e-6 && Math.abs(-dx * s + dy * c) < 0.5 - 1e-6; };
  let seed = 7; const rnd = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
  for (let k = 0; k < 300; k++) {
    const p = { x: 0, y: 0, a: rnd() * 2 }, q = { x: (rnd() - 0.5) * 3, y: (rnd() - 0.5) * 3, a: rnd() * 2 };
    let shared = false; for (let i = 0; i < 160 && !shared; i++) for (let j = 0; j < 160 && !shared; j++) { const x = -1.8 + (3.6 * i) / 159, y = -1.8 + (3.6 * j) / 159; shared = inside(p, x, y) && inside(q, x, y); }
    const depth = S.overlapDepth(p, q);
    if (shared) assert.ok(depth > 0, "sampled overlap"); else assert.ok(depth < 0.05, "no sampled overlap, at most a sliver");
  }
  const moved = S.five(); moved[4].x += 1e-3; assert.ok(S.overlaps(moved).length > 0);
});

test("Hanoi legend: the numbers of the story, recomputed (minimal moves by recursion, years, binary counter)", () => {
  const u = (n) => (n === 1 ? 1n : 2n * u(n - 1) + 1n);
  assert.equal(u(64).toString(), "18446744073709551615"); assert.equal(u(64), 2n ** 64n - 1n);
  const year = 365.25 * 24 * 3600; assert.equal(year, 31557600);
  const years = Number(u(64)) / year; assert.ok(years > 5.84e11 && years < 5.85e11 && years / 13.8e9 > 40 && years / 1000 > 5.8e8);
  // the disk moved at move k, from a direct simulation of the recursive solution, is 1 + (times 2 divides k)
  const out = []; const solve = (n, a, c) => { if (!n) return; const b = 3 - a - c; solve(n - 1, a, b); out.push(n); solve(n - 1, b, c); }; solve(8, 0, 2);
  out.forEach((d, i) => { let k = i + 1, v = 1; while (k % 2 === 0) { k /= 2; v++; } assert.equal(d, v); });
  const text = STORIES.find((s) => s.id === "hanoi-legend"); assert.ok(text && JSON.stringify(text).includes("18 446 744 073 709 551 615"));
});

test("gauss-sum: the closed form equals the sum added term by term, for every preset and random series", () => {
  const brute = (a, d, k) => { let s = 0; for (let i = 0; i < k; i++) s += a + i * d; return s; };
  for (const p of SERIES_PRESETS) { const [a, d, k] = parseSeries(p); assert.equal(seriesSum(a, d, k), brute(a, d, k), p); assert.equal(VARIANTS["gauss-sum"].answer({ series: p }), brute(a, d, k)); }
  assert.equal(VARIANTS["gauss-sum"].answer(defaults("gauss-sum")), 5050);
  assert.equal(seriesSum(81297, 198, 100), 9109800);
  for (let a = 1; a < 30; a += 7) for (let d = 1; d < 12; d += 3) for (let k = 2; k < 60; k += 11) assert.equal(seriesSum(a, d, k), brute(a, d, k));
});
