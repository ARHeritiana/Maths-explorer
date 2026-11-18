// Seeded probability and inference models. Exact benchmarks are separate from simulation.
import { rng } from './probability.js';

const integer = (x, lo, hi, name) => {
  if (!Number.isInteger(x) || x < lo || x > hi) throw new RangeError(name);
  return x;
};
export function permutation(n, next) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function secretaryProbability(n, skip) {
  integer(n, 1, 2000, 'n'); integer(skip, 0, n - 1, 'skip');
  if (!skip) return 1 / n;
  let sum = 0;
  for (let j = skip; j < n; j++) sum += 1 / j;
  return skip * sum / n;
}
export function secretaryThreshold(n) {
  integer(n, 1, 2000, 'n');
  let best = 0, probability = 1 / n;
  for (let r = 1; r < n; r++) { const p = secretaryProbability(n, r); if (p > probability) { probability = p; best = r; } }
  return { skip: best, probability };
}
export function secretarySelection(order, skip) {
  let best = 0;
  for (let i = 0; i < skip; i++) best = Math.max(best, order[i]);
  for (let i = skip; i < order.length; i++) if (order[i] > best) return i;
  return order.length - 1;
}
// Other payoff: the cost is the final rank (1 = best), to be small. Exact law of the rank chosen by the threshold rule:
// stop at i > r exactly when candidate i is a record and the best of the first i-1 is among the r refused (r/(i(i-1))); the rank of
// a record of the first i is j with probability C(n-j, i-1)/C(n, i); no stop before n leaves candidate n, of uniform rank.
export function secretaryRankLaw(n, r) {
  integer(n, 1, 2000, 'n'); integer(r, 0, n - 1, 'skip');
  const law = Array(n + 1).fill(0);
  if (!r || n === 1) { for (let j = 1; j <= n; j++) law[j] = 1 / n; return law; }
  const logC = (a, b) => { let x = 0; for (let t = 1; t <= b; t++) x += Math.log((a - b + t) / t); return x; };
  for (let i = r + 1; i < n; i++) for (let j = 1; j <= n - i + 1; j++) law[j] += r / (i * (i - 1)) * Math.exp(logC(n - j, i - 1) - logC(n, i));
  for (let j = 1; j <= n; j++) law[j] += r / ((n - 1) * n);
  return law;
}
export const secretaryExpectedRank = (n, r) => secretaryRankLaw(n, r).reduce((a, p, j) => a + j * p, 0);
export function secretaryBestRankThreshold(n) {
  let best = 0, value = (n + 1) / 2;
  for (let r = 1; r < n; r++) { const v = secretaryExpectedRank(n, r); if (v < value) { value = v; best = r; } }
  return { skip: best, expectedRank: value };
}
// The rule that minimises the expected rank (backward induction over relative ranks, Lindley 1961; Chow, Moriguti, Robbins and
// Samuels 1964): a candidate of relative rank y at position i has expected final rank y(n+1)/(i+1); accept it when that is at most
// the expected rank V[i] of continuing optimally. Positions are 1-based; accept[i] is the largest relative rank accepted at i.
export function secretaryRankPolicy(n) {
  integer(n, 1, 2000, 'n');
  const V = Array(n + 1).fill(Infinity), accept = Array(n + 1).fill(0);
  V[n] = Infinity; accept[n] = n;
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0; const q = i + 1;
    for (let y = 1; y <= q; y++) sum += Math.min(y * (n + 1) / (q + 1), V[q]);
    V[i] = sum / q;
  }
  for (let i = 1; i < n; i++) accept[i] = Math.min(i, Math.floor(V[i] * (i + 1) / (n + 1) + 1e-12));
  return { expectedRank: V[0], accept };
}
export function secretaryRankSelection(order, policy) {
  const n = order.length; let smaller = 0;
  for (let i = 0; i < n; i++) {
    smaller = 0; for (let k = 0; k < i; k++) if (order[k] > order[i]) smaller++;   // relative rank among the first i+1 (1 = best)
    const y = smaller + 1; if (i === n - 1 || y <= policy.accept[i + 1]) return i;
  }
  return n - 1;
}
export function secretary(s) {
  const { n = 20, skip = 7, runs = 0, seed = 1, interview = 1, accepted = -1, variant = 'best' } = s;
  integer(n, 1, 2000, 'n'); integer(runs, 0, 10000, 'runs');
  const r = Math.max(0, Math.min(n - 1, Math.round(skip))), next = rng(seed);
  const order = permutation(n, next), seen = order.slice(0, Math.min(n, interview));
  let hits = 0; const rankHits = Array(11).fill(0), policy = variant === 'rank' && n <= 200 ? secretaryRankPolicy(n) : null; let optSum = 0, thrSum = 0;
  for (let i = 0; i < runs; i++) {
    const a = permutation(n, next), pick = a[secretarySelection(a, r)]; hits += pick === n;
    if (variant === 'rank') { const rank = n - pick + 1; rankHits[Math.min(10, rank)]++; thrSum += rank; if (policy) optSum += n - a[secretaryRankSelection(a, policy)] + 1; }
  }
  const rankLaw = variant === 'rank' ? secretaryRankLaw(n, r) : null;
  return { variant, rankLaw, rankHits, expectedRank: rankLaw ? rankLaw.reduce((q, p, j) => q + j * p, 0) : null, meanRank: runs && variant === 'rank' ? thrSum / runs : null,
    optimalRank: policy ? policy.expectedRank : null, meanOptimalRank: runs && policy ? optSum / runs : null, bestRankThreshold: variant === 'rank' ? secretaryBestRankThreshold(n) : null,
    order, seen, relative: seen.map(x => 1 + seen.filter(y => y > x).length),
    selected: accepted >= 0 ? order[Math.min(n - 1, accepted)] : null, hits, runs,
    frequency: runs ? hits / runs : null, probability: secretaryProbability(n, r), optimum: secretaryThreshold(n) };
}

