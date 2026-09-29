# CLAMP submission evidence

Verified on 2026-09-29 against the integrated FastAPI + Kiln + Base Sepolia flow.

## Runtime components

- Kiln model in backend: `deepseek-v4.1-flash`
- Policy authority: deterministic Python policy engine
- Durable state: FastAPI + SQLite
- Chain: Base Sepolia
- ClampAudit v2: `0x4648520fe2b192791c9ae13e46e0cba9544c42d6`
- Deployer tx: `0xb7bfa077bad8fea9aecc679b7feba0429138a8983123dd2a0be1be9a6a2b8797`

## Live E2E flow evidence

### 1. ALLOW

Request: `Buy a keyboard from Amazon for $65.`

- Decision ID: `1a8f6582-d967-4793-8e83-d10f27d5f8b6`
- Final decision: `ALLOW`
- Matched rule: `all_checks_passed`
- Reason code: `POLICY_ALLOW`
- Base Sepolia tx: `0xc24d48229e85b34cb77b9410b9debba2d937ba7f076fea777be07baa3573de0b`
- Purchase request hash: `0xd905549d7a8aa354753a3315be42fd62d43ea51ce1507f3c08a29ea70acd10dd`

### 2. NEEDS_HUMAN -> approved -> ALLOW

Request: `Buy AirPods from Apple for $120.`

- Decision ID: `f803694e-a5ad-4ea2-b484-ebd7af40ee9e`
- Initial state: `NEEDS_HUMAN`
- Final decision after human approval: `ALLOW`
- Matched rule: `human_approval`
- Reason code: `HUMAN_APPROVED`
- Base Sepolia tx: `0xed1a99f1b0ed96fa1f9229321ff0eb388898a63e6584f7e25eb8717ce4da869b`
- Purchase request hash: `0x50e2d15bc81f0665d797817f843d8c178c3eea8afd47e19531f6908b0700dff7`

BaseScan verification observed: Success, block 47449214, value 0 ETH. This is an audit transaction, not a payment.

### 3. BLOCK

Request: `Buy a mouse from BestBuy for $20.`

- Decision ID: `382a08f7-9057-4431-9769-ebd0c776e397`
- Final decision: `BLOCK`
- Matched rule: `merchant_allowlist`
- Reason code: `MERCHANT_NOT_ALLOWED`
- Base Sepolia tx: `0xea0b454ebac7e5b6b43ad27d5af6ee5b1c6c60fe3b75e962d44635075caa41ef`
- Purchase request hash: `0x23ff6594cb2a4c2d42b1362d0a14278528e5b76876fc356ae95175bf1ef72e20`

## Budget invariant

E2E mandate:

- Mandate ID: `3d414b3d-f771-499a-9a1f-c83597a9fff1`
- Initial budget: $300
- ALLOW: $65
- Human-approved ALLOW: $120
- BLOCK: $20, no deduction
- Final remaining budget: $115

## Mandate receipt persistence and recovery

Persistence test mandate:

- Mandate ID: `43a7a098-47ff-4906-b556-6358287bd2b4`
- Base Sepolia tx: `0xa99d0ad8f8911d40a34276d3a7298866cd97019a8b3cf25eac78fe92bacb32ea`
- FastAPI persisted `blockchain_network = base-sepolia` and the same `tx_hash`
- Re-attaching the identical receipt returned HTTP 200
- Attempting to replace it with a different hash returned HTTP 409 and `Blockchain transaction is already attached`

## Final local verification

- Frontend production build: passed
- Backend tests: `12 passed`
- Lint: expected to be rerun after final copy-only cleanup before main merge
- Frontend unit tests: expected to be rerun after final copy-only cleanup before main merge

## Capture checklist for README / demo / submission

Capture these without exposing secrets:

1. Mandate detail showing persisted Base Sepolia tx and View on Basescan.
2. ALLOW decision receipt with deterministic rule/reason and BaseScan link.
3. Human review screen before approval, then approved ALLOW receipt.
4. BLOCK decision showing merchant allowlist failure and unchanged budget.
5. Metrics page showing real persisted Kiln calls, token totals, and average latency.
6. FastAPI `GET /api/decisions` showing non-null chain hashes for final decisions.
7. FastAPI `GET /api/mandates` showing persisted mandate chain receipt for the persistence-test mandate.
8. At least one BaseScan success page for each final flow.
9. Kiln evidence/log output showing the real model/API calls. Never include `KILN_API_KEY`.
10. Repository secret check: real `.env`, private key, session secret, and Kiln key must not be tracked.

## Accuracy boundaries

- CLAMP authorizes or blocks spend requests; it does not execute payment.
- The contract stores audit hashes/receipts, not payment settlement.
- FastAPI is authoritative for budgets and decision state.
- Current FastAPI records are not tenant-isolated.
- Human rejection and mandate revocation are not exposed by the current backend UI flow.
- The all-AI baseline is not measured and must remain labeled unavailable.
