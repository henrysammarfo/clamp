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

Final Allow and Block receipts commit the complete backend `audit_payload` to Base Sepolia. Needs human receipts remain off chain until approval. Confirmed mandate and decision transaction hashes are persisted back to FastAPI. If a chain write succeeds but receipt persistence fails, the UI preserves the confirmed transaction hash and retries only the receipt sync; it never recreates the mandate or purchase decision. The backend currently exposes approval only, so human rejection and mandate revocation are disabled in the UI rather than implemented locally.

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

## Verified live E2E evidence

The integrated flow was exercised on Base Sepolia with real FastAPI decisions and Kiln parsing:

| Flow | Final result | Base Sepolia tx |
| --- | --- | --- |
| Amazon keyboard · $65 | ALLOW · `POLICY_ALLOW` | [`0xc24d4822…73de0b`](https://sepolia.basescan.org/tx/0xc24d48229e85b34cb77b9410b9debba2d937ba7f076fea777be07baa3573de0b) |
| Apple AirPods · $120 | NEEDS_HUMAN → human approval → ALLOW · `HUMAN_APPROVED` | [`0xed1a99f1…4da869b`](https://sepolia.basescan.org/tx/0xed1a99f1b0ed96fa1f9229321ff0eb388898a63e6584f7e25eb8717ce4da869b) |
| BestBuy mouse · $20 | BLOCK · `MERCHANT_NOT_ALLOWED` | [`0xea0b454e…aa41ef`](https://sepolia.basescan.org/tx/0xea0b454ebac7e5b6b43ad27d5af6ee5b1c6c60fe3b75e962d44635075caa41ef) |

The $300 E2E mandate finished with $115 remaining: the $65 ALLOW and approved $120 request committed budget, while the blocked $20 request did not.

Mandate receipt persistence was separately verified with [`0xa99d0ad8…b32ea`](https://sepolia.basescan.org/tx/0xa99d0ad8f8911d40a34276d3a7298866cd97019a8b3cf25eac78fe92bacb32ea). Re-attaching that exact receipt returned 200; attempting to replace it with a different hash returned 409.

See [`docs/SUBMISSION_EVIDENCE.md`](docs/SUBMISSION_EVIDENCE.md) for IDs, hashes, reproduction commands, and the final capture checklist.

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

1. Open the existing mandate and show its persisted Base Sepolia commitment.
2. Submit an allowed request and show the deterministic rule result plus its on-chain audit receipt.
3. Submit a request above the human approval threshold, approve it, then show the final ALLOW receipt.
4. Submit a disallowed merchant request and show BLOCK with no budget deduction.
5. Open Metrics to show persisted Kiln calls/tokens/latency, then open Audit trail and a BaseScan receipt.
6. State the boundary clearly: CLAMP records authorization decisions on-chain; it does not execute payment.

## Submit package

1. Public GitHub + this README
2. Demo video <= 3 min
3. Pitch PDF <= 10 pages
4. Google Form in the official window
