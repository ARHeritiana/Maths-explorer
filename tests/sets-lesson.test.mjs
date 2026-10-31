// The foundations lesson "Sets and operations" (site/resources/basics/sets.html and sets.en.html), real page scripts under jsdom.
// The mathematics is checked against independent computations with real Set objects, never against the page's own predicates.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInContext} from 'node:vm';
import {JSDOM} from 'jsdom';

const LANGS = ['fr', 'en'];
const file = lang => new URL(`../site/resources/basics/sets${lang === 'en' ? '.en' : ''}.html`, import.meta.url);

function page(lang) {
  const html = readFileSync(file(lang), 'utf8');
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  const dom = new JSDOM(html, {runScripts: 'outside-only', url: 'https://example.test/resources/basics/sets.html'});
  const w = dom.window, messages = [];
  w.matchMedia = () => ({matches: true});
  w.addEventListener('error', e => messages.push(e.message));
  w.parent.postMessage = (m) => messages.push(m);
  const ctx = dom.getInternalVMContext();
  const run = code => runInContext(code, ctx);
  runInContext(script, ctx);
  // Deterministic randomness, different for every page and call sequence.
  run('globalThis.__seed=12345;Math.random=()=>{__seed=(__seed*1664525+1013904223)%4294967296;return __seed/4294967296}');
  return {dom, w, run, doc: w.document, messages, close: () => w.close()};
}

// Independent reference: sets of the 4-element universe {0,1,2,3}, as real Sets.
const UNI = [0, 1, 2, 3];
const fromMask = m => new Set(UNI.filter(i => m >> i & 1));
const union = (a, b) => new Set([...a, ...b]);
const inter = (a, b) => new Set([...a].filter(x => b.has(x)));
const diff = (a, b) => new Set([...a].filter(x => !b.has(x)));
const comp = a => diff(new Set(UNI), a);
const symd = (a, b) => union(diff(a, b), diff(b, a));
const eq = (a, b) => a.size === b.size && [...a].every(x => b.has(x));
const FULL = new Set(UNI), EMPTY = new Set();

const LAWS = {
  demorgan1: [(a, b) => comp(union(a, b)), (a, b) => inter(comp(a), comp(b))],
  demorgan2: [(a, b) => comp(inter(a, b)), (a, b) => union(comp(a), comp(b))],
  commUnion: [(a, b) => union(a, b), (a, b) => union(b, a)],
  commInter: [(a, b) => inter(a, b), (a, b) => inter(b, a)],
  assocUnion: [(a, b, c) => union(union(a, b), c), (a, b, c) => union(a, union(b, c))],
  assocInter: [(a, b, c) => inter(inter(a, b), c), (a, b, c) => inter(a, inter(b, c))],
  distribute1: [(a, b, c) => inter(a, union(b, c)), (a, b, c) => union(inter(a, b), inter(a, c))],
  distribute2: [(a, b, c) => union(a, inter(b, c)), (a, b, c) => inter(union(a, b), union(a, c))],
  absorb1: [(a, b) => union(a, inter(a, b)), a => a],
  absorb2: [(a, b) => inter(a, union(a, b)), a => a],
  difference: [(a, b) => diff(a, b), (a, b) => inter(a, comp(b))],
  symDiff: [(a, b) => symd(a, b), (a, b) => union(diff(a, b), diff(b, a))],
  doubleComplement: [a => comp(comp(a)), a => a],
  excludedMiddle: [a => union(a, comp(a)), () => FULL],
  contradiction: [a => inter(a, comp(a)), () => EMPTY]
};
const OPS = {
  union: (a, b) => union(a, b), intersection: (a, b) => inter(a, b), diff: (a, b) => diff(a, b), reverseDiff: (a, b) => diff(b, a),
  sym: (a, b) => symd(a, b), complement: a => comp(a), notUnion: (a, b) => comp(union(a, b)), notIntersection: (a, b) => comp(inter(a, b)),
  tripleUnion: (a, b, c) => union(union(a, b), c), tripleIntersection: (a, b, c) => inter(inter(a, b), c),
  pairWithC: (a, b, c) => inter(union(a, b), c), interWithPair: (a, b, c) => inter(a, union(b, c)),
  diffUnion: (a, b, c) => diff(union(a, b), c), onlyA: (a, b, c) => diff(a, union(b, c)), outsideAll: (a, b, c) => comp(union(union(a, b), c)),
  tripleSym: (a, b, c) => symd(symd(a, b), c),
  notAAndB: (a, b) => inter(comp(a), b), ABCexcept: (a, b, c) => diff(inter(a, b), c), diff3: (a, b, c) => diff(a, inter(b, c)),
  atLeastTwo: (a, b, c) => union(union(inter(a, b), inter(a, c)), inter(b, c))
};

