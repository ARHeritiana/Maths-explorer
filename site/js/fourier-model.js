import {MADAGASCAR,heart,star,resample,fourier} from './gallery-math.js';
// Pure, period-one Fourier models. Continuous coefficients and sampled DFTs are deliberately distinct.
export const TAU = 2 * Math.PI;
export const SIGNALS = ['square', 'saw', 'triangle', 'mixture'];
export function signal(kind, t) {
  t = ((t % 1) + 1) % 1;
  if (kind === 'square') return t === 0 || t === .5 ? 0 : t < .5 ? 1 : -1;
  if (kind === 'saw') return t === 0 ? 0 : 2 * t - 1;
  if (kind === 'triangle') return 1 - 4 * Math.abs(t - .5);
  return .6 * Math.cos(TAU * t) + .8 * Math.sin(2 * TAU * t);
}
// f = a0/2 + sum(an cos(2πnt) + bn sin(2πnt)); explicit coefficients avoid quadrature at jumps.
export function coefficient(kind, n) {
  if (!n) return {a: 0, b: 0};
  if (kind === 'square') return {a: 0, b: n % 2 ? 4 / (Math.PI * n) : 0};
  if (kind === 'saw') return {a: 0, b: -2 / (Math.PI * n)};
  if (kind === 'triangle') return {a: n % 2 ? -8 / (Math.PI ** 2 * n ** 2) : 0, b: 0};
  return {a: n === 1 ? .6 : 0, b: n === 2 ? .8 : 0};
}
export function partial(kind, N, t, fejer = false) {
  let sum = coefficient(kind, 0).a / 2;
  for (let n = 1; n <= N; n++) {
    const {a, b} = coefficient(kind, n), weight = fejer ? 1 - n / (N + 1) : 1;
    sum += weight * (a * Math.cos(TAU * n * t) + b * Math.sin(TAU * n * t));
  }
  return sum;
}
export function energy(kind) { return kind === 'triangle' || kind === 'saw' ? 1 / 3 : kind === 'mixture' ? .5 : 1; }
export function errorEnergy(kind, N, fejer = false) {
  let captured = 0, adjustment = 0;
  for (let n = 1; n <= N; n++) {
    const {a,b} = coefficient(kind,n), e = (a*a+b*b)/2;
    captured += e;
    if (fejer) adjustment += e * (n/(N+1)) ** 2;
  }
  return Math.max(0, energy(kind) - captured + adjustment);
}
// Numerical correlation: 2∫ f(t) cos/sin(2πnt)dt, midpoint quadrature over [0,1].
export function correlate(kind, n, steps = 4096) {
  let a=0,b=0;
  for(let j=0;j<steps;j++){const t=(j+.5)/steps,f=signal(kind,t);a+=f*Math.cos(TAU*n*t);b+=f*Math.sin(TAU*n*t);}
  return {a:2*a/steps,b:2*b/steps};
}
export function reconstruct(coeffs, t, count = coeffs.length) {
  let x=0,y=0;
  for(const c of coeffs.slice(0,count)){const a=TAU*c.k*t; x+=c.re*Math.cos(a)-c.im*Math.sin(a);y+=c.re*Math.sin(a)+c.im*Math.cos(a);}
  return [x,y];
}
export function sampleError(coeffs, count) { return coeffs.slice(count).reduce((s,c)=>s+c.amp*c.amp,0); }
export function alias(k, M) { return ((k % M) + M) % M; }

let cachedKey='',cachedOutline=null;
export function outline(s){
 const key=JSON.stringify([s.shape,s.custom]);if(key===cachedKey&&cachedOutline)return cachedOutline;
 const raw=s.shape==='custom'?(s.custom||MADAGASCAR):s.shape==='heart'?heart(160):s.shape==='star'?star(160):MADAGASCAR;
 let points=resample(raw,128);const mx=points.reduce((a,p)=>a+p[0]/128,0),my=points.reduce((a,p)=>a+p[1]/128,0);
 const size=Math.max(...points.map(p=>Math.abs(p[0]-mx)),...points.map(p=>Math.abs(p[1]-my)),1);
 points=points.map(p=>[(p[0]-mx)*10/size,(p[1]-my)*10/size]);
 cachedKey=key;cachedOutline={points,coefficients:fourier(points)};return cachedOutline;
}
export function outlineRMS(s){return Math.sqrt(sampleError(outline(s).coefficients,s.count));}
