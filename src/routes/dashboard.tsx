import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · CLAMP" },
      {
        name: "description",
        content: "Active mandate, recent decisions, and pending human review.",
      },
    ],
  }),
  component: DashboardPage,
});
