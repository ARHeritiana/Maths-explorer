// Typography clean-up shared by the Terminale generators (templates-terminale-2..5.js): a statement or an answer never keeps a
// denominator 1, the exponent 1 of e, a coefficient 1 in front of e or a coefficient -1 in front of a letter.
// A coefficient 1 in front of a letter inside a formula ('+1t', '(1x)', '1x^{2}'): outside \text{...}, never after a digit or a letter.
const dropUnit = (m) => m.split(/(\\text\{[^}]*\})/).map((part, i) => (i % 2 ? part : part.replace(/(?<![\w}.,\\^])1([a-z])(?![a-zA-Z{(])/g, '$1'))).join('');
const tidyMath = (s) => s.replace(/\\\((.*?)\\\)/gs, (all, inner) => '\\(' + dropUnit(inner) + '\\)');
export const tidyText = (s) => tidyMath(String(s)
  .replace(/\\dfrac\{(-?\d+)\}\{1\}=\1(?![\d{,])/g, '$1')
  .replace(/\\dfrac\{(-?\d+)\}\{1\}/g, '$1')
  .replace(/\\mathrm\{e\}\^\{1\}/g, '\\mathrm{e}')
  .replace(/(?<![\w}\d.,])1\\mathrm\{e\}/g, '\\mathrm{e}')
  .replace(/(?<![\w}\d.,])-1([a-z])/g, '-$1'));

// Wraps make() of each template: same draw, tidy text; four-choice questions with two identical wrong options are redrawn.
export function tidy(list) {
  for (const t of list) {
    const make = t.make;
    t.make = function (r, level) {
      for (let i = 0; i < 40; i++) {
        try { const x = make.call(this, r, level); return { ...x, q: tidyText(x.q), a: tidyText(x.a), s: x.s ? tidyText(x.s) : x.s }; } catch (e) { if (!/^mcq: only/.test(e.message)) throw e; }
      }
      throw new Error(`${t.id}: no valid four-choice draw`);
    };
  }
  return list;
}

// Same clean-up for the seeded problems (intro, statements, hints and corrections).
export function tidyProblems(list) {
  for (const e of list) {
    const make = e.make;
    e.make = function (r) {
      const x = make.call(this, r);
      return { ...x, intro: tidyText(x.intro), parts: x.parts.map((p) => ({ ...p, q: tidyText(p.q), a: tidyText(p.a), hint: p.hint ? tidyText(p.hint) : p.hint })) };
    };
  }
  return list;
}
