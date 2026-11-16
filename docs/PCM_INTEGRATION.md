# Engineering Codex ↔ ProjectContextManager (PCM) boundary

The **Engineering Codex** is the canonical owner of public educational content, lesson metadata, its learning graphs, labs and optional learner progress. **PCM** is the private source of truth for project decisions, priorities, implementation evidence, checkpoints and work metrics.

## Stable identity
PCM slug: `engineering-codex`. A corresponding project in PCM is a registry entry only. It does not make PCM the Codex content backend.

## One-way-safe exchange
- Codex → PCM: repository URL, source commit, review status, CI/test evidence URLs, schema version, content/lesson counts (from actual build output), validated milestone status.
- PCM → Codex: only approved, non-sensitive project metadata through a filtered export; never raw catalog files, credentials, private decision logs, Drive source links or work-session ledgers.
- Cross-repo references are URLs + immutable revision hashes. No runtime dependency on PCM availability.
- Idempotency key: `engineering-codex:<event-type>:<source-sha-or-immutable-id>`.
- Publish gate: source → evidence map → interactive view → test → explicit approval → publish.

## Important permissions
`data/private/` is local inventory and excluded by `.gitignore`. It must never be committed to a public repository, copied into static assets, or sent to client bundles. Academic PDFs are not automatically public domain. A course PDF link may require logged-in access and does not grant redistribution rights.

## Example proposed checkpoint (not an emitted API event)
```json
{
  "event_id": "engineering-codex:checkpoint:m0-inventory-draft",
  "project_id": "engineering-codex",
  "kind": "checkpoint",
  "source": "manual_checkpoint",
  "status": "proposal",
  "observed_at": "2026-11-16",
  "evidence": ["official Shenkar curriculum", "GitHub repository listing", "Drive source metadata"],
  "target": "PCM reviewable PR, not production catalog"
}
```

## Quality gates before actual sync
1. Register project folder with source repo link once one exists.
2. Validate PCM `meta.json` and provenance conventions.
3. Open draft PR with checkpoint delta only; no private source inventory.
4. Merge/release only upon owner approval and successful checks.