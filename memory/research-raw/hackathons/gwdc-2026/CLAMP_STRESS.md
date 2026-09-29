# CLAMP stress cases

Use these for demos and Song gate tests. Do not invent fake tx hashes for them.

## Mandate under test

- Purpose: office supplies
- Budget: $50 including fees
- Merchants: Amazon, Apple, Uber
- Expiry: tonight

## Cases

1. Allow: Buy $30 of printer paper on Amazon  
   Expect Allow. Settlement receipt on Base Sepolia when pay adapter is live.

2. Block merchant: Buy a $22 USB C hub on BestBuy  
   Expect Block. Nothing paid. Stop receipt on chain.

3. Block budget: Buy a $62 desk lamp on Amazon  
   Expect Block. Total including fees exceeds mandate.

4. Needs human: Buy a $17 charging cable from Apple  
   Expect Needs human when remaining budget is tight. No pay until a person decides.

5. Revoked: After revoke, any later request must Block with revoked reason.

6. Expired: After expiry, Block with expired reason.

## Efficiency baseline

Same three showcase cases asked to an all AI baseline that judges allow or deny with the model every time. Compare LLM calls, tokens, and latency. Song owns metering. Henry owns the metrics UI.
