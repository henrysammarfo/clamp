import { createFileRoute } from "@tanstack/react-router";
import { MetricsPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/metrics")({
  head: () => ({ meta: [{ title: "Metrics · CLAMP" }] }),
  component: MetricsPage,
});
