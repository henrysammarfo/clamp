import type { Decision, EfficiencyMetrics, Mandate } from "@/lib/clamp-types";
import { hashAuditPayload, hashMandate } from "@/server/chain/hash";
import type { FastApiDecision, FastApiMandate, FastApiMetrics } from "./types";

export function mapMandate(source: FastApiMandate): Mandate {
  const budget = Number(source.total_budget);
  const remaining = Number(source.remaining_budget);
  return {
    id: source.id,
    name: source.name,
    purpose: source.purpose,
    budget,
    spent: budget - remaining,
    currency: source.currency,
    merchants: source.allowed_merchants,
    expiresAt: source.expires_at,
    humanApprovalThreshold: Number(source.human_approval_threshold),
    status: source.status.toLowerCase() as Mandate["status"],
    mandateHash: hashMandate(source),
    commitTxHash: source.tx_hash,
    chainSyncPending: false,
    revocationId: source.revocation_id,
    revokedAt: source.revoked_at,
    revokeTxHash: source.revoke_tx_hash,
    revokeBlockchainNetwork: source.revoke_blockchain_network,
    createdAt: source.created_at,
  };
}

export function mapDecision(source: FastApiDecision): Decision {
  return {
    id: source.decision_id,
    mandateId: source.mandate_id,
    merchant: source.structured_request.merchant,
    request: source.original_request,
    amount: Number(source.structured_request.amount),
    // FastAPI does not currently supply a fee. This is a UI compatibility value only.
    fee: 0,
    currency: source.structured_request.currency,
    status:
      source.decision === "ALLOW" ? "allow" : source.decision === "BLOCK" ? "block" : "review",
    reason: source.reason,
    reasonCode: source.reason_code,
    rule: source.matched_rule,
    time: source.timestamp,
    decisionHash: hashAuditPayload(source.audit_payload),
    txHash: source.tx_hash,
    blockchainNetwork: source.blockchain_network,
    chainSyncPending: false,
    purpose: source.structured_request.purpose,
    auditPayload: source.audit_payload,
  };
}

export function mapMetrics(source: FastApiMetrics): EfficiencyMetrics {
  return {
    decisions: source.decisions,
    kilnCalls: source.kiln.calls,
    promptTokens: source.kiln.prompt_tokens,
    completionTokens: source.kiln.completion_tokens,
    totalTokens: source.kiln.total_tokens,
    averageLatencyMs: source.kiln.average_latency_ms,
  };
}
