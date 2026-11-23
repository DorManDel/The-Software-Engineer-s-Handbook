/**
 * Pure prime-number teaching engine. No DOM, storage, or arbitrary code execution.
 * "checks" counts actual integer remainder operations (n % divisor).
 */
export const MAX_PRIME_INPUT = 100000;

export const PRIME_STRATEGIES = Object.freeze({
  naive: {label: 'All divisors', time: 'O(n)', description: 'Test every possible divisor from 2 through n - 1.'},
  sqrt: {label: 'Square-root bound', time: 'O(√n)', description: 'Only test divisors up to the square root of n.'},
  wheel: {label: '6k ± 1', time: 'O(√n)', description: 'Handle 2 and 3, then test only 6k - 1 and 6k + 1 candidates.'}
});

const MAX_VISIBLE_CHECKS = 48;

/** Return a deterministic trace of the chosen trial-division strategy. */
export function analyzePrime(n, strategy = 'wheel') {
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX_PRIME_INPUT) {
    throw new RangeError('Enter a whole number between 0 and 100000.');
  }
  if (!Object.hasOwn(PRIME_STRATEGIES, strategy)) {
    throw new RangeError('Unknown prime-checking strategy.');
  }

  const trace = [];
  let checks = 0;
  const test = divisor => {
    const remainder = n % divisor;
    checks += 1;
    if (trace.length < MAX_VISIBLE_CHECKS) trace.push({divisor, remainder});
    return remainder === 0;
  };
  const result = divisor => ({
    n, strategy, prime: divisor === null && n >= 2, divisor, checks, trace,
    hiddenChecks: Math.max(0, checks - trace.length),
    time: PRIME_STRATEGIES[strategy].time, space: 'O(1)'
  });

  if (n < 2) return result(null);
  if (n <= 3) return result(null);

  if (strategy === 'naive') {
    for (let divisor = 2; divisor < n; divisor += 1) {
      if (test(divisor)) return result(divisor);
    }
  } else if (strategy === 'sqrt') {
    for (let divisor = 2; divisor <= Math.floor(n / divisor); divisor += 1) {
      if (test(divisor)) return result(divisor);
    }
  } else {
    if (test(2)) return result(2);
    if (test(3)) return result(3);
    // Test only numbers of the form 6k - 1 and 6k + 1.
    for (let divisor = 5; divisor <= Math.floor(n / divisor); divisor += 6) {
      if (test(divisor)) return result(divisor);
      // Matching the common C implementation: checking divisor + 2 here
      // can perform one harmless extra test above sqrt(n).
      if (test(divisor + 2)) return result(divisor + 2);
    }
  }
  return result(null);
}
