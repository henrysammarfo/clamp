import { describe, expect, it } from "vitest";
import { clearTenant, getMandate, listMandates, saveMandate } from "@/server/store";

describe("tenant store", () => {
  it("isolates tenants", () => {
    clearTenant("t1");
    clearTenant("t2");
    saveMandate({
      id: "m1",
      tenantId: "t1",
      name: "One",
      purpose: "Office supplies",
      budget: 50,
      spent: 0,
      merchants: ["Amazon"],
      expiresAt: new Date().toISOString(),
      status: "active",
      mandateHash: "0x1",
      commitTxHash: null,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    });
    expect(listMandates("t1")).toHaveLength(1);
    expect(listMandates("t2")).toHaveLength(0);
    expect(getMandate("t2", "m1")).toBeNull();
  });
});
