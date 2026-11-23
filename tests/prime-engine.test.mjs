import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePrime, MAX_PRIME_INPUT} from '../src/prime-engine.mjs';

test('known primes and composites are recognized by all strategies', () => {
  for (const strategy of ['naive', 'sqrt', 'wheel']) {
    for (const n of [0, 1, 4, 6, 9, 25, 49, 121, 100]) {
      assert.equal(analyzePrime(n, strategy).prime, false, `${strategy}: ${n}`);
    }
    for (const n of [2, 3, 5, 7, 11, 29, 97, 9973]) {
      assert.equal(analyzePrime(n, strategy).prime, true, `${strategy}: ${n}`);
    }
  }
});

test('optimized strategies agree with naive strategy for the first 2000 integers', () => {
  for (let n = 0; n <= 2000; n++) {
    const expected = analyzePrime(n, 'naive').prime;
    assert.equal(analyzePrime(n, 'sqrt').prime, expected, `sqrt: ${n}`);
    assert.equal(analyzePrime(n, 'wheel').prime, expected, `wheel: ${n}`);
  }
});

test('97 takes 95 / 8 / 4 remainder operations', () => {
  assert.equal(analyzePrime(97, 'naive').checks, 95);
  assert.equal(analyzePrime(97, 'sqrt').checks, 8);
  assert.equal(analyzePrime(97, 'wheel').checks, 4);
  assert.deepEqual(analyzePrime(97, 'wheel').trace.map(x => x.divisor), [2, 3, 5, 7]);
});

test('stop immediately upon finding a divisor', () => {
  const result = analyzePrime(25, 'wheel');
  assert.equal(result.divisor, 5);
  assert.equal(result.checks, 3);
  assert.deepEqual(result.trace.map(x => x.divisor), [2, 3, 5]);
});

test('bad input and invalid strategy are rejected', () => {
  for (const n of [-1, 1.5, NaN, MAX_PRIME_INPUT + 1, Infinity]) {
    assert.throws(() => analyzePrime(n), RangeError);
  }
  assert.throws(() => analyzePrime(97, 'no-such-strategy'), RangeError);
});

test('large runs bound the displayed trace without losing operation totals', () => {
  const result = analyzePrime(99991, 'naive');
  assert.equal(result.prime, true);
  assert.equal(result.checks, 99989);
  assert.equal(result.trace.length, 48);
  assert.equal(result.hiddenChecks, result.checks - 48);
});
