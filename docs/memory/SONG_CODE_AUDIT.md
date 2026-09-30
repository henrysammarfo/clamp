# Song v0.3 code audit (2026-09-29)

Audited merged `main` on this branch. Backend tests: **25 passed**.

## Confirmed real

| Claim | Status |
| --- | --- |
| FastAPI + SQLite is source of truth | Yes |
| Kiln interprets only (`deepseek-v4.1-flash`) · code decides | Yes (`policy.evaluate_policy`) |
| Policy order: revoke → expired → purpose → merchant → budget → currency → human threshold → allow | Yes |
| Human approve + reject | Yes · reject does not deduct budget |
| Mandate revoke + revoke chain attach | Yes · post-revoke blocks skip new decision tx |
| Purpose category on mandate + OFFICE vs FOOD style block | Yes |
| Chain receipt attach after frontend write | Yes |
| Verify on Base readback (exists, mandate hash, outcome) | Yes (`src/server/chain/verification.ts`) |
| Adversarial benchmark artifacts 30×3 | Yes · CLAMP 100/100 reason · ALL_AI 100/97.78 · 44.4% fewer tokens |
| UI wired to FastAPI not localStorage | Yes |

## Split of labor (honest)

- **Song backend:** interpret, policy, budget, approve/reject/revoke, metrics, unsigned audit payloads, store tx hashes
- **Henry / TanStack:** UI, session cookie, ClampAudit v2 writes + Verify on Base reads, hash canonicalization, receipt sync retry

## Watch / do not overclaim

- No FastAPI auth or tenant isolation (prototype)
- Purpose classification still comes from Kiln before code compares
- Backend does not itself broadcast txs · frontend writes, FastAPI attaches
- Kiln “explain” stage not implemented in app (interpret only)
- OpenAPI / some README lists lag reject+revoke routes
- Dashboard still has one stale “Song metering fail closed” string
- Unused `src/server/integrations/song/*` stubs remain (not on live path)
- Benchmark is this dataset/model only · not energy proof · not unhackable

## Demo blocker here

`KILN_API_KEY` empty in `backend/.env` · live decisions need it to record video.
