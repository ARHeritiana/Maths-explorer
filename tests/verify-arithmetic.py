"""Reproducible independent checks for the arithmetic course, with exact integer arithmetic."""
import json,math,html
from fractions import Fraction
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def divisors(n):return [d for d in range(1,n+1) if n%d==0]
def euclid(a,b):
 while b:a,b=b,a%b
 return a
for a,b in [(84,126),(85,126),(180,252),(140,630),(120,150),(18,30),(210,462)]:
 enumeration=max(set(divisors(a))&set(divisors(b)))
 assert enumeration==euclid(a,b)==math.gcd(a,b)
for a in range(1,101):
 for b in range(1,101):assert euclid(a,b)==math.gcd(a,b)
for n in [1,2,97,121,157,161,221]:
 all_divisors=n>=2 and all(n%d for d in range(2,n))
 sqrt_test=n>=2 and all(n%d for d in range(2,math.isqrt(n)+1))
 assert all_divisors==sqrt_test
for k in range(-50,51):assert (2*k+1)**2%2==1 and (2*k+1+3)%2==0
for k in range(-10,11):
 for l in range(-10,11):assert ((2*k+1)+(2*l+1))%2==0
assert Fraction(140,630)==Fraction(2,9) and Fraction(-120,150)==Fraction(-4,5) and Fraction(210,462)==Fraction(5,11)
deck=json.loads((root/'content/slides/seconde-01.json').read_text())
code=next(s for s in deck['slides'] if s['k']=='code')
for language,name in [(0,'est_multiple'),(1,'is_multiple')]:
 ns={};exec(html.unescape(code['b'][language]),ns)
 for a in range(-15,16):
  for b in range(-15,16):
   expected=any(a==b*k for k in range(-50,51))
   assert ns[name](a,b) is expected,(language,a,b)
print('Arithmetic content verified: two GCD methods, prime tests, parity, fractions and 1,922 Python divisibility cases.')
