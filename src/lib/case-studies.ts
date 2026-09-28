import type { CaseStudy } from "@/lib/clamp-types";

/** Marketing reconstructions only. Not live chain receipts. */
export const caseStudies: CaseStudy[] = [
  {
    slug: "amazonAllow",
    title: "Amazon allowed",
    kicker: "Inside every boundary",
    description:
      "A $30 office supply purchase passes merchant, purpose, time, and total checks before settlement.",
    status: "allow",
    request: "Buy $30 of printer paper on Amazon",
    merchant: "Amazon",
    amount: 30,
    fee: 1.2,
    rule: "All mandate checks passed",
    reason: "Merchant, purpose, deadline, and total are inside the mandate.",
  },
  {
    slug: "bestbuyBlock",
    title: "BestBuy blocked",
    kicker: "Wrong merchant. Nothing paid.",
    description:
      "The model parses the request, but code stops it because BestBuy is not on the mandate.",
    status: "block",
    request: "Buy a $22 USB C hub on BestBuy",
    merchant: "BestBuy",
    amount: 22,
    fee: 0,
    rule: "Merchant allowlist",
    reason: "BestBuy is not on the merchant allowlist.",
  },
  {
    slug: "appleReview",
    title: "Apple needs human",
    kicker: "Borderline by design",
    description:
      "A valid merchant request approaches the budget edge, so CLAMP holds payment for a person.",
    status: "review",
    request: "Buy a $17 charging cable from Apple",
    merchant: "Apple",
    amount: 17,
    fee: 1.1,
    rule: "Budget safety margin",
    reason: "Total is close to the remaining budget edge.",
  },
];

export function getCaseStudy(slug: string): CaseStudy | null {
  return caseStudies.find((item) => item.slug === slug) ?? null;
}
