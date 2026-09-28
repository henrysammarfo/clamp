import { createServerFn } from "@tanstack/react-start";
import { getChainStatus } from "@/server/chain/clamp-audit";
import {
  SongNotWiredError,
  songGateClient,
  songMeteringClient,
  songParseClient,
} from "@/server/integrations/song";
import { requireClampSession } from "@/server/session";

async function probe(
  label: string,
  fn: () => Promise<unknown>,
): Promise<{ name: string; wired: boolean; detail: string }> {
  try {
    await fn();
    return { name: label, wired: true, detail: "Responded" };
  } catch (error) {
    if (error instanceof SongNotWiredError) {
      return { name: label, wired: false, detail: error.message };
    }
    return {
      name: label,
      wired: false,
      detail: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const getRuntimeStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireClampSession();
  const chain = getChainStatus();
  const song = await Promise.all([
    probe("Kiln parse", async () =>
      songParseClient.parseRequest({
        text: "probe",
        mandate: {
          id: "probe",
          tenantId: session.tenantId,
          name: "probe",
          purpose: "probe",
          budget: 1,
          spent: 0,
          merchants: ["Amazon"],
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          status: "active",
          mandateHash: "0x0",
          commitTxHash: null,
          createdAt: new Date().toISOString(),
          revokedAt: null,
        },
      }),
    ),
    probe("Code gate", async () =>
      songGateClient.evaluateGate({
        mandate: {
          id: "probe",
          tenantId: session.tenantId,
          name: "probe",
          purpose: "probe",
          budget: 1,
          spent: 0,
          merchants: ["Amazon"],
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          status: "active",
          mandateHash: "0x0",
          commitTxHash: null,
          createdAt: new Date().toISOString(),
          revokedAt: null,
        },
        action: {
          merchant: "Amazon",
          amount: 1,
          fee: 0,
          purpose: "probe",
          requestedAt: new Date().toISOString(),
        },
      }),
    ),
    probe("Efficiency metering", async () => songMeteringClient.getEfficiencyMetrics(["probe"])),
  ]);

  return {
    session: {
      tenantId: session.tenantId,
      email: session.email,
      mode: "Signed httpOnly server session",
    },
    chain,
    song,
    modelPreference: "qwen3-32b via Kiln when Song wires it",
    gatePolicy: "Song code gate. Zero inference. Fail closed until wired.",
  };
});
