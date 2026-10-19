// Pure maths of the experiment `euler-primes`: the polynomial f(n) = n² + n + c for Euler's lucky numbers c (2, 3, 5, 11, 17,
// 41), prime for n = 0, …, c − 2 and composite at n = c − 1, where f(c − 1) = c². No DOM.
import { isPrime, smallestFactor } from "./primes.js";

export const LUCKY = [2, 3, 5, 11, 17, 41];
export const CELLS = 60;   // the grid shows n = 0, …, 59

export const f = (c, n) => n * n + n + c;

export function model(s) {
  const { c, n } = s, value = f(c, n);
  const primes = Array.from({ length: CELLS }, (_, k) => isPrime(f(c, k)));
  const firstComposite = primes.indexOf(false);
  return {
    c, n, value, prime: isPrime(value), factor: smallestFactor(value),
    primes, firstComposite, root: Math.sqrt(value),
    // how long the run of primes lasts before n
    run: primes.slice(0, n + 1).every(Boolean),
  };
}

export const quantities = {
  value: (s) => model(s).value,
  root: (s) => model(s).root,
};
export const quantity = (name, s) => quantities[name](s);
