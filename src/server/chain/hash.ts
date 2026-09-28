import { keccak256, stringToHex } from "viem";
import type { Decision, Mandate } from "@/lib/clamp-types";

export function hashMandate(
  mandate: Pick<Mandate, "id" | "tenantId" | "purpose" | "budget" | "merchants" | "expiresAt">,
): `0x${string}` {
  const payload = JSON.stringify({
    id: mandate.id,
    tenantId: mandate.tenantId,
    purpose: mandate.purpose,
    budget: mandate.budget,
    merchants: [...mandate.merchants].sort(),
    expiresAt: mandate.expiresAt,
  });
  return keccak256(stringToHex(payload));
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
  const payload = JSON.stringify({
    id: decision.id,
    tenantId: decision.tenantId,
    mandateId: decision.mandateId,
    request: decision.request,
    merchant: decision.merchant,
    amount: decision.amount,
    fee: decision.fee,
    status: decision.status,
    rule: decision.rule,
    reason: decision.reason,
  });
  return keccak256(stringToHex(payload));
}
