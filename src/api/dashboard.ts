import { createServerFn } from "@tanstack/react-start";
import { requireClampSession } from "@/server/session";
import { listDecisions, listMandates } from "@/server/store";

export const getDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireClampSession();
  const mandates = listMandates(session.tenantId);
  const decisions = listDecisions(session.tenantId);
  const active = mandates.find((m) => m.status === "active") ?? mandates[0] ?? null;
  const pending = decisions.filter((d) => d.status === "review");
  return {
    session,
    activeMandate: active,
    recentDecisions: decisions.slice(0, 5),
    pendingReviews: pending,
    totals: {
      mandates: mandates.length,
      decisions: decisions.length,
      pending: pending.length,
    },
  };
});
