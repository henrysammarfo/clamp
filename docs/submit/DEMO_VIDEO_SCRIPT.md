# Demo video script (≤ 3 minutes)

Tone: soft, friendly, a little curious. Like someone showing you something cool at a quiet table. No hype. No jargon pileup. Open on the refuse. No secrets on screen.

Voice notes: slow breath between beats. Smile in the voice. Short sentences. Human grammar.

Record yourself. When a beat says **Paste**, select all in the field and paste. Don’t retype if you don’t have to.

---

## Paste kit (keep this open)

```
judge@demo.clamp
```

```
Buy a $22 USB C hub on BestBuy
```

```
Buy $30 of printer paper on Amazon
```

```
Buy a $120 monitor stand from Apple
```

```
Buy $20 groceries on Amazon for a team lunch
```

Optional purpose contrast (same merchant + amount, different purpose):

```
Buy $20 of printer paper on Amazon for the office
```

Mandate to pick in the dropdown: **Kiln smoke** (Amazon + Apple, OFFICE, human threshold $80).

Local: `http://127.0.0.1:3000/` · Live: `https://clamp-eight.vercel.app`

---

## 0:00 to 0:18 · Open

On screen: landing. Cursor drifts to the wordmark, then **Open control room**.

Voice:
“Hey. This is CLAMP.

Imagine an AI that can spend for you… but only inside a box you drew.

That’s the whole idea. Soft prompts can be talked around. A mandate can’t.”

---

## 0:18 to 0:40 · Mandate

**Paste / fill**
- Sign in email → `judge@demo.clamp` → Continue
- Sidebar → **Mandates** → open **Kiln smoke**
- Slow hover: Purpose, Budget, Merchants, Human approval, Expiry

Voice:
“You set the box. Purpose. Budget. Who they can buy from. When a human has to step in. When it expires.

We commit that on Base Sepolia, so later you can prove what you actually allowed.”

---

## 0:40 to 1:10 · Block first

**Paste / fill**
- Sidebar → **New request**
- Mandate dropdown → **Kiln smoke**
- Request box → paste:

```
Buy a $22 USB C hub on BestBuy
```

- Click **Evaluate request**
- Wait for **Block.** Zoom on the reason (BestBuy not allowed). Nothing paid.

Voice:
“Watch this. The agent asks for BestBuy.

BestBuy isn’t on the list… so code just says no.

Nothing gets paid. And that little refusal? It’s on the trail.”

---

## 1:10 to 1:30 · Allow

**Paste / fill**
- Still on **New request** (or go back)
- Mandate → **Kiln smoke**
- Request box → paste:

```
Buy $30 of printer paper on Amazon
```

- **Evaluate request** → **Allow.** Gentle zoom.

Voice:
“Same mandate. Now Amazon. Inside the box.

The gate opens in code. Quiet. Clean. Done.”

---

## 1:30 to 1:55 · Needs human

**Paste / fill**
- Request box → paste:

```
Buy a $120 monitor stand from Apple
```

- **Evaluate request** → **Needs human.** Hover “Awaiting a person.”

Voice:
“And when it’s fuzzy? Or a bit expensive?

CLAMP doesn’t guess. It waits for a person.

No payment until someone actually decides.”

---

## 1:55 to 2:20 · Why that matters (purpose)

**Paste / fill** (optional live contrast, if time)
1. Paste and evaluate:

```
Buy $20 of printer paper on Amazon for the office
```

→ expect **Allow** (OFFICE)

2. Then paste and evaluate:

```
Buy $20 groceries on Amazon for a team lunch
```

→ expect **Block** / purpose not allowed (same merchant, same amount)

Or skim **Case studies** and point at Allow / Block / Needs human cards if Kiln is slow.

Voice:
“Merchant alone isn’t enough. Purpose has to match too.

You’re not hoping the model behaves. You’re checking a rule.”

---

## 2:20 to 2:40 · Efficiency

**Go to:** sidebar → **Metrics**

Hover: 30 cases × 3, decision accuracy 100%, **44.4% fewer tokens**.

Voice:
“Parse once. Decide in code.

Fewer tokens than asking the model to judge every single spend… and on our thirty case check, the decisions stay sharp.”

---

## 2:40 to 3:00 · Close

**Go to:** **Audit** (quick flash) → back to landing. Cursor rests on CLAMP.

Voice:
“Later, someone else can reconstruct the whole story from the trail.

That’s CLAMP. Control before action.

Thanks for watching.”

---

## One-screen cheat card

| Beat | Paste / click |
| --- | --- |
| Sign in | `judge@demo.clamp` |
| Mandate | open **Kiln smoke** |
| Block | `Buy a $22 USB C hub on BestBuy` |
| Allow | `Buy $30 of printer paper on Amazon` |
| Needs human | `Buy a $120 monitor stand from Apple` |
| Purpose allow | `Buy $20 of printer paper on Amazon for the office` |
| Purpose block | `Buy $20 groceries on Amazon for a team lunch` |
| Metrics | sidebar **Metrics** |
| Close | **Audit** → home |
