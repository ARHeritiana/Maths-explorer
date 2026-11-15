// RATCHET: the hints and written solutions of the challenges must stay at high-school level, with no jargon, no group theory,
// no URLs and no citations. Several challenges still violate this; they are listed in ALLOWLIST (by id) so the test passes
// today. A NEW violation fails, and so does an allowlisted challenge that no longer violates (remove it from the list).
// Later batches of the challenge redesign shrink ALLOWLIST until it is empty.
import test from "node:test";
import assert from "node:assert/strict";
import { VARIANTS, defaults } from "../site/js/challenges/registry.js";

export const BANNED = [
  "group", "groupe", "generator", "générateur", "generateur", "inverse", "commutateur", "commutator", "modulo", "congru",
  "invariant", "monovariant", "valuation", "p-adic", "hamilton", "eulér", "euler", "graphe", "graph", "bézout", "bezout",
  "pgcd", "gcd", "hierholzer", "warnsdorff", "schwenk", "arxiv", "http", "[verify]",
  "parité", "parity", "chvátal", "fisk", "goldbach", "legendre",
];

// Known offenders from the audit of 12 November 2026. Remove an id once its hints and solution are clean.
export const ALLOWLIST = new Set([
  "rooms", "konigsberg",
]);

const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// "group" and "groupe" match from a word start only, so "regrouper" is fine; the other terms match anywhere.
const banned = BANNED.map((w) => (/^group/.test(w) ? new RegExp(`(^|[^a-z])${strip(w)}`) : new RegExp(strip(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));

function texts(id) {
  const v = VARIANTS[id], q0 = defaults(id), out = [];
  const pools = v.params.map((p) => (p.kind === "int" ? [p.min, p.value, p.max] : p.options.map((o) => o[0])));
  let combos = pools.reduce((acc, pool) => acc.flatMap((a) => pool.map((x) => [...a, x])), [[]]);
  if (combos.length > 400) combos = combos.filter((_, i) => i % Math.ceil(combos.length / 400) === 0);
  for (const combo of [null, ...combos]) {
    const q = combo ? Object.fromEntries(v.params.map((p, i) => [p.id, combo[i]])) : q0;
    out.push(...v.solution(q), ...(v.hints ? v.hints(q).flat() : []));
  }
  return out;
}

export function offences(id) {
  const found = new Set();
  for (const raw of texts(id)) {
    const s = strip(raw);
    banned.forEach((re, i) => { if (re.test(s)) found.add(BANNED[i]); });
  }
  return [...found];
}

test("challenge hints and solutions use no banned jargon (ratchet with an allowlist of known offenders)", () => {
  const stale = [], fresh = [];
  for (const id of Object.keys(VARIANTS)) {
    const bad = offences(id);
    if (bad.length && !ALLOWLIST.has(id)) fresh.push(`${id}: ${bad.join(", ")}`);
    if (!bad.length && ALLOWLIST.has(id)) stale.push(id);
  }
  assert.deepEqual(fresh, [], "new jargon in hints or solution (fix the text, do not extend the allowlist)");
  assert.deepEqual(stale, [], "these challenges are clean now: remove them from ALLOWLIST");
  for (const id of ALLOWLIST) assert.ok(Object.hasOwn(VARIANTS, id), `unknown challenge in ALLOWLIST: ${id}`);
});
