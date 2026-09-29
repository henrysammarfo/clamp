export type FastApiMandateStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export type FastApiMandate = {
  id: string;
  name: string;
  purpose: string;
  total_budget: string;
  remaining_budget: string;
  currency: string;
  allowed_merchants: string[];
  expires_at: string;
  human_approval_threshold: string;
  status: FastApiMandateStatus;
  created_at: string;
  blockchain_network: string | null;
  tx_hash: string | null;
};

export type FastApiMandateCreate = {
  name: string;
  purpose: string;
  total_budget: number;
  currency: string;
  allowed_merchants: string[];
  expires_at: string;
  human_approval_threshold: number;
};

export type FastApiDecisionValue = "ALLOW" | "BLOCK" | "NEEDS_HUMAN";

export type AuditPayload = {
  decision_id: string;
  mandate_id: string;
  purchase_request_hash: string;
  decision: FastApiDecisionValue;
  reason_code: string;
  timestamp: string;
};

export type FastApiDecision = {
  id: string;
  decision_id: string;
  mandate_id: string;
  original_request: string;
  structured_request: {
    merchant: string;
    amount: string;
    currency: string;
    item: string;
    purpose: string;
  };
  decision: FastApiDecisionValue;
  matched_rule: string;
  reason_code: string;
  reason: string;
  timestamp: string;
  blockchain_network: string | null;
  tx_hash: string | null;
  audit_payload: AuditPayload;
};

export type FastApiMetrics = {
  decisions: Record<FastApiDecisionValue, number>;
  kiln: {
    calls: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    average_latency_ms: number;
  };
};
