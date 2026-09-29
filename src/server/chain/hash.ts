import { keccak256, stringToHex } from "viem";
import type {
  AuditPayload,
  FastApiMandate,
  FastApiRevocationAuditPayload,
} from "@/server/fastapi/types";

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
    .join(",")}}`;
}

export function hashMandate(mandate: FastApiMandate): `0x${string}` {
  const authority: Record<string, unknown> = {
    id: mandate.id,
    name: mandate.name,
    purpose: mandate.purpose,
    total_budget: mandate.total_budget,
    currency: mandate.currency,
    allowed_merchants: [...mandate.allowed_merchants].sort(),
    expires_at: mandate.expires_at,
    human_approval_threshold: mandate.human_approval_threshold,
    created_at: mandate.created_at,
  };
  if (mandate.purpose_category !== null) {
    authority.purpose_category = mandate.purpose_category;
  }
  return keccak256(stringToHex(canonicalize(authority)));
}

export function hashAuditPayload(payload: AuditPayload): `0x${string}` {
  return keccak256(stringToHex(canonicalize(payload)));
}

export function hashRevocationAuditPayload(payload: FastApiRevocationAuditPayload): `0x${string}` {
  return keccak256(stringToHex(canonicalize(payload)));
}
