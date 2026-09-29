# ClampAudit chain audit

Date: 2026-09-29  
Auditor role: Henry chain owner  
Network: Base Sepolia (84532)  
Honesty: This is hardened audit logging, not an unhackable system.

## Active contract (v2)

| Item             | Value                                                                           |
| ---------------- | ------------------------------------------------------------------------------- |
| Address          | `0x4648520fe2b192791c9ae13e46e0cba9544c42d6`                                    |
| Deploy tx        | `0xb7bfa077bad8fea9aecc679b7feba0429138a8983123dd2a0be1be9a6a2b8797`            |
| Owner / deployer | `0x9ADd0ac311e9E528800afc3F4A04e9cDe52C9cE0`                                    |
| Explorer         | https://sepolia.basescan.org/address/0x4648520fe2b192791c9ae13e46e0cba9544c42d6 |

### Approved recorders

| Address | Notes |
| --- | --- |
| `0x9ADd0ac311e9E528800afc3F4A04e9cDe52C9cE0` | Owner / Henry deployer |
| `0x84e71c088A5254F13650682aD9E4d751B57Ac43e` | Song FastAPI writer · setRecorder tx [`0xe60dc240…65c9`](https://sepolia.basescan.org/tx/0xe60dc24086c22c27a323bd24b21e9acc2e0f3038286922b81a87e1b79c6565c9) |

### Outcome mapping (v2, authoritative)

| Meaning | uint8 |
| --- | --- |
| unset | `0` |
| ALLOW | `1` |
| BLOCK | `2` |
| NEEDS_HUMAN / review | `3` |
| REVOKE | `4` |

Do **not** use v1 style `ALLOW=0, BLOCK=1, REVIEW=2, REVOKE=3`. That mapping is retired with v1.

## Superseded v1 (do not use)

| Item        | Value                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| Address     | `0xebf79a18105f43730d6b54fc53144499c8050287`                                      |
| Why retired | Anyone could write. Post revoke decisions allowed. Outcome 0 collided with unset. |

## Findings fixed in v2

1. **Open writer surface** — v1 had no access control. v2: only `owner` or `isRecorder`.
2. **Post revoke writes** — v1 allowed later decisions. v2 sets `revoked` on outcome 4 and rejects further writes.
3. **Outcome encoding** — v2 uses 1..4; storage zero means unset.
4. **Hash canonicalization** — the client deterministically canonicalizes the backend mandate/audit JSON, then hashes the UTF-8 canonical string with Keccak-256 via viem. Dynamic fields such as remaining budget are excluded from the mandate hash.
5. **Review outcome available but unused** — v2 reserves outcome 3 for review, but the current FastAPI flow keeps Needs human off chain until approval and then records outcome 1.
6. **Read after write** — client retries read back after mining to survive public RPC lag.
7. **ABI source of truth** — runtime ABI is compiled solc output, not a hand copied mismatch.

## Live verification (`bun scripts/audit-clamp-live.ts`)

All passed on 2026-09-29:

- bytecode present
- owner is deployer
- deployer is recorder
- stranger commit blocked
- commit readable
- outcome 0 blocked
- allow outcome = 1
- duplicate decision blocked
- revoke flags mandate
- post revoke blocked

## Residual risks (accepted for hackathon)

- Hot server key can write any hash it is allowed to. Protect `.env`. Rotate after the hack.
- Contract stores hashes, not full mandate plaintext. Reconstruction needs off chain records that match the hash inputs.
- FastAPI SQLite is the authoritative durable mandate and decision store. The TanStack server does not keep a second product datastore.
- Public RPC can lag; retries mitigate, they do not remove consensus delay.
- No formal third party audit firm review. No claim of unhackable.

## Security checklist

- [x] Input validation on hashes and outcomes
- [x] Secrets only in env
- [x] Access control on writers
- [x] No ETH custody / no payable attack surface
- [x] No reentrancy external calls
- [x] Custom errors for clear reverts
- [x] Append only decision hashes
- [x] Revoke terminal state
- [x] Unit tests for hashes and outcome codes
- [x] Live Base Sepolia invariant script
