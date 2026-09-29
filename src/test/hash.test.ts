import { describe, expect, it } from "vitest";
import { hashAuditPayload, hashMandate, hashRevocationAuditPayload } from "@/server/chain/hash";
import type { FastApiMandate } from "@/server/fastapi/types";

const mandate: FastApiMandate = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Office supplies mandate",
  purpose: "Office supplies",
  total_budget: "50",
  remaining_budget: "50",
  currency: "USD",
  allowed_merchants: ["Uber", "Amazon", "Apple"],
  expires_at: "2026-10-01T12:00:00Z",
  human_approval_threshold: "40",
  status: "ACTIVE",
  created_at: "2026-09-29T03:00:00Z",
  blockchain_network: null,
  tx_hash: null,
  revocation_id: null,
  revoked_at: null,
  revoke_blockchain_network: null,
  revoke_tx_hash: null,
};

describe("clamp hashes", () => {
  it("hashes authoritative mandates stably", () => {
    const a = hashMandate(mandate);
    const b = hashMandate({
      ...mandate,
      allowed_merchants: ["Apple", "Amazon", "Uber"],
      remaining_budget: "12",
      status: "EXPIRED",
    });
    expect(a).toBe(b);
    expect(a).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("changes when the authoritative total budget changes", () => {
    expect(hashMandate(mandate)).not.toBe(hashMandate({ ...mandate, total_budget: "51" }));
  });

  it("canonically hashes mandate revocation payloads", () => {
    const payload = {
      revocation_id: "33333333-3333-4333-8333-333333333333",
      mandate_id: mandate.id,
      decision: "REVOKE" as const,
      reason_code: "MANDATE_REVOKED" as const,
      timestamp: "2026-09-29T04:00:00Z",
    };
    expect(hashRevocationAuditPayload(payload)).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("canonically hashes the complete backend audit payload", () => {
    const payload = {
      decision_id: "22222222-2222-4222-8222-222222222222",
      mandate_id: mandate.id,
      purchase_request_hash: `0x${"a".repeat(64)}`,
      decision: "ALLOW" as const,
      reason_code: "POLICY_ALLOW",
      timestamp: "2026-09-29T03:01:00Z",
    };
    const reordered = {
      timestamp: payload.timestamp,
      reason_code: payload.reason_code,
      decision: payload.decision,
      purchase_request_hash: payload.purchase_request_hash,
      mandate_id: payload.mandate_id,
      decision_id: payload.decision_id,
    };
    expect(hashAuditPayload(payload)).toBe(hashAuditPayload(reordered));
  });
});
