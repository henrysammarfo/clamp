# CLAMP pitch deck (≤10 pages)

Use this as the slide script. Export to PDF when visuals are ready. Keep copy short.

---

## 1. Title

**CLAMP**  
Control before action.

Team 14 · Henry Sam Marfo · Song Hyewon  
GWDC 2026 Korea · Challenge B · FuriosaAI × Bricksum

Soft: You set a spending mandate. The agent asked outside it. Nothing paid. The refuse is on the audit trail.

---

## 2. Problem

AI agents can spend.  
Prompt only limits are socially engineerable.  
Teams need a hard mandate and a trail a second person can reconstruct.

---

## 3. What CLAMP is

A **delegation control layer**, not a shopping chatbot and not a wallet UI clone.

Temporary mandate:
- purpose
- budget including fees
- allowed merchants
- expiry
- revocable anytime

---

## 4. Decision model

| Outcome | Meaning |
| --- | --- |
| Allow | Clearly inside the mandate |
| Block | Clearly outside · nothing paid |
| Needs human | Borderline · no pay until a person decides |

The model parses. **Code decides.**

---

## 5. Architecture

Human UI  
→ FastAPI mandate and policy  
→ Kiln parse / explain (`qwen3-32b`)  
→ Deterministic gate (zero inference)  
→ ClampAudit on Base Sepolia  
→ Audit receipt and metrics

Organiser hero: Kiln energy by flow + on chain stop or settle hash.

---

## 6. Live demo beat (open on the block)

1. BestBuy not on list → **Block** · nothing paid · tx on audit trail  
2. Same mandate · Amazon inside budget → **Allow** · receipt  
3. Apple near edge → **Needs human** → approve → Allow · receipt  
4. Hand the trail to another person

---

## 7. Efficiency thesis

Do not ask the model “is this allowed?” every time.

Parse once → gate in code → explain once.

Show CLAMP vs all AI on the same cases: calls, tokens, latency.  
(Insert Song benchmark numbers when ready.)

---

## 8. On chain evidence

Network: Base Sepolia  
Contract: `0x4648520fe2b192791c9ae13e46e0cba9544c42d6`

Outcomes on chain: Allow=1 · Block=2 · Needs human=3 · Revoke=4

(Insert Song verified tx links here.)

---

## 9. Honesty and scope

- Live Kiln and live testnet receipts  
- Testnet labeled  
- No fake pays  
- Hard controls + inspectable trail  
- Not claiming unhackable

---

## 10. Ask / next

Ship CLAMP as the control layer agents use before money moves.

Team 14 · ready for booth and Q and A.
