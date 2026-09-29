import type { EfficiencyMetrics, GateResult, Mandate, ProposedAction } from "@/lib/clamp-types";

export type ParseRequestInput = {
  text: string;
  mandate: Mandate;
};

export type EvaluateGateInput = {
  mandate: Mandate;
  action: ProposedAction;
};

export type ExplainDecisionInput = {
  request: string;
  status: GateResult["status"];
  rule: string;
  reason: string;
  merchant: string;
  amount: number;
  fee: number;
};

export type SongParseClient = {
  parseRequest: (input: ParseRequestInput) => Promise<ProposedAction>;
};

export type SongGateClient = {
  evaluateGate: (input: EvaluateGateInput) => Promise<GateResult>;
};

export type SongExplainClient = {
  explainDecision: (input: ExplainDecisionInput) => Promise<string>;
};

export type SongMeteringClient = {
  getEfficiencyMetrics: (cases: string[]) => Promise<EfficiencyMetrics>;
};
