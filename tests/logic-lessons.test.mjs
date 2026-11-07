// The four logic lessons (site/resources/basics/logic-*.html and .en.html, shared engine logic-lesson.js): real page scripts under jsdom.
// Mathematics is compared with independent brute-force computations, never with the page's own predicates.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {runInContext} from 'node:vm';
import {JSDOM} from 'jsdom';

const IDS = ['logic-propositions', 'logic-implication', 'logic-quantifiers', 'logic-reasoning'];
const LANGS = ['fr', 'en'];
const dir = new URL('../site/resources/basics/', import.meta.url);
const file = (id, lang) => new URL(`${id}${lang === 'en' ? '.en' : ''}.html`, dir);
const shared = readFileSync(new URL('logic-lesson.js', dir), 'utf8');
const inline = html => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const textBlock = html => html.match(/\/\* TEXT-BEGIN[\s\S]*?\/\* TEXT-END \*\//)[0];

function page(id, lang, seed = 12345) {
  const html = readFileSync(file(id, lang), 'utf8');
  const dom = new JSDOM(html, {runScripts: 'outside-only', url: 'https://example.test/resources/basics/' + id + '.html'});
  const w = dom.window, errors = [], posted = [];
  w.matchMedia = () => ({matches: true});
  w.addEventListener('error', e => errors.push(e.message));
  w.parent.postMessage = m => posted.push(m);
  const ctx = dom.getInternalVMContext(), run = c => runInContext(c, ctx);
  run(`globalThis.__seed=${seed};Math.random=()=>{__seed=(__seed*1664525+1013904223)%4294967296;return __seed/4294967296}`);
  run(shared + '\n' + inline(html));
  return {w, doc: w.document, run, errors, posted, html, close: () => w.close()};
}
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', {bubbles: true}));
const shape = v => typeof v === 'function' ? 'fn' : Array.isArray(v) ? v.map(shape) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
const strings = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(x => strings(x, out)); else if (v && typeof v === 'object') Object.values(v).forEach(x => strings(x, out)); return out; };
const words = s => s.replace(/<[^>]+>/g, ' ').toLowerCase().match(/[a-zàâçéèêëîïôûùüÿœ]+/g) || [];

