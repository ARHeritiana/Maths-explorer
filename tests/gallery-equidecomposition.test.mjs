// Equidecomposition exhibit (Wallace-Bolyai-Gerwien): the pure model by independent checks. Area is preserved at every
// stage time for every pair of presets, consecutive stages join up (point sampling), and hand-made degenerate polygons
// behave as the audit of 31 October 2026 describes.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../site/js/gallery/gallery-equidecomposition-model.js';

const polyArea = (p) => Math.abs(E.area(p));
// even-odd point in polygon (independent of the model's own tests)
const inside = (q, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
const inUnion = (q, pieces) => pieces.some((p) => inside(q, p.poly));
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

test('presets: counter-clockwise or not, ear clipping returns n - 2 triangles, areas are rescaled to 500', () => {
  assert.equal(E.PRESETS.length, 14);
  for (const p of E.PRESETS) {
    const A = E.normalise(p.pts);
    assert.ok(Math.abs(E.area(A) - E.AREA) < 1e-9, p.id);
    assert.equal(E.triangulate(A).length, p.pts.length - 2, p.id);
    assert.ok(E.validatePolygon(p.pts).ok, `${p.id} passes the validator`);
    const rev = E.normalise([...p.pts].reverse());
    assert.ok(Math.abs(E.area(rev) - E.AREA) < 1e-9, `${p.id} reversed`);
  }
  for (const [a, b] of E.GALLERY) assert.ok(E.preset(a) && E.preset(b));
});

test('area is preserved at every stage time for all 196 ordered pairs of presets', () => {
  let worst = 0;
  for (const a of E.PRESETS) for (const b of E.PRESETS) {
    const CH = E.buildChain(a.pts, b.pts);
    assert.ok(Math.abs(CH.W * CH.H - E.AREA) < 1e-9 && CH.W > 0 && CH.H > 0);
    for (let i = 0; i < E.STAGES; i++) for (const e of [0, 0.5, 1]) {
      const pieces = E.stagePieces(CH, i, e), total = pieces.reduce((s, p) => s + polyArea(p.poly), 0);
      assert.ok(pieces.every((p) => p.poly.flat().every(Number.isFinite)), `${a.id}->${b.id} finite`);
      const err = Math.abs(total - E.AREA) / E.AREA; worst = Math.max(worst, err);
      assert.ok(err < 1e-9, `${a.id} -> ${b.id}, step ${i}, e=${e}: pieces cover ${total}`);
    }
    for (const T of [0, 0.37, 3.99, 4, 7.5, 8]) assert.ok(Math.abs(E.frame(CH, T).pieces.reduce((s, p) => s + polyArea(p.poly), 0) - E.AREA) < 5e-7);
  }
  assert.ok(worst < 1e-9);
});

test('the chain starts on P, ends on Q, passes through the rectangle R, and consecutive stages join up', () => {
  const pairs = [['hexagon', 'square'], ['star', 'hexagon'], ['cross', 'arrow'], ['l-shape', 'star'], ['house', 'zigzag'], ['rectangle', 'pentagon']];
  for (const [a, b] of pairs) {
    const CH = E.buildChain(E.preset(a).pts, E.preset(b).pts);
    const box = CH.bbox, x0 = Math.min(...box.map((p) => p[0])), x1 = Math.max(...box.map((p) => p[0])), y0 = Math.min(...box.map((p) => p[1])), y1 = Math.max(...box.map((p) => p[1]));
    let bad = 0, n = 0;
    const same = (p1, p2, target) => { for (let k = 0; k < 600; k++) { const q = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)], u = inUnion(q, p1); n++; if (u !== (target ? inside(q, target) : inUnion(q, p2))) bad++; } };
    same(E.stagePieces(CH, 0, 0), null, CH.AP);          // P at the start
    same(E.stagePieces(CH, 3, 1), null, CH.R);           // R at the end of the chain of P
    same(E.stagePieces(CH, 4, 0), null, CH.R);           // R at the start of the chain of Q
    same(E.stagePieces(CH, 7, 1), null, CH.AQ);          // Q at the end
    for (let i = 0; i < E.STAGES - 1; i++) same(E.stagePieces(CH, i, 1), E.stagePieces(CH, i + 1, 0));
    assert.equal(bad, 0, `${a} -> ${b}: ${bad} of ${n} sample points differ`);
  }
});

