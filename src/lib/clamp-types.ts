export type DecisionStatus = "allow" | "block" | "review";

export type MandateStatus = "active" | "expired" | "revoked";

export type Mandate = {
  id: string;
  tenantId: string;
  name: string;
  purpose: string;
  budget: number;
  spent: number;
  merchants: string[];
  expiresAt: string;
  status: MandateStatus;
  mandateHash: string;
  commitTxHash: string | null;
  createdAt: string;
  revokedAt: string | null;
};

export type Decision = {
  id: string;
  tenantId: string;
  mandateId: string;
  merchant: string;
  request: string;
  amount: number;
  fee: number;
  status: DecisionStatus;
  reason: string;
  rule: string;
  time: string;
  decisionHash: string;
  txHash: string | null;
  purpose: string;
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
  cases: string[];
  clampCalls: number;
  allAiCalls: number;
  clampTokens: number;
  allAiTokens: number;
  clampGateLatencyMs: number;
  allAiLatencyMs: number;
  notes: string;
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
  return "Needs human";
}

export function explorerTxUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}