for (const id of IDS) {
  test(`${id}: both editions exist, share code and markup, and have the same text structure`, () => {
    const fr = readFileSync(file(id, 'fr'), 'utf8'), en = readFileSync(file(id, 'en'), 'utf8');
    assert.match(fr, /<html lang="fr">/); assert.match(en, /<html lang="en">/);
    const strip = h => h.replace(/<html lang="..">/, '').replace(/<title>.*<\/title>/, '').replace(textBlock(h), '');
    assert.equal(strip(fr), strip(en));
    assert.ok(fr.includes('logic-lesson.css') && fr.includes('logic-lesson.js'));
    assert.doesNotMatch(fr + en, /https?:\/\/|[—–]/);
    assert.equal([...(fr + en).matchAll(/<script[^>]+src="([^"]+)"/g)].every(m => m[1] === 'logic-lesson.js'), true);
    const a = page(id, 'fr'), b = page(id, 'en');
    try {
      assert.equal(JSON.stringify(shape(a.run('T'))), JSON.stringify(shape(b.run('T'))));
      assert.deepEqual(a.errors, []); assert.deepEqual(b.errors, []);
      const ids = d => [...d.querySelectorAll('[id]')].map(e => e.id).sort().join();
      assert.equal(ids(a.doc), ids(b.doc));
      assert.ok(a.posted.some(m => m.type === 'mx-basics-size'), 'height message sent to the host');
    } finally { a.close(); b.close(); }
  });

  test(`${id}: no English in the French edition, no French in the English edition`, () => {
    const fr = page(id, 'fr'), en = page(id, 'en');
    try {
      const f = new Set(words(strings(fr.run('T')).join(' '))), e = words(strings(en.run('T')).join(' '));
      const english = ['the', 'and', 'which', 'with', 'is', 'are', 'this', 'that'].filter(w => f.has(w));
      assert.deepEqual(english, [], 'English words in the French text');
      const french = ['le', 'la', 'les', 'est', 'une', 'des', 'pour', 'dans', 'que', 'qui'].filter(w => e.includes(w));
      assert.deepEqual(french, [], 'French words in the English text');
    } finally { fr.close(); en.close(); }
  });

  test(`${id}: roles, tabs by keyboard, labelled controls, no external request`, () => {
    for (const lang of LANGS) {
      const P = page(id, lang);
      try {
        const tabs = [...P.doc.querySelectorAll('[role=tab]')];
        assert.ok(tabs.length >= 3);
        tabs.forEach(t => assert.ok(P.doc.getElementById(t.getAttribute('aria-controls')), 'panel for ' + t.id));
        assert.equal(tabs.filter(t => t.getAttribute('aria-selected') === 'true').length, 1);
        tabs[0].dispatchEvent(new P.w.KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
        assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
        tabs[1].dispatchEvent(new P.w.KeyboardEvent('keydown', {key: 'End', bubbles: true}));
        assert.equal(tabs.at(-1).getAttribute('aria-selected'), 'true');
        assert.equal(P.doc.querySelectorAll('h1').length, 1);
        for (const b of P.doc.querySelectorAll('button')) assert.ok(b.textContent.trim() || b.getAttribute('aria-label'), 'button without a name: ' + b.outerHTML.slice(0, 80));
        for (const el of P.doc.querySelectorAll('[data-i]')) assert.ok(el.innerHTML.trim(), 'empty text ' + el.dataset.i);
        assert.deepEqual(P.errors, []);
      } finally { P.close(); }
    }
  });

  test(`${id}: the challenge runner reaches the summary whatever the answers (both languages, several seeds)`, () => {
    for (const lang of LANGS) for (const seed of [1, 2, 3, 4]) {
      const P = page(id, lang, seed);
      try {
        const host = P.doc.querySelector('#quiz, #game');
        for (let step = 0; step < 12 && !host.querySelector('#' + host.id + '-again'); step++) {
          const body = host.querySelector('.qbody');
          for (const b of [...body.querySelectorAll('button')]) if (!b.disabled) click(P.w, b);
          const rv = host.querySelector('.rv'); if (rv) click(P.w, rv);
          const next = [...host.querySelectorAll('.act .btn')].find(b => !b.classList.contains('rv'));
          assert.ok(next, `step ${step} offers a way on`);
          click(P.w, next);
        }
        assert.ok(host.querySelector('#' + host.id + '-again'), 'summary reached');
        click(P.w, host.querySelector('#' + host.id + '-again'));
        assert.ok(host.querySelector('.qbody'), 'restart works');
        assert.deepEqual(P.errors, []);
      } finally { P.close(); }
    }
  });
}

// ---- Lesson 1: propositions
const bools = [true, false];
test('propositions: every formula agrees with an independent truth-table computation', () => {
  const P = page('logic-propositions', 'fr');
  try {
    const ref = {not: (p) => !p, and: (p, q) => p && q, or: (p, q) => p || q, nand: (p, q) => !(p && q), nor: (p, q) => !(p || q), ornn: (p, q) => !p || !q,
      andnn: (p, q) => !p && !q, pnq: (p, q) => p && !q, npq: (p, q) => !p && q, porn: (p, q) => p || !q, xor: (p, q) => p !== q, lem: () => true, contra: () => false};
    const ids = P.run('F.map(f=>f.id)');
    assert.deepEqual([...ids].sort(), Object.keys(ref).sort());
    for (const id of ids) for (const p of bools) for (const q of bools) assert.equal(P.run(`byId('${id}').f(${p},${q})`), ref[id](p, q), `${id} ${p} ${q}`);
    assert.equal(P.run("sameTable(byId('nand'),byId('ornn'))"), true);
    assert.equal(P.run("sameTable(byId('nor'),byId('andnn'))"), true);
    assert.equal(P.run("sameTable(byId('and'),byId('or'))"), false);
    assert.equal(P.run("isTautology(byId('lem'))"), true); assert.equal(P.run("isContradiction(byId('contra'))"), true);
  } finally { P.close(); }
});
test('propositions: the Venn regions of a formula are the elements where it is true (connectives are set operations)', () => {
  const P = page('logic-propositions', 'en');
  try {
    const U = Array.from({length: 12}, (_, i) => i + 1), pr = n => n > 1 && [...Array(n).keys()].slice(2).every(d => n % d);
    const preds = {even: n => n % 2 === 0, m3: n => n % 3 === 0, gt6: n => n > 6, prime: pr, lt5: n => n < 5};
    const sets = {and: (A, B) => A.filter(x => B.includes(x)), or: (A, B) => [...new Set([...A, ...B])]};
    for (const a of Object.keys(preds)) for (const b of Object.keys(preds)) {
      const items = {'10': [], '01': [], '11': [], '00': []};
      for (let n = 1; n <= 12; n++) items[`${+preds[a](n)}${+preds[b](n)}`].push(n);
      const A = U.filter(preds[a]), B = U.filter(preds[b]);
      for (const [fid, want] of [['and', sets.and(A, B)], ['or', sets.or(A, B)]]) {
        const regs = [...P.run(`regionsWhere(byId('${fid}'))`)];
        const got = regs.flatMap(r => items[r]).sort((x, y) => x - y);
        assert.deepEqual(got, want.sort((x, y) => x - y), `${a} ${fid} ${b}`);
      }
    }
    // The interface: choosing P and Q and the formula changes the diagram and the reading.
    P.doc.querySelector('[data-p="prime"]').dispatchEvent(new P.w.MouseEvent('click', {bubbles: true}));
    P.doc.querySelector('[data-vf="or"]').dispatchEvent(new P.w.MouseEvent('click', {bubbles: true}));
    assert.match(P.doc.getElementById('venn-read').textContent, /A ∪ B/);
    assert.equal(P.doc.querySelectorAll('#venn-svg [data-region]').length, 0, 'read-only diagram in the explorer');
  } finally { P.close(); }
});
test('propositions: switches flip truth values and the highlighted row follows', () => {
  const P = page('logic-propositions', 'fr');
  try {
    const row = () => [...P.doc.querySelectorAll('#tt tr.cur td')].map(td => td.textContent).join('');
    assert.equal(row(), 'VFF'); // P true, Q false, P and Q
    click(P.w, P.doc.querySelector('[data-var="q"]')); assert.equal(row(), 'VVV');
    click(P.w, P.doc.querySelector('[data-var="p"]')); assert.equal(row(), 'FVF');
    click(P.w, P.doc.querySelector('[data-f="or"]')); assert.equal(row(), 'FVV');
    assert.equal(P.doc.querySelector('[data-var="q"]').getAttribute('aria-checked'), 'true');
  } finally { P.close(); }
});

// ---- Lesson 2: implication
test('implication: the four statements agree with brute force, and the contrapositive always matches the implication', () => {
  const P = page('logic-implication', 'fr');
  try {
    const U = Array.from({length: 20}, (_, i) => i + 1), imp = (p, q) => !p || q;
    const ids = P.run('PRED.map(p=>p.id)');
    assert.equal(ids.length, 9);
    for (const a of ids) for (const b of ids) {
      const f = id => n => P.run(`predById('${id}').f(${n})`);
      const Pf = f(a), Qf = f(b), all = g => U.every(g);
      const ks = P.run(`kinds('${a}','${b}').map(k=>({id:k.id,ok:holds(k),c:counters(k)}))`);
      const want = {imp: all(n => imp(Pf(n), Qf(n))), conv: all(n => imp(Qf(n), Pf(n))), contra: all(n => imp(!Qf(n), !Pf(n))), inv: all(n => imp(!Pf(n), !Qf(n)))};
      for (const k of ks) {
        assert.equal(k.ok, want[k.id], `${k.id} ${a} ${b}`);
        assert.equal(k.c.length === 0, k.ok);
      }
      assert.equal(want.imp, want.contra); assert.equal(want.conv, want.inv);
      const counter = U.filter(n => Pf(n) && !Qf(n));
      assert.deepEqual([...ks[0].c], counter);
    }
  } finally { P.close(); }
});
test('implication: truth table of P ⇒ Q (false only for V then F) and the Venn red region', () => {
  const P = page('logic-implication', 'en');
  try {
    assert.deepEqual([[1, 1], [1, 0], [0, 1], [0, 0]].map(([p, q]) => P.run(`imp(${!!p},${!!q})`)), [true, false, true, true]);
    // default pair: multiples of 6 and even numbers: P ⇒ Q holds
    assert.match(P.doc.getElementById('test-read').textContent, /T on U/);
    click(P.w, P.doc.querySelector('[data-p="even"]'));
    click(P.w, P.doc.querySelector('[data-q="m6"]'));
    const read = P.doc.getElementById('test-read').textContent;
    assert.match(read, /counterexamples/); assert.match(read, /n = 2/);
    assert.ok(P.doc.querySelector('#venn-svg .rg.on'), 'counterexample region coloured');
    const tile2 = P.doc.querySelector('#tiles [data-n="2"]'); assert.ok(tile2.classList.contains('ko'));
    assert.ok(P.doc.querySelector('#tiles [data-n="12"]').classList.contains('ok'));
    assert.ok(P.doc.querySelector('#tiles [data-n="3"]').classList.contains('hid'));
    // converse tab shows the converse true while the implication is false
    const badges = [...P.doc.querySelectorAll('#stmts .badge')].map(b => b.textContent);
    assert.deepEqual(badges, ['F', 'T', 'F', 'T']); // implication, converse, contrapositive (= implication), inverse (= converse)
  } finally { P.close(); }
});

// ---- Lesson 3: quantifiers
test('quantifiers: ∀ and ∃ over finite universes, empty universe, and the negation rules', () => {
  const P = page('logic-quantifiers', 'en');
  try {
    const f = id => n => P.run(`predById('${id}').f(${n})`);
    const subsets = a => Array.from({length: 1 << a.length}, (_, m) => a.filter((_, i) => m >> i & 1));
    const base = [1, 2, 3, 4, 5, 6];
    for (const id of P.run('PRED.map(p=>p.id)')) {
      const g = f(id);
      for (const S of subsets(base)) {
        assert.equal(P.run(`holds('all',predById('${id}').f,${JSON.stringify(S)})`), S.every(g));
        assert.equal(P.run(`holds('ex',predById('${id}').f,${JSON.stringify(S)})`), S.some(g));
      }
    }
    assert.equal(P.run("holds('all',n=>false,[])"), true); assert.equal(P.run("holds('ex',n=>true,[])"), false);
    // negation: exactly the swapped quantifier with the negated property is a negation of each statement
    for (const st of P.run('STATEMENTS')) {
      const swapped = st.q === 'all' ? 'ex' : 'all';
      for (const q of ['all', 'ex']) for (const neg of [false, true]) {
        const verdict = P.run(`negationTest(${JSON.stringify(st)},'${q}',${neg},BASE)`).valid;
        assert.equal(verdict, q === swapped && neg === true, `${st.id} ${q} ${neg}`);
      }
    }
    // order of quantifiers: relation y = x on {1..4}
    const eq = [1, 2, 3, 4].map(x => [1, 2, 3, 4].map(y => y === x));
    assert.equal(P.run(`forallExists(${JSON.stringify(eq)})`), true); assert.equal(P.run(`existsForall(${JSON.stringify(eq)})`), false);
    const ge = [1, 2, 3, 4].map(x => [1, 2, 3, 4].map(y => y >= x));
    assert.equal(P.run(`existsForall(${JSON.stringify(ge)})`), true);
    for (let m = 0; m < 1 << 16; m += 37) { // ∃y∀x implies ∀x∃y; ¬(∀x∃y) is ∃x∀y¬
      const mat = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => !!(m >> (4 * i + j) & 1)));
      const J = JSON.stringify(mat), ae = P.run(`forallExists(${J})`), ea = P.run(`existsForall(${J})`);
      assert.equal(ae, mat.every(r => r.some(Boolean))); assert.equal(ea, [0, 1, 2, 3].some(j => mat.every(r => r[j])));
      if (ea) assert.ok(ae);
      assert.equal(P.run(`existsForallNot(${J})`), !ae);
    }
  } finally { P.close(); }
});
test('quantifiers: the game claims have the expected truth values and counterexamples', () => {
  const P = page('logic-quantifiers', 'fr');
  try {
    const dom = g => Array.from({length: g.hi - g.lo + 1}, (_, i) => g.lo + i);
    const isPrime = n => n > 1 && Array.from({length: n - 2}, (_, i) => i + 2).every(d => n % d);
    const claims = P.run('CLAIMS.map(c=>({id:c.id,kind:c.kind,lo:c.lo,hi:c.hi}))');
    assert.equal(claims.length, 11);
    const expected = {
      g1: n => n * n > n, g2: n => !isPrime(n) || n % 2 === 1, g3: n => isPrime(n * n + n + 41), g4: n => isPrime(n * n + n + 41),
      g5: n => n * n === 3 * n + 10, g6: n => 2 ** n === n * n, g7: n => 2 ** n > n * n, g8: n => n * (n + 1) % 2 === 0, g9: n => n * n === 2 * n - 3,
      g10: n => !isPrime(n) || isPrime(2 ** n - 1), g11: n => !(n % 4 === 0 && n % 6 === 0) || n % 24 === 0
    };
    const truth = {g1: false, g2: false, g3: true, g4: false, g5: true, g6: true, g7: false, g8: true, g9: false, g10: false, g11: false};
    for (const c of claims) {
      const d = dom(c), got = c.kind === 'all' ? d.every(expected[c.id]) : d.some(expected[c.id]);
      assert.equal(got, truth[c.id], c.id);
      assert.equal(P.run(`claimTruth(CLAIMS.find(c=>c.id==='${c.id}'))`), got, c.id);
    }
    assert.deepEqual(dom(claims[3]).filter(n => !expected.g4(n)).slice(0, 2), [40, 41]);
    assert.deepEqual(dom(claims[6]).filter(n => !expected.g7(n)), [2, 3, 4]);
    assert.deepEqual(dom(claims[9]).filter(n => !expected.g10(n)), [11]);
    // every claim has its text in both editions
    for (const c of claims) assert.ok(P.run(`T.g.${c.id}.s`) && P.run(`T.g.${c.id}.x`));
  } finally { P.close(); }
});
test('quantifiers: editing the universe flips the truth value, and a wrong negation is refuted', () => {
  const P = page('logic-quantifiers', 'en');
  try {
    const badge = () => P.doc.querySelector('#xread .badge').textContent;
    assert.equal(badge(), 'F'); // n² > n on {1..8}: 1 is a counterexample
    click(P.w, P.doc.querySelector('#board [data-n="1"]')); assert.equal(badge(), 'T');
    click(P.w, P.doc.querySelector('[data-q="ex"]')); assert.equal(badge(), 'T');
    click(P.w, P.doc.querySelector('[data-preset="none"]'));
    assert.equal(badge(), 'F'); assert.match(P.doc.getElementById('xread').textContent, /empty/);
    click(P.w, P.doc.querySelector('[data-q="all"]')); assert.equal(badge(), 'T');
    // negation tab: statement s1 is "for all n even": the negation is "exists n not even"
    click(P.w, P.doc.querySelector('[data-nq="ex"]')); click(P.w, P.doc.querySelector('[data-np="1"]'));
    assert.ok(P.doc.querySelector('#nread .fb.good'));
    click(P.w, P.doc.querySelector('[data-np="0"]'));
    assert.ok(P.doc.querySelector('#nread .fb.bad'));
    click(P.w, P.doc.querySelector('[data-nq="all"]')); click(P.w, P.doc.querySelector('[data-np="1"]'));
    assert.ok(P.doc.querySelector('#nread .fb.bad'), '∀ with the negated property is not a negation');
    // relation grid
    click(P.w, P.doc.querySelector('[data-tab="two"], #tab-two'));
    assert.match(P.doc.getElementById('tworead').textContent, /Every row has at least one/);
  } finally { P.close(); }
});

