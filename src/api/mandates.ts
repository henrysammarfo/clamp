import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Mandate } from "@/lib/clamp-types";
import { commitMandateOnChain, recordDecisionOnChain } from "@/server/chain/clamp-audit";
import { outcomeFromStatus } from "@/server/chain/abi";
import { hashDecision, hashMandate } from "@/server/chain/hash";
import { requireClampSession } from "@/server/session";
import { getMandate, listMandates, saveDecision, saveMandate } from "@/server/store";

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 40) || `mandate${Date.now()}`
  );
}

export const listMandatesFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireClampSession();
  return { mandates: listMandates(session.tenantId) };
});

export const getMandateFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await requireClampSession();
    const mandate = getMandate(session.tenantId, data.id);
    if (!mandate) throw new Error("Mandate not found for this tenant.");
    return { mandate };
  });

export const createMandateFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(2).max(80),
      purpose: z.string().min(2).max(120),
      budget: z.number().positive().max(1_000_000),
      merchants: z.array(z.string().min(1)).min(1).max(20),
      expiresAt: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const session = await requireClampSession();
    const expires = new Date(data.expiresAt);
    if (Number.isNaN(expires.getTime())) {
      throw new Error("Expiry must be a valid date and time.");
    }
    if (expires.getTime() <= Date.now()) {
      throw new Error("Expiry must be in the future.");
    }

    const idBase = slugify(data.name);
    let id = idBase;
    let n = 1;
    while (getMandate(session.tenantId, id)) {
      id = `${idBase}${n}`;
      n += 1;
    }

    const draft: Mandate = {
      id,
      tenantId: session.tenantId,
      name: data.name.trim(),
      purpose: data.purpose.trim(),
      budget: data.budget,
      spent: 0,
      merchants: data.merchants.map((m) => m.trim()).filter(Boolean),
      expiresAt: expires.toISOString(),
      status: "active",
      mandateHash: "0x",
      commitTxHash: null,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    };
    draft.mandateHash = hashMandate(draft);

    const { txHash } = await commitMandateOnChain(draft.mandateHash as `0x${string}`);
    draft.commitTxHash = txHash;
    saveMandate(draft);
    return { mandate: draft };
  });

export const revokeMandateFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await requireClampSession();
    const mandate = getMandate(session.tenantId, data.id);
    if (!mandate) throw new Error("Mandate not found for this tenant.");
    if (mandate.status !== "active") {
      throw new Error("Only an active mandate can be revoked.");
    }

    const decisionId = `revoke${mandate.id}${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const decision = {
      id: decisionId,
      tenantId: session.tenantId,
      mandateId: mandate.id,
      merchant: "system",
      request: `Revoke mandate ${mandate.name}`,
      amount: 0,
      fee: 0,
      status: "revoke" as const,
      reason: "Mandate revoked by operator.",
      rule: "Revocation",
      time: new Date().toISOString(),
      decisionHash: "0x",
      txHash: null,
      purpose: mandate.purpose,
    };
    decision.decisionHash = hashDecision(decision);
    const { txHash } = await recordDecisionOnChain({
      mandateHash: mandate.mandateHash as `0x${string}`,
      decisionHash: decision.decisionHash as `0x${string}`,
      outcome: outcomeFromStatus("revoke"),
    });
    decision.txHash = txHash;
    saveDecision(decision);

    const next: Mandate = {
      ...mandate,
      status: "revoked",
      revokedAt: new Date().toISOString(),
    };
    saveMandate(next);
    return { mandate: next, decision };
  });
