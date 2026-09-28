# CLAMP

A delegation control layer: temporary spending mandates for AI agents, with Allow, Block, or Needs human, plus an on chain audit trail of request, rule, decision, and reason.

Team 14 · GWDC 2026 Korea · Challenge B · FuriosaAI x Bricksum

## Honesty

- Henry ships live Base Sepolia mandate commits and decision receipts when chain env is set.
- Song owns Kiln parse or explain, the code gate, metering, and AuditTrail shape.
- If Song APIs are unwired, request evaluation and metrics fail closed. No fake Kiln calls. No mock pays. No invented tx hashes.
- Testnet is labeled. We do not claim the system is unhackable.

## Ownership

| Owner | Scope |
| --- | --- |
| Henry Sam Marfo | On chain receipts, frontend, sessions, metrics UI, demo, pitch, README |
| Song Hyewon | Kiln client, gate, metering, tests, AuditTrail shape |

## Stack

- TanStack Start + React 19 + Vite + Tailwind
- Signed httpOnly server sessions (no localStorage for product state)
- Tenant scoped server store
- Base Sepolia + `ClampAudit` via viem

## Setup

```bash
bun install
cp .env.example .env
# fill SESSION_SECRET (32+ chars)
# fill BASE_SEPOLIA_RPC_URL and BASE_SEPOLIA_PRIVATE_KEY
bun run compile:audit
bun run deploy:audit
# put returned address into CLAMP_AUDIT_ADDRESS
bun run dev
```

## Scripts

- `bun run dev` local app
- `bun run build` production build
- `bun run lint` lint
- `bun run test` unit tests
- `bun run compile:audit` compile Solidity
- `bun run deploy:audit` deploy ClampAudit to Base Sepolia

## Demo beat

1. Sign in to create a tenant session.
2. Create a mandate ($50, Amazon Apple Uber, office supplies). Confirm Basescan tx.
3. Open on a BestBuy request after Song wires the gate. Expect Block. Nothing paid.
4. Run an Amazon allow under the same mandate.
5. Show metrics when Song metering is wired.
6. Hand the audit trail to a second person.

## Prebuilt vs hackathon built

- UI shell and brand started in the Lovable TanStack template before and during the hack.
- Henry live session, tenant store, ClampAudit, route map, and fail closed Song contracts are hackathon built.
- Mark any further prebuilt assets in submit notes.

## Submit package

1. Public GitHub + this README
2. Demo video <= 3 min
3. Pitch PDF <= 10 pages
4. Google Form in the official window
