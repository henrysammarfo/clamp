# CLAMP

A delegation control layer: temporary spending mandates for AI agents, with Allow, Block, or Needs human, plus an on chain audit trail of request, rule, decision, and reason.

Team 14 · GWDC 2026 Korea · Challenge B · FuriosaAI x Bricksum

## Honesty

- FastAPI is the source of truth for Kiln parsing, deterministic policy, budgets, mandates, decisions, metrics, audit payloads, and confirmed transaction hashes.
- TanStack is a server-side adapter and UI. It does not calculate policy or budgets and does not store mandate or decision state.
- No fake Kiln calls. No mock pays. No invented transaction hashes.
- Testnet is labeled. We do not claim the system is unhackable.

## Ownership

| Owner           | Scope                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Henry Sam Marfo | On chain receipts, frontend, sessions, metrics UI, demo, pitch, README |
| Song Hyewon     | Kiln client, gate, metering, tests, AuditTrail shape                   |

## Stack

- TanStack Start + React 19 + Vite + Tailwind
- Signed httpOnly server sessions (no localStorage for product state)
- FastAPI + SQLite authoritative persistence
- Base Sepolia + access-controlled `ClampAudit` v2 via viem

Final Allow and Block receipts commit the complete backend `audit_payload` to Base Sepolia. Needs human receipts remain off chain until approval. The backend currently exposes approval only, so human rejection and mandate revocation are disabled in the UI rather than implemented locally.

## Live Base Sepolia

Hardened ClampAudit v2 uses access-controlled writers, a terminal revoke state, and outcome codes 1 through 4:

- Deployer and owner: `0x9ADd0ac311e9E528800afc3F4A04e9cDe52C9cE0`
- ClampAudit v2: [`0x4648520fe2b192791c9ae13e46e0cba9544c42d6`](https://sepolia.basescan.org/address/0x4648520fe2b192791c9ae13e46e0cba9544c42d6)
- Deploy tx: [`0xb7bfa077bad8fea9aecc679b7feba0429138a8983123dd2a0be1be9a6a2b8797`](https://sepolia.basescan.org/tx/0xb7bfa077bad8fea9aecc679b7feba0429138a8983123dd2a0be1be9a6a2b8797)
- Live invariant script: `bun scripts/audit-clamp-live.ts`
- Audit notes: [`docs/memory/CHAIN_AUDIT.md`](docs/memory/CHAIN_AUDIT.md)

The configured private key must belong to the owner or an address approved through `setRecorder`.

Current receipt outcomes:

- Allow: `1`
- Block: `2`
- Needs human: not recorded until approval
- Approved Needs human: Allow, `1`

## Setup

```bash
bun install
cp .env.example .env
# fill SESSION_SECRET (32+ chars)
# set FASTAPI_BASE_URL (defaults to http://127.0.0.1:8000)
# fill BASE_SEPOLIA_RPC_URL
# set BASE_SEPOLIA_PRIVATE_KEY to the owner or an approved recorder
# CLAMP_AUDIT_ADDRESS must be 0x4648520fe2b192791c9ae13e46e0cba9544c42d6
bun run dev
```

## Scripts

- `bun run dev` local app
- `bun run build` production build
- `bun run lint` lint
- `bun run test` unit tests
- `bun run compile:audit` compile Solidity
- `bun run deploy:audit` deploy a new ClampAudit contract
- `bun run audit:live` audit the configured live contract

## Demo beat

1. Sign in to create a server session.
2. Create a mandate and confirm the v2 `MandateCommitted` event on BaseScan.
3. Submit a disallowed merchant request. FastAPI returns Block and nothing is paid.
4. Submit an allowed request under the same mandate.
5. Show persisted Kiln metrics from FastAPI. The all AI baseline is unavailable until measured.
6. Hand the audit trail to a second person.

## Submit package

1. Public GitHub + this README
2. Demo video <= 3 min
3. Pitch PDF <= 10 pages
4. Google Form in the official window
