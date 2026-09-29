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
| Song Hyewon | Kiln, FastAPI source of truth, gate, budget, reject/revoke, purpose controls, benchmark, Verify on Base, final product docs + evidence on main. Final pitch if selected. GitHub: [20223096](https://github.com/20223096) |
| Henry Sam Marfo | Product UI/session/chain foundation, pitch deck, demo video, submit form, 4 AM Zoom booth + Q and A |

## Integration lock (2026-09-29)

`React UI → thin TanStack adapters → FastAPI → ClampAudit v2 → confirmed tx → FastAPI /chain`

Live E2E already green. Henry pauses integration file edits unless Song asks.

## Repo access

- Repo: https://github.com/henrysammarfo/clamp (public)
- Song needs **Write** collaborator access as `20223096` so she can push her backend branch (403 without it).
- Cursor agents cannot invite collaborators (GitHub integration returns 403). Henry must invite from GitHub Settings.

## Submit window

- Form: https://forms.gle/iiDRR7e3qbaXfetp7
- Organiser deadline: **30 Sep 2026 at 12:00 noon (not midnight)**
- Timezone for the event clock: **KST** (GWDC Korea / bible lock)
- **Ghana (GMT):** form must be in by **30 Sep 2026 03:00 AM GMT**
- Day of (Song-confirmed): submit **12:00 KST** → booth Q and A **13:00 KST** (all teams, Zoom ok) → results **15:00 KST** → final pitch **16:00 KST** if selected (Song presents)
- Ghana: submit 03:00 · booth 04:00 · results 06:00 · final 07:00
- Henry wakes ~06:30 for intern work; booth at 04:00 is rough

## Honesty

- No mock pays. No fake Kiln usage. Testnet labeled.
- Fail closed when Song APIs are unwired.
- Never claim unhackable.
- Prefers qwen3-32b on Kiln. Do not hard require gpt-oss-120b.

## AgentRouter

Not part of the CLAMP product. Coding proxy only. Skip for app integration.
