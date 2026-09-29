
## 2026-09-29 chain live

- Deployer: 0x9ADd0ac311e9E528800afc3F4A04e9cDe52C9cE0
- ClampAudit: 0xebf79a18105f43730d6b54fc53144499c8050287
- Deploy tx: 0x6c1bc4c64080e737a387ffb15a7e4fad3e41b06684f900ca35c00097e83e7d98
- Explorer: https://sepolia.basescan.org/address/0xebf79a18105f43730d6b54fc53144499c8050287
- Private key stays in local .env only. Rotate after the hack.

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
