import type { Abi } from "viem";
import artifactAbi from "./clamp-audit-abi.json";

// Compiled solc ABI plus custom errors.
export const clampAuditAbi = artifactAbi as Abi;

/** On chain codes: 1 allow, 2 block, 3 review, 4 revoke. Zero means unset. */
export type DecisionOutcomeCode = 1 | 2 | 3 | 4;

export function outcomeFromStatus(
  status: "allow" | "block" | "review" | "revoke",
): DecisionOutcomeCode {
  if (status === "allow") return 1;
  if (status === "block") return 2;
  if (status === "review") return 3;
  return 4;
}

export function statusFromOutcome(
  outcome: number,
): "allow" | "block" | "review" | "revoke" | "unset" {
  if (outcome === 1) return "allow";
  if (outcome === 2) return "block";
  if (outcome === 3) return "review";
  if (outcome === 4) return "revoke";
  return "unset";
}