const tryPoly = (pts) => E.validatePolygon(pts);
const acceptedPreservesArea = (poly) => {
  const CH = E.buildChain(poly, E.preset('square').pts), CH2 = E.buildChain(E.preset('hexagon').pts, poly);
  for (const c of [CH, CH2]) for (let i = 0; i < E.STAGES; i++) for (const e of [0, 0.5, 1]) {
    const total = E.stagePieces(c, i, e).reduce((s, p) => s + polyArea(p.poly), 0);
    assert.ok(Math.abs(total - E.AREA) / E.AREA < 1e-9, `step ${i}: ${total}`);
  }
};

test('degenerate custom polygons: refused when the figure would be wrong, accepted when it is fine', () => {
  const rect = [[0, 0], [10, 0], [10, 6], [0, 6]];
  assert.ok(tryPoly(rect).ok);
  // repeated consecutive vertex: duplicate removed, same rectangle
  const rep = tryPoly([[0, 0], [10, 0], [10, 0], [10, 6], [0, 6]]); assert.ok(rep.ok); assert.equal(rep.poly.length, 4); acceptedPreservesArea(rep.poly);
  // closing vertex typed twice
  const closed = tryPoly([...rect, [0, 0]]); assert.ok(closed.ok); assert.equal(closed.poly.length, 4);
  // zero-width spike (out and back along the same line)
  assert.deepEqual(tryPoly([[0, 0], [10, 0], [10, 6], [15, 6], [10, 6], [0, 6]]), { ok: false, code: 'invalid' });
  assert.equal(tryPoly([[0, 0], [10, 0], [5, 0], [5, 6]]).ok, false);
  // pinched polygon touching itself at a vertex, and a plain bow-tie
  assert.equal(tryPoly([[0, 0], [10, 0], [5, 5], [10, 10], [0, 10], [5, 5]]).code, 'invalid');
  assert.equal(tryPoly([[0, 0], [10, 10], [10, 0], [0, 10]]).code, 'invalid');
  // collinear overlap of two non-adjacent edges, and a vertex lying on another edge
  assert.equal(tryPoly([[0, 0], [10, 0], [10, 5], [4, 5], [4, 0], [6, 0], [6, 8], [0, 8]]).code, 'invalid');
  assert.equal(tryPoly([[0, 0], [10, 0], [10, 6], [5, 0], [0, 6]]).ok, false);
  // clockwise input, collinear vertex on an edge line: accepted, area preserved
  const cw = tryPoly([...rect].reverse()); assert.ok(cw.ok); acceptedPreservesArea(cw.poly);
  const col = tryPoly([[0, 0], [5, 0], [10, 0], [10, 10], [0, 10]]); assert.ok(col.ok); assert.equal(E.triangulate(E.normalise(col.poly)).length, 3); acceptedPreservesArea(col.poly);
  // comb of 18 triangles
  const comb = [[0, 0], [36, 0], [36, 2]]; for (let k = 17; k >= 0; k--) comb.push([2 * k + 1, 6], [2 * k, 2]); comb.push([0, 2].slice());
  comb.pop();   // the last valley (0,2) is already the final push; the loop leaves the polygon closed back to (0,0)
  const cm = tryPoly(comb); assert.ok(cm.ok, 'comb'); assert.equal(cm.poly.length, comb.length); acceptedPreservesArea(cm.poly);
  // huge and tiny coordinates
  const huge = tryPoly([[0, 0], [1e6, 0], [1e6, 6e5], [0, 6e5]]); assert.ok(huge.ok); acceptedPreservesArea(huge.poly);
  const tiny = tryPoly([[0, 0], [1e-6, 0], [1e-6, 6e-7], [0, 6e-7]]); assert.ok(tiny.ok); acceptedPreservesArea(tiny.poly);
  const offset = tryPoly(rect.map(([x, y]) => [x + 1e9, y + 1e9])); assert.ok(offset.ok, 'far from the origin'); acceptedPreservesArea(offset.poly);
});

