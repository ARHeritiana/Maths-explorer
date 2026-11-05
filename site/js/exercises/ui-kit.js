import {currentCourse,rememberCourse} from '../navigation-state.js';
// Shared pieces of the two generator pages (#automatismes, #sheets): form controls, settings kept on the device,
// maths typesetting, file download and printing. Plain DOM, no framework.
import { CLASSES, DOMAINS, LEVELS, chaptersOf, domainsOf } from './bank.js';
import { esc } from './export.js';

const P = (fr, en) => [fr, en];
export { P };

// ---- settings kept on this device (a convenience, never sent anywhere) ----
export const loadSettings = (key, fallback) => { let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}const settings={...fallback,...saved};if('cls' in settings)settings.cls=currentCourse(settings.cls)||settings.cls;return settings; };
export const saveSettings = (key, value) => { if(value.cls)rememberCourse(value.cls); try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be blocked */ } };

// ---- maths ----
let mathPromise = null;
export function loadMath() {
  if (window.MathJax?.typesetPromise) return Promise.resolve();
  return (mathPromise ||= new Promise((ok, fail) => {
    if (!window.MathJax) window.MathJax = { startup: { typeset: false }, svg: { fontCache: 'none' }, options: { enableAssistiveMml: true }, tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] } };
    const s = document.createElement('script');
    s.src = './vendor/mathjax-tex-svg.js?v=3.2.2-full'; s.onload = () => (window.MathJax.startup?.promise || Promise.resolve()).then(ok, ok); s.onerror = () => { mathPromise = null; fail(new Error('MathJax')); };
    document.head.append(s);
  }));
}
export async function typeset(root) {
  try { await loadMath(); await window.MathJax.typesetPromise([root]); } catch { /* the text stays readable as plain LaTeX */ }
}

// ---- files and printing ----
export function download(name, text, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
// Prints a block of markup alone: it is mounted in .print-doc, the rest of the page is hidden by print.css rules.
export async function printMarkup(markup) {
  document.querySelector('.print-doc')?.remove();
  const host = Object.assign(document.createElement('div'), { className: 'print-doc', innerHTML: markup });
  document.body.append(host);
  await typeset(host);
  await Promise.all([...host.querySelectorAll('img')].map(img=>{img.loading='eager';return img.decode?img.decode().catch(()=>{}):Promise.resolve();}));
  const root = document.documentElement;
  root.classList.add('printing-doc');
  const done = () => { root.classList.remove('printing-doc'); host.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}
// the previous or next series: a seed ending in -N moves to -(N+1), any other seed gets the suffix -2
export const stepSeed = (seed, delta) => { const m = /^(.*)-(\d+)$/.exec(seed); const base = m ? m[1] : seed, n = m ? Number(m[2]) : 1; return `${base}-${Math.max(1, n + delta)}`; };
export const stamp = (cls, seed) => `${cls}-${String(seed).replace(/[^a-z0-9]+/gi, '').slice(0, 10) || 'x'}`;

// ---- controls ----
export const classOptions = (current) => CLASSES.map((c) => `<option value="${c.id}"${c.id === current ? ' selected' : ''}>${esc(c.label)}</option>`).join('');
export function checkChips(name, legend, items, selected) {
  return `<fieldset class="gen-chips"><legend>${legend}</legend><div class="gen-chiplist">${items.map(([id, label]) => `<label class="gen-chip"><input type="checkbox" name="${name}" value="${esc(id)}"${selected.includes(id) ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('')}</div></fieldset>`;
}
export const levelChips = (selected, t) => checkChips('level', t(P('Niveaux', 'Levels')), LEVELS.map(([n, l]) => [String(n), l]), selected.map(String));
export const chapterChips = (cls, selected, chapterTitle, t) => checkChips('chapter', t(P('Chapitres (aucun coché : tous)', 'Chapters (none ticked: all)')), chaptersOf(cls).map((id) => [id, chapterTitle(id)]), selected);
export const domainChips = (cls, selected, t) => checkChips('domain', t(P('Thèmes (aucun coché : tous)', 'Topics (none ticked: all)')), domainsOf(cls).map((d) => [d, DOMAINS[d] || d]), selected);
export const checked = (root, name) => [...root.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);
