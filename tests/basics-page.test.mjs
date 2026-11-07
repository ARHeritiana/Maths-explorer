// The Foundations page as data (site/js/basics-page.js): groups, derived numbers and neighbours, index and lesson markup, discovery.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {BASICS_GROUPS, basicsLessons, basicsLesson, basicsGroupOf, isBasicsRoute, basicsPage, discoveryLessons} from '../site/js/basics-page.js';
import {buildDiscoveryIndex} from '../site/js/discovery-index.js';
import {isLiveHash} from '../site/js/live-curriculum.js';

const OLD_URLS = ['place-value', 'addition', 'subtraction', 'multiplication', 'division', 'sets', 'fractions'];
const env = lang => ({t: p => p[lang === 'en' ? 1 : 0], pair: (fr, en) => lang === 'en' ? en : fr, lang, assetHref: p => p});
const parse = html => new JSDOM('<body>' + html + '</body>').window.document;

test('every existing lesson URL is still a route, and the new lessons are routes too', () => {
  for (const id of [...OLD_URLS, 'logic-propositions', 'logic-implication', 'logic-quantifiers', 'logic-reasoning']) assert.ok(isBasicsRoute(id), id);
  assert.ok(isBasicsRoute(undefined) && isBasicsRoute('') && !isBasicsRoute('nope'));
  assert.equal(basicsPage('nope', env('fr')), '');
});

test('groups are well formed and every lesson belongs to exactly one', () => {
  assert.deepEqual(BASICS_GROUPS.map(g => g.id), ['numbers', 'fractions', 'logic']);
  const ids = basicsLessons.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length); assert.equal(ids.length, 11);
  for (const g of BASICS_GROUPS) {
    assert.equal(g.title.length, 2); assert.equal(g.description.length, 2); assert.ok(g.lessons.length >= 1);
    for (const l of g.lessons) for (const k of ['title', 'description', 'does', 'frameTitle']) assert.ok(l[k].length === 2 && l[k][0] && l[k][1], `${l.id}.${k}`);
  }
  assert.deepEqual(BASICS_GROUPS.find(g => g.id === 'logic').lessons.map(l => l.id), ['sets', 'logic-propositions', 'logic-implication', 'logic-quantifiers', 'logic-reasoning']);
  assert.equal(basicsGroupOf('division').id, 'numbers');
});

test('numbers, previous and next are derived from the data order, across groups', () => {
  basicsLessons.forEach((l, i) => {
    assert.equal(l.number, String(i + 1).padStart(2, '0'));
    assert.equal(l.previous, basicsLessons[i - 1]?.id ?? null);
    assert.equal(l.next, basicsLessons[i + 1]?.id ?? null);
  });
  assert.equal(basicsLesson('division').next, 'fractions'); // crosses a group boundary
  assert.equal(basicsLesson('fractions').next, 'sets');
  assert.equal(basicsLesson('place-value').previous, null); assert.equal(basicsLesson('logic-reasoning').next, null);
});

test('every lesson has both editions on disk, and each language shows its own title', () => {
  for (const l of basicsLessons) for (const suffix of ['.html', '.en.html']) assert.ok(existsSync(new URL(`../site/resources/basics/${l.id}${suffix}`, import.meta.url)), l.id + suffix);
});

for (const lang of ['fr', 'en']) {
  test(`index page (${lang}): landmarks, one heading per group, one row per lesson in order`, () => {
    const d = parse(basicsPage(undefined, env(lang)));
    assert.equal(d.querySelectorAll('main#main[tabindex="-1"]').length, 1);
    assert.equal(d.querySelectorAll('h1').length, 1);
    const sections = [...d.querySelectorAll('section.foundation-group')];
    assert.equal(sections.length, 3);
    for (const s of sections) {
      const h = s.querySelector('h2'); assert.equal(s.getAttribute('aria-labelledby'), h.id);
      assert.ok(s.querySelector('.foundation-group-desc').textContent.trim());
    }
    const rows = [...d.querySelectorAll('.foundation-list a')];
    assert.deepEqual(rows.map(a => a.getAttribute('href').replace('#basics/', '')), basicsLessons.map(l => l.id));
    assert.deepEqual(rows.map(a => a.querySelector('.chapter-row-number').textContent), basicsLessons.map(l => l.number));
    rows.forEach((a, i) => {
      assert.equal(a.querySelector('strong').textContent, basicsLessons[i].title[lang === 'en' ? 1 : 0]);
      assert.ok(a.querySelectorAll('small').length === 2, 'description and what the student will do');
      assert.match(a.querySelector('.foundation-does').textContent, lang === 'en' ? /^You will/ : /^Tu vas/);
    });
    assert.doesNotMatch(d.body.innerHTML, /[—–]/);
  });

  test(`lesson page (${lang}): breadcrumb, neighbours, iframe in the right language`, () => {
    const d = parse(basicsPage('division', env(lang)));
    const f = d.querySelector('iframe#basics-frame');
    assert.equal(f.getAttribute('lang'), lang);
    assert.equal(f.getAttribute('src'), './resources/basics/division' + (lang === 'en' ? '.en' : '') + '.html');
    assert.ok(f.getAttribute('title'));
    assert.equal(d.querySelector('.foundation-crumbs .backlink').getAttribute('href'), '#basics');
    const navs = [...d.querySelectorAll('nav.foundation-steps')];
    assert.equal(navs.length, 2); navs.forEach(n => assert.ok(n.getAttribute('aria-label')));
    assert.deepEqual([...navs[0].querySelectorAll('a')].map(a => a.getAttribute('href')), ['#basics/multiplication', '#basics/fractions']);
    const first = parse(basicsPage('place-value', env(lang))).querySelector('nav.foundation-steps');
    assert.deepEqual([...first.querySelectorAll('a')].map(a => a.getAttribute('href')), ['#basics/addition']);
    const last = parse(basicsPage('logic-reasoning', env(lang))).querySelector('nav.foundation-steps');
    assert.deepEqual([...last.querySelectorAll('a')].map(a => a.getAttribute('href')), ['#basics/logic-quantifiers']);
  });
}

test('app.js only imports the module; no lesson list or hard-coded chain remains there', () => {
  const app = readFileSync(new URL('../site/js/app.js', import.meta.url), 'utf8');
  assert.match(app, /import \{ basicsPage, bindBasics, isBasicsRoute \} from "\.\/basics-page\.js"/);
  assert.doesNotMatch(app, /Leçon suivante|Next lesson|r\.id === "sets"|const basicsLessons/);
});

test('logic lessons are in the discovery index under logic and proof, and linked with sets', () => {
  const lessons = discoveryLessons();
  assert.deepEqual(lessons.map(l => l.id), ['logic-propositions', 'logic-implication', 'logic-quantifiers', 'logic-reasoning']);
  const sets = {id: 'sets', title: ['Ensembles', 'Sets'], summary: ['', ''], topics: ['foundations/sets'], concepts: ['sets'], links: ['#basics/logic-propositions']};
  const index = buildDiscoveryIndex({lessons: [sets, ...lessons]});
  for (const l of lessons) {
    const item = index.find(x => x.route === '#basics/' + l.id);
    assert.ok(item, l.id); assert.ok(item.memberships.includes('foundations/reasoning')); assert.ok(isLiveHash(item.route));
  }
  assert.ok(index.find(x => x.route === '#basics/logic-propositions').related.includes('#basics/sets'));
  assert.ok(index.find(x => x.route === '#basics/sets').related.includes('#basics/logic-propositions'));
});
