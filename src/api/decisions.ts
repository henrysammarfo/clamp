import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { outcomeFromStatus } from "@/server/chain/abi";
import { ensureMandateCommitted, recordDecisionOnChain } from "@/server/chain/clamp-audit";
import { hashAuditPayload, hashMandate } from "@/server/chain/hash";
import { fastApiClient } from "@/server/fastapi/client";
import { mapDecision, mapMetrics } from "@/server/fastapi/mappers";
import type { FastApiDecision } from "@/server/fastapi/types";
import { requireClampSession } from "@/server/session";

async function recordFinalDecision(source: FastApiDecision) {
  if (source.decision === "NEEDS_HUMAN" || source.tx_hash) return mapDecision(source);

  const mandate = await fastApiClient.getMandate(source.mandate_id);
  const mandateHash = hashMandate(mandate);
  await ensureMandateCommitted(mandateHash);
  const { txHash } = await recordDecisionOnChain({
    mandateHash,
    decisionHash: hashAuditPayload(source.audit_payload),
    outcome: outcomeFromStatus(source.decision === "ALLOW" ? "allow" : "block"),
  });
  const attached = await fastApiClient.attachChain(source.decision_id, {
    network: "base-sepolia",
    tx_hash: txHash,
  });
  return mapDecision(attached);
}

export const listDecisionsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireClampSession();
  return { decisions: (await fastApiClient.listDecisions()).map(mapDecision) };
});

export const getDecisionFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireClampSession();
    return { decision: mapDecision(await fastApiClient.getDecision(data.id)) };
  });

export const submitAgentRequestFn = createServerFn({ method: "POST" })
  .validator(z.object({ mandateId: z.string().min(1), text: z.string().min(1).max(4000) }))
  .handler(async ({ data }) => {
    await requireClampSession();
    // This POST is intentionally called once. The backend operation is not idempotent.
    const source = await fastApiClient.createDecision({
      mandate_id: data.mandateId,
      request: data.text.trim(),
    });
    return { decision: await recordFinalDecision(source) };
  });

export const approveReviewFn = createServerFn({ method: "POST" })
  .validator(z.object({ decisionId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireClampSession();
    const approved = await fastApiClient.approveDecision(data.decisionId);
    return { decision: await recordFinalDecision(approved) };
  });

export const getMetricsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireClampSession();
  return { metrics: mapMetrics(await fastApiClient.getMetrics()) };
});
