import { createFileRoute } from "@tanstack/react-router";
import { AuditPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit trail · CLAMP" }] }),
  component: AuditPage,
});
