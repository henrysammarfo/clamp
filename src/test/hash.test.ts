import { describe, expect, it } from "vitest";
import { hashDecision, hashMandate } from "@/server/chain/hash";

describe("clamp hashes", () => {
  it("hashes mandates stably", () => {
    const base = {
      id: "office",
      tenantId: "tenant_a",
      purpose: "Office supplies",
      budget: 50,
      merchants: ["Uber", "Amazon", "Apple"],
      expiresAt: "2026-09-28T23:59:00.000Z",
    };
    const a = hashMandate(base);
    const b = hashMandate({ ...base, merchants: ["Apple", "Amazon", "Uber"] });
    expect(a).toBe(b);
    expect(a.startsWith("0x")).toBe(true);
  });

  it("changes when budget changes", () => {
    const a = hashMandate({
      id: "office",
      tenantId: "tenant_a",
      purpose: "Office supplies",
      budget: 50,
      merchants: ["Amazon"],
      expiresAt: "2026-09-28T23:59:00.000Z",
    });
    const b = hashMandate({
      id: "office",
      tenantId: "tenant_a",
      purpose: "Office supplies",
      budget: 51,
      merchants: ["Amazon"],
      expiresAt: "2026-09-28T23:59:00.000Z",
    });
    expect(a).not.toBe(b);
  });

  it("hashes decisions", () => {
    const hash = hashDecision({
      id: "d1",
      tenantId: "tenant_a",
      mandateId: "office",
      request: "Buy on BestBuy",
      merchant: "BestBuy",
      amount: 22,
      fee: 0,
      status: "block",
      rule: "Merchant allowlist",
      reason: "BestBuy is not on the merchant allowlist.",
    });
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
  });
});
