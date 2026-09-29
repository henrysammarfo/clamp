# Demo video script (≤ 3 minutes)

Tone: calm, clear, no hype. Show the refuse early. No secrets on screen.

Record from the final app on main. Full capture list lives in `docs/SUBMISSION_EVIDENCE.md` §13.

## 0:00 to 0:20 · Open

On screen: CLAMP wordmark.

Voice:
“CLAMP is a delegation control layer for AI agents that spend. You set a temporary mandate. The agent can act alone only inside it.”

## 0:20 to 0:45 · Mandate

Show enterprise procurement mandate: purpose OFFICE, budget, Amazon + Apple, human threshold, expiry, Base commit tx.

Voice:
“Purpose category, budget, merchants, human threshold, expiry. Committed on Base Sepolia.”

## 0:45 to 1:15 · Block first

BestBuy $20 → BLOCK / MERCHANT_NOT_ALLOWED. Show nothing paid. Show Verify on Base → VERIFIED.

Voice:
“BestBuy is not on the list. Code stops it. Nothing paid. The refuse is on chain and verified.”

## 1:15 to 1:35 · Allow

Amazon $65 OFFICE → ALLOW. Show receipt + Verify.

Voice:
“Same mandate. Amazon inside the box. The gate passes in code.”

## 1:35 to 2:00 · Needs human

Apple $120 → NEEDS_HUMAN → approve → ALLOW. Or show $90 pending NOT_RECORDED then reject path if cleaner.

Voice:
“Borderline cases wait for a person. No payment until then.”

## 2:00 to 2:25 · Purpose control

Amazon $20 OFFICE → ALLOW. Amazon $20 FOOD → BLOCK / PURPOSE_NOT_ALLOWED. Same merchant, same amount.

Voice:
“Merchant alone is not enough. Purpose has to match.”

## 2:25 to 2:45 · Efficiency

Metrics page: 30 × 3 adversarial benchmark. CLAMP 100% decisions, 100% reason codes, 44.4% fewer tokens vs ALL_AI.

Voice:
“Parse once, decide in code. Fewer tokens than asking the model to judge every spend.”

## 2:45 to 3:00 · Close

Audit trail / Basescan flash. End card: Team 14 · github.com/henrysammarfo/clamp · contract address.

Voice:
“A second person can reconstruct the story from the trail. CLAMP. Control before action.”
