import type { Hex } from "viem";
import type { ChainDecisionVerification, ChainMandateVerification } from "@/lib/clamp-types";
import type { FastApiDecision, FastApiMandate } from "@/server/fastapi/types";
import { readDecisionOnChain, readMandateOnChain } from "./clamp-audit";
import { hashAuditPayload, hashMandate } from "./hash";

type DecisionChainView = Awaited<ReturnType<typeof readDecisionOnChain>>;
type MandateChainView = Awaited<ReturnType<typeof readMandateOnChain>>;

const EMPTY_DECISION_VIEW: ChainDecisionVerification["onChain"] = {
  exists: false,
  mandateHash: null,
  outcome: 0,
  actor: null,
  recordedAt: null,
};

function isoFromUnixSeconds(value: bigint): string | null {
  if (value === 0n) return null;
  return new Date(Number(value) * 1000).toISOString();
}

function expectedOutcome(decision: FastApiDecision): 1 | 2 | 3 {
  if (decision.decision === "ALLOW") return 1;
  if (decision.decision === "BLOCK") return 2;
  return 3;
}

export async function verifyDecisionAgainstChain(
  decision: FastApiDecision,
  mandate: FastApiMandate,
  readDecision: (hash: Hex) => Promise<DecisionChainView> = readDecisionOnChain,
): Promise<ChainDecisionVerification> {
  const decisionHash = hashAuditPayload(decision.audit_payload);
  const mandateHash = hashMandate(mandate);
  const outcome = expectedOutcome(decision);
  const base = {
    decisionId: decision.decision_id,
    decisionHash,
    mandateHash,
    expectedOutcome: outcome,
    localTxHash: decision.tx_hash,
  };

  if (decision.reason_code === "MANDATE_REVOKED" && !decision.tx_hash) {
    return {
      ...base,
      status: "REVOCATION_ENFORCED",
      message:
        "Enforced from an already-recorded mandate revocation. No additional decision receipt is expected.",
      onChain: EMPTY_DECISION_VIEW,
      checks: { exists: false, mandateHashMatches: false, outcomeMatches: false },
    };
  }

  if (decision.decision === "NEEDS_HUMAN" && !decision.tx_hash) {
    return {
      ...base,
      status: "NOT_RECORDED",
      message: "Held for human review. No on-chain decision receipt is expected before approval.",
      onChain: EMPTY_DECISION_VIEW,
      checks: { exists: false, mandateHashMatches: false, outcomeMatches: false },
    };
  }

  const chain = await readDecision(decisionHash);
  const mandateHashMatches =
    chain.exists && chain.mandateHash.toLowerCase() === mandateHash.toLowerCase();
  const outcomeMatches = chain.exists && chain.outcome === outcome;
  const onChain = {
    exists: chain.exists,
    mandateHash: chain.exists ? chain.mandateHash : null,
    outcome: chain.outcome,
    actor: chain.exists ? chain.actor : null,
    recordedAt: isoFromUnixSeconds(chain.recordedAt),
  };
  const checks = { exists: chain.exists, mandateHashMatches, outcomeMatches };

  if (!chain.exists) {
    return {
      ...base,
      status: "NOT_RECORDED",
      message: "No decision receipt was found in ClampAudit v2 for this decision hash.",
      onChain,
      checks,
    };
  }
  const verified = mandateHashMatches && outcomeMatches;
  return {
    ...base,
    status: verified ? "VERIFIED" : "MISMATCH",
    message: verified
      ? "Verified against ClampAudit v2 on Base Sepolia."
      : "The local decision receipt does not match the stored ClampAudit v2 state.",
    onChain,
    checks,
  };
}

export async function verifyMandateAgainstChain(
  mandate: FastApiMandate,
  readMandate: (hash: Hex) => Promise<MandateChainView> = readMandateOnChain,
): Promise<ChainMandateVerification> {
  const mandateHash = hashMandate(mandate);
  const chain = await readMandate(mandateHash);
  const ignoresRevocation = mandate.status === "EXPIRED";
  const expectedRevoked = mandate.status === "REVOKED";
  const revokedMatches = ignoresRevocation || chain.revoked === expectedRevoked;
  const checks = { exists: chain.exists, revokedMatches };
  const status = !chain.exists ? "NOT_RECORDED" : revokedMatches ? "VERIFIED" : "MISMATCH";
  const message =
    status === "NOT_RECORDED"
      ? "No mandate commitment was found in ClampAudit v2 for this mandate hash."
      : status === "MISMATCH"
        ? "The local mandate status does not match the stored ClampAudit v2 revocation state."
        : ignoresRevocation
          ? "Commitment verified. Expiration is an off-chain policy state, not a ClampAudit state."
          : "Verified against ClampAudit v2 on Base Sepolia.";

  return {
    status,
    mandateId: mandate.id,
    mandateHash,
    localStatus: mandate.status,
    localTxHash: mandate.tx_hash,
    message,
    onChain: {
      exists: chain.exists,
      revoked: chain.revoked,
      committer: chain.exists ? chain.committer : null,
      committedAt: isoFromUnixSeconds(chain.committedAt),
    },
    checks,
  };
}
