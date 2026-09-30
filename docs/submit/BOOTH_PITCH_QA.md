# 5 minute booth pitch + Q and A

## Day of

1. Submit by **12:00 KST** (03:00 AM Ghana)
2. Booth judging + Q and A at **13:00 KST** (04:00 AM Ghana) · **Henry on Zoom**
3. Results at **15:00 KST**
4. Final pitch at **16:00 KST** if selected · **Song presents**

Source of truth for facts: `docs/SUBMISSION_EVIDENCE.md` on main.  
Song also prepared `CLAMP_Judge_QA_Preparation_FINAL.docx` (Telegram).

## Spoken path (about 5 minutes)

Hey. We’re Team 14, and this is CLAMP.

People are starting to let AI agents spend money. The hard part isn’t the chat. It’s control. Soft prompt limits can be talked around. We wanted something firmer: a temporary mandate, and a trail a second person can actually read.

With CLAMP, you draw a box. Purpose category. Budget, including fees. Allowed merchants. A human threshold. An expiry. The agent can move alone only inside that box.

Kiln listens and turns the request into structured fields. Then a deterministic Python policy returns Allow, Block, or Needs human. The model explains. It does not grant permission.

We like to open on a Block. BestBuy isn’t on the list. Nothing paid. The refuse lands on Base Sepolia. Then Allow on Amazon under the same mandate. Then Needs human on Apple until a person decides. We also show purpose control: same merchant and amount, OFFICE allows, FOOD blocks. And Verify on Base reads the contract back, quietly.

So the story stays simple. You set the mandate. The agent asked outside it. Nothing paid. The refuse is on the audit trail.

That’s CLAMP. Control before action. Happy to take questions.

## Keep ready (say these slowly)

- Code decides. The model explains.
- Open on the block.
- Nothing paid.
- A second person can reconstruct it from the trail.
- Authorization and audit. Not payment. Not custody.

## Likely questions (short answers)

**Is this just a wallet limit UI?**  
No. It’s a delegation control layer: mandate, deterministic gate, reconstructable audit trail. Kiln only interprets.

**Why not let the model decide allow or deny?**  
Social engineering risk, and a lot of wasted tokens. We parse once, decide in code. On our 30 case × 3 rep adversarial benchmark with the same model, CLAMP matched ALL_AI on decision accuracy at 100% and beat it on reason codes (100% vs 97.78%) with 44.4% fewer tokens. That’s that set. We don’t overclaim beyond it.

**What model?**  
Kiln / Bricksum `deepseek-v4.1-flash` for interpretation.

**What is on chain?**  
ClampAudit v2 on Base Sepolia. Mandate commits, final decision receipts, revocations. Outcomes 1..4. Testnet, labeled clearly. Value 0 ETH means audit, not payment.

**What if it’s fuzzy?**  
Needs human. No pay until approve or reject. Reject writes BLOCK / HUMAN_REJECTED and does not deduct budget.

**Can someone fake a receipt?**  
Writers are owner / approved recorders. Verify on Base compares the local receipt to contract state.

**Purpose control?**  
Same Amazon $20: OFFICE → ALLOW, FOOD → BLOCK. Merchant and amount held constant.

**Revoke?**  
Revocation is terminal on chain. Later requests BLOCK / MANDATE_REVOKED.

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
