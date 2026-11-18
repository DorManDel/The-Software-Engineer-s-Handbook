#!/usr/bin/env python3
"""Build the public GitHub Pages artifact using an explicit, auditable allowlist.

Never publish the entire repository root: private drafts or added files can leak.
"""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
ALLOWLIST = (
    "index.html",
    "styles.css",
    "src/app.mjs",
    "src/terminal-engine.mjs",
    "src/quantization-engine.mjs",
    "src/quantization-lab.mjs",
    "labs/quantization/index.html",
    "labs/quantization/lab.css",
    "src/memory-layout-engine.mjs",
    "src/memory-layout-lab.mjs",
    "labs/memory-layout/index.html",
    "labs/memory-layout/lab.css",
    "data/public/official_curriculum.json",
    "data/public/concentrated_curriculum_5786.json",
    "data/public/public_sources.json",
)

def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for rel in ALLOWLIST:
        path = ROOT / rel
        if not path.is_file():
            raise FileNotFoundError(f"Missing public site dependency: {rel}")
        target = OUT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
    (OUT / ".nojekyll").write_text("", encoding="utf-8")

    published = {x.relative_to(OUT).as_posix() for x in OUT.rglob("*") if x.is_file()}
    expected = set(ALLOWLIST) | {".nojekyll"}
    if published != expected:
        raise AssertionError(f"Unexpected public artifact files: {published ^ expected}")
    for candidate in published:
        if "private" in candidate.lower() or candidate.startswith("docs/") or candidate.startswith("pilot/"):
            raise AssertionError(f"Forbidden public output: {candidate}")
    print(f"PASS: only {len(published)} allowlisted public files are included in _site")

if __name__ == "__main__":
    try:
        build()
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise
