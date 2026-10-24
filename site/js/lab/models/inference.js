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
export function secretary(s) {
  const { n = 20, skip = 7, runs = 0, seed = 1, interview = 1, accepted = -1 } = s;
  integer(n, 1, 2000, 'n'); integer(runs, 0, 10000, 'runs');
  const r = Math.max(0, Math.min(n - 1, Math.round(skip))), next = rng(seed);
  const order = permutation(n, next), seen = order.slice(0, Math.min(n, interview));
  let hits = 0;
  for (let i = 0; i < runs; i++) { const a = permutation(n, next); hits += a[secretarySelection(a, r)] === n; }
  return { order, seen, relative: seen.map(x => 1 + seen.filter(y => y > x).length),
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
export function tank(s) {
  const { N = 100, k = 5, runs = 0, seed = 1 } = s;
  integer(N, 2, 2000, 'N'); integer(k, 1, N, 'k'); integer(runs, 0, 10000, 'runs');
  const next = rng(seed), sample = permutation(N, next).slice(0, k).sort((a,b) => a-b), m = sample.at(-1);
  const estimate = m * (1 + 1 / k) - 1, estimates = [], maxima = [];
  for (let i = 0; i < runs; i++) { const mx = Math.max(...permutation(N, next).slice(0, k)); maxima.push(mx); estimates.push(mx * (1 + 1 / k) - 1); }
  return { sample, m, estimate, upper: tankUpperBound(m, k), estimates, maxima, runs,
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
