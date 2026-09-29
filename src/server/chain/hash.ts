import { encodeAbiParameters, keccak256, parseAbiParameters } from "viem";
import type { Decision, Mandate } from "@/lib/clamp-types";

const mandateParams = parseAbiParameters(
  "string id, string tenantId, string purpose, uint256 budget, string[] merchants, string expiresAt, uint256 chainId",
);

const decisionParams = parseAbiParameters(
  "string id, string tenantId, string mandateId, string request, string merchant, uint256 amount, uint256 fee, string status, string rule, string reason, uint256 chainId",
);

const BASE_SEPOLIA_CHAIN_ID = 84532n;

function moneyToUint(value: number): bigint {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Amount values must be finite and non negative.");
  }
  // Store USD cents as integer to avoid float drift in hashes.
  return BigInt(Math.round(value * 100));
}

export function hashMandate(
  mandate: Pick<Mandate, "id" | "tenantId" | "purpose" | "budget" | "merchants" | "expiresAt">,
): `0x${string}` {
  const merchants = [...mandate.merchants]
    .map((m) => m.trim())
    .filter(Boolean)
    .sort();
  return keccak256(
    encodeAbiParameters(mandateParams, [
      mandate.id,
      mandate.tenantId,
      mandate.purpose.trim(),
      moneyToUint(mandate.budget),
      merchants,
      mandate.expiresAt,
      BASE_SEPOLIA_CHAIN_ID,
    ]),
  );
}

export function hashDecision(
  decision: Pick<
    Decision,
    | "id"
    | "tenantId"
    | "mandateId"
    | "request"
    | "merchant"
    | "amount"
    | "fee"
    | "status"
    | "rule"
    | "reason"
  >,
): `0x${string}` {
  return keccak256(
    encodeAbiParameters(decisionParams, [
      decision.id,
      decision.tenantId,
      decision.mandateId,
      decision.request,
      decision.merchant,
      moneyToUint(decision.amount),
      moneyToUint(decision.fee),
      decision.status,
      decision.rule,
      decision.reason,
      BASE_SEPOLIA_CHAIN_ID,
    ]),
  );
}
