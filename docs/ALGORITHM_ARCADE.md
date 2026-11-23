# Algorithm Arcade / Language Explorer (incremental pilot)

## Purpose
Teach algorithmic problem solving using the same contract across challenges:
**problem -> constraints & examples -> brute force -> proof -> optimization ->
time/space analysis -> implementation -> tests -> playable visualization**.

This module extends the existing Engineering Codex shell. It does not replace the
terminal or memory labs, and it does not expose private PCM or course records.

## Pilot: Prime Detective (Challenge 001)
- Three strategies: naive (O(n)), square-root bound (O(sqrt(n))), and 6k +/- 1
  candidates (O(sqrt(n))).
- Trace of remainder operations, first divisor, and *worst-case* asymptotic
  complexity. The trace is capped in the UI, but the count is exact.
- Handles 0, 1, 2, 3, composites including 25/49/121, and primes.
- Integers 0..100000 only, to keep the teaching UI responsive.
- Additional algorithm storage is O(1); diagnostic trace/UI storage is separate.
- 6k +/- 1 is necessary for primes > 3, not sufficient. Always test divisibility.
- At loop end, the common paired 6k implementation might test i + 2 slightly
  beyond sqrt(n). This is a valid but redundant remainder check.

### Required reasoning exercises
1. Why do tests of divisibility by 2 and 3 alone miss 25 and 49?
2. Prove that a composite integer has a factor <= sqrt(n).
3. Derive residue classes mod 6; explain why only 1 and 5 remain as candidates.
4. Compare the three algorithms on n=97: 95, 8, and 4 remainder checks.
5. Explain the difference between a constant-factor speedup and a change in Big-O.

## Language Explorer (pilot seed)
Each language is a separate catalog entity keyed by stable ID. The catalog
distinguishes **reviewed prime example available** from **planned**. A language's
presence in the catalog does *not* imply it can execute in the browser.

Current examples: C17, Python 3, JavaScript.
Catalog-only: C++, TypeScript, C#, Java, COBOL, x86-64 Assembly, HTML, CSS.
HTML is markup and CSS is a stylesheet; these can be cross-referenced as
web technology but not treated as standalone general-purpose algorithm runners.

### Next milestones
1. Extract the language catalog, challenge data, examples, glossary terms,
   review state and source references into structured validated data files.
2. Multi-challenge library: palindrome, Two Sum, search, BFS/DFS, Snake.
3. Filter actual solution entries by language, concept, course, complexity
   and difficulty; show complete/partial/not-yet-available accurately.
4. Code-level side-by-side comparison; terminology linked to relevant tokens
   in each language, with runnable WSL recipes and tests.
5. COBOL + x86-64 examples only after compiler/assembler verification.
6. Separate sandboxed execution runner if needed; never blindly execute
   uploaded user code inside the GitHub Pages site or server.
7. Local progress tracking, optional export, responsive code stepping, and
   game-mechanics laboratory.

### Implementation boundaries
- src/prime-engine.mjs is a pure deterministic algorithm and can be tested in Node.
- src/algorithm-arcade.mjs is browser-only presentation and language filtering.
- App navigation is shared in src/app.mjs.
- scripts/build_pages.py must allowlist every newly published module.
- Public Pages bundles must not include docs/, pilot/, or private source data.
- Every new algorithm needs correctness cases, edge cases, complexity reasoning,
  and an explicit "simulated / copied / executed" distinction.
