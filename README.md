# Engineering Codex — The Software Engineer's Handbook

A source-traceable, expandable software engineering guide from university foundations to professional practice, with interactive educational labs.

**Status: Milestone 0.1 feature preview.** The public-safe curriculum and source inventory is imported, a browser-first learning shell is running, and the Terminal Academy and C Memory Explorer are instructional prototypes—not full language/operating-system emulators.

## Run locally

Python built-in server (no frontend dependencies):

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

PowerShell:

```powershell
py -m http.server 8000
# Open http://localhost:8000
```

Tests:

```bash
node --test tests/*.test.mjs
python3 scripts/validate.py
cc -std=c17 -Wall -Wextra -Wpedantic -Werror pilot/labs/pointer_demo.c -o /tmp/pointer_demo
/tmp/pointer_demo
```

## First preview features

- **Home:** responsive, accessible navigation for the emerging handbook.
- **Degree Explorer:** all **56 schedule entries** from the published Shenkar four-year B.Sc. curriculum, with year filters and search. Entries are not 56 unique courses and not evidence of personal completion.
- **Terminal Academy:** in-memory, allowlisted command simulator for Ubuntu/Linux and PowerShell, including modeled `wsl -l -v` and `wsl` transitions. Three guided missions use virtual filesystem-state checks rather than guessing based on typed text. No arbitrary code execution and no real WSL integration.
- **C Memory Explorer:** interactive symbolic pointer/value lesson with code preview and quiz.
- **Source Registry:** public sources with provenance; private Drive references stay out of the site.

## Educational architecture

`data/public` contains public sources and official curriculum only. `schemas/` defines the planned content types: evidence, course, topic, assignment and lab. `pilot/` contains an initial MDX chapter skeleton, C17 sample and lab design. `src/terminal-engine.mjs` isolates simulation from browser rendering so its behavior can be tested without a DOM.

**Boundary:** the Engineering Codex owns educational content. Private `ProjectContextManager` (PCM) owns project handoffs/decisions/tasks. Cross-link via immutable repo refs and reviewed metadata, never by exposing PCM catalogs or private academic records.

## Important limitations

1. This static web app has no runtime backend, accounts, language interpreter, integrated local WSL or cloud shell.
2. Simulated terminal files are reset with the session; commands are a curated subset and may differ from full Bash or PowerShell behavior.
3. The C memory addresses are illustrative; they are not machine addresses.
4. Public source links are metadata references, not permission to redistribute course PDFs or copy third-party teaching material.
5. The pilot C chapter is a draft requiring full technical review, reference checks, beginner tests and device testing before a production release.

## Progress & next steps

See `docs/PILOT_PLAN.md`, `docs/PCM_INTEGRATION.md`, and `docs/TERMINAL_ACADEMY.md`. The next learning module expands the virtual shell with process concepts (`fork`/`exec`/FDs) as *visual state machines*, followed by a controlled optional local companion for real WSL practice.

## Atelier R1 visual redesign (review branch)

A portfolio-inspired editorial redesign of the public teaching interface is proposed in `feat/portfolio-inspired-design-r1`. It uses a cool ocean palette, refined display typography, restrained frosted glass, a motion-reactive CSS sculpture, and accessible reduced-motion controls. The underlying terminal and pointer logic is unchanged. See `docs/ATELIER_DESIGN_R1.md` for design sources, performance boundaries and review gates. The live Pages site remains on `main` until explicit approval.


## Concentrated study plan and private academic progress

The curriculum explorer can show the official published Shenkar concentrated track (תשפ״ו): **11 semester schedules**, including summer in Years 1–3 and A/B in Year 4. It is a source-backed institutional schedule, *not* a student's transcript or confirmation of course completion.

The homepage also contains an **optional local-only academic credit meter**. To use it:
1. Create or obtain a **redacted** `engineering-codex-private-progress` version-1 JSON file.
2. Run the site on a trusted local server (`py -m http.server 8000`) or an environment whose hosting and scripts you trust.
3. Choose the file using **Choose private progress JSON**. The app parses it with `file.text()`; it does not upload it, send it to any server, store it in the repository or persist it in browser storage.
4. Use **Clear** to remove the imported data from the visible UI. A reload also resets the meter.

For safety, **do not import a real transcript or private progress file into an untrusted third-party preview**. The public repository intentionally contains **no personal transcripts, grades, student IDs or earned-credit totals**. The progress JSON must stay private and outside the repository.

The meter shows documented accumulated credits compared with a reference credit requirement. It is **not an official graduation eligibility check**. The old `Mark reviewed` tracker is retained as a separate learning/exploration metric.


## Data & Algorithms Arsenal · Lab 001 (review branch)

The first interactive educational module lives at `labs/quantization/index.html` and is linked from the homepage. It covers normalized coordinate quantization, actual vs worst-case error, five-place decimal fixed-point encoding, bit packing and a simple payload-only trade-off estimator. `src/quantization-engine.mjs` owns testable calculations; `src/quantization-lab.mjs` owns UI. All calculations are local in the browser. This is a teaching model, not a measured network or memory performance benchmark.

**Publication guard:** the build script includes this lab only in an explicit static-site allowlist. This branch is based on the unmerged Atelier R1 design branch; do not publish from `main` without separate visual/CI/device review.


## Data & Algorithms Arsenal · Lab 002 (review branch)

`labs/memory-layout/index.html` is a separate, cross-linked Memory Layout Explorer. AoS, SoA and AoSoA are modeled using **real Float32Array buffers** with reproducible per-field byte offsets, padding for incomplete AoSoA blocks, a step-by-step access trace and a separate 12-byte explicit little-endian DataView struct overlay. The byte diagrams are exact for these defined buffers but do **not** reveal native process addresses, CPU cache lines or a portable C ABI layout.

An opt-in local benchmark reads identical fields from all layouts using the same synthetic values. It runs five interleaved samples per candidate, reports the median time per full scan with a checksum and offers a downloadable JSON evidence record. Allocation, setup, real rendering and native C/C++ performance are out of scope. The results depend on this specific browser/device/workload; they are **not** performance guarantees. No benchmark data are uploaded or automatically saved.
