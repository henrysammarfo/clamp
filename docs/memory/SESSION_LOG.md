# Session log

## 2026-09-28 Henry live build

- Locked plan: Henry only, live Base Sepolia, fail closed Song contracts, no localStorage, plain copy with no hyphens in user facing text.
- Created memory docs, Cursor rules, clamp-gwdc-build skill.
- Overrode AGENTS.md fixture rule to live fail closed contract.
- Implemented server sessions, tenant store, ClampAudit, routes, marketing rewrite, README.
- RPC modules live in src/api/* because TanStack import protection blocks client imports from src/server/**.
- bun run test and bun run build pass.
- Chain smoke waits on BASE_SEPOLIA_RPC_URL and BASE_SEPOLIA_PRIVATE_KEY from Henry.
