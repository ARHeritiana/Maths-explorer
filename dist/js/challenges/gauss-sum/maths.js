// Pure mathematics of the gauss-sum challenge (no DOM), checked by an independent method in tests/.

/* ------------------------------------------------------------ arithmetic series */
// A series is written "a,d,k": first term a, common difference d, k terms. Presets: the sum of the story (1 to 100), odd
// and even numbers, a longer sum, and the version told by E. T. Bell (81297 + 81495 + … + 100899).
export const SERIES_PRESETS = ["1,1,100", "1,2,50", "2,2,50", "1,1,1000", "81297,198,100"];
export const parseSeries = (s) => String(s).split(",").map(Number);
export const term = (a, d, i) => a + i * d;
export const lastTerm = (a, d, k) => a + (k - 1) * d;
// Written forwards and backwards, the series gives k columns that all add up to a + l: twice the sum is k(a + l).
export const seriesSum = (a, d, k) => (k * (a + lastTerm(a, d, k))) / 2;
export const groupDigits = (n, lang) => Number(n).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB");
