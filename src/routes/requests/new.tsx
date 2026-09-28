import { createFileRoute } from "@tanstack/react-router";
import { NewRequestPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/requests/new")({
  head: () => ({ meta: [{ title: "Agent request · CLAMP" }] }),
  component: NewRequestPage,
});
