import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · CLAMP" }] }),
  component: SettingsPage,
});
