# Data & Algorithms Arsenal — Roadmap & Experiment Contract

Status: **Labs 001 and 002 implemented on a draft review branch, not published**. Target product: Engineering Codex (a discoverable learning track). The visualization/measurement core remains modular so ASCean, WebForge, MobiLab and future projects can reuse it. No direct coupling to ASCean's domain model or to private PCM data.

## Purpose

Learn with four successive depths:
1. **Intuition:** which problem does this technique solve, what assumptions does it need?
2. **Visual model:** inspect bytes, coordinates, cache-like accesses or network events step by step.
3. **Hands-on experiment:** change workloads, precision, distribution and hardware constraints; compare outcomes.
4. **Engineering transfer:** implement a small real benchmark, choose a design with stated uncertainty, and document rollback/failure conditions.

Every module needs a runnable playground, plain-English formula/diagram, real use cases, counterexample, explicit trade-off, accessibility and performance checks, and source references. Learning explanations can later be localized into Hebrew, with technical identifiers in English.

## First 12 experiments (teaching order, not implementation promise)

| ID | Area | Mechanic | What we change | What we learn | Transfer example |
| --- | --- | --- | --- | --- | --- |
| 001 | Encoding | Uniform quantization + fixed-point | Bits, value, axis width, decimal resolution | Actual error vs worst-case error; exact decimal grid; raw payload accounting | ASCean normalized organ landmarks; multiplayer coordinates |
| 002 | Memory | AoS vs SoA vs AoSoA | Entity count, field access pattern, data layout | Locality, iteration cost, update/insert cost, allocations | Fish transforms, Unity ECS, analytics |
| 003 | Spatial | Brute force vs spatial hash/grid vs quadtree | Density, neighbor radius, clustering, moving objects | Candidate counts, rebuild cost, boundary misses | Fish detection, collision, broadphase |
| 004 | Compression | RLE, delta, bit packing, dictionary coding | Entropy, repetition, smoothness, chunk size | Lossless ratios, decompression work, edge cases | Replay/snapshot storage |
| 005 | Encoding | Varint + ZigZag + binary schema | Signed values, distributions, fields, schema versions | Byte count, versioning, serialization compatibility | Network messages, telemetry |
| 006 | Caching | LRU/LFU/TTL | Request distribution, cache size, updates | Hit rate, invalidation, memory budgets | Asset/network request caching |
| 007 | Algorithms | Sorting, hashing, binary search | Dataset shape, mutations, access patterns | Time complexity vs constants and locality | Inventory, lookup tables |
| 008 | Graphs | BFS, Dijkstra, A* | Weights, obstacles, heuristics | Optimality and search work | Navigation and planning |
| 009 | Concurrency | Double buffering, message passing | Tick rate, consumers, contention | Consistency, latency, tearing, race risks | Simulation/render separation |
| 010 | Networking | Snapshots vs events, interpolation | Send rate, jitter, loss, drift | Bandwidth, consistency, prediction cost | Multiplayer entities |
| 011 | Distribution | Partitioning and replication | Shard count, failure rate, coordination | Availability, consistency, operational complexity | Distributed state and services |
| 012 | Workload | CPU vs GPU and batching | Batch size, transfer overhead, arithmetic intensity | Transfer overhead and parallelism constraints | Fish schooling and particle updates |

Later tracks: graph databases, B-trees/LSM trees, compression families (Huffman/LZ/Zstd), approximate data structures (Bloom filters, HyperLogLog), SIMD, ECS, lock-free structures, persistent/immutable data, CRDTs, job schedulers, GPU memory layouts.

## Trade-off Engine: decision contract

A claim such as "12-bit is faster" or "SoA is better" is **invalid without a workload and metric**.

Inputs:
- **Hard requirements:** max error/precision, accepted loss, max latency, throughput, determinism, platform, update pattern.
- **Workload:** entity count, data shape, reads/writes, query locality, density, update frequency.
- **Environment:** JS/TS or C/C++ or Unity; phone/desktop; CPU/GPU; memory and bandwidth budgets.
- **Candidate technique:** lossless/lossy, layout, encoding and indexing.

Outputs:
- Theoretical metrics with formulas and units, including worst-case bounds.
- Empirical metrics measured on this device if a real benchmark exists (never silently mix estimates with measurement).
- Pareto view of constraints vs cost; recommendations only if hard constraints are satisfied.
- Reasons, assumptions, uncertainty, where it *loses*, verification experiment and rollback path.
- Explicit `not evaluated` for dimensions without a valid model.

**Do not turn this into an ungrounded AI recommender.** First implement deterministic analyzers with tests and explainable formulas; later use AI to retrieve evidence and summarize options, never fabricate timings.

### Lab 001 model and boundaries

For normalized `x in [0,1]`, uniform `b`-bit nearest-level quantization uses
`q = round(x*(2^b-1))`, `x_hat=q/(2^b-1)`, `absolute_error=|x-x_hat|`.
The worst-case normalized error is `1/[2*(2^b-1)]`; for an axis of width `W`, the bound is `W/[2*(2^b-1)]` pixels. The *particular* error can increase from 8 to 12 bits due to differently aligned grids, despite the improving bound.

For exactly five **decimal** places on [0,1], store `round(100000*x)` as an integer from 0 to 100000, requiring `ceil(log2(100001))=17` bits. This is exact for five-place grid inputs but rounds arbitrary higher-precision input. 17-bit fixed-point is **not** the same as 17-bit uniform binary quantization.

