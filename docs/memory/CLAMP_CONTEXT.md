# CLAMP context

Locked 2026-09-28. GWDC 2026 Korea. Challenge B. Team 14.

## Product

Delegation control layer for AI agents that spend. A person creates a temporary spending mandate (purpose, budget including fees, allowed merchants, expiry). The agent may act alone only inside that mandate. Outcomes are Allow, Block, or Needs human. Every decision writes an audit trail: request, matched rule, decision, reason, and pay or stop transaction.

## Soft

You set a spending mandate. The agent asked outside it. Nothing paid. The refuse is on the audit trail.

## Organiser hero

1. Kiln NPU inference for parse and explain (Song).
2. At least one on chain transaction on Base Sepolia for mandate commit or decision receipt (Henry).

Delete either and the entry is weak for Challenge B.

## Team split

| Owner | Owns |
| --- | --- |
| Song Hyewon | Kiln client, parse, explain, code gate, unit tests, token or latency metering, vs all AI baseline, AuditTrail shape |
| Henry Sam Marfo | On chain mandate or decision receipts, frontend mandate or watch or block or Needs human UI, metrics panel UI, demo video, pitch PDF, README |

## Submit window

- Form opens 29 Sep 21:00 KST
- Form closes 30 Sep 12:00 KST
- Top 3 pitch 30 Sep 15:00 KST

## Honesty

- No mock pays. No fake Kiln usage. Testnet labeled.
- Fail closed when Song APIs are unwired.
- Never claim unhackable.
- Prefers qwen3-32b on Kiln. Do not hard require gpt-oss-120b.

## AgentRouter

Not part of the CLAMP product. Coding proxy only. Skip for app integration.
