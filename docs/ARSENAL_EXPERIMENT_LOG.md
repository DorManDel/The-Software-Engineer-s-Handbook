# Arsenal Experiment Log — evidence, not guesses

This log tracks the **implementation and verification status**, not inferred performance.
Source branch: `feat/data-algorithms-arsenal-lab-001`
Review PR: https://github.com/DorManDel/The-Software-Engineer-s-Handbook/pull/3
Base branch: `feat/portfolio-inspired-design-r1` (unmerged review version).

## Current status

| ID | Experiment | Source implemented | Unit verification | Device/browser QA | Real measurements | Published to main |
| --- | --- | --- | --- | --- | --- | --- |
| 001 | Quantization and payload estimation | Yes, review branch | GitHub Actions | Not yet recorded | No on-device compression/throughput measurements | No |
| 002 | Memory Layout Explorer: AoS/SoA/AoSoA | Yes, review branch | GitHub Actions | Not yet recorded | User-triggered microbenchmark is implemented; **no captured device results yet** | No |
| 003 | Spatial Grid, Hash and Quadtree | Planned | Not started | Not started | None | No |
| 004 | Actual bit packing / RLE / delta codecs | Planned | Not started | Not started | None | No |

"Source implemented" and "unit verification" do not mean production-ready or fast. CI asserts byte layout and numerical correctness, not real device performance or visual quality.

## Lab 002 benchmark protocol

1. Record a concrete scenario before running: number of entities, scan pattern, AoSoA block size, scans per measurement, and target device/browser.
2. Let the lab create identical deterministic Float32 datasets for all three layouts. Its setup and allocation are outside the timer.
3. For each layout, warm up twice, then take **five measurements** (the order rotates across trials). Store the underlying samples and median milliseconds per *full scan*.
4. Check the expected checksum across layouts. Do not compare invalid results.
5. Use **Export results JSON** to preserve the exact session settings and sample times locally. These are not automatically uploaded or committed; never report hypothetical numbers as measured.
6. Repeat multiple runs on the target machine and compare variability, then test on a second device before generalizing. Take account of JIT behavior, dynamic clock, background apps, GC and timer noise.
7. A recommendation must state the access pattern, platform, observed timing range/median, memory bytes, missing costs (allocation/mutations), and a falsifiable alternative.

### Measurement result template

- Test date / local context:
- Commit / lab version:
- Device / OS / browser:
- Workload (positions / health / all fields):
- Entities / repeats / AoSoA block size:
- JSON evidence location:
- AoS median and spread: **Not measured**
- SoA median and spread: **Not measured**
- AoSoA median and spread: **Not measured**
- Buffer bytes and unused padding: derive from actual TypedArrays
- Scope limitations and anomalies:
- Proposed decision: **Undecided until evidence exists**

## Lab 001 reproducibility

The `x=0.447` regression demonstrates a larger **particular** reconstruction error at 12-bit than 8-bit, while its *worst-case bound* improves. This is a proven calculation with unit tests, **not** a runtime benchmark.

For `b` bits and axis length `W`:
- `encoded = round(x*(2^b-1))`
- `decoded = encoded/(2^b-1)`
- `maxPixelError = W/(2*(2^b-1))`

The ideal packed-byte estimate assumes no headers, IDs, alignment or serialization costs, and does **not** yet implement a real bit-packed codec. It must not be cited as measured network savings.

## Review and publishing gates

- [x] 001 quantization math and pure tests
- [x] 002 offset/padding/trace model and pure tests
- [x] Native C17 struct layout probe (output varies by ABI; no fixed assertion)
- [x] Public Pages allowlist entries included
- [x] CI automated tests and syntax checks (confirm the most recent commit's run)
- [ ] Browser interaction smoke test with a visual preview
- [ ] Phone responsive test and keyboard/screen-reader checks
- [ ] Capture and export repeatable measured results from target device
- [ ] Review and approve merging the underlying Atelier R1 base
- [ ] Review and approve merging the Arsenal PR to production

**Status vocabulary:** planned → implemented (draft) → CI verified → device verified → measured → approved → published.
Avoid skipping stages or reporting numbers as if they were measured.