for (const lang of LANGS) {
  test(`all 15 laws agree with real sets on all 4096 triples (${lang})`, () => {
    const P = page(lang);
    try {
      const ids = P.run('laws.map(l=>l.id)');
      assert.deepEqual([...ids].sort(), Object.keys(LAWS).sort(), 'exactly the 15 expected laws');
      assert.equal(ids.length, 15);
      for (const id of ids) {
        const [L, R] = LAWS[id], law = P.run(`laws.find(l=>l.id==='${id}')`);
        for (let ma = 0; ma < 16; ma++) for (let mb = 0; mb < 16; mb++) for (let mc = 0; mc < 16; mc++) {
          const A = fromMask(ma), B = fromMask(mb), C = fromMask(mc);
          const left = L(A, B, C), right = R(A, B, C);
          assert.ok(eq(left, right), `${id}: independent sides differ`);
          for (const x of UNI) {
            const a = A.has(x), b = B.has(x), c = C.has(x);
            assert.equal(!!law.l(a, b, c), left.has(x), `${id} left predicate at element ${x}`);
            assert.equal(!!law.r(a, b, c), right.has(x), `${id} right predicate at element ${x}`);
          }
        }
        // The rendered truth table: one row per membership pattern, equal columns, a tick in every row.
        P.doc.querySelector(`[data-law="${id}"]`).click();
        const rows = [...P.doc.querySelectorAll('#law-article tbody tr')];
        assert.equal(rows.length, 2 ** law.n);
        for (const row of rows) {
          const cells = [...row.children].map(c => c.textContent.trim());
          assert.equal(cells[law.n], cells[law.n + 1], `${id} table columns`);
          assert.equal(cells[law.n + 2], '✓');
        }
        assert.equal(P.doc.querySelectorAll('#law-article svg').length, 2);
      }
    } finally { P.close(); }
  });

  test(`two-set and three-set operations agree with real sets, in the predicates and in the page (${lang})`, () => {
    const P = page(lang);
    try {
      const ops2 = P.run('ops2.map(o=>o.id)'), ops3 = P.run('ops3.map(o=>o.id)');
      assert.equal(ops2.length, 8); assert.equal(ops3.length, 8);
      for (const id of [...ops2, ...ops3, 'notAAndB', 'ABCexcept', 'diff3', 'atLeastTwo']) {
        const test = P.run(`([...ops2,...ops3,...shadePrompts].find(o=>o.id==='${id}')).test`);
        for (let ma = 0; ma < 16; ma++) for (let mb = 0; mb < 16; mb++) for (let mc = 0; mc < 16; mc++) {
          const A = fromMask(ma), B = fromMask(mb), C = fromMask(mc), want = OPS[id](A, B, C);
          for (const x of UNI) assert.equal(!!test(A.has(x), B.has(x), C.has(x)), want.has(x), `${id} at ${x}`);
        }
      }
      // The page: build sets, choose each operation, compare the displayed result with the independent one.
      const U = Array.from({length: 12}, (_, i) => i + 1);
      for (const [count, ids] of [[2, ops2], [3, ops3]]) {
        P.doc.querySelector(`[data-count="${count}"]`).click();
        for (let trial = 0; trial < 6; trial++) {
          const pick = () => new Set(U.filter(() => P.run('Math.random()') < .5));
          const A = pick(), B = pick(), C = pick();
          P.run(`sets={A:new Set(${JSON.stringify([...A])}),B:new Set(${JSON.stringify([...B])}),C:new Set(${JSON.stringify([...C])})}`);
          for (const id of ids) {
            P.run(`operation='${id}';renderExplore()`);
            P.doc.querySelector(`[data-op="${id}"]`).click();
            const universe = new Set(U);
            const cmp = a => diff(universe, a);
            const impl = {
              union: (a, b) => union(a, b), intersection: (a, b) => inter(a, b), diff: (a, b) => diff(a, b), reverseDiff: (a, b) => diff(b, a),
              sym: (a, b) => union(diff(a, b), diff(b, a)), complement: a => cmp(a), notUnion: (a, b) => cmp(union(a, b)), notIntersection: (a, b) => cmp(inter(a, b)),
              tripleUnion: (a, b, c) => union(union(a, b), c), tripleIntersection: (a, b, c) => inter(inter(a, b), c), pairWithC: (a, b, c) => inter(union(a, b), c),
              interWithPair: (a, b, c) => inter(a, union(b, c)), diffUnion: (a, b, c) => diff(union(a, b), c), onlyA: (a, b, c) => diff(a, union(b, c)),
              outsideAll: (a, b, c) => cmp(union(union(a, b), c)), tripleSym: (a, b, c) => union(diff(union(diff(A, B), diff(B, A)), C), diff(C, union(diff(A, B), diff(B, A))))
            }[id](A, B, C);
            const shown = P.doc.querySelector('#explore-result').textContent;
            const text = '{' + [...impl].sort((x, y) => x - y).join(P.run('T.sep')) + '}';
            assert.ok(shown.includes('= ' + text), `${lang} ${id}: expected ${text} in "${shown}"`);
            // The union of the region pills is the whole universe, and regions are disjoint.
            const regionSets = P.run('allBits(setCount).map(b=>U.filter(x=>bitsFor(x,setCount)===b))');
            assert.equal(regionSets.flat().length, 12);
          }
        }
      }
    } finally { P.close(); }
  });

  // What each question kind must answer, recomputed from the question's own data with real Sets.
  const sepOf = P => P.run('T.sep');
  const fmt = (arr, sep) => '{' + [...new Set(arr)].sort((x, y) => x - y).join(sep) + '}';
  const squash = s => s.replace(/[\s ;,]/g, '');
  function expectedFor(P, q) {
    const d = q.data, sep = sepOf(P), A = new Set(d.a), B = new Set(d.b), C = new Set(d.c || []);
    switch (d.kind) {
      case 'op': case 'triple': {
        const U = new Set(d.domain), rel = a => new Set([...U].filter(x => !a.has(x)));
        const f = {
          union: (a, b) => union(a, b), intersection: (a, b) => inter(a, b), diff: (a, b) => diff(a, b), reverseDiff: (a, b) => diff(b, a),
          sym: (a, b) => union(diff(a, b), diff(b, a)), complement: a => rel(a), notUnion: (a, b) => rel(union(a, b)), notIntersection: (a, b) => rel(inter(a, b)),
          tripleUnion: (a, b, c) => union(union(a, b), c), tripleIntersection: (a, b, c) => inter(inter(a, b), c), pairWithC: (a, b, c) => inter(union(a, b), c),
          interWithPair: (a, b, c) => inter(a, union(b, c)), diffUnion: (a, b, c) => diff(union(a, b), c), onlyA: (a, b, c) => diff(a, union(b, c)),
          outsideAll: (a, b, c) => rel(union(union(a, b), c)), tripleSym: (a, b, c) => new Set([...U].filter(x => (A.has(x) + B.has(x) + C.has(x)) % 2 === 1))
        }[d.op](A, B, C);
        return {text: fmt([...f], sep), kind: 'text'};
      }
      case 'subset': return {yes: [...A].every(x => B.has(x)), kind: 'yn', yesKey: 'subset'};
      case 'proper': return {yes: [...A].every(x => B.has(x)) && A.size < B.size, kind: 'yn', yesKey: 'proper'};
      case 'disjoint': return {yes: inter(A, B).size === 0, kind: 'yn', yesKey: 'disjoint'};
      case 'cardinality': return {text: String(union(A, B).size), kind: 'text'};
      case 'powerCount': return {text: String(2 ** d.n), kind: 'text'};
      case 'cartCount': return {text: String(d.m * d.n), kind: 'text'};
      case 'membership': return {kind: 'member', yes: d.a.includes(d.x)};
      case 'powerExample': return {kind: 'squash', text: '{∅{a}{b}{ab}}'};
      case 'cartExample': return {kind: 'squash', text: '{' + [1, 2].flatMap(n => ['x', 'y'].map(l => `(${n}${l})`)).join('') + '}'};
      case 'empty': return {kind: 'empty'};
      default: throw new Error('unknown kind ' + d.kind);
    }
  }

  test(`every quiz generator, many times: one correct option, no duplicate text, correct = independent recomputation (${lang})`, () => {
    const P = page(lang);
    try {
      const ids = P.run('quizGenerators.map(g=>g.id)');
      assert.equal(ids.length, 8 + 11, 'eight operations plus eleven further generators');
      const seen = new Set();
      for (const id of ids) {
        for (let n = 0; n < 400; n++) {
          const q = P.run(`quizGenerators.find(g=>g.id==='${id}').make()`);
          seen.add(q.data.kind);
          const texts = q.choices.map(c => c.text), correct = q.choices.filter(c => c.correct);
          assert.equal(q.choices.length, 4, `${id}: four options`);
          assert.equal(correct.length, 1, `${id}: exactly one correct option (${JSON.stringify(texts)})`);
          assert.equal(new Set(texts).size, 4, `${id}: duplicate option text ${JSON.stringify(texts)}`);
          assert.ok(q.explanation && q.hint && q.prompt && q.context, `${id}: complete question`);
          const want = expectedFor(P, q), got = correct[0].text;
          if (want.kind === 'text') assert.equal(got, want.text, `${id}: ${q.context}`);
          else if (want.kind === 'squash') assert.equal(squash(got), want.text);
          else if (want.kind === 'yn') {
            const T = P.run(`T.q.${want.yesKey}`);
            assert.equal(got, want.yes ? T.yes : T.no, `${id}: ${q.context}`);
          } else if (want.kind === 'member') {
            assert.equal(got, `${q.data.x} ${want.yes ? '∈' : '∉'} A`);
          } else if (want.kind === 'empty') assert.ok(['∅⊆A', '∅⊂A'].includes(squash(got)));
          if (want.kind === 'text' && (q.data.kind === 'op' || q.data.kind === 'triple')) assert.ok(q.explanation.includes(want.text), 'explanation states the result');
        }
      }
      assert.equal(seen.size, 18 - 8 + 2, 'every question kind was produced');
    } finally { P.close(); }
  });

  test(`the quiz in the page: answering, feedback, score, keyboard focus (${lang})`, () => {
    const P = page(lang);
    try {
      let right = 0, total = 0;
      for (let round = 0; round < 40; round++) {
        const q = P.run('quizState.current');
        const buttons = [...P.doc.querySelectorAll('#quiz-area .answer')];
        assert.equal(buttons.length, 4);
        const goodIndex = q.choices.findIndex(c => c.correct);
        const pickRight = round % 2 === 0, index = pickRight ? goodIndex : (goodIndex + 1) % 4;
        buttons[index].click(); total++; if (pickRight) right++;
        assert.ok(P.doc.querySelector('#quiz-area .fb'), 'feedback shown');
        assert.equal(P.doc.querySelector('#quiz-area .fb').classList.contains('good'), pickRight);
        assert.ok([...P.doc.querySelectorAll('#quiz-area .answer')].every(b => b.disabled));
        assert.equal(P.doc.querySelectorAll('#quiz-area .answer.correct').length, 1);
        assert.equal(P.doc.activeElement.id, 'quiz-next', 'focus moves to the next-question button');
        assert.equal(P.doc.getElementById('score-correct').textContent, String(right));
        assert.equal(P.doc.getElementById('score-attempts').textContent, String(total));
        P.doc.getElementById('quiz-next').click();
        assert.equal(P.doc.activeElement.id, 'quiz-title');
      }
      P.doc.getElementById('quiz-hint').click();
      assert.equal(P.doc.getElementById('quiz-hint').getAttribute('aria-expanded'), 'true');
      P.doc.getElementById('quiz-reset').click();
      assert.equal(P.doc.getElementById('score-attempts').textContent, '0');
    } finally { P.close(); }
  });

  test(`shade the diagram: expected regions, worded report, missed regions, keyboard (${lang})`, () => {
    const P = page(lang);
    try {
      const prompts = P.run('shadePrompts.map(p=>p.id)');
      assert.equal(prompts.length, 12);
      for (const id of prompts) {
        P.run(`shadeQuestion=shadePrompts.find(p=>p.id==='${id}');shadeSelection=new Set();shadeChecked=false;shadeRevealed=false;renderShade()`);
        const expected = new Set(P.run('[...expectedRegions()]'));
        const want = new Set();
        for (let m = 0; m < 8; m++) { // bit i of the string = membership in A, B, C
          const bits = m.toString(2).padStart(3, '0'), s = [0, 1, 2].map(i => bits[i] === '1');
          // one representative element per region: a universe of three points with these memberships
          const A = new Set(s[0] ? [0] : []), B = new Set(s[1] ? [0] : []), C = new Set(s[2] ? [0] : []);
          const r = OPS[id](A, B, C); // complements use the universe {0..3}: look at the point 0
          if (r.has(0)) want.add(bits);
        }
        assert.deepEqual([...expected].sort(), [...want].sort(), `${id}: regions`);
        // Shade exactly the expected regions with the mouse, then check.
        for (const bits of expected) P.doc.querySelector(`#shade-svg [data-region="${bits}"]`).dispatchEvent(new P.w.MouseEvent('click', {bubbles: true}));
        P.doc.getElementById('shade-check').click();
        assert.ok(P.doc.querySelector('#shade-feedback .fb.good'), `${id}: correct shading is accepted`);
        assert.equal(P.doc.querySelector('#shade-feedback').textContent.includes(P.run('T.shadeUi.wrongList([])').slice(0, 8)), false);
      }
      // A wrong and a missed region are named in words, and the missed one is drawn (green, visible).
      P.run("shadeQuestion=shadePrompts.find(p=>p.id==='tripleIntersection');shadeSelection=new Set();shadeChecked=false;renderShade()");
      P.doc.querySelector('#shade-svg [data-region="110"]').dispatchEvent(new P.w.MouseEvent('click', {bubbles: true}));
      P.doc.getElementById('shade-check').click();
      const fb = P.doc.querySelector('#shade-feedback').textContent;
      assert.ok(P.doc.querySelector('#shade-feedback .fb.bad'));
      const words = {fr: ['dans A et B seulement', 'dans A, B et C'], en: ['in A and B only', 'in A, B and C']}[lang];
      for (const w of words) assert.ok(fb.replace(/ /g, ' ').includes(w), `report mentions "${w}": ${fb}`);
      const missed = P.doc.querySelector('#shade-svg [data-region="111"] .rg');
      assert.equal(missed.getAttribute('opacity'), '.4', 'missed region is drawn');
      assert.match(missed.getAttribute('style'), /--ok/);
      const wrong = P.doc.querySelector('#shade-svg [data-region="110"] .rg');
      assert.match(wrong.getAttribute('style'), /--bad/);
      // Keyboard: Enter and Space toggle, aria-pressed follows, focus stays on the region.
      const g = () => P.doc.querySelector('#shade-svg [data-region="001"]');
      g().focus();
      assert.equal(g().getAttribute('aria-pressed'), 'false');
      g().dispatchEvent(new P.w.KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
      assert.equal(g().getAttribute('aria-pressed'), 'true');
      assert.equal(P.doc.activeElement.getAttribute('data-region'), '001', 'focus kept after the redraw');
      g().dispatchEvent(new P.w.KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true}));
      assert.equal(g().getAttribute('aria-pressed'), 'false');
      // Reveal shows the solution.
      P.doc.getElementById('shade-reveal').click();
      assert.ok(P.doc.querySelector('#shade-feedback .fb.good'));
    } finally { P.close(); }
  });

  test(`semantics: tabs, diagram roles, pressed states, names, no external request, no dash in copy (${lang})`, () => {
    const P = page(lang), html = readFileSync(file(lang), 'utf8');
    try {
      const d = P.doc;
      // tablist: arrows, Home, End
      const key = (el, k) => el.dispatchEvent(new P.w.KeyboardEvent('keydown', {key: k, bubbles: true, cancelable: true}));
      const tab = id => d.getElementById('tab-' + id);
      assert.equal(tab('explore').getAttribute('aria-selected'), 'true');
      key(tab('explore'), 'ArrowRight');
      assert.equal(tab('learn').getAttribute('aria-selected'), 'true'); assert.equal(d.activeElement, tab('learn'));
      assert.equal(d.getElementById('panel-learn').hidden, false); assert.equal(d.getElementById('panel-explore').hidden, true);
      key(tab('learn'), 'End'); assert.equal(tab('reference').getAttribute('aria-selected'), 'true');
      key(tab('reference'), 'ArrowRight'); assert.equal(tab('explore').getAttribute('aria-selected'), 'true');
      key(tab('explore'), 'ArrowLeft'); assert.equal(tab('reference').getAttribute('aria-selected'), 'true');
      key(tab('reference'), 'Home'); assert.equal(tab('explore').getAttribute('aria-selected'), 'true');
      assert.equal(d.querySelectorAll('[role="tab"][tabindex="0"]').length, 1);
      // diagrams
      const clickable = d.querySelectorAll('#explore-svg svg'), shade = d.querySelectorAll('#shade-svg svg');
      assert.equal(clickable[0].getAttribute('role'), 'group'); assert.equal(shade[0].getAttribute('role'), 'group');
      for (const svg of d.querySelectorAll('svg')) {
        assert.ok(svg.getAttribute('aria-label'), 'every diagram has a name');
        if (svg.querySelector('[data-region]')) assert.equal(svg.getAttribute('role'), 'group'); else assert.equal(svg.getAttribute('role'), 'img');
        for (const t of svg.querySelectorAll('text')) assert.equal(t.getAttribute('font'), null, 'no invalid font attribute');
      }
      for (const g of d.querySelectorAll('[data-region]')) {
        assert.equal(g.getAttribute('role'), 'button'); assert.equal(g.getAttribute('tabindex'), '0');
        assert.ok(['true', 'false'].includes(g.getAttribute('aria-pressed'))); assert.ok(g.getAttribute('aria-label'));
      }
      // every control has a name and toggles carry aria-pressed
      for (const b of d.querySelectorAll('button')) assert.ok((b.textContent.trim() || b.getAttribute('aria-label')), 'button without a name: ' + b.outerHTML.slice(0, 80));
      for (const b of d.querySelectorAll('.num, .op, .cbtn, [data-count], [data-practice]')) assert.ok(b.hasAttribute('aria-pressed'));
      for (const b of d.querySelectorAll('.law-btn')) assert.ok(b.hasAttribute('aria-current'));
      assert.equal(d.querySelectorAll('[aria-selected]:not([role="tab"])').length, 0);
      // inspecting a region by keyboard
      d.getElementById('panel-explore');
      const g = d.querySelector('#explore-svg [data-region="11"]'); g.focus();
      key(g, 'Enter');
      assert.equal(d.querySelector('#explore-svg [data-region="11"]').getAttribute('aria-pressed'), 'true');
      assert.equal(d.activeElement.getAttribute('data-region'), '11');
      assert.ok(d.querySelector('.pill.picked'));
      // 3 sets: eight regions, all non-empty in the layout of the standard example
      d.querySelector('[data-count="3"]').click();
      assert.equal(d.querySelectorAll('#explore-svg [data-region]').length, 8);
      // set builder toggle by keyboard-equivalent click keeps focus on the same number
      const n = d.querySelector('[data-set="B"][data-value="7"]'); n.focus(); const was = n.getAttribute('aria-pressed'); n.click();
      assert.notEqual(d.querySelector('[data-set="B"][data-value="7"]').getAttribute('aria-pressed'), was);
      assert.equal(d.activeElement.getAttribute('data-value'), '7');
      // lessons: all 18 reachable with the "next" button, each with a diagram and the four text parts
      const lessonIds = P.run('lessons.map(l=>l.id)');
      assert.equal(lessonIds.length, 18);
      for (let i = 0; i < 18; i++) {
        const article = d.getElementById('lesson');
        assert.ok(article.querySelector('svg'), 'diagram'); assert.ok(article.querySelector('.formula').textContent.trim());
        assert.equal(article.querySelectorAll('.panels h4').length, 2);
        d.getElementById('lesson-next').click();
      }
      assert.equal(P.run('activeLesson'), 'set', 'the last concept wraps around');
      // size message to the parent page
      assert.ok(P.messages.some(m => m && m.type === 'mx-basics-size'));
      // no external request and no dash in copy
      assert.ok(!/(src|href)=["']https?:/i.test(html), 'no external resource');
      assert.ok(!/fonts\.googleapis|<link /.test(html));
      assert.ok(!/[–—]/.test(html), 'no em or en dash');
      assert.ok(html.includes('prefers-reduced-motion'));
      assert.ok(html.includes('../../fonts/') && html.includes('mx-basics-size') && html.includes('ResizeObserver'));
      assert.deepEqual(P.messages.filter(m => typeof m === 'string'), [], 'no script error');
    } finally { P.close(); }
  });
}