export function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || n < k) return 0;
  k = Math.min(k, n - k); let out = 1;
  for (let j = 1; j <= k; j++) out *= (n - k + j) / j;
  return out;
}
export function maximumProbability(N, k, m) {
  integer(N, 1, 10000, 'N'); integer(k, 1, N, 'k');
  if (!Number.isInteger(m) || m < k || m > N) return 0;
  // Stable product for C(m-1,k-1)/C(N,k), even where individual combinations overflow.
  let p = k / N;
  for (let j = 1; j < k; j++) p *= (m - j) / (N - j);
  return p;
}
export function maximumCDF(N, k, m) {
  if (m < k) return 0;
  if (m >= N) return 1;
  let p = 1;
  for (let j = 0; j < k; j++) p *= (m - j) / (N - j);
  return p;
}
export function tankUpperBound(m, k, alpha = .05) {
  integer(m, 1, 10000, 'm'); integer(k, 1, m, 'k');
  if (!(alpha > 0 && alpha < 1)) throw new RangeError('alpha');
  // Invert P_N(M <= m) > alpha, with explicit finite search limit.
  let lo = m, hi = m;
  while (maximumCDF(hi, k, m) > alpha && hi < 1e9) hi *= 2;
  while (hi - lo > 1) { const mid = Math.floor((lo + hi) / 2); if (maximumCDF(mid, k, m) > alpha) lo = mid; else hi = mid; }
  return lo;
}
// Bayesian reading: flat prior on N = m, m+1, ... (improper, stated as such). The likelihood of the sample maximum m is 1/C(n,k), so
// P(N > n | m, k) = C(m-1, k-1) / C(n, k-1) for n >= m (telescoping sum), posterior mean (m-1)(k-1)/(k-2) for k >= 3 (infinite below).
export const tankPosteriorMean = (m, k) => (k >= 3 ? (m - 1) * (k - 1) / (k - 2) : null);
export function tankPosteriorTail(m, k, n) {
  if (n < m) return 1;
  let p = 1; for (let j = 0; j < k - 1; j++) p *= (m - 1 - j) / (n - j);
  return p;
}
export function tankPosteriorMedian(m, k) {
  if (k < 2) return null;
  let n = m; while (tankPosteriorTail(m, k, n) > .5 && n < 1e7) n++;
  return n;
}
export function tank(s) {
  const { N = 100, k = 5, runs = 0, seed = 1 } = s;
  integer(N, 2, 2000, 'N'); integer(k, 1, N, 'k'); integer(runs, 0, 10000, 'runs');
  const next = rng(seed), sample = permutation(N, next).slice(0, k).sort((a,b) => a-b), m = sample.at(-1);
  const estimate = m * (1 + 1 / k) - 1, estimates = [], maxima = [];
  const names = ['max', 'unbiased', 'mean', 'bayes', 'median'], tot = names.map(() => ({ sum: 0, sq: 0, n: 0 }));
  for (let i = 0; i < runs; i++) {
    const draw = permutation(N, next).slice(0, k), mx = Math.max(...draw); maxima.push(mx); estimates.push(mx * (1 + 1 / k) - 1);
    const avg = draw.reduce((a, b) => a + b, 0) / k, vals = [mx, mx * (1 + 1 / k) - 1, 2 * avg - 1, tankPosteriorMean(mx, k), tankPosteriorMedian(mx, k)];
    vals.forEach((v, j) => { if (v !== null) { tot[j].sum += v; tot[j].sq += (v - N) ** 2; tot[j].n++; } });
  }
  const estimators = names.map((id, j) => ({ id, mean: tot[j].n ? tot[j].sum / tot[j].n : null, rmse: tot[j].n ? Math.sqrt(tot[j].sq / tot[j].n) : null,
    now: [m, estimate, 2 * sample.reduce((a, b) => a + b, 0) / k - 1, tankPosteriorMean(m, k), tankPosteriorMedian(m, k)][j] }));
  return { sample, m, estimate, upper: tankUpperBound(m, k), estimates, maxima, runs, estimators,
    observedMean: runs ? estimates.reduce((a,b) => a+b,0) / runs : null,
    expectedMaximum: k * (N + 1) / (k + 1), expectedEstimate: N,
    variance: (N + 1) * (N - k) / (k * (k + 2)) };
}

