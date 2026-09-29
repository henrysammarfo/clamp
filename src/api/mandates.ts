import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { commitMandateOnChain } from "@/server/chain/clamp-audit";
import { hashMandate } from "@/server/chain/hash";
import { fastApiClient } from "@/server/fastapi/client";
import { mapMandate } from "@/server/fastapi/mappers";
import { requireClampSession } from "@/server/session";

export const listMandatesFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireClampSession();
  return { mandates: (await fastApiClient.listMandates()).map(mapMandate) };
});

export const getMandateFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireClampSession();
    return { mandate: mapMandate(await fastApiClient.getMandate(data.id)) };
  });

export const createMandateFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(120),
      purpose: z.string().min(1).max(500),
      budget: z.number().positive(),
      currency: z.string().length(3),
      merchants: z.array(z.string().min(1)).min(1),
      expiresAt: z.string().datetime(),
      humanApprovalThreshold: z.number().positive(),
    }),
  )
  .handler(async ({ data }) => {
    await requireClampSession();
    const source = await fastApiClient.createMandate({
      name: data.name.trim(),
      purpose: data.purpose.trim(),
      total_budget: data.budget,
      currency: data.currency.toUpperCase(),
      allowed_merchants: data.merchants.map((merchant) => merchant.trim()),
      expires_at: data.expiresAt,
      human_approval_threshold: data.humanApprovalThreshold,
    });
    const mandate = mapMandate(source);
    const { txHash } = await commitMandateOnChain(hashMandate(source));
    try {
      const attached = await fastApiClient.attachMandateChain(source.id, {
        network: "base-sepolia",
        tx_hash: txHash,
      });
      return { mandate: mapMandate(attached) };
    } catch {
      // The on-chain commit is already confirmed. Preserve the real tx hash in
      // the response so the operator can retry only the backend receipt sync.
      return {
        mandate: {
          ...mandate,
          commitTxHash: txHash,
          chainSyncPending: true,
        },
      };
    }
  });

export const retryMandateChainSyncFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      mandateId: z.string().min(1),
      txHash: z.string().regex(/^0x[0-9a-fA-F]+$/),
    }),
  )
  .handler(async ({ data }) => {
    await requireClampSession();
    const attached = await fastApiClient.attachMandateChain(data.mandateId, {
      network: "base-sepolia",
      tx_hash: data.txHash,
    });
    return { mandate: mapMandate(attached) };
  });
