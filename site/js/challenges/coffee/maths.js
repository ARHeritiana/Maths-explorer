// Pure mathematics of the coffee challenge (no DOM), checked with exact fractions in tests/coffee.test.mjs.
// Two cups of V mL, one of coffee, one of milk, and a spoon of v mL. One round trip: a spoonful of coffee into the milk,
// stir, then a spoonful of the mixture back into the coffee. Each cup is a pair { c: coffee, m: milk } in mL.

// (V, v) pairs for which the answer V v / (V + v) is a whole number of mL.
export const CUPS = ["200,50", "100,25", "300,60", "120,30", "240,60", "180,20", "150,30", "280,70"];
export const cupsOf = (id) => String(id).split(",").map(Number);

export const start = (V) => [{ c: V, m: 0 }, { c: 0, m: V }];
export const volume = (cup) => cup.c + cup.m;

// A spoonful of v mL from a well-stirred cup: coffee and milk in the cup's proportions.
export function scoop(cup, v) {
  const k = Math.min(1, v / volume(cup)), s = { c: cup.c * k, m: cup.m * k };
  return { cup: { c: cup.c - s.c, m: cup.m - s.m }, spoon: s };
}
export const pour = (cup, spoon) => ({ c: cup.c + spoon.c, m: cup.m + spoon.m });

// One round trip from cups `cups` (default: the start); returns the two cups after it.
export function roundTrip(V, v, cups = start(V)) {
  const a = scoop(cups[0], v), b = pour(cups[1], a.spoon), c = scoop(b, v);
  return [pour(a.cup, c.spoon), c.cup];
}

// The answer: milk in the coffee cup after one round trip, V v / (V + v).
export const milkInCoffee = (V, v) => roundTrip(V, v)[0].m;
export const answerOf = (V, v) => (V * v) / (V + v);

// "33,3 mL" in French, "33.3 mL" in English.
export const ml = (x, lang = "fr") => { const r = Math.round(x * 10) / 10, s = Number.isInteger(r) ? String(r) : r.toFixed(1); return `${lang === "fr" ? s.replace(".", ",") : s} mL`; };
