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
| Song Hyewon | Kiln client, parse, explain, code gate, unit tests, token or latency metering, vs all AI baseline, AuditTrail shape. GitHub: [20223096](https://github.com/20223096) |
| Henry Sam Marfo | On chain mandate or decision receipts, frontend mandate or watch or block or Needs human UI, metrics panel UI, demo video, pitch PDF, README |

## Repo access

- Repo: https://github.com/henrysammarfo/clamp (public)
- Song needs **Write** collaborator access as `20223096` so she can push her backend branch (403 without it).
- Cursor agents cannot invite collaborators (GitHub integration returns 403). Henry must invite from GitHub Settings.

## Submit window

- Form: https://forms.gle/iiDRR7e3qbaXfetp7
- Organiser deadline: **30 Sep 2026 at 12:00 noon (not midnight)**
- Timezone for the event clock: **KST** (GWDC Korea / bible lock)
- **Ghana (GMT):** form must be in by **30 Sep 2026 03:00 AM GMT**
- Top 3 pitch that afternoon after review (bible: 30 Sep 15:00 KST = 06:00 AM GMT)
- After close: judges pick three projects per ecosystem; selected teams present that afternoon for 1st/2nd/3rd

## Honesty

- No mock pays. No fake Kiln usage. Testnet labeled.
- Fail closed when Song APIs are unwired.
- Never claim unhackable.
- Prefers qwen3-32b on Kiln. Do not hard require gpt-oss-120b.

## AgentRouter

Not part of the CLAMP product. Coding proxy only. Skip for app integration.
