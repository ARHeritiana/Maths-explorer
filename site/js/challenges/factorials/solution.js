import { P } from "../common/helpers.js";
import { valuationTerms, factorialValuation } from "./maths.js";
export const diagram = {
  size: [520, 300],
  steps: ({ n, p }) => [P(`On compte les facteurs ${p} dans le produit 1 × 2 × … × ${n}.`, `Count factors of ${p} in the product 1 × 2 × … × ${n}.`), P(`Chaque multiple de ${p} donne un facteur ; ceux de ${p ** 2} en donnent un autre.`, `Every multiple of ${p} supplies one factor; multiples of ${p ** 2} supply another.`), P(`La somme des couches donne v_${p}(${n}!) = ${factorialValuation(n, p)}.`, `The layer sum gives v_${p}(${n}!) = ${factorialValuation(n, p)}.`)],
  draw(c, step, progress, { n, p }) { const terms = valuationTerms(n, p); terms.slice(0, 7).forEach(({ power, count }, i) => { c.text(25, 40 + i * 34, `${power}`, { fill: "var(--ink)", "font-size": 17 }); const scale = step ? 1 : progress; c.rect(100, 22 + i * 34, Number(count) / Math.max(1, n) * 340 * scale, 24, { fill: "var(--accent)" }); c.text(460, 40 + i * 34, String(count), { fill: "var(--ink)", "font-size": 17 }); }); if (step === 2) c.text(220, 285, `Σ = ${factorialValuation(n, p)}`, { fill: "var(--ink)", "font-size": 22 }); },
};
