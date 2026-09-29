
## 2026-09-29 chain audit and harden

- Audited v1: open writers, post revoke writes, outcome 0 ambiguity.
- Shipped ClampAudit v2 with owner/recorder ACL, revoke terminal state, outcomes 1..4.
- New address: 0x4648520fe2b192791c9ae13e46e0cba9544c42d6
- Live script `bun run audit:live` passed 10/10.
- See docs/memory/CHAIN_AUDIT.md. Private key stays in local .env only.

# Session log

## 2026-09-29 submit deadline confirm

- Final form: https://forms.gle/iiDRR7e3qbaXfetp7
- Organiser text: Deadline September 30 at 12:00 p.m. (noon), not midnight.
- Event clock is KST → Ghana GMT = **30 Sep 2026 03:00 AM**.
- After close: top three per ecosystem pitch that afternoon.

## 2026-09-28 Henry live build

- Locked plan: Henry only, live Base Sepolia, fail closed Song contracts, no localStorage, plain copy with no hyphens in user facing text.
- Created memory docs, Cursor rules, clamp-gwdc-build skill.
- Overrode AGENTS.md fixture rule to live fail closed contract.
- Implemented server sessions, tenant store, ClampAudit, routes, marketing rewrite, README.
- RPC modules live in src/api/* because TanStack import protection blocks client imports from src/server/**.
- bun run test and bun run build pass.
- Chain smoke waits on BASE_SEPOLIA_RPC_URL and BASE_SEPOLIA_PRIVATE_KEY from Henry.
