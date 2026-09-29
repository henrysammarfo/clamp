---
name: clamp-gwdc-build
description: Builds and verifies CLAMP for GWDC 2026 Challenge B on the Henry slice. Use when implementing CLAMP routes, Base Sepolia receipts, sessions, marketing copy, README, or Song handoff contracts.
---

# CLAMP GWDC build

## When to use

Any CLAMP product change for Team 14 Henry work: UI, sessions, chain, copy, submit docs.

## Always read first

1. [docs/memory/CLAMP_CONTEXT.md](../../../docs/memory/CLAMP_CONTEXT.md)
2. [docs/memory/STACK_AND_SECRETS.md](../../../docs/memory/STACK_AND_SECRETS.md)
3. [docs/memory/FACT_CHECK_LOG.md](../../../docs/memory/FACT_CHECK_LOG.md)
4. [memory/research-raw/hackathons/gwdc-2026/CLAMP_STRESS.md](../../../memory/research-raw/hackathons/gwdc-2026/CLAMP_STRESS.md)

## Henry checklist

- [ ] Routes exist for public and app maps
- [ ] Marketing copy is CLAMP soft and plain English with no hyphens
- [ ] Signed server session + tenant store (no localStorage)
- [ ] ClampAudit deploy path and live tx when env is set
- [ ] Song contracts fail closed
- [ ] Metrics UI ready; data from Song only
- [ ] README has declared function, run steps, ownership, honesty
- [ ] `bun run lint` and `bun run build` pass

## Demo beat

1. Open on BestBuy Block. Nothing paid. Audit row shows request, rule, Block, reason, tx.
2. Flip to Amazon Allow under the same mandate.
3. Show metrics strip when Song metering is wired.
4. Hand the audit trail to a second person.

## Song handoff contracts

Henry must not implement these. Only typed interfaces that throw until wired:

- parseRequest(text) -> ProposedAction
- evaluateGate(mandate, action) -> GateResult
- explainDecision(decision) -> string
- getEfficiencyMetrics(cases) -> MetricsTable

Interfaces live in `src/server/integrations/song/`. Henry RPC entrypoints live in `src/api/`.

## Submit package

1. Public GitHub + README
2. Demo video <= 3 min
3. Pitch PDF <= 10 pages
4. Google Form in the open window
