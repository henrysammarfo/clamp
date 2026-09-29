
## 2026-09-29 submit split locked with Song

Song keeps product improvements: human reject/revoke, purpose controls, benchmark, Base verification, final docs, final branch name, verified tx links.

Henry owns submit package:
- pitch deck draft (`docs/submit/PITCH_DECK.md`)
- demo video script (`docs/submit/DEMO_VIDEO_SCRIPT.md`)
- submit checklist/form (`docs/submit/SUBMIT_CHECKLIST.md`)
- booth pitch + Q and A (`docs/submit/BOOTH_PITCH_QA.md`)

Personal note: Song is open to talking more outside the code after the grind. Keep it calm and respectful.

## 2026-09-29 Song live E2E success

Song confirmed recorder access, funded her Base Sepolia wallet, and completed live E2E:

- Mandate creation committed on Base Sepolia
- Amazon $65 → ALLOW → on chain receipt confirmed
- Apple $120 → NEEDS_HUMAN → approved → ALLOW → on chain receipt confirmed
- BestBuy $20 → BLOCK → on chain audit receipt confirmed
- FastAPI `/api/decisions` shows real `base-sepolia` tx hashes for final decisions
- Budget state correct after reload (reported $300 total context)

Architecture in use: React UI → thin TanStack adapters → FastAPI → ClampAudit v2 → confirmed tx → FastAPI `/chain`.

## 2026-09-29 Song integration confirmations

- Song accepted GitHub invite and is integrating FastAPI as source of truth.
- Target: React UI -> thin TanStack adapters -> FastAPI -> Base Sepolia -> confirmed hash -> FastAPI /chain.
- Henry confirms: keep UI + ClampAudit v2; Song owns policy/store/budget; pause conflicting Henry edits on those files while she wires.
- setRecorder(Song `0x84e71c088A5254F13650682aD9E4d751B57Ac43e`, true) confirmed: tx `0xe60dc24086c22c27a323bd24b21e9acc2e0f3038286922b81a87e1b79c6565c9`.
- Critical: v2 outcomes are 1..4, not 0..3.

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