export function leadingDigits(x, digits = 1) {
  if (!Number.isFinite(x) || !x) return null;
  integer(digits, 1, 2, 'digits');
  // Decimal string handles tiny/subnormal numbers and exponent boundaries without log rounding.
  const text = Math.abs(x).toString().split('e')[0].replace('.', '').replace(/^0+/, '').padEnd(digits, '0');
  return Number(text.slice(0, digits));
}
export function benfordProbability(d, digits = 1) {
  integer(digits, 1, 2, 'digits'); integer(d, 10 ** (digits - 1), 10 ** digits - 1, 'digit');
  return Math.log10(1 + 1 / d);
}
export function benfordData(seed, count, mode = 'log') {
  integer(count, 0, 10000, 'count'); const next = rng(seed);
  if (mode === 'pow2') return Array.from({ length: Math.min(count, 1000) }, (_, i) => 2 ** (i + 1));
  if (mode === 'fib') { const f = [1, 2]; while (f.length < Math.min(count, 1000)) f.push(f.at(-1) + f.at(-2)); return f.slice(0, Math.min(count, 1000)); }
  if (mode === 'squares') return Array.from({ length: count }, (_, i) => (i + 1) ** 2);
  // Fictional shop with fixed "psychological" prices (a price list, not a measurement): few distinct values, chosen by people.
  if (mode === 'prices') { const list = [4.99, 9.99, 14.99, 19.99, 24.99, 29.99, 39.99, 49.99, 79.99, 99.99]; return Array.from({ length: count }, () => list[Math.floor(next() * list.length)]); }
  // A fictional forger who invents amounts: each leading digit drawn uniformly from 1 to 9, magnitude from 1 to 4 digits. A model of
  // "invented numbers", not a claim about how real people behave.
  if (mode === 'invented') return Array.from({ length: count }, () => (1 + Math.floor(next() * 9) + next() * .99) * 10 ** Math.floor(next() * 4));
  return Array.from({ length: count }, (_, i) => mode === 'identifiers' ? 1000 + i : mode === 'narrow' ? 80 + 10 * next() : mode === 'uniform' ? 1 + 999 * next() : 10 ** (6 * next() - 3));
}
export function benford(s) {
  const { seed = 1, count = 100, mode = 'log', digits = 1, scale = 1, values = null } = s;
  const xs = values || benfordData(seed, count, mode), start = 10 ** (digits - 1), bins = 9 * start;
  const counts = Array(bins).fill(0); let excluded = 0;
  for (const x of xs) { const d = leadingDigits(x * scale, digits); if (d === null) excluded++; else counts[d - start]++; }
  const n = xs.length - excluded, theory = counts.map((_, i) => benfordProbability(i + start, digits));
  const chiSquare = n ? counts.reduce((sum, c, i) => sum + (c - n * theory[i]) ** 2 / (n * theory[i]), 0) : null;
  return { values: xs, n, excluded, counts, theory, frequency: counts.map(c => n ? c / n : 0), chiSquare,
    chiSquareUsable: n > 0 && theory.every(p => n * p >= 5) };
}

