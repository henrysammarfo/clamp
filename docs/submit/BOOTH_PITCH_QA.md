# 5 minute booth pitch + Q and A

## Day of

1. Submit by **12:00 KST** (03:00 AM Ghana)
2. Booth judging + Q and A at **13:00 KST** (04:00 AM Ghana) · **Henry on Zoom**
3. Results at **15:00 KST**
4. Final pitch at **16:00 KST** if selected · **Song presents**

Source of truth for facts: `docs/SUBMISSION_EVIDENCE.md` on main.  
Song also prepared `CLAMP_Judge_QA_Preparation_FINAL.docx` (Telegram).

## Spoken path (about 5 minutes)

Hi, we’re Team 14, and this is CLAMP.

People are starting to let AI agents spend money. The hard part is not the chat. It’s control. Soft prompt limits can be talked around. We wanted a hard mandate and a trail someone else can read.

With CLAMP, you create a temporary spending mandate: purpose category, budget including fees, allowed merchants, human threshold, and an expiry. The agent may act alone only inside that box.

Kiln interprets the request into structured fields. Then a deterministic Python policy returns Allow, Block, or Needs human. The model does not grant permission.

We open on a Block. BestBuy is not on the list. Nothing paid. The refuse is written to Base Sepolia. Then Allow on Amazon under the same mandate. Then Needs human on Apple until a person decides. We also show purpose control: same merchant and amount, OFFICE allows, FOOD blocks. And Verify on Base reads the contract back.

So the story is simple. You set the mandate. The agent asked outside it. Nothing paid. The refuse is on the audit trail.

That’s CLAMP. Control before action.

## Keep ready

- Code decides. The model explains.
- Open on the block.
- Nothing paid.
- A second person can reconstruct it from the trail.
- Authorization and audit. Not payment. Not custody.

## Likely questions (short answers)

**Is this just a wallet limit UI?**  
No. Delegation control layer: mandate + deterministic gate + reconstructable audit trail. Kiln only interprets.

**Why not let the model decide allow or deny?**  
Social engineering risk and wasted tokens. We parse once, decide in code. On our 30 case × 3 rep adversarial benchmark with the same model, CLAMP matched ALL_AI on decision accuracy at 100% and beat it on reason codes (100% vs 97.78%) with 44.4% fewer tokens. Do not generalize beyond that set.

**What model?**  
Kiln / Bricksum `deepseek-v4.1-flash` for interpretation.

**What is on chain?**  
ClampAudit v2 on Base Sepolia. Mandate commits, final decision receipts, revocations. Outcomes 1..4. Testnet labeled. Value 0 ETH means audit, not payment.

**What if fuzzy?**  
Needs human. No pay until approve or reject. Reject writes BLOCK / HUMAN_REJECTED and does not deduct budget.

**Can someone fake a receipt?**  
Writers are owner / approved recorders. Verify on Base compares local receipt to contract state.

**Purpose control?**  
Same Amazon $20: OFFICE → ALLOW, FOOD → BLOCK. Merchant and amount held constant.

**Revoke?**  
Revocation is terminal on chain. Later requests BLOCK / MANDATE_REVOKED without a new decision write that would revert.

**Is it production custody?**  
No. Authorization and audit prototype for Challenge B. Honest about testnet and residual risk. Not unhackable.

**Who built what?**  
Song: Kiln, FastAPI policy, budget, reject/revoke, purpose, benchmark, Verify on Base, evidence docs.  
Henry: product UI/session foundation, ClampAudit v2, pitch/demo/submit package, 4 AM booth.

## Claims to avoid

- Do not claim CLAMP executes payment or holds funds.
- Do not claim on chain proof that a purchase happened.
- Do not claim the model is always correct or fair.
- Do not claim unhackable.
- Do not present token savings as measured energy without labeling them as proxies.
