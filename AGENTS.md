# Design lab collaboration

Scope: this standalone static design repository. Do not modify the Android repository.

- Preserve the original palette and confirmed decisions in poverkadoma-design-ideas.json / poverkadoma-design-rules.json.
- Work only in the assigned worktree and branch: codex/design-<task-id>-<slug>. Check the current branch before edits.
- Workers edit and commit only source files and task-specific QA. Do not commit generated previews, QA reports, distribution files, manifests or queue changes. Report base SHA, task commit SHA, files changed, checks and limitations.
- Integration agent exclusively owns the queue, codex/design-integration, main, rebuilds and publication. Integrate one worker at a time; preserve unrelated work and resolve semantic conflicts deliberately.
- Before integration and immediately before push, fetch origin/main and inspect unexpected changes. Push fast-forward updates only. Never force-push.
- Run node build-site.cjs for the complete existing QA and portable root deployment. DOM tests do not verify real browser geometry.
- Do not use the old REST publisher for branch integration. Publish checked Git commits to main, wait for Pages built at that SHA and compare deployed files with local SHA256.
- New directories/worktrees require explicit user approval for exact paths. Only the three recorded workspace paths are currently approved. No recursive removal.
- Never add raw Confluence exports, credentials, auth tools, sessions or unrelated files. No credentials in URLs or logs.

Shared generated tracked files are integration-owned: index.html, site.css, site.js, data.js, README.txt, deployment-state.json, poverkadoma-design-site-manifest.json, poverkadoma-verifier-qa.json, poverkadoma-design-site-qa.json. Local current preview/data intermediates and ZIP are ignored. Historical experimental HTML snapshots are source inputs; do not confuse them with generated current previews.
