export type DecisionStatus = "allow" | "block" | "review" | "revoke";

export type MandateStatus = "active" | "expired" | "revoked";

export type PurposeCategory =
  | "OFFICE"
  | "SOFTWARE"
  | "TRAVEL"
  | "FOOD"
  | "TRANSPORT"
  | "MARKETING"
  | "PROFESSIONAL_SERVICES"
  | "OTHER";

export type Mandate = {
  id: string;
  name: string;
  purpose: string;
  purposeCategory: PurposeCategory | null;
  budget: number;
  spent: number;
  currency: string;
  merchants: string[];
  expiresAt: string;
  humanApprovalThreshold: number;
  status: MandateStatus;
  mandateHash: string;
  commitTxHash: string | null;
  chainSyncPending: boolean;
  revocationId: string | null;
  revokedAt: string | null;
  revokeTxHash: string | null;
  revokeBlockchainNetwork: string | null;
  revokeChainSyncPending: boolean;
  createdAt: string;
};

export type Decision = {
  id: string;
  mandateId: string;
  merchant: string;
  request: string;
  amount: number;
  fee: number;
  currency: string;
  status: DecisionStatus;
  reason: string;
  reasonCode: string;
  rule: string;
  time: string;
  decisionHash: string;
  txHash: string | null;
  blockchainNetwork: string | null;
  chainSyncPending: boolean;
  purpose: string;
  purposeCategory: PurposeCategory | null;
  auditPayload: {
    decision_id: string;
    mandate_id: string;
    purchase_request_hash: string;
    decision: "ALLOW" | "BLOCK" | "NEEDS_HUMAN";
    reason_code: string;
    timestamp: string;
  };
};

export type ProposedAction = {
  merchant: string;
  amount: number;
  fee: number;
  purpose: string;
  requestedAt: string;
};

export type GateResult = {
  status: DecisionStatus;
  rule: string;
  reason: string;
  action: ProposedAction;
};

export type EfficiencyMetrics = {
  decisions: Record<"ALLOW" | "BLOCK" | "NEEDS_HUMAN", number>;
  kilnCalls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  averageLatencyMs: number;
};

export type ChainDecisionVerification = {
  status: "VERIFIED" | "MISMATCH" | "NOT_RECORDED" | "REVOCATION_ENFORCED";
  decisionId: string;
  decisionHash: string;
  mandateHash: string;
  expectedOutcome: 1 | 2 | 3;
  localTxHash: string | null;
  message: string;
  onChain: {
    exists: boolean;
    mandateHash: string | null;
    outcome: number;
    actor: string | null;
    recordedAt: string | null;
  };
  checks: {
    exists: boolean;
    mandateHashMatches: boolean;
    outcomeMatches: boolean;
  };
};

export type ChainMandateVerification = {
  status: "VERIFIED" | "MISMATCH" | "NOT_RECORDED";
  mandateId: string;
  mandateHash: string;
  localStatus: "ACTIVE" | "EXPIRED" | "REVOKED";
  localTxHash: string | null;
  message: string;
  onChain: {
    exists: boolean;
    revoked: boolean;
    committer: string | null;
    committedAt: string | null;
  };
  checks: {
    exists: boolean;
    revokedMatches: boolean;
  };
};

export type CaseStudy = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  status: DecisionStatus;
  request: string;
  merchant: string;
  amount: number;
  fee: number;
  rule: string;
  reason: string;
};

export function statusLabel(status: DecisionStatus): string {
  if (status === "allow") return "Allow";
  if (status === "block") return "Block";
  if (status === "revoke") return "Revoked";
  return "Needs human";
}

export function explorerTxUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}
