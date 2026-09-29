import { createServerFn } from "@tanstack/react-start";
import { fastApiClient } from "@/server/fastapi/client";
import { mapDecision, mapMandate } from "@/server/fastapi/mappers";
import { requireClampSession } from "@/server/session";

export const getDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireClampSession();
  const [mandatesSource, decisionsSource] = await Promise.all([
    fastApiClient.listMandates(),
    fastApiClient.listDecisions(),
  ]);
  const mandates = mandatesSource.map(mapMandate);
  const decisions = decisionsSource.map(mapDecision);
  const active = mandates.find((mandate) => mandate.status === "active") ?? mandates[0] ?? null;
  const pending = decisions.filter((decision) => decision.status === "review");
  return {
    session,
    activeMandate: active,
    recentDecisions: decisions.slice(0, 5),
    pendingReviews: pending,
    totals: { mandates: mandates.length, decisions: decisions.length, pending: pending.length },
  };
});