export function normal(next) { return Math.sqrt(-2 * Math.log(Math.max(Number.MIN_VALUE, next()))) * Math.cos(2 * Math.PI * next()); }
export function normalCDF(x) {
  const t = 1 / (1 + .2316419 * Math.abs(x)), d = .3989422804014327 * Math.exp(-x*x/2);
  const tail = d * t * (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - tail : tail;
}
export function baker(s) {
  const { target = 1000, mean = 980, sigma = 20, noise = 5, n = 30, seed = 1, mode = 'random', runs = 0 } = s;
  integer(n, 1, 1000, 'n'); integer(runs, 0, 10000, 'runs');
  if (!(sigma > 0 && noise >= 0)) throw new RangeError('noise');
  const next = rng(seed), totalSD = Math.hypot(sigma, noise);
  const draw = () => { let x = mean + sigma * normal(next); if (mode === 'selected') for (let j = 0; j < 4; j++) x = Math.max(x, mean + sigma * normal(next)); return x + noise * normal(next); };
  const weights = Array.from({ length: n }, draw), average = weights.reduce((a,b) => a+b,0) / n, se = totalSD / Math.sqrt(n), z = (average - target) / se;
  let rejections = 0, coverage = 0;
  for (let r = 0; r < runs; r++) { let sum = 0; for(let j = 0;j < n;j++) sum += draw(); const av = sum / n; rejections += (av - target) / se < -1.6448536269514722; coverage += Math.abs(av - mean) <= 1.959963984540054 * se; }
  return { weights, average, se, z, p: normalCDF(z), ci: [average - 1.959963984540054*se, average + 1.959963984540054*se], runs, rejections, coverage,
    rejectRate: runs ? rejections / runs : null, coverageRate: runs ? coverage / runs : null, validIID: mode === 'random',
    power: normalCDF((target - mean) / se - 1.6448536269514722) };
}

export function birthdayProbability(n, days = 365, probabilities = null) {
  integer(n, 0, 1000, 'n'); integer(days, 1, 10000, 'days');
  if (n > days) return 1;
  if (!probabilities) { let no = 1; for (let j = 0; j < n; j++) no *= (days - j) / days; return 1 - no; }
  if (probabilities.length !== days || probabilities.some(p => !Number.isFinite(p) || p < 0) || Math.abs(probabilities.reduce((a,b)=>a+b,0)-1)>1e-10) throw new RangeError('distribution');
  // q[j] = j! e_j(p_1,...,p_i); stable without factorial overflow.
  const q = Array(n + 1).fill(0); q[0] = 1;
  for (let i = 0; i < days; i++) for (let j = Math.min(n, i + 1); j > 0; j--) q[j] += j * probabilities[i] * q[j-1];
  return Math.max(0, Math.min(1, 1 - q[n]));
}
export function birthdays(s) {
  const { n = 23, days = 365, mode = 'uniform', runs = 0, seed = 1 } = s;
  const probabilities = Array.from({ length: days }, (_,i) => mode === 'seasonal' ? (1 + .6 * Math.cos(2*Math.PI*i/days)) / days : 1 / days);
  let total = 0;
  const cumulative = probabilities.map(p => (total += p));
  const next = rng(seed), draw = () => {
    const u = next(); let lo = 0, hi = days - 1;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (u < cumulative[mid]) hi = mid; else lo = mid + 1; }
    return lo;
  };
  const sample = Array.from({ length: n }, draw); let hits = 0;
  for(let r=0;r<runs;r++){const seen = new Set(); let hit=false; for(let j=0;j<n;j++){const d=draw();if(seen.has(d))hit=true;seen.add(d);} hits += hit;}
  return { sample, duplicate: sample.length !== new Set(sample).size, hits, runs, frequency: runs ? hits/runs : null,
    probability: birthdayProbability(n, days, mode === 'uniform' ? null : probabilities), expectedPairs: n*(n-1)/2*probabilities.reduce((a,p)=>a+p*p,0) };
}