// ---- Lesson 4: reasoning
test('reasoning: pure helpers agree with direct computation', () => {
  const P = page('logic-reasoning', 'fr');
  try {
    assert.equal(P.run('euler(40)'), 1681); assert.equal(P.run('isPrime(euler(40))'), false); assert.equal(P.run('smallestFactor(1681)'), 41);
    for (let n = 0; n < 40; n++) assert.equal(P.run(`isPrime(euler(${n}))`), true, 'n=' + n);
    const e = P.run('euclid(6)'); assert.equal(e.N, 30031); assert.equal(e.p, 59); assert.equal(e.isNew, true);
    for (let k = 1; k <= 7; k++) { const r = P.run(`euclid(${k})`); assert.equal(r.isNew, true); assert.equal(r.N % r.p, 0); r.list.forEach(p => assert.notEqual(r.N % p, 0)); }
    for (let q = 1; q <= 1000; q++) { const r = P.run(`sqrt2(${q})`); assert.notEqual(r.diff, 0); assert.ok(Math.abs(r.p - q * Math.SQRT2) <= .5); }
    for (let n = 1; n <= 50; n++) assert.equal(P.run(`triangle(${n})`), Array.from({length: n}, (_, i) => i + 1).reduce((a, b) => a + b));
    assert.deepEqual([...P.run('dominoFall(10,true,new Set())')], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepEqual([...P.run('dominoFall(10,false,new Set())')], []);
    assert.deepEqual([...P.run('dominoFall(10,true,new Set([5]))')], [0, 1, 2, 3, 4]);
    assert.deepEqual([...P.run('dominoFall(10,true,new Set([3,7]))')], [0, 1, 2]);
  } finally { P.close(); }
});
test('reasoning: a proof is assembled only in the right order (all six methods, both languages)', () => {
  for (const lang of LANGS) {
    const P = page('logic-reasoning', lang);
    try {
      for (const m of ['direct', 'contra', 'cases', 'absurd', 'induction']) {
        click(P.w, P.doc.querySelector(`[data-m="${m}"]`));
        const bank = () => [...P.doc.querySelectorAll('#tech-proof .bank [data-i]')];
        const total = bank().length;
        assert.ok(total >= 4, m);
        // a wrong first click is refused and nothing is placed
        const wrong = bank().find(b => b.dataset.i !== '0');
        click(P.w, wrong);
        assert.equal(P.doc.querySelectorAll('#tech-proof .steps li').length, 0);
        assert.ok(P.doc.querySelector('#tech-proof .fb.bad'));
        for (let i = 0; i < total; i++) click(P.w, P.doc.querySelector(`#tech-proof .bank [data-i="${i}"]`));
        assert.equal(P.doc.querySelectorAll('#tech-proof .steps li').length, total);
        assert.ok(P.doc.querySelector('#tech-proof .fb.good'));
        assert.equal(bank().length, 0);
      }
      click(P.w, P.doc.querySelector('[data-m="absurd"]')); click(P.w, P.doc.querySelector('[data-ctx="primes"]'));
      assert.match(P.doc.getElementById('aread').textContent, /30031|2 × 3 × 5/);
      click(P.w, P.doc.querySelector('[data-m="counter"]'));
      const r = P.doc.getElementById('cn'); r.value = '40'; r.dispatchEvent(new P.w.Event('input', {bubbles: true}));
      assert.match(P.doc.getElementById('cread').textContent, /41 × 41|40/);
      assert.ok(P.doc.querySelector('#cread .fb.bad'));
      assert.deepEqual(P.errors, []);
    } finally { P.close(); }
  }
});
test('reasoning: the dominoes fall exactly as the base case and the stuck links allow', () => {
  const P = page('logic-reasoning', 'en');
  try {
    click(P.w, P.doc.querySelector('[data-m="induction"]'));
    const fell = () => [...P.doc.querySelectorAll('#doms .dom')].map((d, i) => d.classList.contains('fell') ? i : -1).filter(i => i >= 0);
    click(P.w, P.doc.getElementById('dgo')); assert.deepEqual(fell(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    click(P.w, P.doc.querySelector('[data-k="6"]')); assert.deepEqual(fell(), [], 'sticking a domino resets');
    click(P.w, P.doc.getElementById('dgo')); assert.deepEqual(fell(), [0, 1, 2, 3, 4, 5]);
    assert.match(P.doc.getElementById('dread').textContent, /0 to 5/);
    click(P.w, P.doc.getElementById('dbase')); click(P.w, P.doc.getElementById('dgo'));
    assert.deepEqual(fell(), []); assert.match(P.doc.getElementById('dread').textContent, /Without a base case/);
    assert.equal(P.doc.getElementById('dbase').getAttribute('aria-checked'), 'false');
  } finally { P.close(); }
});

test('the shared files are published with the lessons and referenced fonts exist', () => {
  assert.ok(existsSync(new URL('logic-lesson.css', dir)));
  const css = readFileSync(new URL('logic-lesson.css', dir), 'utf8');
  assert.ok(css.includes('prefers-reduced-motion') && css.includes('prefers-color-scheme:dark') && css.includes('[data-theme="dark"]'));
  for (const m of css.matchAll(/url\("([^"]+\.woff2)"\)/g)) assert.ok(existsSync(new URL(m[1], dir)), m[1]);
  assert.doesNotMatch(css + shared, /fetch\(|XMLHttpRequest|googleapis|import\(|url\("?https?:/);
  assert.ok(shared.includes('mx-basics-size') && shared.includes('ResizeObserver'));
});
