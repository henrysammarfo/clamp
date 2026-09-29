# CLAMP

**Give AI spending authority without giving up control.**

CLAMP is an **authorization and audit control plane for AI agents that spend**. A human delegates a narrow, temporary mandate—purpose category, budget, merchant allowlist, currency, expiry, approval threshold, and revocation—and the system enforces that mandate before an AI agent can proceed.

Team 14 · GWDC 2026 Korea · Challenge B · FuriosaAI × Bricksum

## What CLAMP does

CLAMP separates interpretation from authorization:

1. **Kiln interprets** a natural-language purchase request into structured fields such as merchant, amount, currency, item, and purpose category.
2. **Deterministic Python policy authorizes** the request with a fixed rule order. The LLM never grants permission.
3. **Humans handle exceptions** through explicit approval or rejection when a request crosses the configured threshold.
4. **Base Sepolia records final authorization receipts** and mandate revocations in access-controlled ClampAudit v2.
5. **Verify on Base** reads contract state back and compares it with the local receipt.

A concrete enterprise-procurement example:

- Purpose category: `OFFICE`
- Budget: `$2,000`
- Allowed merchants: `Amazon, Apple`
- Human approval threshold: `$500`
- Expiry: Friday
- Revocable at any time

Then:

- `$60` keyboard from Amazon → **ALLOW**
- `$40` groceries from Amazon → **BLOCK / PURPOSE_NOT_ALLOWED**
- `$700` monitor from Apple → **NEEDS_HUMAN**
- Human reject → **BLOCK / HUMAN_REJECTED**
- Revoke mandate → future requests are **BLOCK / MANDATE_REVOKED**

## Product boundary

CLAMP controls **authorization** and records **audit evidence**.

It does **not**:

- execute payment,
- custody funds,
- prove that a purchase itself happened,
- prove that an AI model was correct,
- prove fairness,
- claim to be unhackable.

FastAPI + SQLite are authoritative for mandate, budget, and decision state. Base Sepolia provides a tamper-resistant audit record for committed mandate hashes, final decision hashes/outcomes, and revocation state.

## Architecture

```text
Natural-language purchase request
            |
            v
Kiln / Bricksum
(structured interpretation only)
            |
            v
Deterministic Python policy
revoked -> expired -> purpose -> merchant
-> budget -> currency -> human threshold -> allow
            |
       +----+----+
       |         |
       v         v
ALLOW/BLOCK   NEEDS_HUMAN
       |         |
       |    human approve/reject
       |         |
       +----+----+
            |
            v
Final audit receipt
            |
            v
TanStack server adapter
            |
            v
ClampAudit v2 on Base Sepolia
            |
            v
Read-back verification
```

### Stack

- TanStack Start + React 19 + Vite + Tailwind
- Signed httpOnly demo session; no browser storage for product state
- FastAPI + SQLite authoritative persistence
- Kiln / Bricksum model: `deepseek-v4.1-flash`
- Deterministic Python policy engine
- Base Sepolia + viem
- Access-controlled `ClampAudit` v2

### Current prototype boundaries

- The sign-in flow creates a signed demo session; it is not production identity verification.
- FastAPI records are not tenant-isolated in this hackathon prototype.
- `POST /api/decisions` is intentionally **not idempotent**. The UI disables double-submit and receipt recovery never recreates the purchase decision.
- Legacy mandates created before purpose-category enforcement remain readable with `purpose_category = null`; new mandates require a controlled purpose category.

## Deterministic policy

The fixed authorization order is:

| Priority | Condition | Result | Reason code |
| ---: | --- | --- | --- |
| 1 | Mandate revoked | BLOCK | `MANDATE_REVOKED` |
| 2 | Mandate expired | BLOCK | `MANDATE_EXPIRED` |
| 3 | Purpose category missing/mismatch | BLOCK | `PURPOSE_UNCLASSIFIED` / `PURPOSE_NOT_ALLOWED` |
| 4 | Merchant not allowed | BLOCK | `MERCHANT_NOT_ALLOWED` |
| 5 | Amount exceeds remaining budget | BLOCK | `BUDGET_EXCEEDED` |
| 6 | Currency mismatch | BLOCK | `CURRENCY_MISMATCH` |
| 7 | Amount >= human approval threshold | NEEDS_HUMAN | `HUMAN_APPROVAL_REQUIRED` |
| 8 | Otherwise | ALLOW | `POLICY_ALLOW` |

Purpose categories:

`OFFICE`, `SOFTWARE`, `TRAVEL`, `FOOD`, `TRANSPORT`, `MARKETING`, `PROFESSIONAL_SERVICES`, `OTHER`.

**Core rule:** the model interprets intent; deterministic code grants or denies authority.

## Human control lifecycle