Payload-only estimator: `ceil(N * coordinatesPerItem * bits / 8)` bytes. A 12-bit field in a normal 16-bit container saves **no** bytes unless fields are packed or transmitted efficiently. Production must include headers, alignment, IDs, validity masks, schema version, serialization overhead, packing CPU cost and network packet overhead. Float32 is four bytes per coordinate, but JS Number is ordinarily double precision; comparison must use real typed-buffer representation for an accurate memory benchmark.

### ASCean transfer without overengineering

1. Keep the anatomy editor's **canonical authoring coordinates in float precision** with stable organ identifiers and local/relative coordinate frames. For different fish shapes, model anatomical anchor frames or explicit deformation/constraints, not mere image rescaling.
2. Add quantization **only at a serialization/replication boundary** when there is a measured need. Preserve authoring originals separately and never repeatedly re-quantize already decoded coordinates.
3. Distinguish organism-local coordinates, world coordinates, rendering pixels and error budgets; changing fish width affects pixel error in the local coordinate direction.
4. A pinned organ should bind to a stable parent/anchor/constraint, not an accidental screen pixel.
5. Track schema version, exact units, bounds, round-trip error and backward compatibility; compare bit packing with native Float32/Uint16 buffer access under actual workload.
6. Keep sparse organs/metadata separate from dense simulation arrays if their access patterns differ. Choose AoS/SoA/AoSoA from measured iteration and mutation patterns.

## Engineering Codex integration

- Discoverable **Arsenal** navigation and homepage card inside the existing site (the educational source of truth).
- Each lab is a standalone static page and a pure calculation module; no network requests, backend or framework required for Lab 001.
- Use the existing Atelier R1 design tokens, glass material and native accessible controls. Honor mobile and reduced-motion.
- Keep a versioned public manifest in a later milestone: id, title, category, difficulty, prerequisites, actual test status, references, owner, implementation status.
- Keep implementation metadata (decisions, source SHA, screenshots, real device checks, blockers) in private PCM, referencing only reviewed public artifacts.

## Delivery gates

**M0 — Lab 001:** UI sliders and graph, same-value bit-depth comparisons, decimal fixed-point demo, payload-only trade-off model, unit tests, explicit deployment allowlist, no auto-publish. Test on 390/820/1512 widths and reduced-motion. Review math with boundary values [0,1] and "0.447" regression.

**M1 — Comparison harness:** shared scenarios and metrics; counters for allocations, bytes, operations, false positives, plus `performance.now()` benchmarks when implemented. Export JSON/CSV with test environment and method. Compare theory and measurement separately.

**M2 — Data structures & spatial:** AoS/SoA/AoSoA and spatial grid labs with visual byte maps and measured candidate/lookup counts. Include adversarial clustered and sparse distributions and real array allocation behavior.

**M3 — Codec lab:** implement bit pack/unpack, delta and RLE with verified byte-for-byte lossless round trips, benchmark encode/decode time and ratio; do not confuse code examples with production compressors.

**M4 — Trade-off decisions:** hard constraint filter, Pareto comparisons, explainable recommendations; scenario library for ASCean, multiplayer, WebForge and telemetry. Manual sign-off before a production architecture change.

**M5 — Learning and discovery:** tagged module registry, prerequisites and skill levels, knowledge map, progress that tracks `viewed / experimented / implemented / benchmarked` separately. Weekly candidate idea can be generated automatically, but review/test before publishing.

## Verification checklist

- Unit tests and math examples reproduce expected results.
- Accessibility: keyboard ranges, accessible labels, text alternatives and adequate contrast.
- Performance: avoid heavy animation loops; no false benchmark claims.
- CI validates allowlist, module syntax and basic lab structure.
- Manual QA: mobile Safari/Chrome + desktop, focus order, slider feel, overflow and responsive typography.
- Do not merge or deploy Atelier R1 or this lab without explicit user review.


## Implemented Lab 002 — Memory Layout Explorer

- AoS: one contiguous Float32Array buffer, three consecutive float32 fields per fish.
- SoA: three **separately allocated** Float32Array buffers, one per field. Offset zero restarts for each buffer; addresses are never inferred.
- AoSoA: one contiguous buffer; groups of `B` fish, with `B` x, then `B` y, then `B` health values. The final block explicitly allocates unused slots. `B` is a teaching parameter, not an automatically optimized block size.
- Interactive step-by-step physical offset trace for positions, all fields of one fish, and health scans.
- A deliberately specified 12-byte little-endian DataView overlay with x:float32 (+0), hp:uint8 (+4), explicit pad (+5..7), y:float32 (+8); this is **not** a promise about the layout of a platform C struct.
- Five-run local browser benchmark in which setup/allocations are excluded and checksums must agree. Timings are `performance.now()` measurements specific to one microbenchmark and device; export has schema, timestamp, data size, repeats, raw samples, median and checksum.
- Follow-up: implement actual bit packing and a cross-language C17 struct-layout investigation using `sizeof`, `_Alignof`, and `offsetof` across compilers/targets when reproducible environments are available. Do not imply JS can inspect true virtual addresses or CPU cache misses directly.

Acceptance gate before publication: GitHub CI, manual responsive and keyboard testing, reproducibility notes, and user-approved merge.
