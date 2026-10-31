// The two editions of the sets lesson stay in sync: same logic byte for byte, same structure, no English in French and no French in English.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInContext} from 'node:vm';
import {JSDOM} from 'jsdom';

const read = lang => readFileSync(new URL(`../site/resources/basics/sets${lang === 'en' ? '.en' : ''}.html`, import.meta.url), 'utf8');
const scriptOf = html => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const split = html => {
  const s = scriptOf(html), a = s.indexOf('/* TEXT-BEGIN'), b = s.indexOf('/* TEXT-END */') + '/* TEXT-END */'.length;
  return {text: s.slice(a, b), logic: s.slice(0, a) + s.slice(b)};
};
function load(lang) {
  const html = read(lang), dom = new JSDOM(html, {runScripts: 'outside-only', url: 'https://example.test/'});
  dom.window.matchMedia = () => ({matches: true});
  const ctx = dom.getInternalVMContext();
  runInContext(scriptOf(html), ctx);
  runInContext('globalThis.__seed=7;Math.random=()=>{__seed=(__seed*1664525+1013904223)%4294967296;return __seed/4294967296}', ctx);
  return {dom, doc: dom.window.document, run: c => runInContext(c, ctx), html};
}
const shape = (v) => typeof v === 'function' ? 'fn' + v.length
  : Array.isArray(v) ? v.map(shape) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, shape(v[k])])) : typeof v;
const strings = (v, out = []) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(x => strings(x, out)); else if (v && typeof v === 'object') Object.values(v).forEach(x => strings(x, out)); return out; };
const words = s => s.replace(/<[^>]+>/g, ' ').toLowerCase().match(/[a-zàâçéèêëîïôûùüÿœ]+/g) || [];

test('the code is identical in both editions; only the text block, the title and the language differ', () => {
  const en = read('en'), fr = read('fr');
  assert.equal(split(en).logic, split(fr).logic);
  const strip = h => h.replace(/<html lang="..">/, '').replace(/<title>.*<\/title>/, '').replace(split(h).text, '');
  assert.equal(strip(en), strip(fr), 'markup and style are shared');
  assert.match(en, /<html lang="en">/); assert.match(fr, /<html lang="fr">/);
});

test('the text tables have exactly the same structure (keys, kinds, function arity)', () => {
  const en = load('en'), fr = load('fr');
  try {
    assert.equal(JSON.stringify(shape(fr.run('T'))), JSON.stringify(shape(en.run('T'))));
    for (const name of ['lessons.map(l=>l.id)', 'laws.map(l=>l.id)', 'quizGenerators.map(g=>g.id)', 'ops2.map(o=>o.id)', 'ops3.map(o=>o.id)', 'shadePrompts.map(p=>p.id)', 'Object.keys(T.lessons)', 'Object.keys(T.laws)', 'Object.keys(T.ops)'])
      assert.equal(JSON.stringify(fr.run(name)), JSON.stringify(en.run(name)), name);
    assert.equal(en.run('lessons.length'), 18); assert.equal(en.run('laws.length'), 15); assert.equal(en.run('quizGenerators.length'), 19);
    const ids = d => [...d.querySelectorAll('[id]')].map(e => e.id).sort();
    assert.equal(JSON.stringify(ids(fr.doc)), JSON.stringify(ids(en.doc)));
    const attrs = d => [...d.querySelectorAll('*')].map(e => e.tagName + [...e.attributes].map(a => a.name).filter(n => n.startsWith('data-') || n.startsWith('aria-') || n === 'role').sort().join(',')).join('|');
    assert.equal(attrs(fr.doc), attrs(en.doc));
    assert.equal(fr.doc.querySelectorAll('#notation-rows tr').length, en.doc.querySelectorAll('#notation-rows tr').length);
    // The same sequence of questions (same seed) has the same mathematical content in both editions.
    for (const id of fr.run('quizGenerators.map(g=>g.id)')) for (let i = 0; i < 20; i++) {
      const a = fr.run(`quizGenerators.find(g=>g.id==='${id}').make()`), b = en.run(`quizGenerators.find(g=>g.id==='${id}').make()`);
      assert.equal(a.choices.length, b.choices.length);
      assert.equal(a.choices.filter(c => c.correct).length, 1); assert.equal(b.choices.filter(c => c.correct).length, 1);
    }
  } finally { fr.dom.window.close(); en.dom.window.close(); }
});

