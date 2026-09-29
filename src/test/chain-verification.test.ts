import { describe, expect, it, vi } from "vitest";
import { hashMandate } from "@/server/chain/hash";
import { verifyDecisionAgainstChain, verifyMandateAgainstChain } from "@/server/chain/verification";
import type { FastApiDecision, FastApiMandate } from "@/server/fastapi/types";

const actor = `0x${"1".repeat(40)}` as const;
const zeroHash = `0x${"0".repeat(64)}` as const;

const mandate: FastApiMandate = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Office mandate",
  purpose: "Office supplies",
  purpose_category: null,
  total_budget: "100",
  remaining_budget: "75",
  currency: "USD",
  allowed_merchants: ["Amazon"],
  expires_at: "2026-10-01T12:00:00Z",
  human_approval_threshold: "80",
  status: "ACTIVE",
  created_at: "2026-09-29T03:00:00Z",
  blockchain_network: "base-sepolia",
  tx_hash: `0x${"a".repeat(64)}`,
  revocation_id: null,
  revoked_at: null,
  revoke_blockchain_network: null,
  revoke_tx_hash: null,
};

const decision: FastApiDecision = {
  id: "22222222-2222-4222-8222-222222222222",
  decision_id: "22222222-2222-4222-8222-222222222222",
  mandate_id: mandate.id,
  original_request: "Buy paper from Amazon for $25",
  structured_request: {
    merchant: "Amazon",
    amount: "25",
    currency: "USD",
    item: "paper",
    purpose: "Office supplies",
    purpose_category: "OFFICE",
  },
  decision: "ALLOW",
  matched_rule: "POLICY_ALLOW",
  reason_code: "POLICY_ALLOW",
  reason: "Within mandate",
  timestamp: "2026-09-29T03:01:00Z",
  blockchain_network: "base-sepolia",
  tx_hash: `0x${"b".repeat(64)}`,
  audit_payload: {
    decision_id: "22222222-2222-4222-8222-222222222222",
    mandate_id: mandate.id,
    purchase_request_hash: `0x${"c".repeat(64)}`,
    decision: "ALLOW",
    reason_code: "POLICY_ALLOW",
    timestamp: "2026-09-29T03:01:00Z",
  },
};

function decisionReader(
  overrides: Partial<{
    exists: boolean;
    mandateHash: `0x${string}`;
    outcome: number;
    actor: `0x${string}`;
    recordedAt: bigint;
  }> = {},
) {
  return vi.fn().mockResolvedValue({
    exists: true,
    mandateHash: hashMandate(mandate),
    outcome: 1,
    actor,
    recordedAt: 1_759_118_460n,
    ...overrides,
  });
}

function mandateReader(
  overrides: Partial<{
    exists: boolean;
    revoked: boolean;
    committer: `0x${string}`;
    committedAt: bigint;
  }> = {},
) {
  return vi.fn().mockResolvedValue({
    exists: true,
    revoked: false,
    committer: actor,
    committedAt: 1_759_118_400n,
    ...overrides,
  });
}

describe("decision verification", () => {
  it("verifies a matching ALLOW receipt and serializes the timestamp", async () => {
    const result = await verifyDecisionAgainstChain(decision, mandate, decisionReader());
    expect(result.status).toBe("VERIFIED");
    expect(result.expectedOutcome).toBe(1);
    expect(result.checks).toEqual({
      exists: true,
      mandateHashMatches: true,
      outcomeMatches: true,
    });
    expect(result.onChain.recordedAt).toBe("2025-09-29T04:01:00.000Z");
  });

  it("verifies BLOCK as outcome 2", async () => {
    const blocked = {
      ...decision,
      decision: "BLOCK" as const,
      audit_payload: { ...decision.audit_payload, decision: "BLOCK" as const },
    };
    const result = await verifyDecisionAgainstChain(
      blocked,
      mandate,
      decisionReader({ outcome: 2 }),
    );
    expect(result.status).toBe("VERIFIED");
    expect(result.expectedOutcome).toBe(2);
  });

  it("reports a wrong outcome", async () => {
    const result = await verifyDecisionAgainstChain(
      decision,
      mandate,
      decisionReader({ outcome: 2 }),
    );
    expect(result.status).toBe("MISMATCH");
    expect(result.checks.outcomeMatches).toBe(false);
  });

  it("reports a wrong mandate hash", async () => {
    const result = await verifyDecisionAgainstChain(
      decision,
      mandate,
      decisionReader({ mandateHash: `0x${"f".repeat(64)}` }),
    );
    expect(result.status).toBe("MISMATCH");
    expect(result.checks.mandateHashMatches).toBe(false);
  });

  it("reports a missing expected final receipt as not recorded", async () => {
    const result = await verifyDecisionAgainstChain(
      decision,
      mandate,
      decisionReader({ exists: false, mandateHash: zeroHash, outcome: 0, recordedAt: 0n }),
    );
    expect(result.status).toBe("NOT_RECORDED");
    expect(result.checks.exists).toBe(false);
  });

  it("does not read chain for a pending human review with no receipt", async () => {
    const read = decisionReader();
    const held = {
      ...decision,
      decision: "NEEDS_HUMAN" as const,
      tx_hash: null,
      audit_payload: { ...decision.audit_payload, decision: "NEEDS_HUMAN" as const },
    };
    const result = await verifyDecisionAgainstChain(held, mandate, read);
    expect(result.status).toBe("NOT_RECORDED");
    expect(result.message).toContain("Held for human review");
    expect(read).not.toHaveBeenCalled();
  });

  it("does not expect a new receipt for a post-revoke block", async () => {
    const read = decisionReader();
    const revokedBlock = {
      ...decision,
      decision: "BLOCK" as const,
      reason_code: "MANDATE_REVOKED",
      tx_hash: null,
      audit_payload: {
        ...decision.audit_payload,
        decision: "BLOCK" as const,
        reason_code: "MANDATE_REVOKED",
      },
    };
    const result = await verifyDecisionAgainstChain(revokedBlock, mandate, read);
    expect(result.status).toBe("REVOCATION_ENFORCED");
    expect(read).not.toHaveBeenCalled();
  });
});

describe("mandate verification", () => {
  it("verifies an active, unrevoked commitment", async () => {
    const result = await verifyMandateAgainstChain(mandate, mandateReader());
    expect(result.status).toBe("VERIFIED");
    expect(result.checks.revokedMatches).toBe(true);
  });

  it("verifies a revoked mandate", async () => {
    const result = await verifyMandateAgainstChain(
      { ...mandate, status: "REVOKED" },
      mandateReader({ revoked: true }),
    );
    expect(result.status).toBe("VERIFIED");
  });

  it("reports an active mandate that is revoked on chain", async () => {
    const result = await verifyMandateAgainstChain(mandate, mandateReader({ revoked: true }));
    expect(result.status).toBe("MISMATCH");
    expect(result.checks.revokedMatches).toBe(false);
  });

  it("reports a missing mandate commitment", async () => {
    const result = await verifyMandateAgainstChain(
      mandate,
      mandateReader({ exists: false, committedAt: 0n }),
    );
    expect(result.status).toBe("NOT_RECORDED");
  });

  it("verifies an expired commitment and explains off-chain expiration", async () => {
    const result = await verifyMandateAgainstChain(
      { ...mandate, status: "EXPIRED" },
      mandateReader({ revoked: false }),
    );
    expect(result.status).toBe("VERIFIED");
    expect(result.message).toContain("off-chain policy state");
  });
});
