import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  commitMandateOnChain,
  ensureMandateCommitted,
  recordDecisionOnChain,
} from "@/server/chain/clamp-audit";
import { hashMandate, hashRevocationAuditPayload } from "@/server/chain/hash";
import { verifyMandateAgainstChain } from "@/server/chain/verification";
import { fastApiClient } from "@/server/fastapi/client";
import { mapMandate } from "@/server/fastapi/mappers";
import { requireClampSession } from "@/server/session";

const purposeCategorySchema = z.enum([
  "OFFICE",
  "SOFTWARE",
  "TRAVEL",
  "FOOD",
  "TRANSPORT",
  "MARKETING",
  "PROFESSIONAL_SERVICES",
  "OTHER",
]);

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

export const verifyMandateOnBaseFn = createServerFn({ method: "GET" })
  .validator(z.object({ mandateId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireClampSession();
    const mandate = await fastApiClient.getMandate(data.mandateId);
    return { verification: await verifyMandateAgainstChain(mandate) };
  });

export const createMandateFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(120),
      purpose: z.string().min(1).max(500),
      purposeCategory: purposeCategorySchema,
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
      purpose_category: data.purposeCategory,
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

async function recordRevocationOnChain(mandateId: string) {
  const revocation = await fastApiClient.getMandateRevocation(mandateId);
  if (revocation.tx_hash) {
    return {
      mandate: mapMandate(await fastApiClient.getMandate(mandateId)),
    };
  }

  const source = await fastApiClient.getMandate(mandateId);
  const mandateHash = hashMandate(source);
  await ensureMandateCommitted(mandateHash);

  const { txHash } = await recordDecisionOnChain({
    mandateHash,
    decisionHash: hashRevocationAuditPayload(revocation.audit_payload),
    outcome: 4,
  });

  try {
    await fastApiClient.attachMandateRevocationChain(mandateId, {
      network: "base-sepolia",
      tx_hash: txHash,
    });
    return {
      mandate: mapMandate(await fastApiClient.getMandate(mandateId)),
    };
  } catch {
    return {
      mandate: {
        ...mapMandate(await fastApiClient.getMandate(mandateId)),
        revokeTxHash: txHash,
        revokeBlockchainNetwork: "base-sepolia",
        revokeChainSyncPending: true,
      },
    };
  }
}

export const revokeMandateFn = createServerFn({ method: "POST" })
  .validator(z.object({ mandateId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireClampSession();
    await fastApiClient.revokeMandate(data.mandateId);
    return recordRevocationOnChain(data.mandateId);
  });

export const retryMandateRevocationFn = createServerFn({ method: "POST" })
  .validator(z.object({ mandateId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireClampSession();
    return recordRevocationOnChain(data.mandateId);
  });

export const retryMandateRevocationChainSyncFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      mandateId: z.string().min(1),
      txHash: z.string().regex(/^0x[0-9a-fA-F]+$/),
    }),
  )
  .handler(async ({ data }) => {
    await requireClampSession();
    await fastApiClient.attachMandateRevocationChain(data.mandateId, {
      network: "base-sepolia",
      tx_hash: data.txHash,
    });
    return { mandate: mapMandate(await fastApiClient.getMandate(data.mandateId)) };
  });
