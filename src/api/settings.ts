import { createServerFn } from "@tanstack/react-start";
import { getChainStatus } from "@/server/chain/clamp-audit";
import { fastApiClient, fastApiRuntimeStatus } from "@/server/fastapi/client";
import { requireClampSession } from "@/server/session";

export const getRuntimeStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireClampSession();
  let backend: { name: string; wired: boolean; detail: string };
  try {
    await fastApiClient.health();
    backend = { name: "FastAPI policy service", wired: true, detail: "Responded" };
  } catch (error) {
    backend = {
      name: "FastAPI policy service",
      wired: false,
      detail: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return {
    session: {
      tenantId: session.tenantId,
      email: session.email,
      mode: "Signed httpOnly server session",
    },
    chain: getChainStatus(),
    backend: { ...backend, ...fastApiRuntimeStatus() },
    modelPreference: "Configured by the FastAPI Kiln integration",
    gatePolicy: "Deterministic policy in FastAPI",
  };
});
