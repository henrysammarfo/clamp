import { createFileRoute } from "@tanstack/react-router";
import { MandatesPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/mandates/")({
  head: () => ({ meta: [{ title: "Mandates · CLAMP" }] }),
  component: MandatesPage,
});
