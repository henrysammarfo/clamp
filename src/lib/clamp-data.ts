export type DecisionStatus = "allow" | "block" | "review";

export type Decision = {
  id: string;
  merchant: string;
  request: string;
  amount: number;
  fee: number;
  status: DecisionStatus;
  reason: string;
  rule: string;
  time: string;
  tx: string;
};

export type Mandate = {
  id: string;
  name: string;
  purpose: string;
  budget: number;
  spent: number;
  merchants: string[];
  expires: string;
  status: "active" | "expired" | "revoked";
};

export const mandates: Mandate[] = [
  { id: "office-supplies", name: "Office essentials", purpose: "Office supplies", budget: 50, spent: 31.2, merchants: ["Amazon", "Apple", "Uber"], expires: "Tonight · 23:59 KST", status: "active" },
  { id: "team-travel", name: "Team travel", purpose: "Local transport", budget: 120, spent: 84, merchants: ["Uber", "Kakao T"], expires: "30 Sep · 18:00 KST", status: "active" },
  { id: "event-printing", name: "Event printing", purpose: "Pitch collateral", budget: 75, spent: 75, merchants: ["Print City"], expires: "27 Sep · 20:00 KST", status: "expired" },
];

export const decisions: Decision[] = [
  { id: "bestbuy-block", merchant: "BestBuy", request: "Buy a $22 USB-C hub on BestBuy", amount: 22, fee: 0, status: "block", reason: "BestBuy is not on the merchant allowlist.", rule: "Merchant allowlist", time: "15:04:22 KST", tx: "0x8c41…7e2a" },
  { id: "amazon-allow", merchant: "Amazon", request: "Buy $30 of printer paper on Amazon", amount: 30, fee: 1.2, status: "allow", reason: "Merchant, purpose, deadline, and total are inside the mandate.", rule: "All mandate checks passed", time: "14:58:09 KST", tx: "0x31bd…ac90" },
  { id: "apple-review", merchant: "Apple", request: "Buy a $17 charging cable from Apple", amount: 17, fee: 1.1, status: "review", reason: "Total is close to the remaining budget edge.", rule: "Budget safety margin", time: "14:46:31 KST", tx: "Pending human decision" },
  { id: "amazon-over-budget", merchant: "Amazon", request: "Buy a $62 desk lamp on Amazon", amount: 62, fee: 2.4, status: "block", reason: "Total including fees exceeds the $50 mandate.", rule: "Budget including fees", time: "14:32:18 KST", tx: "0xa502…19ef" },
];

export const caseStudies = [
  { slug: "amazon-allow", title: "Amazon · Allowed", kicker: "Inside every boundary", description: "A $30 office-supply purchase passes merchant, purpose, time, and total checks before settlement.", status: "allow" as const },
  { slug: "bestbuy-block", title: "BestBuy · Blocked", kicker: "Wrong merchant. Nothing paid.", description: "The model parses the request, but code stops it because BestBuy is not on the mandate.", status: "block" as const },
  { slug: "apple-review", title: "Apple · Needs human", kicker: "Borderline by design", description: "A valid merchant request approaches the budget edge, so CLAMP holds payment for a person.", status: "review" as const },
];

export const statusLabel = (status: DecisionStatus) => status === "allow" ? "Allow" : status === "block" ? "Block" : "Needs human";