export function montyExact(host = 'informed', strategy = 'switch') {
  if (!['informed','random'].includes(host) || !['switch','stay'].includes(strategy)) throw new RangeError('rules');
  let eligible=0, wins=0;
  for(let prize=0;prize<3;prize++)for(let choice=0;choice<3;choice++){
    const doors=[0,1,2].filter(d=>d!==choice&&(host==='random'||d!==prize));
    for(const opened of doors){const w=1/9/doors.length;if(opened===prize)continue;eligible+=w;const final=strategy==='stay'?choice:[0,1,2].find(d=>d!==choice&&d!==opened);if(final===prize)wins+=w;}
  }
  return { probability: wins/eligible, eligibleProbability: eligible };
}
export function monty(s) {
  const { seed=1, choice=0, host='informed', strategy='switch', runs=0, opened=false }=s;
  const next=rng(seed), trial=(picked)=>{const prize=Math.floor(next()*3),doors=[0,1,2].filter(d=>d!==picked&&(host==='random'||d!==prize)),door=doors[Math.floor(next()*doors.length)];const final=strategy==='stay'?picked:[0,1,2].find(d=>d!==picked&&d!==door);return {prize,door,valid:door!==prize,win:final===prize,final};};
  const current=trial(choice);let eligible=0,wins=0;
  for(let r=0;r<runs;r++){const t=trial(Math.floor(next()*3));if(t.valid){eligible++;wins+=t.win;}}
  return {...current,choice,opened,runs,eligible,wins,frequency:eligible?wins/eligible:null,...montyExact(host,strategy)};
}

// Figures: pure data behind the pictures (the same seeds as the models above, so the picture and the numbers cannot disagree).
// P(collision) for n = 0..maxN in one pass: q[j] = j! e_j(p) is the probability that j people all differ.
export function birthdayCurve(days = 365, probabilities = null, maxN = 100) {
  integer(days, 1, 10000, 'days'); integer(maxN, 1, 1000, 'maxN');
  const q = Array(maxN + 1).fill(0); q[0] = 1;
  for (let i = 0; i < days; i++) { const p = probabilities ? probabilities[i] : 1 / days; for (let j = Math.min(maxN, i + 1); j > 0; j--) q[j] += j * p * q[j - 1]; }
  return q.map(x => Math.max(0, Math.min(1, 1 - x)));
}
export const birthdayThreshold = curve => curve.findIndex(p => p >= .5);
// The two clouds of loaves: weighed at random, and keeping the heaviest of five. Same seed, same n.
export function bakerClouds(s) {
  const a = baker({ ...s, mode: 'random', runs: 0 }), b = baker({ ...s, mode: 'selected', runs: 0 });
  return { random: a.weights, selected: b.weights, meanRandom: a.average, meanSelected: b.average, shift: b.average - a.average };
}
// Many Monty Hall games with the cumulative wins of the two strategies among the games where a goat was revealed.
export function montyTally(seed, runs, host = 'informed') {
  integer(runs, 0, 10000, 'runs');
  const next = rng(seed), eligible = new Uint32Array(runs), sw = new Uint32Array(runs), st = new Uint32Array(runs);
  let e = 0, a = 0, b = 0;
  for (let i = 0; i < runs; i++) {
    const prize = Math.floor(next() * 3), choice = Math.floor(next() * 3), doors = [0, 1, 2].filter(d => d !== choice && (host === 'random' || d !== prize)), opened = doors[Math.floor(next() * doors.length)];
    if (opened !== prize) { e++; if (choice === prize) b++; else a++; }
    eligible[i] = e; sw[i] = a; st[i] = b;
  }
  return { eligible, switchWins: sw, stayWins: st };
}
