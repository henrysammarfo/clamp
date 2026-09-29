import { createFileRoute } from "@tanstack/react-router";
import { NewMandatePage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/mandates/new")({
  head: () => ({ meta: [{ title: "Create mandate · CLAMP" }] }),
  component: NewMandatePage,
});
