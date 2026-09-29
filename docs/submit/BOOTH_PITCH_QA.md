# 5 minute booth pitch + Q and A

## Slot

If selected: **30 Sep 2026 15:00 KST** on Zoom (= 06:00 AM Ghana GMT). Henry presents if called.

## Spoken pitch (about 5 minutes)

Hi, we’re Team 14, and this is CLAMP.

People are starting to let AI agents spend money. The hard part is not the chat. It’s control. Prompt only limits can be talked around. We wanted a hard mandate and a trail someone else can read.

With CLAMP, you create a temporary spending mandate: purpose, budget including fees, allowed merchants, and an expiry. The agent may act alone only inside that box.

Kiln turns a sentence into a proposed buy. Then a deterministic code gate returns one of three outcomes: Allow, Block, or Needs human. The model does not grant permission.

We open the demo on a Block. BestBuy is not on the list. Nothing paid. The refuse is written to Base Sepolia. Then we show an Allow under the same mandate, and a Needs human path that waits for a person.

So the story is simple. You set the mandate. The agent asked outside it. Nothing paid. The refuse is on the audit trail.

That’s CLAMP. Control before action.

## Likely questions

**Is this just a wallet limit UI?**  
No. It’s a delegation control layer. Mandate plus deterministic gate plus reconstructable audit trail, with Kiln for parse and explain only.

**Why not let the model decide allow or deny?**  
Because that burns tokens and can be socially engineered. We parse once, decide in code, explain once.

**What is on chain?**  
Mandate commits and decision receipts on Base Sepolia through ClampAudit. Hashes and outcomes. Testnet is labeled.

**What if the case is fuzzy?**  
Needs human. Payment stays stopped until a person decides.

**Can someone fake a receipt?**  
Writers are access controlled. Final decisions are backed by real Base Sepolia tx hashes in FastAPI.

**Is it production custody?**  
No. It’s a control and records system for Challenge B. Honest about testnet and residual risk.

**Who built what?**  
Song: Kiln, gate, FastAPI, metering, audit payloads.  
Henry: product UI, sessions, ClampAudit, pitch and demo package.

## Calm lines to keep ready

- “Code decides. The model explains.”
- “Open on the block.”
- “Nothing paid.”
- “A second person can reconstruct it from the trail.”