test('too few, non numeric, too many and too thin polygons are refused with a reason', () => {
  assert.equal(tryPoly([]).code, 'few'); assert.equal(tryPoly([[0, 0], [1, 1]]).code, 'few'); assert.equal(tryPoly([[0, 0], [0, 0], [0, 0]]).code, 'few');
  assert.equal(tryPoly([[0, 0], [1, NaN], [2, 2]]).code, 'numbers'); assert.equal(tryPoly([[0, 0], [Infinity, 1], [2, 2]]).code, 'numbers'); assert.equal(tryPoly([[0, 0, 1], [1, 1], [2, 0]]).code, 'numbers');
  assert.equal(tryPoly(E.PRESETS[0].pts.concat(Array(E.MAX_VERTICES).fill([0.5, 0.5]))).code, 'many');
  assert.equal(tryPoly([[0, 0], [100, 0], [100, 0.001], [0, 0.001]]).code, 'thin');
  assert.equal(tryPoly([[0, 0], [10, 0], [20, 0]]).code, 'thin');   // collinear: zero width
  assert.ok(tryPoly([[0, 0], [40, 0], [40, 1.1], [0, 1.1]]).ok, '36 times longer than wide is fine');
  assert.equal(tryPoly([[0, 0], [42, 0], [42, 1], [0, 1]]).code, 'thin');
});

test('typed vertices go through the same validator', () => {
  assert.deepEqual(E.parseVertices('0,0; 10,0; 10,6; 0,6'), [[0, 0], [10, 0], [10, 6], [0, 6]]);
  assert.deepEqual(E.parseVertices('0 0;10 0\n10 6 ;0,6;'), [[0, 0], [10, 0], [10, 6], [0, 6]]);
  assert.deepEqual(E.parseVertices('1.5,-2e1'), [[1.5, -20]]);
  // decimal point or decimal comma: a lone comma in a pair without spaces separates x and y, otherwise it is the decimal mark
  assert.deepEqual(E.parseVertices('1,5 2,5; 3 4'), [[1.5, 2.5], [3, 4]]);
  assert.deepEqual(E.parseVertices('1, 2; 3.5,4; 0,5 -1,25'), [[1, 2], [3.5, 4], [0.5, -1.25]]);
  assert.equal(E.parseVertices('1,5,2; 3,4'), null);
  for (const bad of ['', '   ', '1;2', '1,2,3', 'a,b', '1,Infinity', '0,0; x']) assert.equal(E.parseVertices(bad), null, JSON.stringify(bad));
  assert.ok(E.validatePolygon(E.parseVertices('0,0; 10,0; 10,6; 0,6')).ok);
  assert.equal(E.validatePolygon(E.parseVertices('0,0; 10,10; 10,0; 0,10')).code, 'invalid');
});

test('ear clipping: n - 2 triangles whose areas add up, on random star-shaped polygons', () => {
  for (let k = 0; k < 40; k++) {
    const n = 5 + Math.floor(rnd() * 25), A = Array.from({ length: n }, (_, i) => { const r = 1 + 2 * rnd(), a = 2 * Math.PI * i / n; return [r * Math.cos(a), r * Math.sin(a)]; });
    const tris = E.triangulate(A); assert.equal(tris.length, n - 2);
    assert.ok(Math.abs(tris.reduce((s, t) => s + E.area(t), 0) - E.area(A)) < 1e-9);
  }
  // a self-crossing bow-tie can still be clipped into n - 2 triangles: only the simplicity test refuses it
  assert.equal(E.isSimple([[0, 0], [10, 10], [10, 0], [0, 10]]), false);
});

test('at the end of every step no point is covered by two pieces (pieces of different triangles do not overlap on screen)', () => {
  for (const p of E.PRESETS) for (const q of E.PRESETS) {
    if (p === q) continue;
    const CH = E.buildChain(p.pts, q.pts);
    for (let T = 0; T <= E.STAGES; T++) {
      const polys = E.frame(CH, T).pieces.map((x) => x.poly), pts = polys.flat();
      const xs = pts.map((z) => z[0]), ys = pts.map((z) => z[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      for (let k = 0; k < 120; k++) {
        const pt = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)], n = polys.filter((poly) => inside(pt, poly)).length;
        assert.ok(n <= 1, `${p.id} to ${q.id}, step boundary ${T}: a point lies in ${n} pieces`);
      }
    }
  }
});