- **Approve:** `NEEDS_HUMAN -> ALLOW / HUMAN_APPROVED`; budget is deducted exactly once.
- **Reject:** `NEEDS_HUMAN -> BLOCK / HUMAN_REJECTED`; budget is unchanged.
- **Revoke mandate:** `ACTIVE -> REVOKED`; revocation is recorded on Base Sepolia with outcome code `4`.
- After revocation, later purchase requests are deterministically blocked off-chain with `MANDATE_REVOKED`; no additional decision write is expected because the contract is already in terminal revoked state.

## Base Sepolia

Authoritative deployment:

- ClampAudit v2: [`0x4648520fe2b192791c9ae13e46e0cba9544c42d6`](https://sepolia.basescan.org/address/0x4648520fe2b192791c9ae13e46e0cba9544c42d6)
- Deploy tx: [`0xb7bfa077bad8fea9aecc679b7feba0429138a8983123dd2a0be1be9a6a2b8797`](https://sepolia.basescan.org/tx/0xb7bfa077bad8fea9aecc679b7feba0429138a8983123dd2a0be1be9a6a2b8797)
- Deployer / owner: `0x9ADd0ac311e9E528800afc3F4A04e9cDe52C9cE0`

Outcome codes:

- `1` = ALLOW
- `2` = BLOCK
- `3` = REVIEW
- `4` = REVOKE

Production CLAMP intentionally keeps pending `NEEDS_HUMAN` receipts off-chain until a person approves or rejects them.

### Verify on Base

Decision and mandate detail screens expose an explicit **Verify on Base** action. Verification recomputes the local hashes, reads `ClampAudit v2`, and compares:

- existence,
- mandate hash,
- outcome,
- revoked state where applicable,
- recorder / actor,
- recorded timestamp.

This verifies that the local audit receipt matches the stored contract state. It does not independently prove payment or the truth of the underlying purchase.

## Verified live E2E evidence

### Original integrated flow

| Flow | Final result | Base Sepolia tx |
| --- | --- | --- |
| Amazon keyboard · $65 | ALLOW · `POLICY_ALLOW` | [`0xc24d4822…73de0b`](https://sepolia.basescan.org/tx/0xc24d48229e85b34cb77b9410b9debba2d937ba7f076fea777be07baa3573de0b) |
| Apple AirPods · $120 | NEEDS_HUMAN → ALLOW · `HUMAN_APPROVED` | [`0xed1a99f1…4da869b`](https://sepolia.basescan.org/tx/0xed1a99f1b0ed96fa1f9229321ff0eb388898a63e6584f7e25eb8717ce4da869b) |
| BestBuy mouse · $20 | BLOCK · `MERCHANT_NOT_ALLOWED` | [`0xea0b454e…aa41ef`](https://sepolia.basescan.org/tx/0xea0b454ebac7e5b6b43ad27d5af6ee5b1c6c60fe3b75e962d44635075caa41ef) |

The $300 mandate finished with $115 remaining: only the $65 ALLOW and human-approved $120 request committed budget.

### Human reject

- Decision ID: `9d390e3d-73fc-43e5-8323-48ea99f62602`
- Final result: `BLOCK / HUMAN_REJECTED`
- Budget effect: **$0 deduction**
- Base Sepolia tx: [`0x810c0bcb…ec9258`](https://sepolia.basescan.org/tx/0x810c0bcb3fa199aba35c0fb2194db39de715529c79fca9be9d2bc2a630ec9258)

### Mandate revoke

- Mandate ID: `18e806d1-96f0-4ad0-979d-27584eea5abc`
- Mandate commit tx: [`0x50560b6e…dc2d5`](https://sepolia.basescan.org/tx/0x50560b6e46001980edd4db265b28faa550e61c48758b69719ecb15fbd20dc2d5)
- Revocation tx: [`0x9f83da2b…9e8d93`](https://sepolia.basescan.org/tx/0x9f83da2b89d060d42bfb72bffaec0456ef7e3f26dbea9741004d6860549e8d93)
- Post-revoke request: `BLOCK / MANDATE_REVOKED`
- Post-revoke decision tx: intentionally none; the already-recorded revocation is terminal on-chain.

### Purpose control

Purpose E2E mandate:

- Mandate ID: `0892a92a-8f7f-4b54-8166-ad6d6bca5e76`
- Purpose: `Office supplies and work equipment`
- Purpose category: `OFFICE`
- Initial budget: $200
- Mandate commit tx: [`0x894dd459…e0c903`](https://sepolia.basescan.org/tx/0x894dd4594e983953a00a32eebb458c93f6934a0cacbc6ea7c80b0ac841e0c903)

| Request | Kiln category | Result | Base Sepolia tx |
| --- | --- | --- | --- |
| Keyboard from Amazon · $20 · office work | OFFICE | ALLOW / `POLICY_ALLOW` | [`0xd76a371e…c3e4c1`](https://sepolia.basescan.org/tx/0xd76a371eb6bbc2a7693ccd14176bddaa7a0f7a338880fa56cd20750066c3e4c1) |
| Groceries from Amazon · $20 · dinner | FOOD | BLOCK / `PURPOSE_NOT_ALLOWED` | [`0x219a83a5…af99b3`](https://sepolia.basescan.org/tx/0x219a83a5815cea03eaf16874ec1cd10be213fddac4c2ae2f52bf687a58af99b3) |

Remaining budget after both requests: **$180**. The purpose-blocked $20 request did not deduct budget.

Live UI read-back verified the active mandate, the ALLOW decision, the purpose BLOCK decision, and the revoked mandate against ClampAudit v2. A pending $90 OFFICE request correctly showed `NOT_RECORDED` while waiting for human review.

## Adversarial benchmark

The checked-in benchmark uses **30 adversarial cases × 3 runs = 90 runs per approach** with the same Kiln model.

- **CLAMP:** Kiln interpretation + deterministic authorization.
- **All-AI baseline:** Kiln directly decides ALLOW / BLOCK / NEEDS_HUMAN from the mandate and request.

Measured results:

| Metric | CLAMP | All-AI |
| --- | ---: | ---: |
| Decision accuracy | 100.0% | 100.0% |
| Reason-code accuracy | 100.0% | 97.78% |
| Decision consistency | 100.0% | 100.0% |
| LLM calls | 90 | 90 |
| Total tokens | 38,420 | 69,053 |
| Average LLM latency | 3,945.99 ms | 4,225.56 ms |
| Malformed outputs | 0 | 0 |

In this benchmark, CLAMP **matched the all-AI baseline's 100% decision accuracy while using 44.4% fewer tokens**. The all-AI baseline produced the correct BLOCK decision but the wrong policy reason twice for `purpose_01`, returning `PURPOSE_UNCLASSIFIED` instead of `PURPOSE_NOT_ALLOWED`.

These results are specific to this benchmark set, model, and prompts; they are not a universal model-performance claim. Token count and latency are measured proxies for inference work, not direct energy measurements.

Reproduction details are in [`backend/benchmarks/README.md`](backend/benchmarks/README.md), and the measured artifacts are checked in under `backend/benchmarks/results/`.

## Verified test snapshot

Latest verified development snapshot:

- Backend: **25 passed**
- Frontend: **18 passed across 3 files**
- Lint: **0 errors**, 6 existing React Fast Refresh warnings
- Production build: **passed**
- `git diff --check`: **passed**
- Real benchmark: **180 Kiln calls completed**, no malformed outputs

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set KILN_API_KEY in backend/.env or export it in the shell.
uvicorn app.main:app --reload --port 8000
```

### 2. Web app + Base Sepolia

```bash
bun install
cp .env.example .env
# SESSION_SECRET: 32+ characters
# FASTAPI_BASE_URL=http://127.0.0.1:8000
# BASE_SEPOLIA_RPC_URL=<RPC URL>
# BASE_SEPOLIA_PRIVATE_KEY=<approved recorder key>
# CLAMP_AUDIT_ADDRESS=0x4648520fe2b192791c9ae13e46e0cba9544c42d6
bun run dev
```

Never commit or display `.env`, `KILN_API_KEY`, wallet private keys, session secrets, or RPC credentials.

## Useful commands

```bash
# backend tests
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest -q

# real Kiln smoke
python scripts/smoke_real.py

# benchmark pilot / full run
python scripts/benchmark_adversarial.py --runs 1
python scripts/benchmark_adversarial.py --runs 3

# frontend
cd ..
bun run lint
bun run test
bun run build

# live contract audit
bun run audit:live
```

## Recommended demo beat

1. Show an `OFFICE` procurement mandate with budget, merchants, threshold, expiry, and Base commitment.
2. Submit an OFFICE keyboard request → **ALLOW** → **Verify on Base: VERIFIED**.
3. Submit groceries at the same merchant/amount → Kiln classifies `FOOD` → deterministic **BLOCK / PURPOSE_NOT_ALLOWED** → **VERIFIED**.
4. Submit an OFFICE request above the human threshold → **NEEDS_HUMAN** → show intentional `NOT_RECORDED`.
5. Approve or reject from Human Review; final result is recorded on Base.
6. Revoke a mandate; verify `revoked = true` on Base and show future request `BLOCK / MANDATE_REVOKED`.
7. Open Metrics and show the measured 30 × 3 adversarial benchmark.
8. State the boundary: **CLAMP controls authorization and records audit evidence; it does not execute payment.**

## Submission evidence

See [`docs/SUBMISSION_EVIDENCE.md`](docs/SUBMISSION_EVIDENCE.md) for exact IDs, transaction hashes, verification evidence, benchmark results, and capture checklist.
