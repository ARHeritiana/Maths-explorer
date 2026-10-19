// Pure maths of the experiment `fermat`: the numbers 2^e + 1 for e = 1, …, 32. Fermat numbers are those with e a power of 2
// (F0 = 3 to F5 = 2^32 + 1). Every value is below 2^53, so the arithmetic is exact. No DOM.
import { isPrime, smallestFactor, factor } from "./primes.js";

export const MAX_E = 32;
export const value = (e) => 2 ** e + 1;
export const isPowerOfTwo = (e) => e > 0 && (e & (e - 1)) === 0;

export function model(s) {
  const e = s.e, N = value(e);
  const p = smallestFactor(N);
  return {
    e, N, prime: isPrime(N), smallest: p, factors: factor(N),
    fermat: isPowerOfTwo(e), index: isPowerOfTwo(e) ? Math.log2(e) : null,
    primes: Array.from({ length: MAX_E }, (_, i) => isPrime(value(i + 1))),
    // Euler: a prime factor of F5 is 64k + 1
    k: (p - 1) / 64,
  };
}

export const quantities = {
  N: (s) => model(s).N,
  k: (s) => model(s).k,
};
export const quantity = (name, s) => quantities[name](s);
