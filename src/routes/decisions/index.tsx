import { createFileRoute } from "@tanstack/react-router";
import { DecisionsPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/decisions/")({
  head: () => ({ meta: [{ title: "Decisions · CLAMP" }] }),
  component: DecisionsPage,
});