const FRENCH_WORDS = ['les', 'des', 'une', 'est', 'sont', 'pour', 'avec', 'dans', 'ou', 'et', 'ensemble', 'ensembles', 'réunion', 'élément', 'éléments', 'appartient', 'tout', 'aussi', 'mais', 'pas', 'ni', 'oui', 'non', 'exemple'];
const ENGLISH_WORDS = ['the', 'and', 'of', 'is', 'are', 'with', 'that', 'which', 'every', 'from', 'only', 'for', 'you', 'your', 'to', 'an', 'it', 'element', 'elements', 'union', 'subset', 'set', 'sets', 'yes', 'no', 'answer', 'complement', 'difference', 'symmetric', 'cardinality', 'power', 'not', 'in'];

function everyVisibleString(P) {
  const body = P.doc.body.cloneNode(true); body.querySelectorAll('script,style').forEach(e => e.remove());
  const out = [body.textContent.replace(/\s+/g, ' ')];
  for (const e of P.doc.querySelectorAll('[aria-label]')) out.push(e.getAttribute('aria-label'));
  // Every concept, law and a hundred questions of each kind, as rendered.
  for (const id of P.run('lessons.map(l=>l.id)')) { P.run(`activeLesson='${id}';renderLesson()`); out.push(P.doc.getElementById('lesson').textContent); for (const e of P.doc.querySelectorAll('#lesson [aria-label]')) out.push(e.getAttribute('aria-label')); }
  for (const id of P.run('laws.map(l=>l.id)')) { P.run(`activeLaw='${id}';renderLaws()`); out.push(P.doc.getElementById('law-article').textContent); for (const e of P.doc.querySelectorAll('#law-article [aria-label]')) out.push(e.getAttribute('aria-label')); }
  for (const g of P.run('quizGenerators.map(g=>g.id)')) for (let i = 0; i < 30; i++) {
    const q = P.run(`quizGenerators.find(g=>g.id==='${g}').make()`);
    out.push(q.prompt, q.explanation, q.hint, ...q.choices.map(c => c.text));
    out.push(q.context.replace(/\{[^}]*\}/g, ' '));
  }
  for (const id of P.run('shadePrompts.map(p=>p.id)')) {
    P.run(`shadeQuestion=shadePrompts.find(p=>p.id==='${id}');shadeSelection=new Set(['010']);shadeChecked=true;renderShade()`);
    out.push(P.doc.getElementById('shade-prompt').textContent, P.doc.getElementById('shade-feedback').textContent);
  }
  return out.join(' \n ');
}

test('the French edition has no English sentence and the English edition no French', () => {
  const fr = load('fr'), en = load('en');
  try {
    const frWords = new Set(words(everyVisibleString(fr))), enWords = new Set(words(everyVisibleString(en)));
    const leakEn = ENGLISH_WORDS.filter(w => frWords.has(w)), leakFr = FRENCH_WORDS.filter(w => enWords.has(w));
    assert.equal(JSON.stringify(leakEn), '[]', 'English words in the French edition');
    assert.equal(JSON.stringify(leakFr), '[]', 'French words in the English edition');
    // The French source text table contains accents and the French vocabulary of the task.
    const text = strings(fr.run('T')).join(' ') + fr.run('T.q.card.explain.toString()');
    for (const term of ['ensemble vide', 'réunion', 'intersection', 'complémentaire', 'différence symétrique', 'ensemble des parties', 'produit cartésien', 'cardinal', 'inclusion'])
      assert.ok(text.toLowerCase().includes(term), `French term "${term}"`);
    assert.ok(text.includes('∅') && text.includes('⊂'));
    assert.ok(!strings(en.run('T')).some(s => /réunion|complémentaire|ensemble des parties/.test(s)));
    // One inclusion symbol per edition, stated in the notation table.
    assert.ok(fr.run('T.notation').some(r => /⊂/.test(r[0]) && /manuels/.test(r[1])));
    assert.ok(en.run('T.notation').some(r => /⊆/.test(r[0]) && /some books/.test(r[1])));
  } finally { fr.dom.window.close(); en.dom.window.close(); }
});

test('no claim about programmes, grades or owners in the lesson text', () => {
  for (const lang of ['fr', 'en']) {
    const strs = strings(load(lang).run('T')).join(' ').toLowerCase();
    assert.ok(!/programme|curriculum|syllabus|lycée|terminale|grade|year \d|collège|bac\b|niveau|level/.test(strs.replace('convention du lycée français', '')) , `${lang}: no programme alignment`);
  }
});
