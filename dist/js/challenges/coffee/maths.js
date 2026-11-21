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

// The discrete version (owner, 21 November 2026): two bags of N beans, white in one and red in the other, and a handful
// of k beans. Ids "b20,5" (N = 20, k = 5) share the parameter list with the mugs. A bag is { w, r }: its white and red
// beans. Whatever beans the handfuls hold, after one handful each way both bags hold N beans again, so the red beans in
// the white bag are exactly as many as the white beans in the red bag.
export const BEANS = ["b20,5", "b16,4", "b24,6", "b30,10", "b12,3"];
export const isBeans = (id) => String(id).startsWith("b");
export const beansOf = (id) => String(id).slice(1).split(",").map(Number);
export const bagsStart = (N) => [{ w: N, r: 0 }, { w: 0, r: N }];
export const count = (bag) => bag.w + bag.r;
// Move a handful { w, r } out of bag `from` into bag `to` (bags as an array of two); the handful must be in the bag.
export function move(bags, from, hand) {
  const b = bags.map((x) => ({ ...x })), to = 1 - from;
  if (hand.w > b[from].w || hand.r > b[from].r || hand.w < 0 || hand.r < 0) throw new RangeError("not in the bag");
  b[from].w -= hand.w; b[from].r -= hand.r; b[to].w += hand.w; b[to].r += hand.r;
  return b;
}
// A handful of k beans drawn at random from a bag (rnd: a function returning a number in [0, 1)).
export function grab(bag, k, rnd = Math.random) {
  const h = { w: 0, r: 0 }, left = { ...bag };
  for (let i = 0; i < Math.min(k, count(bag)); i++) { if (rnd() * (left.w + left.r) < left.w) { h.w++; left.w--; } else { h.r++; left.r--; } }
  return h;
}
