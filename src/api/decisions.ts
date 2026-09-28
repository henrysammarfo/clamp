import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Decision } from "@/lib/clamp-types";
import { outcomeFromStatus } from "@/server/chain/abi";
import { recordDecisionOnChain } from "@/server/chain/clamp-audit";
import { hashDecision } from "@/server/chain/hash";
import {
  SongNotWiredError,
  songExplainClient,
  songGateClient,
  songMeteringClient,
  songParseClient,
} from "@/server/integrations/song";
import { requireClampSession } from "@/server/session";
import { getDecision, getMandate, listDecisions, saveDecision, saveMandate } from "@/server/store";

function publicError(error: unknown): never {
  if (error instanceof SongNotWiredError) throw error;
  if (error instanceof Error) throw error;
  throw new Error("Unexpected server error.");
}

export const listDecisionsFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireClampSession();
  return { decisions: listDecisions(session.tenantId) };
});

export const getDecisionFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await requireClampSession();
    const decision = getDecision(session.tenantId, data.id);
    if (!decision) throw new Error("Decision not found for this tenant.");
    return { decision };
  });

export const submitAgentRequestFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      mandateId: z.string().min(1),
      text: z.string().min(3).max(500),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const session = await requireClampSession();
      const mandate = getMandate(session.tenantId, data.mandateId);
      if (!mandate) throw new Error("Mandate not found for this tenant.");
      if (mandate.status === "revoked") {
        throw new Error("Mandate is revoked. New requests are blocked.");
      }
      if (new Date(mandate.expiresAt).getTime() <= Date.now()) {
        const expired = { ...mandate, status: "expired" as const };
        saveMandate(expired);
        throw new Error("Mandate is expired. New requests are blocked.");
      }

      const action = await songParseClient.parseRequest({
        text: data.text.trim(),
        mandate,
      });
      const gate = await songGateClient.evaluateGate({ mandate, action });

      const decisionId = `dec${Date.now()}`;
      const decision: Decision = {
        id: decisionId,
        tenantId: session.tenantId,
        mandateId: mandate.id,
        merchant: gate.action.merchant,
        request: data.text.trim(),
        amount: gate.action.amount,
        fee: gate.action.fee,
        status: gate.status,
        reason: gate.reason,
        rule: gate.rule,
        time: new Date().toISOString(),
        decisionHash: "0x",
        txHash: null,
        purpose: gate.action.purpose,
      };
      decision.decisionHash = hashDecision(decision);

      if (gate.status === "review") {
        saveDecision(decision);
        return { decision, explanation: null as string | null };
      }

      const { txHash } = await recordDecisionOnChain({
        mandateHash: mandate.mandateHash as `0x${string}`,
        decisionHash: decision.decisionHash as `0x${string}`,
        outcome: outcomeFromStatus(gate.status),
      });
      decision.txHash = txHash;

      if (gate.status === "allow") {
        const spent = mandate.spent + gate.action.amount + gate.action.fee;
        saveMandate({ ...mandate, spent });
      }

      saveDecision(decision);

      let explanation: string | null = null;
      try {
        explanation = await songExplainClient.explainDecision({
          request: decision.request,
          status: decision.status,
          rule: decision.rule,
          reason: decision.reason,
          merchant: decision.merchant,
          amount: decision.amount,
          fee: decision.fee,
        });
      } catch (error) {
        if (!(error instanceof SongNotWiredError)) throw error;
        // Explain is optional after the decision is already recorded.
        explanation = null;
      }

      return { decision, explanation };
    } catch (error) {
      publicError(error);
    }
  });

export const resolveReviewFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      decisionId: z.string().min(1),
      status: z.enum(["allow", "block"]),
    }),
  )
  .handler(async ({ data }) => {
    const session = await requireClampSession();
    const decision = getDecision(session.tenantId, data.decisionId);
    if (!decision) throw new Error("Decision not found for this tenant.");
    if (decision.status !== "review") {
      throw new Error("Only a Needs human decision can be resolved.");
    }
    const mandate = getMandate(session.tenantId, decision.mandateId);
    if (!mandate) throw new Error("Mandate not found for this tenant.");
    if (mandate.status !== "active") {
      throw new Error("Mandate is not active.");
    }

    const next: Decision = {
      ...decision,
      status: data.status,
      reason:
        data.status === "allow"
          ? "Operator approved a Needs human request."
          : "Operator blocked a Needs human request.",
      rule: "Human review",
      time: new Date().toISOString(),
      decisionHash: "0x",
      txHash: null,
    };
    next.decisionHash = hashDecision(next);

    const { txHash } = await recordDecisionOnChain({
      mandateHash: mandate.mandateHash as `0x${string}`,
      decisionHash: next.decisionHash as `0x${string}`,
      outcome: outcomeFromStatus(data.status),
    });
    next.txHash = txHash;

    if (data.status === "allow") {
      saveMandate({
        ...mandate,
        spent: mandate.spent + next.amount + next.fee,
      });
    }

    // Replace the pending review row with the resolved receipt.
    saveDecision(next);
    return { decision: next };
  });

export const getMetricsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireClampSession();
  try {
    const metrics = await songMeteringClient.getEfficiencyMetrics([
      "amazonAllow",
      "bestbuyBlock",
      "appleReview",
    ]);
    return { metrics };
  } catch (error) {
    publicError(error);
  }
});
